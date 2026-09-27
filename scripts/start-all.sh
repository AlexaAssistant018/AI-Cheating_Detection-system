#!/bin/bash

# Start all services for AI Cheating Detection System
# This script starts backend, frontend, and AI module in separate terminals

echo "Starting AI Cheating Detection System..."
echo ""

# Check if tmux is installed
if command -v tmux &> /dev/null; then
    echo "Using tmux to start all services..."
    
    # Create new tmux session
    tmux new-session -d -s cheating-detection
    
    # Backend
    tmux send-keys -t cheating-detection "cd backend && uvicorn main:socket_app --reload --port 5000" C-m
    tmux split-window -h -t cheating-detection
    
    # Frontend
    tmux send-keys -t cheating-detection "cd frontend && npm run dev" C-m
    tmux split-window -v -t cheating-detection
    
    # AI Module
    tmux send-keys -t cheating-detection "cd ai-module && python3 app.py" C-m
    
    # Attach to session
    tmux attach-session -t cheating-detection
    
else
    echo "tmux not found. Starting services in background..."
    echo "Install tmux for better terminal management: sudo apt install tmux"
    echo ""
    
    # Start services in background
    cd backend && uvicorn main:socket_app --reload --port 5000 &
    BACKEND_PID=$!
    
    cd ../frontend && npm run dev &
    FRONTEND_PID=$!
    
    cd ../ai-module && python3 app.py &
    AI_PID=$!
    
    echo "Services started:"
    echo "Backend PID: $BACKEND_PID"
    echo "Frontend PID: $FRONTEND_PID"
    echo "AI Module PID: $AI_PID"
    echo ""
    echo "To stop all services, run: kill $BACKEND_PID $FRONTEND_PID $AI_PID"
    
    # Wait for user interrupt
    wait
fi
