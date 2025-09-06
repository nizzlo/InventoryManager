-- CreateEnum
CREATE TYPE "MoveType" AS ENUM ('IN', 'OUT', 'ADJUST');

-- CreateTable
CREATE TABLE "item" (
    "id" SERIAL NOT NULL,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "uom" TEXT NOT NULL DEFAULT 'pcs',
    "barcode" TEXT,
    "minQty" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "location" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventorymove" (
    "id" SERIAL NOT NULL,
    "itemId" INTEGER NOT NULL,
    "locationId" INTEGER NOT NULL,
    "type" "MoveType" NOT NULL,
    "qty" DECIMAL(65,30) NOT NULL,
    "unitCost" DECIMAL(65,30),
    "ref" TEXT,
    "note" TEXT,
    "movedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userName" TEXT,

    CONSTRAINT "inventorymove_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "item_sku_key" ON "item"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "item_barcode_key" ON "item"("barcode");

-- CreateIndex
CREATE UNIQUE INDEX "location_name_key" ON "location"("name");

-- CreateIndex
CREATE INDEX "inventorymove_itemId_locationId_movedAt_idx" ON "inventorymove"("itemId", "locationId", "movedAt");

-- AddForeignKey
ALTER TABLE "inventorymove" ADD CONSTRAINT "inventorymove_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventorymove" ADD CONSTRAINT "inventorymove_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
