// Shared TypeScript type definitions

export interface UserProfile {
  id: string
  clerkId: string
  email: string
  firstName: string | null
  lastName: string | null
  imageUrl: string | null
  role: 'BUYER' | 'SELLER' | 'ADMIN'
  phone: string | null
  address: string | null
  city: string | null
  state: string | null
  zipCode: string | null
  country: string | null
  bio: string | null
  isVerified: boolean
  verifiedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface LandListing {
  id: string
  sellerId: string
  status: 'PENDING' | 'VERIFIED' | 'LIVE' | 'SOLD' | 'REJECTED'
  propertyType: 'LAND_ONLY' | 'LAND_WITH_HOUSE' | 'COMMERCIAL' | 'AGRICULTURAL' | 'INDUSTRIAL'
  
  // Basic Info
  title: string | null
  description: string | null
  
  // Location & Area
  totalArea: number | null
  coordinates: number[]
  address: string | null
  city: string | null
  state: string | null
  country: string
  geojsonPolygon: any
  
  // AI Verification
  aiVerificationScore: number | null
  documentExtracted: any
  boundaryMatchPct: number | null
  
  // Video Analysis
  videoUrl: string | null
  videoAnalysis: any
  noiseLevelDb: number | null
  accessibilityScore: number | null
  terrainClass: string | null
  
  // Land Attributes
  landTopography: string | null
  soilColor: string | null
  soilTexture: string | null
  waterSource: string | null
  fencingStatus: string | null
  cropsVisible: string[]
  
  // House Attributes
  hasStructureDetected: boolean
  houseExteriorScore: number | null
  houseStyle: string | null
  houseWallColor: string | null
  housePaintFreshness: string | null
  wallMaterial: string | null
  floorsVisible: number | null
  houseExtensions: string[]
  
  // Nearby Facilities
  schoolsNearbyCount: number | null
  hospitalsNearbyCount: number | null
  marketsNearbyCount: number | null
  distanceToNearestRoadM: number | null
  
  // Pricing
  askingPrice: number | null
  pricePerSqm: number | null
  currency: string
  
  // Media
  images: string[]
  thumbnailUrl: string | null
  
  // Engagement
  viewCount: number
  inquiryCount: number
  
  // Timestamps
  createdAt: Date
  updatedAt: Date
}

export interface MeetingRequest {
  id: string
  buyerId: string
  sellerId: string
  listingId: string
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED'
  proposedTimes: Date[]
  selectedTime: Date | null
  location: string | null
  agenda: string | null
  message: string | null
  createdAt: Date
  updatedAt: Date
}

export interface ListingFilters {
  terrainTypes?: string[]
  minPrice?: number
  maxPrice?: number
  minArea?: number
  maxArea?: number
  minVerification?: number
  city?: string
  state?: string
  propertyType?: string
  status?: string
}

export interface PaginatedResponse<T> {
  listings: T[]
  pagination: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
}
