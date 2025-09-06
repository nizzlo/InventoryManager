import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { CreateItemSchema } from '@/lib/validations'
import { ZodError } from 'zod'

export async function GET() {
  try {
    const items = await prisma.item.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    })
    return NextResponse.json(items)
  } catch (error) {
    console.error('Error fetching items:', error)
    return NextResponse.json(
      { error: 'Failed to fetch items' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate the request body
    const validatedData = CreateItemSchema.parse(body)
    
    const item = await prisma.item.create({
      data: {
        ...validatedData,
        minQty: validatedData.minQty.toString(),
      },
    })
    
    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    console.error('Error creating item:', error)
    
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
              error: 'Not found',
              message: 'Required record not found'
            },
            { status: 404 }
          )
        default:
          return NextResponse.json(
            { 
              error: 'Database error',
              message: 'A database error occurred while creating the item'
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
        message: 'An unexpected error occurred while creating the item'
      },
      { status: 500 }
    )
  }
}
