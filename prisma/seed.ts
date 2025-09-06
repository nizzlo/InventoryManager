import { PrismaClient } from '@prisma/client'
import { Decimal } from 'decimal.js'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Create locations
  const warehouse = await prisma.location.upsert({
    where: { name: 'Main Warehouse' },
    update: {},
    create: {
      name: 'Main Warehouse',
    },
  })

  const retail = await prisma.location.upsert({
    where: { name: 'Retail Store' },
    update: {},
    create: {
      name: 'Retail Store',
    },
  })

  console.log('✅ Locations created')

  // Create items
  const laptop = await prisma.item.upsert({
    where: { sku: 'LAPTOP-001' },
    update: {},
    create: {
      sku: 'LAPTOP-001',
      name: 'Dell Laptop XPS 13',
      category: 'Electronics',
      uom: 'pcs',
      barcode: '1234567890123',
      minQty: new Decimal(5),
    },
  })

  const mouse = await prisma.item.upsert({
    where: { sku: 'MOUSE-001' },
    update: {},
    create: {
      sku: 'MOUSE-001',
      name: 'Logitech Wireless Mouse',
      category: 'Electronics',
      uom: 'pcs',
      barcode: '2345678901234',
      minQty: new Decimal(10),
    },
  })

  const keyboard = await prisma.item.upsert({
    where: { sku: 'KB-001' },
    update: {},
    create: {
      sku: 'KB-001',
      name: 'Mechanical Keyboard',
      category: 'Electronics',
      uom: 'pcs',
      barcode: '3456789012345',
      minQty: new Decimal(8),
    },
  })

  console.log('✅ Items created')

  // Create some inventory moves
  await prisma.inventoryMove.createMany({
    data: [
      // Initial stock in warehouse
      {
        itemId: laptop.id,
        locationId: warehouse.id,
        type: 'IN',
        qty: new Decimal(20),
        unitCost: new Decimal(999.99),
        ref: 'PO-001',
        note: 'Initial purchase order',
        userName: 'admin',
      },
      {
        itemId: mouse.id,
        locationId: warehouse.id,
        type: 'IN',
        qty: new Decimal(50),
        unitCost: new Decimal(29.99),
        ref: 'PO-001',
        note: 'Initial purchase order',
        userName: 'admin',
      },
      {
        itemId: keyboard.id,
        locationId: warehouse.id,
        type: 'IN',
        qty: new Decimal(30),
        unitCost: new Decimal(79.99),
        ref: 'PO-001',
        note: 'Initial purchase order',
        userName: 'admin',
      },
      // Transfer some to retail
      {
        itemId: laptop.id,
        locationId: warehouse.id,
        type: 'OUT',
        qty: new Decimal(5),
        ref: 'TRF-001',
        note: 'Transfer to retail store',
        userName: 'admin',
      },
      {
        itemId: laptop.id,
        locationId: retail.id,
        type: 'IN',
        qty: new Decimal(5),
        ref: 'TRF-001',
        note: 'Transfer from warehouse',
        userName: 'admin',
      },
      {
        itemId: mouse.id,
        locationId: warehouse.id,
        type: 'OUT',
        qty: new Decimal(15),
        ref: 'TRF-002',
        note: 'Transfer to retail store',
        userName: 'admin',
      },
      {
        itemId: mouse.id,
        locationId: retail.id,
        type: 'IN',
        qty: new Decimal(15),
        ref: 'TRF-002',
        note: 'Transfer from warehouse',
        userName: 'admin',
      },
      // Some sales from retail
      {
        itemId: laptop.id,
        locationId: retail.id,
        type: 'OUT',
        qty: new Decimal(2),
        ref: 'SALE-001',
        note: 'Customer sale',
        userName: 'retail_user',
      },
      {
        itemId: mouse.id,
        locationId: retail.id,
        type: 'OUT',
        qty: new Decimal(8),
        ref: 'SALE-002',
        note: 'Customer sale',
        userName: 'retail_user',
      },
    ],
  })

  console.log('✅ Inventory moves created')
  console.log('🎉 Seed completed successfully!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
