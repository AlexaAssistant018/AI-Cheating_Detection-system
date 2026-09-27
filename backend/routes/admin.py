from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId
from database import get_db
from auth import get_admin_user

router = APIRouter(prefix="/api/admin", tags=["admin"])


def serialize(doc: dict) -> dict:
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


# ── All students ──────────────────────────────────────────────────────────────

@router.get("/students")
async def get_students(admin=Depends(get_admin_user)):
    db = get_db()
    cursor = db.users.find({"role": "student"}, {"password": 0}).sort("createdAt", -1)
    return [serialize(u) async for u in cursor]


# ── All sessions ──────────────────────────────────────────────────────────────

@router.get("/sessions")
async def get_sessions(admin=Depends(get_admin_user)):
    db = get_db()
    cursor = db.exam_sessions.find().sort("startTime", -1)
    sessions = []
    async for s in cursor:
        s = serialize(s)
        # Populate userId
        u = await db.users.find_one({"_id": ObjectId(s["userId"])}, {"password": 0})
        if u:
            s["userId"] = {"_id": str(u["_id"]), "name": u["name"], "email": u["email"]}
        sessions.append(s)
    return sessions


# ── Session detail with logs ──────────────────────────────────────────────────

@router.get("/sessions/{session_id}")
async def get_session_detail(session_id: str, admin=Depends(get_admin_user)):
    db = get_db()
    session = await db.exam_sessions.find_one({"_id": ObjectId(session_id)})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    u = await db.users.find_one({"_id": session["userId"]}, {"password": 0})
    session = serialize(session)
    if u:
        session["userId"] = {"_id": str(u["_id"]), "name": u["name"], "email": u["email"]}

    cursor = db.cheating_logs.find({"sessionId": ObjectId(session_id)}).sort("timestamp", -1)
    logs = [serialize(doc) async for doc in cursor]

    return {"session": session, "logs": logs}


# ── Stats ─────────────────────────────────────────────────────────────────────

@router.get("/stats")
async def get_stats(admin=Depends(get_admin_user)):
    db = get_db()
    total_students = await db.users.count_documents({"role": "student"})
    total_sessions = await db.exam_sessions.count_documents({})
    active_sessions = await db.exam_sessions.count_documents({"status": "active"})
    total_alerts = await db.cheating_logs.count_documents({})
    return {
        "totalStudents": total_students,
        "totalSessions": total_sessions,
        "activeSessions": active_sessions,
        "totalAlerts": total_alerts,
    }
