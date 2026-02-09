const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const mockListings = [
  {
    title: "Modern Villa with Swimming Pool",
    description: "Beautiful modern house with contemporary design, large swimming pool, and landscaped garden. Perfect for luxury living.",
    sellerId: "user_2outGVDRPU6445SU", // Replace with actual Clerk user ID
    totalArea: 2.5,
    coordinates: [13.0827, 80.2707], // Chennai
    address: "123 Anna Salai",
    city: "Chennai",
    state: "Tamil Nadu",
    country: "India",
    propertyType: "LAND_WITH_HOUSE",
    askingPrice: 15000000, // 1.5 Crore
    pricePerSqm: 25000,
    houseStyle: "modern",
    houseWallColor: "white",
    hasStructureDetected: true,
    terrainClass: "suburban",
    schoolsNearbyCount: 3,
    hospitalsNearbyCount: 2,
    marketsNearbyCount: 5,
    waterSource: "municipal",
    aiVerificationScore: 0.95,
    status: "LIVE",
    images: ["/api/placeholder/400/300"],
    thumbnailUrl: "/api/placeholder/400/300"
  },
  {
    title: "Green Farmhouse with Organic Garden",
    description: "Eco-friendly farmhouse with organic vegetable garden, solar panels, and rainwater harvesting. Surrounded by greenery.",
    sellerId: "user_2outGVDRPU6445SU",
    totalArea: 5.0,
    coordinates: [13.1827, 80.1707], // North Chennai
    address: "Farm Road 45",
    city: "Chennai",
    state: "Tamil Nadu", 
    country: "India",
    propertyType: "AGRICULTURAL",
    askingPrice: 8000000, // 80 Lakhs
    pricePerSqm: 8000,
    houseStyle: "traditional",
    houseWallColor: "green",
    hasStructureDetected: true,
    terrainClass: "farmland",
    schoolsNearbyCount: 1,
    hospitalsNearbyCount: 1,
    marketsNearbyCount: 2,
    waterSource: "well",
    aiVerificationScore: 0.88,
    status: "LIVE",
    images: ["/api/placeholder/400/300"],
    thumbnailUrl: "/api/placeholder/400/300"
  },
  {
    title: "Beachside Land Plot",
    description: "Prime beachfront property with direct beach access. Perfect for resort development or luxury vacation home.",
    sellerId: "user_2outGVDRPU6445SU",
    totalArea: 1.2,
    coordinates: [12.9827, 80.2407], // ECR Chennai
    address: "East Coast Road",
    city: "Chennai",
    state: "Tamil Nadu",
    country: "India", 
    propertyType: "LAND_ONLY",
    askingPrice: 12000000, // 1.2 Crore
    pricePerSqm: 50000,
    terrainClass: "coastal",
    schoolsNearbyCount: 0,
    hospitalsNearbyCount: 1,
    marketsNearbyCount: 1,
    waterSource: "borewell",
    aiVerificationScore: 0.82,
    status: "LIVE",
    images: ["/api/placeholder/400/300"],
    thumbnailUrl: "/api/placeholder/400/300"
  },
  {
    title: "Budget Residential Plot Near Schools",
    description: "Affordable residential plot in developing area with good connectivity. Multiple schools and hospitals nearby.",
    sellerId: "user_2outGVDRPU6445SU",
    totalArea: 1.0,
    coordinates: [13.0327, 80.2207],
    address: "Velachery Main Road", 
    city: "Chennai",
    state: "Tamil Nadu",
    country: "India",
    propertyType: "LAND_ONLY",
    askingPrice: 3500000, // 35 Lakhs
    pricePerSqm: 17500,
    terrainClass: "flat",
    schoolsNearbyCount: 4,
    hospitalsNearbyCount: 3,
    marketsNearbyCount: 6,
    waterSource: "municipal",
    aiVerificationScore: 0.75,
    status: "LIVE",
    images: ["/api/placeholder/400/300"],
    thumbnailUrl: "/api/placeholder/400/300"
  },
  {
    title: "Colonial Style Heritage Home",
    description: "Restored colonial-era house with original architecture, high ceilings, and period features. Located in heritage district.",
    sellerId: "user_2outGVDRPU6445SU",
    totalArea: 3.2,
    coordinates: [13.0627, 80.2507],
    address: "Garden House Road",
    city: "Chennai", 
    state: "Tamil Nadu",
    country: "India",
    propertyType: "LAND_WITH_HOUSE",
    askingPrice: 25000000, // 2.5 Crore
    pricePerSqm: 39000,
    houseStyle: "colonial",
    houseWallColor: "yellow",
    hasStructureDetected: true,
    terrainClass: "suburban",
    schoolsNearbyCount: 2,
    hospitalsNearbyCount: 4,
    marketsNearbyCount: 3,
    waterSource: "municipal",
    aiVerificationScore: 0.91,
    status: "LIVE",
    images: ["/api/placeholder/400/300"],
    thumbnailUrl: "/api/placeholder/400/300"
  },
  {
    title: "IT Park Adjacent Commercial Land",
    description: "Commercial land plot adjacent to major IT park. High appreciation potential with excellent connectivity.",
    sellerId: "user_2outGVDRPU6445SU",
    totalArea: 0.8,
    coordinates: [12.9427, 80.1807], // OMR
    address: "Old Mahabalipuram Road",
    city: "Chennai",
    state: "Tamil Nadu",
    country: "India",
    propertyType: "COMMERCIAL", 
    askingPrice: 18000000, // 1.8 Crore
    pricePerSqm: 112500,
    terrainClass: "flat",
    schoolsNearbyCount: 1,
    hospitalsNearbyCount: 2,
    marketsNearbyCount: 4,
    waterSource: "municipal",
    aiVerificationScore: 0.93,
    status: "LIVE",
    images: ["/api/placeholder/400/300"],
    thumbnailUrl: "/api/placeholder/400/300"
  },
  {
    title: "Contemporary Blue Villa with Pool",
    description: "Ultra-modern contemporary house with blue exterior, infinity pool, smart home features, and rooftop garden.",
    sellerId: "user_2outGVDRPU6445SU",
    totalArea: 4.1,
    coordinates: [13.1127, 80.2107], 
    address: "Posh Colony Avenue",
    city: "Chennai",
    state: "Tamil Nadu",
    country: "India",
    propertyType: "LAND_WITH_HOUSE",
    askingPrice: 35000000, // 3.5 Crore
    pricePerSqm: 42683,
    houseStyle: "contemporary", 
    houseWallColor: "blue",
    hasStructureDetected: true,
    terrainClass: "suburban",
    schoolsNearbyCount: 3,
    hospitalsNearbyCount: 2, 
    marketsNearbyCount: 4,
    waterSource: "municipal",
    aiVerificationScore: 0.97,
    status: "LIVE",
    images: ["/api/placeholder/400/300"],
    thumbnailUrl: "/api/placeholder/400/300"
  },
  {
    title: "Hilltop Land with Mountain Views", 
    description: "Scenic hilltop property with panoramic mountain views. Perfect for resort or weekend retreat development.",
    sellerId: "user_2outGVDRPU6445SU",
    totalArea: 6.5,
    coordinates: [13.2127, 80.1307],
    address: "Hillview Estate Road",
    city: "Chennai",
    state: "Tamil Nadu",
    country: "India",
    propertyType: "LAND_ONLY",
    askingPrice: 9750000, // 97.5 Lakhs
    pricePerSqm: 7500,
    terrainClass: "hilly",
    schoolsNearbyCount: 0,
    hospitalsNearbyCount: 1,
    marketsNearbyCount: 1,
    waterSource: "borewell",
    aiVerificationScore: 0.79,
    status: "LIVE",
    images: ["/api/placeholder/400/300"],
    thumbnailUrl: "/api/placeholder/400/300"
  },
  {
    title: "Traditional Red Brick Farmhouse",
    description: "Charming traditional farmhouse with red brick walls, courtyards, and agricultural land. Includes cattle shed and barn.",
    sellerId: "user_2outGVDRPU6445SU", 
    totalArea: 8.2,
    coordinates: [13.0127, 80.1107],
    address: "Village Road 12",
    city: "Chennai",
    state: "Tamil Nadu",
    country: "India",
    propertyType: "AGRICULTURAL",
    askingPrice: 6150000, // 61.5 Lakhs
    pricePerSqm: 3750,
    houseStyle: "traditional",
    houseWallColor: "red",
    hasStructureDetected: true,
    terrainClass: "farmland",
    schoolsNearbyCount: 1,
    hospitalsNearbyCount: 0,
    marketsNearbyCount: 2,
    waterSource: "well",
    aiVerificationScore: 0.71,
    status: "LIVE", 
    images: ["/api/placeholder/400/300"],
    thumbnailUrl: "/api/placeholder/400/300"
  },
  {
    title: "Waterfront Industrial Land",
    description: "Large industrial plot with water frontage. Suitable for manufacturing, logistics, or port-related activities.",
    sellerId: "user_2outGVDRPU6445SU",
    totalArea: 12.0,
    coordinates: [13.0927, 80.3107], // Port area
    address: "Industrial Estate Zone",
    city: "Chennai", 
    state: "Tamil Nadu",
    country: "India",
    propertyType: "INDUSTRIAL",
    askingPrice: 48000000, // 4.8 Crore
    pricePerSqm: 20000,
    terrainClass: "flat",
    schoolsNearbyCount: 0,
    hospitalsNearbyCount: 1,
    marketsNearbyCount: 1,
    waterSource: "river",
    aiVerificationScore: 0.85,
    status: "LIVE",
    images: ["/api/placeholder/400/300"],
    thumbnailUrl: "/api/placeholder/400/300"
  }
]

async function seedMockData() {
  try {
    console.log('🌱 Starting to seed mock data...')
    
    // First, let's create a test user if it doesn't exist
    const testUser = await prisma.user.upsert({
      where: { clerkId: "user_2outGVDRPU6445SU" },
      update: {},
      create: {
        clerkId: "user_2outGVDRPU6445SU",
        email: "test.seller@example.com",
        firstName: "Test",
        lastName: "Seller",
        role: "SELLER",
        phone: "+91-9876543210",
        address: "Test Address, Chennai",
        city: "Chennai",
        state: "Tamil Nadu",
        country: "India",
        isVerified: true
      }
    })
    
    console.log('√ Test user created/updated')
    
    // Delete existing mock listings to avoid duplicates
    await prisma.landListing.deleteMany({
      where: { sellerId: "user_2outGVDRPU6445SU" }
    })
    
    console.log('√ Cleaned existing mock data')
    
    // Insert new mock listings
    for (let i = 0; i < mockListings.length; i++) {
      const listing = mockListings[i]
      
      const created = await prisma.landListing.create({
        data: {
          ...listing,
          geojsonPolygon: {
            type: "Polygon",
            coordinates: [[
              [listing.coordinates[1] - 0.001, listing.coordinates[0] - 0.001],
              [listing.coordinates[1] + 0.001, listing.coordinates[0] - 0.001], 
              [listing.coordinates[1] + 0.001, listing.coordinates[0] + 0.001],
              [listing.coordinates[1] - 0.001, listing.coordinates[0] + 0.001],
              [listing.coordinates[1] - 0.001, listing.coordinates[0] - 0.001]
            ]]
          }
        }
      })
      
      console.log(`√ Created: ${listing.title} (${created.id})`)
    }
    
    console.log(`\n🎉 Successfully seeded ${mockListings.length} mock listings!`)
    console.log('\n📍 Test queries you can try in the AI chatbot:')
    console.log('   • "Modern house with swimming pool"')
    console.log('   • "Green farmhouse with garden"') 
    console.log('   • "Budget properties near schools"')
    console.log('   • "Colonial house in yellow color"')
    console.log('   • "Beachfront property"')
    console.log('   • "Industrial land with water access"')
    console.log('\n💡 Go to http://localhost:3001/explore and test the AI Search!')
    
  } catch (error) {
    console.error('❌ Error seeding data:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

seedMockData()