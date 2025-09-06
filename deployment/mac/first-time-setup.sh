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

echo
echo "[STEP 3] Installing application dependencies..."
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
npx prisma generate
docker-compose up -d
sleep 5
npx prisma migrate deploy

# Run empty seed to ensure clean database
echo "Setting up empty database..."
npx prisma db seed

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
