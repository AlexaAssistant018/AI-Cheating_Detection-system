#!/bin/bash

# Setup script for AI Cheating Detection System
# This script automates the initial setup process

echo "=================================="
echo "AI Cheating Detection System Setup"
echo "=================================="
echo ""

# Check Node.js
echo "Checking Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi
echo "✅ Node.js $(node --version) found"

# Check npm
echo "Checking npm..."
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed."
    exit 1
fi
echo "✅ npm $(npm --version) found"

# Check Python
echo "Checking Python..."
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8+ first."
    exit 1
fi
echo "✅ Python $(python3 --version) found"

# Check MongoDB
echo "Checking MongoDB..."
if ! command -v mongod &> /dev/null; then
    echo "⚠️  MongoDB is not installed. Please install MongoDB first."
    echo "Visit: https://www.mongodb.com/docs/manual/installation/"
fi

echo ""
echo "Installing dependencies..."
echo ""

# Backend setup
echo "📦 Setting up Backend..."
cd backend
pip3 install -r requirements.txt
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Created backend/.env file (please update with your values)"
fi
cd ..

# Frontend setup
echo "📦 Setting up Frontend..."
cd frontend
npm install
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Created frontend/.env file"
fi
cd ..

# AI Module setup
echo "📦 Setting up AI Module..."
cd ai-module
pip3 install -r requirements.txt
cd ..

echo ""
echo "=================================="
echo "✅ Setup Complete!"
echo "=================================="
echo ""
echo "Next steps:"
echo "1. Update backend/.env with your MongoDB URI and JWT secret"
echo "2. Start MongoDB: mongod"
echo "3. Start Backend: cd backend && uvicorn main:socket_app --reload --port 5000"
echo "4. Start Frontend: cd frontend && npm run dev"
echo "5. Start AI Module: cd ai-module && python3 app.py"
echo ""
echo "Visit http://localhost:3000 to access the application"
echo ""
