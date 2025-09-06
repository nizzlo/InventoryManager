import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { CreateMoveSchema } from '@/lib/validations'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = CreateMoveSchema.parse(body)
    
    const move = await prisma.inventoryMove.create({
      data: {
        ...validatedData,
        qty: validatedData.qty.toString(),
        unitCost: validatedData.unitCost?.toString(),
      },
      include: {
        item: true,
        location: true,
      },
    })
    
    return NextResponse.json(move, { status: 201 })
  } catch (error) {
    console.error('Error creating move:', error)
    return NextResponse.json(
      { error: 'Failed to create move' },
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
