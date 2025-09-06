import { z } from 'zod'

export const CreateItemSchema = z.object({
  sku: z.string().min(1, 'SKU is required'),
  name: z.string().min(1, 'Name is required'),
  category: z.string().optional(),
  uom: z.string().default('pcs'),
  barcode: z.string().optional(),
  minQty: z.number().min(0).default(0),
  imageUrl: z.string().optional(),
})

export const CreateMoveSchema = z.object({
  itemId: z.number().min(1),
  locationId: z.number().min(1),
  type: z.enum(['IN', 'OUT', 'ADJUST']),
  qty: z.number().min(0.01, 'Quantity must be greater than 0'),
  unitCost: z.number().min(0).optional(),
  sellPrice: z.number().min(0).optional(),
  ref: z.string().optional(),
  note: z.string().optional(),
  userName: z.string().optional(),
})

export type CreateItemInput = z.infer<typeof CreateItemSchema>
export type CreateMoveInput = z.infer<typeof CreateMoveSchema>
