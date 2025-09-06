import { z } from 'zod'

export const CreateItemSchema = z.object({
  sku: z.string()
    .min(1, 'SKU is required')
    .max(50, 'SKU must be 50 characters or less')
    .regex(/^[A-Za-z0-9\-_]+$/, 'SKU can only contain letters, numbers, hyphens, and underscores'),
  name: z.string()
    .min(1, 'Item name is required')
    .max(255, 'Item name must be 255 characters or less'),
  category: z.string()
    .max(100, 'Category must be 100 characters or less')
    .optional(),
  uom: z.string()
    .min(1, 'Unit of measure is required')
    .max(20, 'Unit of measure must be 20 characters or less')
    .default('pcs'),
  barcode: z.string()
    .max(100, 'Barcode must be 100 characters or less')
    .optional(),
  minQty: z.number()
    .min(0, 'Minimum quantity cannot be negative')
    .max(999999999, 'Minimum quantity is too large')
    .default(0),
  imageUrl: z.string()
    .url('Image URL must be a valid URL')
    .max(500, 'Image URL must be 500 characters or less')
    .optional(),
})

export const CreateMoveSchema = z.object({
  itemId: z.number()
    .int('Item ID must be an integer')
    .min(1, 'Please select a valid item'),
  locationId: z.number()
    .int('Location ID must be an integer')
    .min(1, 'Please select a valid location'),
  type: z.enum(['IN', 'OUT', 'ADJUST'], {
    errorMap: () => ({ message: 'Movement type must be IN, OUT, or ADJUST' })
  }),
  qty: z.number()
    .min(0.01, 'Quantity must be greater than 0')
    .max(999999999, 'Quantity is too large'),
  unitCost: z.number()
    .min(0, 'Unit cost cannot be negative')
    .max(999999999, 'Unit cost is too large')
    .optional(),
  sellPrice: z.number()
    .min(0, 'Sell price cannot be negative')
    .max(999999999, 'Sell price is too large')
    .optional(),
  ref: z.string()
    .max(100, 'Reference must be 100 characters or less')
    .optional(),
  note: z.string()
    .max(500, 'Note must be 500 characters or less')
    .optional(),
  userName: z.string()
    .max(100, 'User name must be 100 characters or less')
    .optional(),
})

export type CreateItemInput = z.infer<typeof CreateItemSchema>
export type CreateMoveInput = z.infer<typeof CreateMoveSchema>
