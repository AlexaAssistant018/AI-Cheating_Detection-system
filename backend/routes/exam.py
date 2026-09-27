from fastapi import APIRouter, Depends, HTTPException, Query, Request
from bson import ObjectId
from datetime import datetime
from typing import Optional
from database import get_db
from models import StartExamRequest, EventRequest, MessageResponse
from auth import get_current_user

router = APIRouter(prefix="/api/exam", tags=["exam"])


def serialize(doc: dict) -> dict:
    """Recursively convert ObjectId fields to strings."""
    if doc is None:
        return None
    out = {}
    for k, v in doc.items():
        if isinstance(v, ObjectId):
            out[k] = str(v)
        elif isinstance(v, dict):
            out[k] = serialize(v)
        elif isinstance(v, list):
            out[k] = [serialize(i) if isinstance(i, dict) else (str(i) if isinstance(i, ObjectId) else i) for i in v]
        else:
            out[k] = v
    return out


# ── Start exam ────────────────────────────────────────────────────────────────

@router.post("/start", status_code=201)
async def start_exam(body: StartExamRequest, user=Depends(get_current_user)):
    db = get_db()
    session = {
        "userId": ObjectId(user["_id"]),
        "examName": body.examName or "Untitled Exam",
        "startTime": datetime.utcnow(),
        "endTime": None,
        "status": "active",
        "alertCount": 0,
    }
    result = await db.exam_sessions.insert_one(session)
    return {"sessionId": str(result.inserted_id), "message": "Exam session started successfully"}


# ── End exam ──────────────────────────────────────────────────────────────────

@router.post("/end/{session_id}")
async def end_exam(session_id: str, user=Depends(get_current_user)):
    db = get_db()
    session = await db.exam_sessions.find_one({"_id": ObjectId(session_id)})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    if str(session["userId"]) != user["_id"] and user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Access denied")

    await db.exam_sessions.update_one(
        {"_id": ObjectId(session_id)},
        {"$set": {"status": "completed", "endTime": datetime.utcnow()}}
    )
    return {"message": "Exam session ended successfully"}


# ── Store cheating event ──────────────────────────────────────────────────────

@router.post("/event", status_code=201)
async def store_event(body: EventRequest, request: Request, user=Depends(get_current_user)):
    db = get_db()
    log = {
        "sessionId": ObjectId(body.sessionId),
        "userId": ObjectId(user["_id"]),
        "eventType": body.eventType,
        "description": body.description,
        "confidence": body.confidence,
        "timestamp": datetime.utcnow(),
    }
    result = await db.cheating_logs.insert_one(log)
    log["_id"] = result.inserted_id

    # Increment alert count on session
    await db.exam_sessions.update_one(
        {"_id": ObjectId(body.sessionId)},
        {"$inc": {"alertCount": 1}}
    )

    # Broadcast via Socket.IO (stored on app state)
    sio = request.app.state.sio
    if sio:
        payload = serialize(log)
        payload["userId"] = {"_id": user["_id"], "name": user.get("name"), "email": user.get("email")}
        await sio.emit("new-event", payload, room=f"session-{body.sessionId}")
        await sio.emit("alert", payload)

    return {"message": "Event stored successfully", "log": serialize(log)}


# ── Fetch events ──────────────────────────────────────────────────────────────

@router.get("/events")
async def get_events(
    session_id: Optional[str] = Query(None, alias="sessionId"),
    user=Depends(get_current_user)
):
    db = get_db()
    query = {}
    if user["role"] != "admin":
        query["userId"] = ObjectId(user["_id"])
    if session_id:
        query["sessionId"] = ObjectId(session_id)

    cursor = db.cheating_logs.find(query).sort("timestamp", -1).limit(100)
    logs = []
    async for doc in cursor:
        doc = serialize(doc)
        # Populate userId
        u = await db.users.find_one({"_id": ObjectId(doc["userId"])}, {"password": 0})
        if u:
            doc["userId"] = {"_id": str(u["_id"]), "name": u["name"], "email": u["email"]}
        # Populate sessionId
        s = await db.exam_sessions.find_one({"_id": ObjectId(doc["sessionId"])})
        if s:
            doc["sessionId"] = {"_id": str(s["_id"]), "examName": s["examName"]}
        logs.append(doc)
    return logs


# ── Legacy: log event ─────────────────────────────────────────────────────────

@router.post("/log", status_code=201)
async def log_event(body: EventRequest, request: Request, user=Depends(get_current_user)):
    """Backward-compatible alias for /event."""
    return await store_event(body, request, user)


# ── Legacy: reports ───────────────────────────────────────────────────────────

@router.get("/reports")
async def get_reports(user=Depends(get_current_user)):
    db = get_db()
    query = {} if user["role"] == "admin" else {"userId": ObjectId(user["_id"])}
    cursor = db.cheating_logs.find(query).sort("timestamp", -1)
    logs = []
    async for doc in cursor:
        doc = serialize(doc)
        u = await db.users.find_one({"_id": ObjectId(doc["userId"])}, {"password": 0})
        if u:
            doc["userId"] = {"_id": str(u["_id"]), "name": u["name"], "email": u["email"]}
        s = await db.exam_sessions.find_one({"_id": ObjectId(doc["sessionId"])})
        if s:
            doc["sessionId"] = {"_id": str(s["_id"]), "examName": s["examName"]}
        logs.append(doc)
    return logs
