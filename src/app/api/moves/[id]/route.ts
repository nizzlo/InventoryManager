import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { CreateMoveSchema } from '@/lib/validations'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const move = await prisma.inventoryMove.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        item: true,
        location: true,
      },
    })

    if (!move) {
      return NextResponse.json(
        { error: 'Move not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(move)
  } catch (error) {
    console.error('Error fetching move:', error)
    return NextResponse.json(
      { error: 'Failed to fetch move' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const validatedData = CreateMoveSchema.parse(body)
    
    const move = await prisma.inventoryMove.update({
      where: { id: parseInt(params.id) },
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
    
    return NextResponse.json(move)
  } catch (error) {
    console.error('Error updating move:', error)
    return NextResponse.json(
      { error: 'Failed to update move' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.inventoryMove.delete({
      where: { id: parseInt(params.id) },
    })
    
    return NextResponse.json({ message: 'Move deleted successfully' })
  } catch (error) {
    console.error('Error deleting move:', error)
    return NextResponse.json(
      { error: 'Failed to delete move' },
      { status: 500 }
    )
  }
}
