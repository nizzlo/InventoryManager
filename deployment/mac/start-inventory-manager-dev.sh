#!/bin/bash

# Inventory Manager - Development Mode Startup for Mac

echo "==============================================="
echo "  Starting Inventory Manager (Development Mode)"
echo "==============================================="
echo

cd "$(dirname "$0")/../.."

echo "[1/5] Checking Docker Desktop..."
# Check if Docker Desktop is running
if ! docker info >/dev/null 2>&1; then
    echo "Docker Desktop is not running. Starting Docker Desktop..."
    echo "Please wait, this may take 30-60 seconds..."
    
    # Try to start Docker Desktop on Mac
    if [ -d "/Applications/Docker.app" ]; then
        open -a Docker
        echo "Docker Desktop is starting..."
    else
        echo "ERROR: Docker Desktop not found in /Applications/"
        echo "Please install Docker Desktop from https://docker.com/"
        echo "Or start Docker Desktop manually from Applications folder"
        read -p "Press Enter to exit..."
        exit 1
    fi
    
    # Wait for Docker to start (with timeout)
    timeout=90
    while [ $timeout -gt 0 ]; do
        sleep 3
        if docker info >/dev/null 2>&1; then
            echo "✅ Docker Desktop is now running!"
            break
        fi
        timeout=$((timeout-3))
        echo "Waiting for Docker Desktop to start... ($timeout seconds remaining)"
    done
    
    if [ $timeout -le 0 ]; then
        echo "ERROR: Docker Desktop is taking too long to start."
        echo "Please wait for Docker Desktop to fully start, then run this script again."
        echo "You should see the whale icon in your menu bar when ready."
        read -p "Press Enter to exit..."
        exit 1
    fi
else
    echo "✅ Docker Desktop is already running!"
fi

echo "[2/5] Starting Docker database..."
docker-compose up -d
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to start database. Docker Desktop might need more time."
    echo "Please wait 30 seconds and try running this script again."
    read -p "Press Enter to exit..."
    exit 1
fi

echo "[3/5] Installing dependencies (this may take a few minutes on first run)..."
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install dependencies!"
    read -p "Press Enter to exit..."
    exit 1
fi

echo "[4/5] Setting up database..."
npx prisma generate
npx prisma migrate deploy

if [ ! -f ".env.local" ]; then
    echo "Creating default configuration..."
    cat > .env.local << EOF
NEXT_PUBLIC_APP_NAME="Inventory Manager"
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/inventory"
EOF
fi

echo "[5/5] Starting application in DEVELOPMENT mode..."
echo
echo "==============================================="
echo "   ✅ Application started at: http://localhost:3000"
echo "   🌐 Opening browser automatically..."
echo "   🔧 Running in DEVELOPMENT mode (better for images)"
echo
echo "   💡 TO STOP: Press Ctrl+C in this terminal"
echo "   ⚠️  Keep this window open while using the app"
echo "==============================================="
echo

sleep 3
open "http://localhost:3000"

# Start the application in development mode instead of production
npm run dev

# Cleanup when application stops
echo
echo "Cleaning up..."
docker-compose stop >/dev/null 2>&1
echo
echo "✅ Application stopped safely."
echo "You can now close this window."
read -p "Press Enter to exit..."
