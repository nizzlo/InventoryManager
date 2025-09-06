import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { CreateItemSchema } from '@/lib/validations'
import { ZodError } from 'zod'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    
    // Validate ID parameter
    if (isNaN(id) || id <= 0) {
      return NextResponse.json(
        { 
          error: 'Invalid ID',
          message: 'Item ID must be a valid positive number'
        },
        { status: 400 }
      )
    }
    
    const item = await prisma.item.findUnique({
      where: { id },
    })
    
    if (!item) {
      return NextResponse.json(
        { 
          error: 'Item not found',
          message: 'The requested item does not exist'
        },
        { status: 404 }
      )
    }
    
    return NextResponse.json(item)
  } catch (error) {
    console.error('Error fetching item:', error)
    
    // Handle Prisma database errors
    if (error && typeof error === 'object' && 'code' in error) {
      return NextResponse.json(
        { 
          error: 'Database error',
          message: 'A database error occurred while fetching the item'
        },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'An unexpected error occurred while fetching the item'
      },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    
    // Validate ID parameter
    if (isNaN(id) || id <= 0) {
      return NextResponse.json(
        { 
          error: 'Invalid ID',
          message: 'Item ID must be a valid positive number'
        },
        { status: 400 }
      )
    }
    
    const body = await request.json()
    
    // Validate the request body
    const validatedData = CreateItemSchema.parse(body)
    
    const item = await prisma.item.update({
      where: { id },
      data: {
        ...validatedData,
        minQty: validatedData.minQty.toString(),
      },
    })
    
    return NextResponse.json(item)
  } catch (error) {
    console.error('Error updating item:', error)
    
    // Handle validation errors from Zod
    if (error instanceof ZodError) {
      const validationErrors = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }))
      
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: validationErrors,
          message: validationErrors.map(err => `${err.field}: ${err.message}`).join(', ')
        },
        { status: 400 }
      )
    }
    
    // Handle Prisma database errors
    if (error && typeof error === 'object' && 'code' in error) {
      switch (error.code) {
        case 'P2002':
          // Unique constraint violation
          const target = (error as any).meta?.target
          const field = Array.isArray(target) ? target[0] : target || 'field'
          return NextResponse.json(
            { 
              error: 'Duplicate entry',
              message: `An item with this ${field} already exists`,
              field: field
            },
            { status: 409 }
          )
        case 'P2003':
          // Foreign key constraint violation
          return NextResponse.json(
            { 
              error: 'Invalid reference',
              message: 'Referenced record does not exist'
            },
            { status: 400 }
          )
        case 'P2025':
          // Record not found
          return NextResponse.json(
            { 
              error: 'Item not found',
              message: 'The item you are trying to update does not exist'
            },
            { status: 404 }
          )
        default:
          return NextResponse.json(
            { 
              error: 'Database error',
              message: 'A database error occurred while updating the item'
            },
            { status: 500 }
          )
      }
    }
    
    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { 
          error: 'Invalid JSON',
          message: 'Request body contains invalid JSON'
        },
        { status: 400 }
      )
    }
    
    // Handle other errors
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'An unexpected error occurred while updating the item'
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    
    // Validate ID parameter
    if (isNaN(id) || id <= 0) {
      return NextResponse.json(
        { 
          error: 'Invalid ID',
          message: 'Item ID must be a valid positive number'
        },
        { status: 400 }
      )
    }
    
    // Check if item has any inventory moves
    const moveCount = await prisma.inventoryMove.count({
      where: { itemId: id },
    })
    
    if (moveCount > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot delete item',
          message: 'Cannot delete item with existing inventory movements. Please remove all inventory movements first.'
        },
        { status: 400 }
      )
    }
    
    await prisma.item.delete({
      where: { id },
    })
    
    return NextResponse.json({ 
      message: 'Item deleted successfully',
      success: true 
    })
  } catch (error) {
    console.error('Error deleting item:', error)
    
    // Handle Prisma database errors
    if (error && typeof error === 'object' && 'code' in error) {
      switch (error.code) {
        case 'P2025':
          // Record not found
          return NextResponse.json(
            { 
              error: 'Item not found',
              message: 'The item you are trying to delete does not exist'
            },
            { status: 404 }
          )
        case 'P2003':
          // Foreign key constraint violation
          return NextResponse.json(
            { 
              error: 'Cannot delete item',
              message: 'Cannot delete item due to existing references'
            },
            { status: 400 }
          )
        default:
          return NextResponse.json(
            { 
              error: 'Database error',
              message: 'A database error occurred while deleting the item'
            },
            { status: 500 }
          )
      }
    }
    
    // Handle other errors
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'An unexpected error occurred while deleting the item'
      },
      { status: 500 }
    )
  }
}
