import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { CreateMoveSchema } from '@/lib/validations'
import { z } from 'zod'

// Schema for multiple moves
const CreateMultipleMovesSchema = z.object({
  moves: z.array(CreateMoveSchema).min(1, 'At least one move is required'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Check if it's a single move or multiple moves
    if (body.moves && Array.isArray(body.moves)) {
      // Handle multiple moves
      const validatedData = CreateMultipleMovesSchema.parse(body)
      
      const moves = await Promise.all(
        validatedData.moves.map(async (moveData) => {
          return prisma.inventoryMove.create({
            data: {
              ...moveData,
              qty: moveData.qty.toString(),
              unitCost: moveData.unitCost?.toString(),
              sellPrice: moveData.sellPrice?.toString(),
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
      
      const move = await prisma.inventoryMove.create({
        data: {
          ...validatedData,
          qty: validatedData.qty.toString(),
          unitCost: validatedData.unitCost?.toString(),
          sellPrice: validatedData.sellPrice?.toString(),
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
    return NextResponse.json(
      { error: 'Failed to create move(s)' },
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
