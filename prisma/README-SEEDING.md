# Database Setup Options

This Inventory Manager starts with a completely empty database by default.

## Empty Database (Default)
The application starts with no initial data. This is configured in:
- `prisma/seed-empty.ts` - Empty seed script
- Used by both Mac and Windows setup scripts

## Demo Data (Optional)
If you want to populate the database with sample data for testing or demonstration:

### Option 1: Using npm script
```bash
npm run db:seed-demo
```

### Option 2: Using Prisma directly
```bash
npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed-demo.ts
```

## Demo Data Contents
The demo data includes:
- 2 Locations (Main Warehouse, Retail Store)
- 3 Sample Items (Laptop, Mouse, Keyboard)
- Multiple inventory moves showing:
  - Initial stock purchases
  - Transfers between locations
  - Sales transactions
  - Inventory adjustments

## Resetting Database
To completely reset the database and start fresh:

```bash
npm run db:reset
```

This will:
1. Drop all data
2. Reapply all migrations
3. Run the empty seed (no data added)

If you want to reset and add demo data:
```bash
npm run db:reset
npm run db:seed-demo
```
