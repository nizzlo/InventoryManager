#!/bin/bash

echo "==============================================="
echo "    INVENTORY MANAGER - FIRST TIME SETUP"
echo "==============================================="
echo
echo "This will set up your Inventory Manager application"
echo "Please ensure you have installed:"
echo "  - Node.js (from nodejs.org)"
echo "  - Docker Desktop (from docker.com)"
echo
read -p "Press Enter to continue..."

cd "$(dirname "$0")/../.."

echo
echo "[STEP 1] Checking Node.js installation..."
if ! command -v node >/dev/null 2>&1; then
    echo "❌ Node.js not found! Please install it from https://nodejs.org/"
    echo "    Choose the LTS version and restart your terminal after installation."
    read -p "Press Enter to exit..."
    exit 1
else
    echo "✅ Node.js found ($(node --version))"
fi

echo
echo "[STEP 2] Checking Docker installation..."
if ! command -v docker >/dev/null 2>&1; then
    echo "❌ Docker not found! Please install Docker Desktop from https://docker.com/"
    echo "    Make sure Docker Desktop is running (whale icon in menu bar)."
    read -p "Press Enter to exit..."
    exit 1
else
    echo "✅ Docker found ($(docker --version))"
fi

echo "Checking if Docker Desktop is running..."
if ! docker info >/dev/null 2>&1; then
    echo "❌ Docker Desktop is not running!"
    echo "Please start Docker Desktop and wait for it to fully load"
    echo "(you should see the whale icon in your menu bar)"
    echo
    read -p "Press Enter when Docker Desktop is ready, or Ctrl+C to cancel..."
    
    # Wait for Docker to be ready with timeout
    echo "Waiting for Docker to be ready..."
    timeout=60
    while [ $timeout -gt 0 ]; do
        if docker info >/dev/null 2>&1; then
            echo "✅ Docker Desktop is now ready!"
            break
        fi
        sleep 2
        timeout=$((timeout-2))
        echo "Still waiting... ($timeout seconds remaining)"
    done
    
    if [ $timeout -le 0 ]; then
        echo "❌ Docker Desktop failed to start within 60 seconds"
        echo "Please ensure Docker Desktop is fully started and try again"
        read -p "Press Enter to exit..."
        exit 1
    fi
else
    echo "✅ Docker Desktop is running"
fi

echo
echo "[STEP 3] Installing application dependencies..."
echo "This may take 2-5 minutes on first run..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies!"
    read -p "Press Enter to exit..."
    exit 1
else
    echo "✅ Dependencies installed"
fi

echo
echo "[STEP 4] Building application..."
echo "This may take 1-3 minutes..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Failed to build application!"
    read -p "Press Enter to exit..."
    exit 1
else
    echo "✅ Application built successfully"
fi

echo
echo "[STEP 5] Setting up database..."
echo "Generating Prisma client..."
npx prisma generate
if [ $? -ne 0 ]; then
    echo "❌ Failed to generate Prisma client!"
    read -p "Press Enter to exit..."
    exit 1
fi

echo "Starting database containers..."
docker-compose up -d
if [ $? -ne 0 ]; then
    echo "❌ Failed to start database containers!"
    echo "Make sure Docker Desktop is running and try again"
    read -p "Press Enter to exit..."
    exit 1
fi

echo "Waiting for database to be ready..."
sleep 8

echo "Running database migrations..."
npx prisma migrate deploy
if [ $? -ne 0 ]; then
    echo "❌ Failed to run database migrations!"
    echo "Database might not be ready yet. You can try running this later:"
    echo "  npx prisma migrate deploy"
    read -p "Press Enter to continue anyway..."
fi

# Run empty seed to ensure clean database
echo "Setting up empty database..."
npx prisma db seed
if [ $? -ne 0 ]; then
    echo "⚠️  Warning: Failed to run database seed"
    echo "This is usually not critical. You can set up data manually."
fi

echo
echo "==============================================="
echo "    ✅ SETUP COMPLETE!"
echo "==============================================="
echo
echo "Your Inventory Manager is now ready to use!"
echo
echo "To start the application:"
echo "   → Double-click 'start-inventory-manager.sh'"
echo "   → Or run: ./start-inventory-manager.sh"
echo
echo "To stop the application:"
echo "   → Double-click 'stop-inventory-manager.sh'"
echo "   → Or just close the startup terminal window"
echo
echo "The application will open at: http://localhost:3000"
echo

read -p "Press Enter to finish..."
