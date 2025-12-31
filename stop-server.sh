#!/bin/bash
# Bash script to stop the server running on port 9000 (for Linux/Mac)

echo "Looking for processes on port 9000..."

# Find process using port 9000
PID=$(lsof -ti:9000 2>/dev/null)

if [ -z "$PID" ]; then
    echo "✅ Port 9000 is already free!"
else
    echo "Stopping process $PID..."
    kill -9 $PID
    echo "✅ Stopped!"
    sleep 1
    echo "✅ Port 9000 is now free!"
fi

