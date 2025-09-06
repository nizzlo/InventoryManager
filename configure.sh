#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🎨 Inventory Manager Configuration Tool${NC}"
echo "============================================"

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo -e "${YELLOW}Creating .env.local from .env.example...${NC}"
    cp .env.example .env.local
fi

echo ""
echo "Current configuration:"
echo "---------------------"
if grep -q "NEXT_PUBLIC_APP_NAME" .env.local; then
    current_name=$(grep "NEXT_PUBLIC_APP_NAME" .env.local | cut -d'"' -f2)
    echo -e "App Name: ${GREEN}${current_name}${NC}"
fi

if grep -q "NEXT_PUBLIC_APP_DESCRIPTION" .env.local; then
    current_desc=$(grep "NEXT_PUBLIC_APP_DESCRIPTION" .env.local | cut -d'"' -f2)
    echo -e "Description: ${GREEN}${current_desc}${NC}"
fi

echo ""
echo "What would you like to change?"
echo "1) Application Name"
echo "2) Application Description" 
echo "3) Both"
echo "4) Exit"

read -p "Choose option (1-4): " choice

case $choice in
    1|3)
        echo ""
        read -p "Enter new application name: " new_name
        # Update the app name in .env.local
        if grep -q "NEXT_PUBLIC_APP_NAME" .env.local; then
            sed -i.bak "s/NEXT_PUBLIC_APP_NAME=\".*\"/NEXT_PUBLIC_APP_NAME=\"${new_name}\"/" .env.local
        else
            echo "NEXT_PUBLIC_APP_NAME=\"${new_name}\"" >> .env.local
        fi
        echo -e "${GREEN}✓ App name updated to: ${new_name}${NC}"
        
        if [ $choice -eq 1 ]; then
            break
        fi
        ;&
    2)
        if [ $choice -eq 2 ]; then
            echo ""
        fi
        read -p "Enter new application description: " new_desc
        # Update the description in .env.local
        if grep -q "NEXT_PUBLIC_APP_DESCRIPTION" .env.local; then
            sed -i.bak "s/NEXT_PUBLIC_APP_DESCRIPTION=\".*\"/NEXT_PUBLIC_APP_DESCRIPTION=\"${new_desc}\"/" .env.local
        else
            echo "NEXT_PUBLIC_APP_DESCRIPTION=\"${new_desc}\"" >> .env.local
        fi
        echo -e "${GREEN}✓ Description updated to: ${new_desc}${NC}"
        ;;
    4)
        echo "Exiting..."
        exit 0
        ;;
    *)
        echo "Invalid option"
        exit 1
        ;;
esac

# Clean up backup file
rm -f .env.local.bak

echo ""
echo -e "${BLUE}Configuration updated successfully!${NC}"
echo ""
echo "To see the changes:"
echo "1. Restart your development server: npm run dev"
echo "2. Refresh your browser"
echo ""
echo -e "${YELLOW}Note: Environment variables starting with NEXT_PUBLIC_ are bundled into the browser build.${NC}"
echo -e "${YELLOW}You need to restart the dev server for changes to take effect.${NC}"
