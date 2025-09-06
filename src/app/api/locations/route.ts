import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z, ZodError } from 'zod'

const CreateLocationSchema = z.object({
  name: z.string()
    .min(1, 'Location name is required')
    .max(100, 'Location name must be 100 characters or less'),
})

export async function GET() {
  try {
    const locations = await prisma.location.findMany({
      orderBy: {
        name: 'asc',
      },
    })
    return NextResponse.json(locations)
  } catch (error) {
    console.error('Error fetching locations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch locations' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = CreateLocationSchema.parse(body)

    const location = await prisma.location.create({
      data: validatedData,
    })

    return NextResponse.json(location, { status: 201 })
  } catch (error) {
    console.error('Error creating location:', error)

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
          return NextResponse.json(
            { 
              error: 'Duplicate entry',
              message: 'A location with this name already exists'
            },
            { status: 409 }
          )
        default:
          return NextResponse.json(
            { 
              error: 'Database error',
              message: 'A database error occurred while creating the location'
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

    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'An unexpected error occurred while creating the location'
      },
      { status: 500 }
    )
  }
}
