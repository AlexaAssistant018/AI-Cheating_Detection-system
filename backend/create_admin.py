"""
Create Admin User Script
Run this to create an admin user in your database
"""
import asyncio
import bcrypt
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os
from datetime import datetime

load_dotenv()

async def create_admin():
    MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/cheating-detection")
    
    print("=" * 60)
    print("Creating Admin User")
    print("=" * 60)
    
    try:
        # Connect to database
        print("\n1. Connecting to database...")
        client = AsyncIOMotorClient(
            MONGODB_URI,
            serverSelectionTimeoutMS=5000,
            tlsAllowInvalidCertificates=True
        )
        db = client.get_default_database()
        await client.admin.command('ping')
        print("   ✅ Connected successfully!")
        
        # Get admin details
        print("\n2. Enter admin details:")
        name = input("   Name (default: Admin User): ").strip() or "Admin User"
        email = input("   Email (default: admin@test.com): ").strip() or "admin@test.com"
        password = input("   Password (default: admin123): ").strip() or "admin123"
        
        # Hash password
        print("\n3. Hashing password...")
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        print("   ✅ Password hashed")
        
        # Create admin document
        admin_user = {
            "name": name,
            "email": email.lower().strip(),
            "password": hashed_password,
            "role": "admin",
            "createdAt": datetime.utcnow()
        }
        
        # Check if user already exists
        print("\n4. Checking if user exists...")
        existing = await db.users.find_one({"email": email.lower().strip()})
        
        if existing:
            print("   ⚠️  User already exists!")
            update = input("   Update password? (y/n): ").strip().lower()
            if update == 'y':
                await db.users.update_one(
                    {"email": email.lower().strip()},
                    {"$set": {"password": hashed_password, "role": "admin"}}
                )
                print("   ✅ Password updated!")
            else:
                print("   ℹ️  No changes made")
        else:
            # Insert admin user
            print("   Creating new admin user...")
            result = await db.users.insert_one(admin_user)
            print(f"   ✅ Admin user created! ID: {result.inserted_id}")
        
        # Display credentials
        print("\n" + "=" * 60)
        print("✅ SUCCESS!")
        print("=" * 60)
        print("\nAdmin Credentials:")
        print(f"  Email:    {email}")
        print(f"  Password: {password}")
        print(f"  Role:     admin")
        print("\nYou can now login at: http://localhost:3000/login")
        print("=" * 60)
        
        # Close connection
        client.close()
        
    except Exception as e:
        print("\n" + "=" * 60)
        print("❌ ERROR")
        print("=" * 60)
        print(f"\n{str(e)}")
        print("\nMake sure:")
        print("1. MongoDB is running")
        print("2. MONGODB_URI is correct in .env")
        print("3. You have network access to the database")
        print("=" * 60)

if __name__ == "__main__":
    asyncio.run(create_admin())
