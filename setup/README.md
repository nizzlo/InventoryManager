# Setup Scripts

This folder contains all the setup and configuration scripts for the Inventory Manager application.

## Files

### Scripts

- **`setup.sh`** - Main setup script that configures the entire application
- **`reset.sh`** - Reset script that cleans up everything for a fresh start

### SQL Files

- **`init.sql`** - Initial database setup and view creation (used by Docker)
- **`create-view.sql`** - Manual view creation script (backup/reference)

## Usage

### Initial Setup

From the project root directory:

```bash
./setup/setup.sh
```

This script will:
1. Check if Docker is running
2. Install npm dependencies
3. Start PostgreSQL and pgAdmin containers
4. Generate Prisma client
5. Run database migrations
6. Create database views
7. Seed the database with sample data

### Reset Everything

To completely reset the application and database:

```bash
./setup/reset.sh
```

This script will:
1. Stop and remove all Docker containers
2. Remove Docker volumes (deletes all data)
3. Clean Prisma migrations
4. Optionally remove node_modules

### Manual Database Commands

If you need to manually run database operations:

```bash
# Reset database
npm run db:reset

# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed database
npm run db:seed

# Open Prisma Studio
npm run db:studio
```

### Docker Commands

```bash
# Start containers
docker-compose up -d

# Stop containers
docker-compose down

# View logs
docker-compose logs postgres
docker-compose logs pgadmin

# Execute SQL in database
docker exec -it inventory_postgres psql -U postgres -d inventory
```

## Troubleshooting

### Docker Issues

If Docker fails to start:
1. Make sure Docker Desktop is running
2. Check Docker daemon status
3. Try restarting Docker Desktop

### Database Connection Issues

If you can't connect to the database:
1. Check if containers are running: `docker-compose ps`
2. Check container logs: `docker-compose logs postgres`
3. Verify the DATABASE_URL in `.env` file

### Permission Issues

If scripts don't run:
```bash
chmod +x setup/*.sh
```

### Port Conflicts

If ports are already in use:
- PostgreSQL (5432): Change port in `docker-compose.yml`
- pgAdmin (8080): Change port in `docker-compose.yml`
- Next.js (3000): Set PORT environment variable
