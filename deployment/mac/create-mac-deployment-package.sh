#!/bin/bash

echo "==============================================="
echo "    Creating Deployment Package for Mac"
echo "==============================================="
echo

echo "Creating deployment package..."
echo "This will take a moment..."

cd "$(dirname "$0")/../.."

if [ -f "InventoryManager-Mac-Deployment.zip" ]; then
    rm "InventoryManager-Mac-Deployment.zip"
fi

echo
echo "Packaging essential files..."
echo "- Application source code"
echo "- Database schema and migrations"  
echo "- Deployment scripts"
echo "- Configuration files"
echo

# Create a temporary folder structure
if [ -d "temp-deployment" ]; then
    rm -rf "temp-deployment"
fi
mkdir "temp-deployment"

# Copy essential files
cp -r "src" "temp-deployment/"
cp -r "prisma" "temp-deployment/"  
cp -r "public" "temp-deployment/"
cp -r "deployment" "temp-deployment/"
cp "package.json" "temp-deployment/"
cp "package-lock.json" "temp-deployment/"
[ -f "next.config.js" ] && cp "next.config.js" "temp-deployment/"
cp "tsconfig.json" "temp-deployment/"
[ -f ".env.local" ] && cp ".env.local" "temp-deployment/"
cp "docker-compose.yml" "temp-deployment/"
[ -f "tailwind.config.js" ] && cp "tailwind.config.js" "temp-deployment/"
[ -f "postcss.config.js" ] && cp "postcss.config.js" "temp-deployment/"

# Create the deployment package
cd temp-deployment
zip -r "../InventoryManager-Mac-Deployment.zip" .
cd ..

# Cleanup
rm -rf "temp-deployment"

echo
echo "==============================================="
echo "   ✅ Mac deployment package created!"
echo "   📦 File: InventoryManager-Mac-Deployment.zip"
echo "==============================================="
echo
echo "This package contains everything needed to run"
echo "the Inventory Manager on another Mac."
echo
echo "Next steps:"
echo "1. Copy the ZIP file to the target Mac"
echo "2. Extract it to ~/InventoryManager/"
echo "3. Run first-time-setup.sh"
echo "4. Use start-inventory-manager.sh to run"
echo

read -p "Press Enter to finish..."
