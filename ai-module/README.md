# AI Detection Module

Python Flask API for real-time face detection using OpenCV.

## Features

- Face detection using Haar Cascades
- Multiple face detection
- No face detection
- REST API endpoints

## Setup

1. Install Python 3.8+

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the server:
```bash
python app.py
```

The AI module will run on `http://localhost:5001`

## API Endpoints

### POST /detect
Detect faces in an image.

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body: image file

**Response:**
```json
{
  "faces_detected": 1,
  "status": "success",
  "message": "Face detected - All good",
  "face_coordinates": [
    {"x": 100, "y": 150, "width": 200, "height": 200}
  ]
}
```

### POST /detect-advanced
Advanced detection with additional features.

### GET /health
Health check endpoint.

## Future Enhancements

- Head pose estimation
- Phone detection
- Eye tracking
- Suspicious behavior detection
