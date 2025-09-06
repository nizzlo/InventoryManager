import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Get balances using raw SQL query from the view
    const balances = await prisma.$queryRaw`
      SELECT 
        item_id,
        sku,
        name,
        location_id,
        location,
        qty_on_hand
      FROM v_item_location_balances
      ORDER BY sku, location
    `
    
    return NextResponse.json(balances)
  } catch (error) {
    console.error('Error fetching balances:', error)
    
    // Fallback to calculated balances if view doesn't exist
    try {
      const items = await prisma.item.findMany({
        include: {
          moves: {
            include: {
              location: true,
            },
          },
        },
      })
      
      const locations = await prisma.location.findMany()
      
      const balances = []
      
      for (const item of items) {
        for (const location of locations) {
          const movesForLocation = item.moves.filter(
            (move) => move.locationId === location.id
          )
          
          let qtyOnHand = 0
          movesForLocation.forEach((move) => {
            const qty = parseFloat(move.qty.toString())
            switch (move.type) {
              case 'IN':
              case 'ADJUST':
                qtyOnHand += qty
                break
              case 'OUT':
                qtyOnHand -= qty
                break
            }
          })
          
          balances.push({
            item_id: item.id,
            sku: item.sku,
            name: item.name,
            location_id: location.id,
            location: location.name,
            qty_on_hand: qtyOnHand,
          })
        }
      }
      
      return NextResponse.json(balances)
    } catch (fallbackError) {
      console.error('Fallback error:', fallbackError)
      return NextResponse.json(
        { error: 'Failed to fetch balances' },
        { status: 500 }
      )
    }
  }
}
