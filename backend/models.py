from pydantic import BaseModel, Field, EmailStr
from typing import Optional, Literal
from datetime import datetime
from bson import ObjectId


# ── ObjectId helper ──────────────────────────────────────────────────────────

class PyObjectId(str):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return str(v)


# ── Auth schemas ─────────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    name: str = Field(..., min_length=1)
    email: EmailStr
    password: str = Field(..., min_length=6)
    role: Literal["student", "admin"] = "student"


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: str = Field(alias="_id")
    name: str
    email: str
    role: str
    createdAt: Optional[datetime] = None

    class Config:
        populate_by_name = True


class AuthResponse(BaseModel):
    token: str
    user: dict


# ── Exam schemas ─────────────────────────────────────────────────────────────

class StartExamRequest(BaseModel):
    examName: str = "Untitled Exam"


class EventRequest(BaseModel):
    sessionId: str
    eventType: Literal["no_face", "multiple_faces", "looking_away", "phone_detected", "other"]
    description: str
    confidence: float = Field(default=1.0, ge=0.0, le=1.0)


# ── Shared response ──────────────────────────────────────────────────────────

class MessageResponse(BaseModel):
    message: str
