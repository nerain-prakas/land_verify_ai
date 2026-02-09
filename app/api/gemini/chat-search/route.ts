import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { prisma, checkDatabaseHealth } from '@/lib/prisma'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || '')

interface SearchFilters {
  propertyType?: string[]
  minPrice?: number
  maxPrice?: number
  minArea?: number
  maxArea?: number
  city?: string
  state?: string
  houseStyle?: string
  houseWallColor?: string
  hasStructure?: boolean
  terrainType?: string
  nearbySchools?: boolean
  nearbyHospitals?: boolean
  nearbyMarkets?: boolean
  waterSource?: string
  coordinates?: {
    lat: number
    lng: number
    radiusKm: number
  }
}

interface ChatResponse {
  message: string
  filters: SearchFilters
  listings: any[]
  searchSummary: string
}

// Parse user query with Gemini to extract search intent
async function parseUserQuery(query: string, userLocation?: { lat: number; lng: number }): Promise<SearchFilters> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
    
    const prompt = `
You are a real estate search assistant. Parse the following user query and extract search filters for a property search.

User query: "${query}"
${userLocation ? `User's current location: lat ${userLocation.lat}, lng ${userLocation.lng}` : 'User location: not provided'}

Extract the following filters if mentioned (return null if not mentioned):
1. propertyType: Array of types like ["LAND_ONLY", "LAND_WITH_HOUSE", "COMMERCIAL", "AGRICULTURAL", "INDUSTRIAL"]
2. minPrice & maxPrice: in INR (lakhs multiply by 100000, crores by 10000000)
3. minArea & maxArea: in acres
4. city: city name if mentioned
5. state: state name if mentioned  
6. houseStyle: style like "modern", "traditional", "colonial", "contemporary", "villa"
7. houseWallColor: color mentioned like "green", "white", "blue", "yellow"
8. hasStructure: true if they want house/building, false if raw land only
9. terrainType: like "flat", "hilly", "coastal", "farmland", "suburban"
10. nearbySchools: true if they want schools nearby
11. nearbyHospitals: true if they want hospitals nearby
12. nearbyMarkets: true if they want markets/shops nearby
13. waterSource: like "well", "borewell", "river", "municipal"
14. searchRadius: distance in km (default 3 if location based but not specified)

IMPORTANT: Return ONLY valid JSON, no markdown formatting, no code blocks.

Return JSON format:
{
  "propertyType": [...] or null,
  "minPrice": number or null,
  "maxPrice": number or null,
  "minArea": number or null,
  "maxArea": number or null,
  "city": "string" or null,
  "state": "string" or null,
  "houseStyle": "string" or null,
  "houseWallColor": "string" or null,
  "hasStructure": boolean or null,
  "terrainType": "string" or null,
  "nearbySchools": boolean or null,
  "nearbyHospitals": boolean or null,
  "nearbyMarkets": boolean or null,
  "waterSource": "string" or null,
  "searchRadius": number or null,
  "useUserLocation": boolean
}
`

    const result = await model.generateContent(prompt)
    const responseText = result.response.text()
    
    // Parse the JSON response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error('No JSON found in Gemini response:', responseText)
      return {}
    }
    
    const parsed = JSON.parse(jsonMatch[0])
    
    const filters: SearchFilters = {}
    
    if (parsed.propertyType) filters.propertyType = parsed.propertyType
    if (parsed.minPrice) filters.minPrice = parsed.minPrice
    if (parsed.maxPrice) filters.maxPrice = parsed.maxPrice
    if (parsed.minArea) filters.minArea = parsed.minArea
    if (parsed.maxArea) filters.maxArea = parsed.maxArea
    if (parsed.city) filters.city = parsed.city
    if (parsed.state) filters.state = parsed.state
    if (parsed.houseStyle) filters.houseStyle = parsed.houseStyle
    if (parsed.houseWallColor) filters.houseWallColor = parsed.houseWallColor
    if (parsed.hasStructure !== null) filters.hasStructure = parsed.hasStructure
    if (parsed.terrainType) filters.terrainType = parsed.terrainType
    if (parsed.nearbySchools) filters.nearbySchools = parsed.nearbySchools
    if (parsed.nearbyHospitals) filters.nearbyHospitals = parsed.nearbyHospitals
    if (parsed.nearbyMarkets) filters.nearbyMarkets = parsed.nearbyMarkets
    if (parsed.waterSource) filters.waterSource = parsed.waterSource
    
    // Handle location-based search
    if (parsed.useUserLocation && userLocation) {
      filters.coordinates = {
        lat: userLocation.lat,
        lng: userLocation.lng,
        radiusKm: parsed.searchRadius || 3
      }
    }
    
    return filters
    
  } catch (error) {
    console.error('Error parsing query with Gemini:', error)
    return {}
  }
}

// Search database with filters
async function searchListings(filters: SearchFilters): Promise<any[]> {
  const healthCheck = await checkDatabaseHealth()
  if (!healthCheck.healthy) {
    console.warn('Database unavailable for search')
    return []
  }

  const where: any = {
    status: 'LIVE'
  }
  
  // Property type filter
  if (filters.propertyType && filters.propertyType.length > 0) {
    where.propertyType = { in: filters.propertyType }
  }
  
  // Price filters
  if (filters.minPrice || filters.maxPrice) {
    where.askingPrice = {}
    if (filters.minPrice) where.askingPrice.gte = filters.minPrice
    if (filters.maxPrice) where.askingPrice.lte = filters.maxPrice
  }
  
  // Area filters
  if (filters.minArea || filters.maxArea) {
    where.totalArea = {}
    if (filters.minArea) where.totalArea.gte = filters.minArea
    if (filters.maxArea) where.totalArea.lte = filters.maxArea
  }
  
  // Location filters
  if (filters.city) {
    where.city = { contains: filters.city, mode: 'insensitive' }
  }
  if (filters.state) {
    where.state = { contains: filters.state, mode: 'insensitive' }
  }
  
  // House style
  if (filters.houseStyle) {
    where.houseStyle = { contains: filters.houseStyle, mode: 'insensitive' }
  }
  
  // House color
  if (filters.houseWallColor) {
    where.houseWallColor = { contains: filters.houseWallColor, mode: 'insensitive' }
  }
  
  // Structure detection
  if (filters.hasStructure !== undefined) {
    where.hasStructureDetected = filters.hasStructure
  }
  
  // Terrain
  if (filters.terrainType) {
    where.terrainClass = { contains: filters.terrainType, mode: 'insensitive' }
  }
  
  // Nearby amenities
  if (filters.nearbySchools) {
    where.schoolsNearbyCount = { gt: 0 }
  }
  if (filters.nearbyHospitals) {
    where.hospitalsNearbyCount = { gt: 0 }
  }
  if (filters.nearbyMarkets) {
    where.marketsNearbyCount = { gt: 0 }
  }
  
  // Water source
  if (filters.waterSource) {
    where.waterSource = { contains: filters.waterSource, mode: 'insensitive' }
  }

  let listings = await prisma.landListing.findMany({
    where,
    take: 50,
    orderBy: { createdAt: 'desc' },
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
      terrainClass: true,
      propertyType: true,
      hasStructureDetected: true,
      houseStyle: true,
      houseWallColor: true,
      schoolsNearbyCount: true,
      hospitalsNearbyCount: true,
      marketsNearbyCount: true,
      askingPrice: true,
      pricePerSqm: true,
      currency: true,
      images: true,
      thumbnailUrl: true,
      viewCount: true,
      waterSource: true,
      status: true,
      sellerId: true,
      seller: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          imageUrl: true
        }
      }
    }
  })
  
  // Filter by distance if coordinates provided
  if (filters.coordinates && listings.length > 0) {
    const { lat, lng, radiusKm } = filters.coordinates
    
    listings = listings.filter(listing => {
      if (!listing.coordinates || listing.coordinates.length < 2) return false
      
      // Calculate distance using Haversine formula
      const listingLat = listing.coordinates[0]
      const listingLng = listing.coordinates[1]
      
      const R = 6371 // Earth's radius in km
      const dLat = (listingLat - lat) * Math.PI / 180
      const dLng = (listingLng - lng) * Math.PI / 180
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat * Math.PI / 180) * Math.cos(listingLat * Math.PI / 180) * 
        Math.sin(dLng/2) * Math.sin(dLng/2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
      const distance = R * c
      
      return distance <= radiusKm
    })
  }
  
  return listings
}

// Generate response message with Gemini
async function generateResponseMessage(
  query: string, 
  filters: SearchFilters, 
  listings: any[]
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
    
    const listingSummary = listings.slice(0, 5).map(l => ({
      title: l.title,
      price: l.askingPrice,
      area: l.totalArea,
      city: l.city,
      type: l.propertyType,
      style: l.houseStyle,
      color: l.houseWallColor
    }))
    
    const prompt = `
You are a helpful real estate assistant. The user asked: "${query}"

Based on their search, I found ${listings.length} properties.

Sample results:
${JSON.stringify(listingSummary, null, 2)}

Filters applied:
${JSON.stringify(filters, null, 2)}

Generate a brief, friendly response (2-3 sentences) summarizing what was found. 
Mention specific details if relevant (colors, styles, locations).
If no results, suggest broadening the search.
Do not use markdown formatting.
`

    const result = await model.generateContent(prompt)
    return result.response.text()
    
  } catch (error) {
    console.error('Error generating response:', error)
    
    if (listings.length === 0) {
      return "I couldn't find any properties matching your criteria. Try broadening your search or checking a different area."
    }
    return `I found ${listings.length} properties matching your search. The results are shown on the map.`
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query, userLocation } = body
    
    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      )
    }
    
    // Parse query with Gemini
    const filters = await parseUserQuery(query, userLocation)
    console.log('Parsed filters:', filters)
    
    // Search database
    const listings = await searchListings(filters)
    console.log(`Found ${listings.length} listings`)
    
    // Generate response message
    const message = await generateResponseMessage(query, filters, listings)
    
    // Generate search summary
    const filterDescriptions: string[] = []
    if (filters.propertyType) filterDescriptions.push(`Type: ${filters.propertyType.join(', ')}`)
    if (filters.city) filterDescriptions.push(`City: ${filters.city}`)
    if (filters.state) filterDescriptions.push(`State: ${filters.state}`)
    if (filters.houseStyle) filterDescriptions.push(`Style: ${filters.houseStyle}`)
    if (filters.houseWallColor) filterDescriptions.push(`Color: ${filters.houseWallColor}`)
    if (filters.hasStructure !== undefined) filterDescriptions.push(filters.hasStructure ? 'With house' : 'Land only')
    if (filters.coordinates) filterDescriptions.push(`Within ${filters.coordinates.radiusKm}km`)
    if (filters.minPrice || filters.maxPrice) {
      const priceRange = []
      if (filters.minPrice) priceRange.push(`₹${(filters.minPrice/100000).toFixed(1)}L`)
      if (filters.maxPrice) priceRange.push(`₹${(filters.maxPrice/100000).toFixed(1)}L`)
      filterDescriptions.push(`Price: ${priceRange.join(' - ')}`)
    }
    
    const searchSummary = filterDescriptions.length > 0 
      ? `Filters: ${filterDescriptions.join(' | ')}`
      : 'Showing all available properties'
    
    const response: ChatResponse = {
      message,
      filters,
      listings,
      searchSummary
    }
    
    return NextResponse.json(response)
    
  } catch (error) {
    console.error('Chat search error:', error)
    return NextResponse.json(
      { error: 'Failed to process search' },
      { status: 500 }
    )
  }
}
