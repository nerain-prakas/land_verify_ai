import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/listings/[id] - Get specific listing details
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const listing = await prisma.landListing.findUnique({
      where: { id },
      include: {
        seller: {
          select: {
            id: true,
            clerkId: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            imageUrl: true,
            isVerified: true
          }
        },
        meetingRequests: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    })

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    // Increment view count
    await prisma.landListing.update({
      where: { id },
      data: {
        viewCount: {
          increment: 1
        }
      }
    })

    return NextResponse.json(listing)
  } catch (error) {
    console.error('Error fetching listing:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
