import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { CreateItemSchema } from '@/lib/validations'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    const item = await prisma.item.findUnique({
      where: { id },
    })
    
    if (!item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(item)
  } catch (error) {
    console.error('Error fetching item:', error)
    return NextResponse.json(
      { error: 'Failed to fetch item' },
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
    const body = await request.json()
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
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to update item' },
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
    
    // Check if item has any inventory moves
    const moveCount = await prisma.inventoryMove.count({
      where: { itemId: id },
    })
    
    if (moveCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete item with existing inventory movements' },
        { status: 400 }
      )
    }
    
    await prisma.item.delete({
      where: { id },
    })
    
    return NextResponse.json({ message: 'Item deleted successfully' })
  } catch (error) {
    console.error('Error deleting item:', error)
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to delete item' },
      { status: 500 }
    )
  }
}
