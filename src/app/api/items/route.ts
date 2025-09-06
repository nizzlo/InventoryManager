import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { CreateItemSchema } from '@/lib/validations'

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
    return NextResponse.json(
      { error: 'Failed to create item' },
      { status: 500 }
    )
  }
}
