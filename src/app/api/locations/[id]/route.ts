import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const UpdateLocationSchema = z.object({
  name: z.string()
    .min(1, 'Location name is required')
    .max(100, 'Location name must be 100 characters or less'),
})

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const locationId = parseInt(params.id)
    
    if (isNaN(locationId)) {
      return NextResponse.json(
        { error: 'Invalid location ID' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const validatedData = UpdateLocationSchema.parse(body)

    // Check if location exists
    const existingLocation = await prisma.location.findUnique({
      where: { id: locationId }
    })

    if (!existingLocation) {
      return NextResponse.json(
        { error: 'Location not found' },
        { status: 404 }
      )
    }

    // Check if name is already taken by another location
    const nameExists = await prisma.location.findFirst({
      where: {
        name: validatedData.name,
        id: { not: locationId }
      }
    })

    if (nameExists) {
      return NextResponse.json(
        { error: 'A location with this name already exists' },
        { status: 409 }
      )
    }

    const updatedLocation = await prisma.location.update({
      where: { id: locationId },
      data: validatedData,
    })

    return NextResponse.json(updatedLocation)
  } catch (error) {
    console.error('Error updating location:', error)

    // Handle validation errors
    if (error instanceof z.ZodError) {
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
          return NextResponse.json(
            { error: 'A location with this name already exists' },
            { status: 409 }
          )
        case 'P2025':
          return NextResponse.json(
            { error: 'Location not found' },
            { status: 404 }
          )
        default:
          return NextResponse.json(
            { error: 'Database error occurred while updating location' },
            { status: 500 }
          )
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const locationId = parseInt(params.id)
    
    if (isNaN(locationId)) {
      return NextResponse.json(
        { error: 'Invalid location ID' },
        { status: 400 }
      )
    }

    // Check if location exists
    const existingLocation = await prisma.location.findUnique({
      where: { id: locationId }
    })

    if (!existingLocation) {
      return NextResponse.json(
        { error: 'Location not found' },
        { status: 404 }
      )
    }

    // Check if location is being used in any moves
    const movesCount = await prisma.inventoryMove.count({
      where: { locationId }
    })

    if (movesCount > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot delete location',
          message: `This location is referenced in ${movesCount} inventory move(s). Please remove or reassign these moves before deleting the location.`
        },
        { status: 409 }
      )
    }

    await prisma.location.delete({
      where: { id: locationId }
    })

    return NextResponse.json({ message: 'Location deleted successfully' })
  } catch (error) {
    console.error('Error deleting location:', error)

    // Handle Prisma database errors
    if (error && typeof error === 'object' && 'code' in error) {
      switch (error.code) {
        case 'P2025':
          return NextResponse.json(
            { error: 'Location not found' },
            { status: 404 }
          )
        case 'P2003':
          return NextResponse.json(
            { 
              error: 'Cannot delete location',
              message: 'This location is referenced by other records and cannot be deleted.'
            },
            { status: 409 }
          )
        default:
          return NextResponse.json(
            { error: 'Database error occurred while deleting location' },
            { status: 500 }
          )
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
