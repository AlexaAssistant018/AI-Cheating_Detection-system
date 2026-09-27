from fastapi import APIRouter, HTTPException
import bcrypt
from bson import ObjectId
from datetime import datetime
from database import get_db
from models import RegisterRequest, LoginRequest
from auth import create_token

router = APIRouter(prefix="/api/auth", tags=["auth"])


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


def user_to_dict(user: dict) -> dict:
    return {
        "_id": str(user["_id"]),
        "name": user["name"],
        "email": user["email"],
        "role": user["role"],
    }


@router.post("/register", status_code=201)
async def register(body: RegisterRequest):
    db = get_db()

    existing = await db.users.find_one({"email": body.email.lower().strip()})
    if existing:
        raise HTTPException(status_code=400, detail="User already exists")

    doc = {
        "name": body.name.strip(),
        "email": body.email.lower().strip(),
        "password": hash_password(body.password),
        "role": body.role,
        "createdAt": datetime.utcnow(),
    }
    result = await db.users.insert_one(doc)
    doc["_id"] = result.inserted_id

    token = create_token(str(result.inserted_id))
    return {"token": token, "user": user_to_dict(doc)}


@router.post("/login")
async def login(body: LoginRequest):
    db = get_db()

    user = await db.users.find_one({"email": body.email.lower().strip()})
    if not user:
        raise HTTPException(status_code=400, detail="Invalid credentials")

    if not verify_password(body.password, user["password"]):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    token = create_token(str(user["_id"]))
    return {"token": token, "user": user_to_dict(user)}
