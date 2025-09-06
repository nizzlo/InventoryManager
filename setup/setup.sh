#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Inventory Manager Setup${NC}"
echo "================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: Please run this script from the project root directory${NC}"
    exit 1
fi

# Check if Docker is running
echo -e "${YELLOW}🔍 Checking Docker...${NC}"
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker Desktop and run this script again.${NC}"
    echo -e "${YELLOW}   On macOS: Open Docker Desktop application${NC}"
    echo -e "${YELLOW}   On Windows: Open Docker Desktop application${NC}"
    echo -e "${YELLOW}   On Linux: sudo systemctl start docker${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker is running${NC}"

# Install dependencies (if not already installed)
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    npm install
else
    echo -e "${GREEN}✅ Dependencies already installed${NC}"
fi

# Start database containers
echo -e "${YELLOW}🐳 Starting PostgreSQL and pgAdmin containers...${NC}"
docker-compose up -d

# Wait for database to be ready
echo -e "${YELLOW}⏳ Waiting for database to be ready...${NC}"
sleep 15

# Check if containers are running
if ! docker-compose ps | grep -q "Up"; then
    echo -e "${RED}❌ Error: Containers failed to start${NC}"
    echo "Run 'docker-compose logs' to see the error details"
    exit 1
fi

echo -e "${GREEN}✅ Database containers are running${NC}"

# Generate Prisma client
echo -e "${YELLOW}🔧 Generating Prisma client...${NC}"
npm run db:generate

# Run migrations
echo -e "${YELLOW}🗄️ Running database migrations...${NC}"
npm run db:migrate

# Create the view (after migration)
echo -e "${YELLOW}📊 Creating database view...${NC}"
docker exec inventory_postgres psql -U postgres -d inventory -f /docker-entrypoint-initdb.d/init.sql > /dev/null 2>&1 || true

# Seed database
echo -e "${YELLOW}🌱 Seeding database with sample data...${NC}"
npm run db:seed

echo ""
echo -e "${GREEN}🎉 Setup complete!${NC}"
echo "================================"
echo ""
echo -e "${BLUE}📊 Access your application:${NC}"
echo -e "   • Application: ${GREEN}http://localhost:3000${NC}"
echo -e "   • pgAdmin: ${GREEN}http://localhost:8081${NC} (admin@inventory.com / admin123)"
echo -e "   • Prisma Studio: ${GREEN}npm run db:studio${NC}"
echo ""
echo -e "${BLUE}🚀 Start development server:${NC}"
echo -e "   ${GREEN}npm run dev${NC}"
echo ""
echo -e "${BLUE}📚 Useful commands:${NC}"
echo -e "   • ${GREEN}npm run dev${NC}          # Start development server"
echo -e "   • ${GREEN}npm run db:studio${NC}    # Open Prisma Studio"
echo -e "   • ${GREEN}npm run db:migrate${NC}   # Run new migrations"
echo -e "   • ${GREEN}npm run db:seed${NC}      # Re-seed database"
echo -e "   • ${GREEN}docker-compose logs${NC}  # View container logs"
echo -e "   • ${GREEN}./setup/reset.sh${NC}     # Reset everything"
echo ""
