# 📦 Inventory Manager

A modern inventory management system built with Next.js, PostgreSQL, Prisma, and Ant Design.

## 🚀 Features

- **Item Management**: Create and manage inventory items with SKU, name, category, UoM, barcode, and minimum quantity
- **Multi-Location Support**: Track inventory across multiple locations
- **Stock Movements**: Record IN, OUT, and ADJUST stock movements with full audit trail
- **Real-time Balances**: View current stock levels with low stock alerts
- **Low Stock Alerts**: Visual indicators when stock falls below minimum quantity
- **Responsive UI**: Clean, modern interface built with Ant Design
- **TypeScript**: Full type safety throughout the application

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 with App Router
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL 16
- **ORM**: Prisma
- **UI Library**: Ant Design + Ant Design Icons
- **Language**: TypeScript
- **Data Fetching**: TanStack React Query
- **Validation**: Zod
- **Containerization**: Docker & Docker Compose

## 📋 Prerequisites

- Node.js 18+ 
- Docker and Docker Compose
- Git

## 🔧 Installation & Setup

### Option 1: Quick Setup (Recommended)

```bash
# Clone the repository
git clone <your-repo-url>
cd inventory-manager

# Run the setup script (requires Docker to be running)
./setup/setup.sh
```

### Option 2: Manual Setup

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd inventory-manager
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Docker Desktop

**Before proceeding, make sure Docker Desktop is running:**
- **macOS**: Open Docker Desktop from Applications
- **Windows**: Open Docker Desktop from Start Menu
- **Linux**: Run `sudo systemctl start docker`

### 4. Start PostgreSQL with Docker

```bash
# Start PostgreSQL and pgAdmin
docker-compose up -d

# Check if containers are running
docker-compose ps
```

This will start:
- **PostgreSQL** on port `5432`
- **pgAdmin** on port `8080` (admin@inventory.com / admin123)

### 4. Environment Configuration

The `.env` file is already configured for local development:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/inventory?schema=public"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

### 5. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Seed the database with sample data
npm run db:seed
```

### 6. Start the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 📊 Database Schema

The application uses the following main entities:

### Item
- ID (auto-increment)
- SKU (unique)
- Name
- Category (optional)
- Unit of Measure (UoM)
- Barcode (optional, unique)
- Minimum Quantity
- Created timestamp

### Location
- ID (auto-increment)
- Name (unique)

### InventoryMove
- ID (auto-increment)
- Item ID (foreign key)
- Location ID (foreign key)
- Move Type (IN/OUT/ADJUST)
- Quantity
- Unit Cost (optional)
- Reference (optional)
- Note (optional)
- Moved timestamp
- User name (optional)

### Database View
A SQL view `v_item_location_balances` automatically calculates current stock levels across all item-location combinations.

## 🎯 Usage

### Adding Items
1. Navigate to the **Items** page
2. Click **"Add Item"**
3. Fill in the form with item details
4. Click **"Create Item"**

### Recording Stock Movements
1. Navigate to the **Stock Moves** page
2. Click **"Record Move"**
3. Select item, location, and move type
4. Enter quantity and optional details
5. Click **"Record Move"**

### Viewing Stock Balances
1. Navigate to the **Balances** page
2. View current stock levels for all item-location combinations
3. Items below minimum quantity are highlighted in red
4. Use filters to find specific items or locations

## 🔍 API Endpoints

- `GET /api/items` - List all items
- `POST /api/items` - Create a new item
- `GET /api/locations` - List all locations
- `GET /api/moves` - List recent stock movements
- `POST /api/moves` - Record a stock movement
- `GET /api/balances` - Get current stock balances

## 📱 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Run migrations
npm run db:seed      # Seed database
npm run db:studio    # Open Prisma Studio
npm run db:reset     # Reset database (dev only)
```

## � Reset & Cleanup

To completely reset the application and start fresh:

```bash
./setup/reset.sh
```

This will remove all containers, volumes, and optionally node_modules.

## 🐳 Docker Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs postgres
docker-compose logs pgadmin

# Reset everything (careful!)
docker-compose down -v
# Or use: ./setup/reset.sh
```

## 🎨 Sample Data

The seed script creates:

**Locations:**
- Main Warehouse
- Retail Store

**Items:**
- Dell Laptop XPS 13 (SKU: LAPTOP-001)
- Logitech Wireless Mouse (SKU: MOUSE-001)
- Mechanical Keyboard (SKU: KB-001)

**Sample Movements:**
- Initial stock purchases
- Transfers between locations
- Sales transactions

## 🔒 Security Features

- Input validation with Zod schemas
- SQL injection protection via Prisma ORM
- TypeScript for compile-time type checking
- Environment variable configuration

## 🚀 Production Deployment

For production deployment:

1. Set up a PostgreSQL database
2. Update `DATABASE_URL` in environment variables
3. Run migrations: `npm run db:migrate`
4. Build the application: `npm run build`
5. Start with: `npm start`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🐛 Troubleshooting

### Database Connection Issues
- Ensure Docker is running
- Check if PostgreSQL container is healthy: `docker-compose ps`
- Verify DATABASE_URL in `.env` file

### Migration Issues
- Reset database: `npm run db:reset`
- Regenerate client: `npm run db:generate`
- Run migrations again: `npm run db:migrate`

### Port Conflicts
- PostgreSQL (5432): Change port mapping in `docker-compose.yml`
- Next.js (3000): Set `PORT` environment variable
- pgAdmin (8080): Change port mapping in `docker-compose.yml`

## 📞 Support

For issues and questions, please create an issue in the GitHub repository.
