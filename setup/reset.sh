#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔄 Inventory Manager Reset${NC}"
echo "================================"

echo -e "${YELLOW}⚠️  This will completely reset your database and remove all data!${NC}"
read -p "Are you sure you want to continue? (y/N): " -n 1 -r
echo

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${GREEN}Reset cancelled.${NC}"
    exit 0
fi

# Stop and remove containers
echo -e "${YELLOW}🛑 Stopping and removing containers...${NC}"
docker-compose down -v

# Remove Docker volumes (this removes all database data)
echo -e "${YELLOW}🗑️ Removing Docker volumes...${NC}"
docker volume prune -f

# Remove Prisma migrations (optional)
echo -e "${YELLOW}🔧 Cleaning Prisma...${NC}"
rm -rf prisma/migrations

# Remove node_modules (optional)
read -p "Remove node_modules? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}📦 Removing node_modules...${NC}"
    rm -rf node_modules
fi

echo ""
echo -e "${GREEN}🎉 Reset complete!${NC}"
echo "================================"
echo ""
echo -e "${BLUE}To set up again:${NC}"
echo -e "   ${GREEN}./setup/setup.sh${NC}"
echo ""
