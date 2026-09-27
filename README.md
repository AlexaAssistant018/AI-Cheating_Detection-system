# AI-Based Cheating Detection System

An AI-powered online exam proctoring system. It watches a student's webcam feed during an exam, uses computer vision to flag suspicious behaviour (no face, multiple faces, looking away), logs every event to a database in real time, and gives admins a live dashboard to monitor all active exam sessions.

[![React](https://img.shields.io/badge/React-18-61DAFB.svg)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688.svg)](https://fastapi.tiangolo.com/)
[![Flask](https://img.shields.io/badge/Flask-3.0-000000.svg)](https://flask.palletsprojects.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0-47A248.svg)](https://mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-red.svg)](LICENSE)

## Table of Contents

- [How It Works](#how-it-works)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Running the Project](#running-the-project)
- [Creating an Admin User](#creating-an-admin-user)
- [API Reference](#api-reference)
- [Docker Deployment](#docker-deployment)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## How It Works

The system is made of three independent services that talk to each other over HTTP and WebSockets:

```
┌──────────────┐      REST + Socket.IO      ┌──────────────┐
│   Frontend   │ ─────────────────────────▶ │   Backend    │
│  React + Vite│ ◀───────────────────────── │   FastAPI    │──▶ MongoDB
└──────┬───────┘                            └──────▲───────┘
       │  webcam frame (every few seconds)         │ auto-logged event
       ▼                                            │
┌──────────────┐        detection result      ┌─────┴────────┐
│  AI Module   │ ────────────────────────────▶│ (via /event) │
│ Flask+OpenCV │                               └──────────────┘
└──────────────┘
```

1. **Frontend** captures a webcam frame every few seconds during an active exam and sends it to the AI module.
2. **AI Module** runs face detection (OpenCV Haar cascades) and head-pose estimation (MediaPipe, with an OpenCV eye-detection fallback) on the frame, then classifies it as normal, warning, or danger.
3. When something suspicious is detected, the AI module (or the frontend) reports the event to the **Backend**, which stores it in MongoDB and broadcasts it in real time over **Socket.IO** to any connected admin dashboards.
4. **Admins** watch a live dashboard of all active sessions, students, and alerts; students see their own live status and can review their reports after the exam.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, React Router 6, Axios, react-webcam, Socket.IO client, Framer Motion |
| Backend API | Python, FastAPI, Motor (async MongoDB driver), python-socketio, python-jose (JWT), bcrypt |
| AI Module | Python, Flask, OpenCV, MediaPipe, NumPy, Pillow |
| Database | MongoDB |
| Realtime | Socket.IO (server mounted on the FastAPI app, client in the React app) |
| Containerization | Docker, docker-compose |

## Project Structure

```
AI-Cheating-Detection-System/
├── frontend/                 # React app (Vite)
│   ├── src/
│   │   ├── components/       # Navbar, Sidebar, CameraCard, AlertBox, etc.
│   │   ├── pages/            # Landing, Login/Signup, Dashboard, Reports, Admin pages
│   │   ├── context/          # AuthContext, ThemeContext
│   │   └── services/api.js   # Axios + Socket.IO client config
│   └── package.json
│
├── backend/                  # FastAPI service (auth, exams, admin, sockets)
│   ├── main.py                # App entry point, Socket.IO + FastAPI mount
│   ├── database.py            # Motor/MongoDB connection
│   ├── auth.py                 # JWT creation + auth dependencies
│   ├── models.py               # Pydantic request/response schemas
│   ├── create_admin.py        # CLI script to create an admin user
│   └── routes/                 # auth.py, exam.py, admin.py routers
│
├── ai-module/                 # Flask service that runs the CV detection
│   └── app.py                  # /detect, /detect-advanced, /detect-and-report endpoints
│
├── scripts/                    # setup.sh, start-all.sh, stop-all.sh
├── docker-compose.yml          # Orchestrates mongo + backend + ai-module + frontend
└── package.json                 # Root convenience scripts (dev, install-all, build)
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Python 3.10+
- A MongoDB database — either a local `mongod` instance or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster

### Installation

```bash
git clone https://github.com/AlexaAssistant018/AI-Cheating_Detection-system.git
cd AI-Cheating_Detection-system

# Frontend
cd frontend && npm install && cd ..

# Backend
cd backend && pip install -r requirements.txt && cd ..

# AI module
cd ai-module && pip install -r requirements.txt && cd ..
```

> It's recommended to install the Python dependencies inside a virtual environment (`python -m venv venv`) for the `backend` and `ai-module` folders separately, since they don't share the same requirements.

## Environment Variables

Copy the example files and fill in your own values — **never commit real `.env` files**, they're already git-ignored.

**`backend/.env`** (copy from `backend/.env.example`)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/cheating-detection
JWT_SECRET=change_this_to_a_long_random_string
```

**`frontend/.env`** (copy from `frontend/.env.example`)
```env
VITE_API_URL=http://localhost:5000/api
VITE_AI_URL=http://localhost:5001
VITE_SOCKET_URL=http://localhost:5000
```

## Running the Project

Run each service in its own terminal:

```bash
# 1. Backend (FastAPI + Socket.IO) — http://localhost:5000
cd backend
uvicorn main:socket_app --reload --port 5000

# 2. AI module (Flask) — http://localhost:5001
cd ai-module
python app.py

# 3. Frontend (Vite) — http://localhost:3000
cd frontend
npm run dev
```

Or, from the repo root, use the convenience script that runs all three concurrently:

```bash
npm run install-all   # one-time
npm run dev
```

Once running:
- Frontend: http://localhost:3000
- Backend API + docs (Swagger UI): http://localhost:5000/docs
- AI module health check: http://localhost:5001/health

## Creating an Admin User

Signing up through the UI creates a `student` account by default. To create an admin, run the helper script against your configured database:

```bash
cd backend
python create_admin.py
```

It prompts for a name, email, and password (with sensible defaults) and creates/updates a user with the `admin` role.

## API Reference

Base URL: `http://localhost:5000/api` (interactive docs at `/docs`)

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Register a new user (`name`, `email`, `password`, `role`) |
| POST | `/auth/login` | Log in, returns a JWT + user object |

### Exam (requires `Authorization: Bearer <token>`)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/exam/start` | Start a new exam session |
| POST | `/exam/end/{session_id}` | End an exam session |
| POST | `/exam/event` | Log a cheating/warning event and broadcast it via Socket.IO |
| GET | `/exam/events?sessionId=` | List events (own events for students, all for admins) |
| GET | `/exam/reports` | Full report of the current user's (or all, for admins) events |

### Admin (requires an admin JWT)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/admin/students` | List all student accounts |
| GET | `/admin/sessions` | List all exam sessions |
| GET | `/admin/sessions/{session_id}` | Session detail with its logs |
| GET | `/admin/stats` | Aggregate counts (students, sessions, alerts) |

### AI Module
Base URL: `http://localhost:5001`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Health check, reports whether MediaPipe is available |
| POST | `/detect` | Basic face-count detection from a multipart `image` field |
| POST | `/detect-advanced` | Face count + head-pose ("looking away") detection, returns warnings/confidence |
| POST | `/detect-and-report` | Same as above but also auto-POSTs any detected event to the backend (`session_id` + `auth_token` form fields) |

### Realtime events (Socket.IO, on the backend's URL)
- `join_session` (client → server): join the room for a given exam session
- `new-event` (server → clients in that session's room): a new cheating event was logged
- `alert` (server → all clients): broadcast of every new event, used by the admin dashboard

## Docker Deployment

```bash
docker-compose up -d      # build and start mongo, backend, ai-module, frontend
docker-compose logs -f    # tail logs
docker-compose down       # stop everything
```

This spins up MongoDB, the FastAPI backend, the Flask AI module, and a production build of the frontend served via Nginx.

## Troubleshooting

- **Backend fails on startup with a Mongo `ConfigurationError`/DNS error** — your `MONGODB_URI` is unreachable. Point it at a local `mongod` or a live Atlas cluster.
- **`mediapipe not available` in the AI module logs** — head-pose detection falls back to a simpler eye-detection heuristic; face/multi-face detection still works. Install `mediapipe` to enable it.
- **CORS / connection refused from the frontend** — make sure `VITE_API_URL` / `VITE_AI_URL` in `frontend/.env` match where the backend and AI module are actually running.
- **Login works but sockets don't update the admin dashboard** — confirm `VITE_SOCKET_URL` points at the backend (not the AI module) and that the backend process is the one serving `main:socket_app`, not plain `main:app`.

## Contributing

Contributions are welcome — see [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT — see [LICENSE](LICENSE).
