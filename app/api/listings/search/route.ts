import { NextRequest, NextResponse } from 'next/server'
import { prisma, checkDatabaseHealth } from '@/lib/prisma'
import { mockPlots } from '@/lib/mockPlots'

// GET /api/listings/search - Search and filter land listings
export async function GET(req: NextRequest) {
  try {
    // Check database health first
    const healthCheck = await checkDatabaseHealth()

    if (!healthCheck.healthy) {
      console.error('❌ Database unavailable')
      return NextResponse.json(
        { error: 'Database unavailable', listings: [] },
        { status: 503 }
      )
    }

    const searchParams = req.nextUrl.searchParams

    // Extract filter parameters
    const terrainTypes = searchParams.get('terrainTypes')?.split(',').filter(Boolean) || []
    const minPrice = parseInt(searchParams.get('minPrice') || '0')
    const maxPrice = parseInt(searchParams.get('maxPrice') || '10000000000')
    const minArea = parseFloat(searchParams.get('minArea') || '0')
    const maxArea = parseFloat(searchParams.get('maxArea') || '100000')
    const minVerification = parseFloat(searchParams.get('minVerification') || '0')
    const city = searchParams.get('city')
    const state = searchParams.get('state')
    const propertyType = searchParams.get('propertyType')
    const status = searchParams.get('status') || 'LIVE'
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build where clause
    const where: any = {
      status: status as any,
      askingPrice: {
        gte: minPrice,
        lte: maxPrice
      },
      totalArea: {
        gte: minArea,
        lte: maxArea
      }
    }

    // Add optional filters
    if (terrainTypes.length > 0) {
      where.terrainClass = {
        in: terrainTypes
      }
    }

    if (minVerification > 0) {
      where.aiVerificationScore = {
        gte: minVerification
      }
    }

    if (city) {
      where.city = {
        contains: city,
        mode: 'insensitive'
      }
    }

    if (state) {
      where.state = {
        contains: state,
        mode: 'insensitive'
      }
    }

    if (propertyType) {
      where.propertyType = propertyType
    }

    // Fetch listings
    const [listings, total] = await Promise.all([
      prisma.landListing.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: {
          createdAt: 'desc'
        },
        select: {
          id: true,
          title: true,
          description: true,
          totalArea: true,
          coordinates: true,
          address: true,
          city: true,
          state: true,
          country: true,
          geojsonPolygon: true,
          aiVerificationScore: true,
          videoUrl: true,
          noiseLevelDb: true,
          terrainClass: true,
          soilColor: true,
          waterSource: true,
          propertyType: true,
          hasStructureDetected: true,
          schoolsNearbyCount: true,
          hospitalsNearbyCount: true,
          marketsNearbyCount: true,
          askingPrice: true,
          pricePerSqm: true,
          currency: true,
          images: true,
          thumbnailUrl: true,
          viewCount: true,
          inquiryCount: true,
          status: true,
          createdAt: true,
          sellerId: true
        }
      }),
      prisma.landListing.count({ where })
    ])

    return NextResponse.json({
      listings,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + listings.length < total
      }
    })
  } catch (error: any) {
    console.error('❌ Error fetching listings:', error.message || error)

    return NextResponse.json(
      {
        error: 'Failed to fetch listings',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}
