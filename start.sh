#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Free up ports if occupied
lsof -ti:8000 | xargs kill -9 2>/dev/null
lsof -ti:5173 | xargs kill -9 2>/dev/null

echo "Starting VedViki Backend on http://127.0.0.1:8000..."
cd "$DIR/backend"
nohup "$DIR/backend/venv/bin/uvicorn" app.main:app --host 127.0.0.1 --port 8000 < /dev/null > "$DIR/backend/backend.log" 2>&1 &
disown

echo "Starting VedViki Frontend on http://localhost:5173..."
cd "$DIR/frontend"
CI=true nohup "$DIR/frontend/node_modules/.bin/vite" --host 127.0.0.1 --port 5173 > "$DIR/frontend/frontend.log" 2>&1 &
disown

sleep 2

echo "Verifying server status..."
if curl -s http://127.0.0.1:8000/health > /dev/null; then
    echo " Backend is LIVE at http://127.0.0.1:8000"
else
    echo "⚠️ Backend starting up, check $DIR/backend/backend.log"
fi

echo " Frontend is LIVE at http://localhost:5173"
echo "To stop servers later, run: ./stop.sh"
