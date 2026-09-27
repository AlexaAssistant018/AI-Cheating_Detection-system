from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os
import ssl

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/cheating-detection")

client: AsyncIOMotorClient = None
db = None


async def connect_db():
    global client, db
    # For development: disable SSL verification if having certificate issues
    try:
        client = AsyncIOMotorClient(
            MONGODB_URI,
            serverSelectionTimeoutMS=5000,
            tlsAllowInvalidCertificates=True  # Only for development
        )
        db = client.get_default_database()
        # Test connection
        await client.admin.command('ping')
        # Ensure indexes
        await db.users.create_index("email", unique=True)
        print("MongoDB connected successfully")
    except Exception as e:
        print(f"MongoDB connection error: {e}")
        raise


async def close_db():
    global client
    if client:
        client.close()
        print("MongoDB connection closed")


def get_db():
    return db
