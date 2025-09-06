import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { CreateMoveSchema } from '@/lib/validations'
import { z, ZodError } from 'zod'

// Schema for multiple moves
const CreateMultipleMovesSchema = z.object({
  moves: z.array(CreateMoveSchema).min(1, 'At least one move is required'),
})

// Helper function to get or create location
async function getOrCreateLocationId(moveData: any) {
  if (moveData.locationId) {
    return moveData.locationId
  }
  
  if (moveData.locationName) {
    // Try to find existing location first
    let location = await prisma.location.findUnique({
      where: { name: moveData.locationName }
    })
    
    // Create new location if it doesn't exist
    if (!location) {
      location = await prisma.location.create({
        data: { name: moveData.locationName }
      })
    }
    
    return location.id
  }
  
  throw new Error('Either locationId or locationName must be provided')
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Check if it's a single move or multiple moves
    if (body.moves && Array.isArray(body.moves)) {
      // Handle multiple moves
      const validatedData = CreateMultipleMovesSchema.parse(body)
      
      const moves = await Promise.all(
        validatedData.moves.map(async (moveData) => {
          const locationId = await getOrCreateLocationId(moveData)
          
          return prisma.inventoryMove.create({
            data: {
              itemId: moveData.itemId,
              locationId,
              type: moveData.type,
              qty: moveData.qty.toString(),
              unitCost: moveData.unitCost?.toString(),
              sellPrice: moveData.sellPrice?.toString(),
              ref: moveData.ref,
              note: moveData.note,
              userName: moveData.userName,
            },
            include: {
              item: true,
              location: true,
            },
          })
        })
      )
      
      return NextResponse.json(moves, { status: 201 })
    } else {
      // Handle single move
      const validatedData = CreateMoveSchema.parse(body)
      const locationId = await getOrCreateLocationId(validatedData)
      
      const move = await prisma.inventoryMove.create({
        data: {
          itemId: validatedData.itemId,
          locationId,
          type: validatedData.type,
          qty: validatedData.qty.toString(),
          unitCost: validatedData.unitCost?.toString(),
          sellPrice: validatedData.sellPrice?.toString(),
          ref: validatedData.ref,
          note: validatedData.note,
          userName: validatedData.userName,
        },
        include: {
          item: true,
          location: true,
        },
      })
      
      return NextResponse.json(move, { status: 201 })
    }
  } catch (error) {
    console.error('Error creating move(s):', error)
    
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
        case 'P2003':
          // Foreign key constraint violation
          return NextResponse.json(
            { 
              error: 'Invalid reference',
              message: 'Item or Location does not exist'
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
              message: 'A database error occurred while creating the move(s)'
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
        message: 'An unexpected error occurred while creating the move(s)'
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const moves = await prisma.inventoryMove.findMany({
      include: {
        item: true,
        location: true,
      },
      orderBy: {
        movedAt: 'desc',
      },
      take: 100, // Limit to last 100 moves
    })
    
    return NextResponse.json(moves)
  } catch (error) {
    console.error('Error fetching moves:', error)
    return NextResponse.json(
      { error: 'Failed to fetch moves' },
      { status: 500 }
    )
  }
}
