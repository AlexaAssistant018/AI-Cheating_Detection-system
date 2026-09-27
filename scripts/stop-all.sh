#!/bin/bash

# Stop all services for AI Cheating Detection System

echo "Stopping AI Cheating Detection System..."

# Kill processes by port
echo "Stopping Backend (port 5000)..."
lsof -ti:5000 | xargs kill -9 2>/dev/null

echo "Stopping Frontend (port 3000)..."
lsof -ti:3000 | xargs kill -9 2>/dev/null

echo "Stopping AI Module (port 5001)..."
lsof -ti:5001 | xargs kill -9 2>/dev/null

# Kill tmux session if exists
if tmux has-session -t cheating-detection 2>/dev/null; then
    echo "Stopping tmux session..."
    tmux kill-session -t cheating-detection
fi

echo "✅ All services stopped"
