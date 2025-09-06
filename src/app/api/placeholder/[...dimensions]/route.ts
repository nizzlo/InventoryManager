import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { dimensions: string[] } }
) {
  try {
    const [width, height] = params.dimensions.map(Number)
    
    if (!width || !height || width > 500 || height > 500) {
      return NextResponse.json({ error: 'Invalid dimensions' }, { status: 400 })
    }

    // Create a simple SVG placeholder
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f5f5f5"/>
        <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="12" 
              fill="#999" text-anchor="middle" dy=".3em">No Image</text>
      </svg>
    `

    return new Response(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
      },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate placeholder' }, { status: 500 })
  }
}
