import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  // Handle uploaded images
  if (request.nextUrl.pathname.startsWith('/uploads/')) {
    const response = NextResponse.next()
    
    // Add proper headers for images
    response.headers.set('Cache-Control', 'public, max-age=86400, must-revalidate')
    response.headers.set('Content-Type', 'image/*')
    
    return response
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/uploads/:path*'
  ]
}
