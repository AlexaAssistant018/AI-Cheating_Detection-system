from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
import requests
import os
from PIL import Image
from io import BytesIO

app = Flask(__name__)
CORS(app)

BACKEND_URL = os.environ.get('BACKEND_URL', 'http://localhost:5000')

# Load Haar Cascade for face detection
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
eye_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_eye.xml')

# Try to load MediaPipe for head pose estimation
try:
    import mediapipe as mp
    mp_face_mesh = mp.solutions.face_mesh
    face_mesh = mp_face_mesh.FaceMesh(
        static_image_mode=True,
        max_num_faces=4,
        refine_landmarks=True,
        min_detection_confidence=0.5
    )
    MEDIAPIPE_AVAILABLE = True
    print("MediaPipe loaded successfully")
except ImportError:
    MEDIAPIPE_AVAILABLE = False
    print("MediaPipe not available, using OpenCV only")


def decode_image(file_stream):
    """Decode image from file stream to numpy array (BGR)."""
    image = Image.open(file_stream).convert('RGB')
    img_array = np.array(image)
    return cv2.cvtColor(img_array, cv2.COLOR_RGB2BGR)


def estimate_head_pose_mediapipe(img_bgr):
    """
    Use MediaPipe face mesh to estimate head pose.
    Returns (yaw, pitch) in degrees. Large values = looking away.
    """
    img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
    h, w = img_bgr.shape[:2]
    results = face_mesh.process(img_rgb)

    if not results.multi_face_landmarks:
        return None, None

    landmarks = results.multi_face_landmarks[0].landmark

    # Key landmark indices for head pose
    # Nose tip: 1, Chin: 152, Left eye corner: 33, Right eye corner: 263
    # Left mouth: 61, Right mouth: 291
    nose_tip = landmarks[1]
    chin = landmarks[152]
    left_eye = landmarks[33]
    right_eye = landmarks[263]

    # Convert to pixel coords
    nose_x = nose_tip.x * w
    nose_y = nose_tip.y * h
    chin_x = chin.x * w
    chin_y = chin.y * h
    left_x = left_eye.x * w
    right_x = right_eye.x * w

    # Face center x
    face_center_x = (left_x + right_x) / 2

    # Yaw: how much nose deviates from face center horizontally
    eye_width = abs(right_x - left_x)
    yaw = (nose_x - face_center_x) / (eye_width + 1e-6) * 90  # rough degrees

    # Pitch: vertical tilt using nose vs chin
    face_height = abs(chin_y - nose_y)
    pitch = (nose_y - (chin_y - face_height * 0.5)) / (face_height + 1e-6) * 45

    return float(yaw), float(pitch)


def detect_looking_away_opencv(img_bgr, face_rect):
    """Fallback: use eye detection to determine if looking away."""
    x, y, w, h = face_rect
    face_roi = img_bgr[y:y+h, x:x+w]
    gray_roi = cv2.cvtColor(face_roi, cv2.COLOR_BGR2GRAY)
    eyes = eye_cascade.detectMultiScale(gray_roi, 1.1, 5, minSize=(20, 20))
    # If no eyes detected in face region, likely looking away
    return len(eyes) == 0


@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'OK',
        'message': 'AI module is running',
        'mediapipe': MEDIAPIPE_AVAILABLE
    })


@app.route('/detect', methods=['POST'])
def detect():
    """Basic face detection endpoint."""
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image provided'}), 400

        img_bgr = decode_image(request.files['image'].stream)
        gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, 1.1, 5, minSize=(30, 30))
        num_faces = len(faces)

        if num_faces == 0:
            status, message = 'warning', 'No face detected'
        elif num_faces == 1:
            status, message = 'success', 'Face detected - All good'
        else:
            status, message = 'danger', f'Multiple faces detected ({num_faces} faces)'

        return jsonify({
            'faces_detected': int(num_faces),
            'status': status,
            'message': message,
            'face_coordinates': [
                {'x': int(x), 'y': int(y), 'width': int(w), 'height': int(h)}
                for (x, y, w, h) in faces
            ]
        })
    except Exception as e:
        print(f"Detect error: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/detect-advanced', methods=['POST'])
def detect_advanced():
    """
    Advanced detection:
    - Face presence / count
    - Head pose (looking away) via MediaPipe or eye detection fallback
    Returns structured result with warnings list and confidence scores.
    """
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image provided'}), 400

        img_bgr = decode_image(request.files['image'].stream)
        gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, 1.1, 5, minSize=(30, 30))
        num_faces = len(faces)

        results = {
            'faces_detected': int(num_faces),
            'phone_detected': False,
            'looking_away': False,
            'head_yaw': None,
            'head_pitch': None,
            'status': 'success',
            'message': 'All checks passed',
            'warnings': [],
            'confidence': {}
        }

        if num_faces == 0:
            results['status'] = 'warning'
            results['message'] = 'No face detected'
            results['warnings'].append({
                'type': 'no_face',
                'description': 'No face detected in frame',
                'confidence': 0.95
            })
        elif num_faces > 1:
            results['status'] = 'danger'
            results['message'] = f'Multiple faces detected ({num_faces})'
            results['warnings'].append({
                'type': 'multiple_faces',
                'description': f'{num_faces} faces detected in frame',
                'confidence': 0.90
            })
        else:
            # Single face — check head pose
            if MEDIAPIPE_AVAILABLE:
                yaw, pitch = estimate_head_pose_mediapipe(img_bgr)
                if yaw is not None:
                    results['head_yaw'] = round(yaw, 2)
                    results['head_pitch'] = round(pitch, 2)
                    # Thresholds: yaw > 30 or pitch > 25 = looking away
                    if abs(yaw) > 30 or abs(pitch) > 25:
                        confidence = min(0.99, (max(abs(yaw), abs(pitch)) - 20) / 50)
                        results['looking_away'] = True
                        results['status'] = 'warning'
                        results['message'] = 'Student appears to be looking away'
                        results['warnings'].append({
                            'type': 'looking_away',
                            'description': f'Head turned away (yaw={round(yaw,1)}°, pitch={round(pitch,1)}°)',
                            'confidence': round(confidence, 2)
                        })
            else:
                # Fallback: eye detection
                looking_away = detect_looking_away_opencv(img_bgr, faces[0])
                if looking_away:
                    results['looking_away'] = True
                    results['status'] = 'warning'
                    results['message'] = 'Student may be looking away'
                    results['warnings'].append({
                        'type': 'looking_away',
                        'description': 'Eyes not detected — possibly looking away',
                        'confidence': 0.65
                    })

        return jsonify(results)

    except Exception as e:
        print(f"Detect-advanced error: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/detect-and-report', methods=['POST'])
def detect_and_report():
    """
    Detect cheating events AND automatically POST them to the backend.
    Expects: image file + session_id + auth_token in form data.
    """
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image provided'}), 400

        session_id = request.form.get('session_id')
        auth_token = request.form.get('auth_token')

        img_bgr = decode_image(request.files['image'].stream)
        gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, 1.1, 5, minSize=(30, 30))
        num_faces = len(faces)

        events_reported = []

        def report_event(event_type, description, confidence):
            if session_id and auth_token:
                try:
                    requests.post(
                        f'{BACKEND_URL}/api/exam/event',
                        json={
                            'sessionId': session_id,
                            'eventType': event_type,
                            'description': description,
                            'confidence': confidence
                        },
                        headers={'Authorization': f'Bearer {auth_token}'},
                        timeout=3
                    )
                    events_reported.append(event_type)
                except Exception as e:
                    print(f"Failed to report event: {e}")

        warnings = []

        if num_faces == 0:
            report_event('no_face', 'No face detected in frame', 0.95)
            warnings.append({'type': 'no_face', 'confidence': 0.95})
        elif num_faces > 1:
            report_event('multiple_faces', f'{num_faces} faces detected', 0.90)
            warnings.append({'type': 'multiple_faces', 'confidence': 0.90})
        else:
            if MEDIAPIPE_AVAILABLE:
                yaw, pitch = estimate_head_pose_mediapipe(img_bgr)
                if yaw is not None and (abs(yaw) > 30 or abs(pitch) > 25):
                    conf = min(0.99, (max(abs(yaw), abs(pitch)) - 20) / 50)
                    report_event('looking_away',
                                 f'Head turned away (yaw={round(yaw,1)}°)',
                                 round(conf, 2))
                    warnings.append({'type': 'looking_away', 'confidence': round(conf, 2)})

        return jsonify({
            'faces_detected': int(num_faces),
            'warnings': warnings,
            'events_reported': events_reported,
            'status': 'danger' if num_faces > 1 else ('warning' if warnings else 'success')
        })

    except Exception as e:
        print(f"Detect-and-report error: {e}")
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    print("Starting AI Detection Module...")
    print(f"MediaPipe available: {MEDIAPIPE_AVAILABLE}")
    app.run(host='0.0.0.0', port=5001, debug=True)
