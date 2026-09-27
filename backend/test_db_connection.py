"""
Test MongoDB Connection
Run this to verify your database connection works
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

load_dotenv()

async def test_connection():
    MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/cheating-detection")
    
    print("=" * 60)
    print("Testing MongoDB Connection")
    print("=" * 60)
    print(f"\nConnection String: {MONGODB_URI[:50]}...")
    
    try:
        # Create client
        print("\n1. Creating MongoDB client...")
        client = AsyncIOMotorClient(
            MONGODB_URI,
            serverSelectionTimeoutMS=5000,
            tlsAllowInvalidCertificates=True  # For development only
        )
        
        # Test connection
        print("2. Testing connection (ping)...")
        await client.admin.command('ping')
        print("   ✅ Connection successful!")
        
        # Get database
        print("3. Getting database...")
        db = client.get_default_database()
        print(f"   ✅ Database: {db.name}")
        
        # List collections
        print("4. Listing collections...")
        collections = await db.list_collection_names()
        print(f"   ✅ Collections: {collections if collections else 'None (new database)'}")
        
        # Test insert (optional)
        print("5. Testing insert operation...")
        test_collection = db.test_connection
        result = await test_collection.insert_one({"test": "connection", "status": "success"})
        print(f"   ✅ Insert successful! ID: {result.inserted_id}")
        
        # Clean up test document
        await test_collection.delete_one({"_id": result.inserted_id})
        print("   ✅ Test document cleaned up")
        
        # Close connection
        client.close()
        print("\n" + "=" * 60)
        print("✅ ALL TESTS PASSED - Database is working!")
        print("=" * 60)
        
    except Exception as e:
        print("\n" + "=" * 60)
        print("❌ CONNECTION FAILED")
        print("=" * 60)
        print(f"\nError: {str(e)}")
        print("\nPossible solutions:")
        print("1. Check if MongoDB is running (local)")
        print("2. Verify MONGODB_URI in .env file")
        print("3. Check network/firewall settings")
        print("4. For MongoDB Atlas:")
        print("   - Whitelist your IP address")
        print("   - Check username/password")
        print("   - Verify cluster is running")
        print("=" * 60)

if __name__ == "__main__":
    asyncio.run(test_connection())
