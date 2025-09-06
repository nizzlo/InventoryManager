#!/bin/bash

echo "🚀 Setting up Inventory Manager..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop and run this script again."
    echo "   On macOS: Open Docker Desktop application"
    echo "   On Windows: Open Docker Desktop application"
    echo "   On Linux: sudo systemctl start docker"
    exit 1
fi

echo "✅ Docker is running"

# Start database containers
echo "🐳 Starting PostgreSQL and pgAdmin containers..."
docker-compose up -d

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

# Install dependencies (if not already installed)
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npm run db:generate

# Run migrations
echo "🗄️ Running database migrations..."
npm run db:migrate

# Seed database
echo "🌱 Seeding database with sample data..."
npm run db:seed

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📊 Access your application:"
echo "   • Application: http://localhost:3000"
echo "   • pgAdmin: http://localhost:8080 (admin@inventory.com / admin123)"
echo "   • Prisma Studio: npm run db:studio"
echo ""
echo "🚀 Start development server:"
echo "   npm run dev"
echo ""
echo "📚 Useful commands:"
echo "   • npm run dev          # Start development server"
echo "   • npm run db:studio    # Open Prisma Studio"
echo "   • npm run db:migrate   # Run new migrations"
echo "   • npm run db:seed      # Re-seed database"
echo "   • docker-compose logs  # View container logs"
echo ""
