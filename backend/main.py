import socketio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from database import connect_db, close_db
from routes.auth import router as auth_router
from routes.exam import router as exam_router
from routes.admin import router as admin_router


# ── Socket.IO ─────────────────────────────────────────────────────────────────

sio = socketio.AsyncServer(
    async_mode="asgi",
    cors_allowed_origins="*",
    logger=False,
    engineio_logger=False,
)


@sio.event
async def connect(sid, environ):
    print(f"Socket connected: {sid}")


@sio.event
async def disconnect(sid):
    print(f"Socket disconnected: {sid}")


@sio.event
async def join_session(sid, session_id):
    await sio.enter_room(sid, f"session-{session_id}")
    print(f"Socket {sid} joined session-{session_id}")


# ── FastAPI app ───────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    yield
    await close_db()


app = FastAPI(
    title="ProctorAI Backend",
    description="AI-Based Cheating Detection System API",
    version="2.0.0",
    lifespan=lifespan,
)

# Store sio on app state so routes can access it
app.state.sio = sio

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth_router)
app.include_router(exam_router)
app.include_router(admin_router)


@app.get("/health")
async def health():
    return {"status": "OK", "message": "Server is running"}


# ── Mount Socket.IO as ASGI sub-app ──────────────────────────────────────────

socket_app = socketio.ASGIApp(sio, other_asgi_app=app)
