#!/bin/bash

echo "==============================================="
echo "    Stopping Inventory Manager Application"
echo "==============================================="
echo
echo "NOTE: You can also stop the application by simply"
echo "       closing the start-inventory-manager terminal window."
echo

cd "$(dirname "$0")/../.."

echo "Stopping application servers..."
pkill -f "npm start" 2>/dev/null
pkill -f "next start" 2>/dev/null
pkill -f "node.*next" 2>/dev/null

echo "Stopping database..."
docker-compose down

echo
echo "==============================================="
echo "   Inventory Manager stopped successfully!"
echo "==============================================="
echo
echo "TIP: Next time you can just close the startup terminal"
echo "      instead of using this stop script."
echo

read -p "Press Enter to exit..."
