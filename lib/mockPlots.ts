import type { GeoJSON } from 'geojson'

export interface PlotData {
  id: string
  price: number
  area: number // acres
  verificationScore: number // 0-100
  terrainType: 'vineyard' | 'suburban' | 'mountain' | 'coastal' | 'farmland'
  videoUrl?: string
  videoThumbnail?: string
  coordinates: [number, number] // [lng, lat]
  polygon: GeoJSON.Polygon
  address: string
  description: string
  owner?: {
    name: string
    phone: string
    email: string
    avatar?: string
  }
}

export const mockPlots: PlotData[] = [
  {
    id: 'sonoma-vineyard-001',
    price: 850000,
    area: 5.2,
    verificationScore: 95,
    terrainType: 'vineyard',
    videoUrl: '/videos/sonoma-vineyard.mp4',
    videoThumbnail: '/thumbnails/sonoma.jpg',
    coordinates: [-122.8, 38.5],
    address: 'Healdsburg, Sonoma County, CA 95448',
    description: 'Premium vineyard land with established Pinot Noir vines',
    polygon: {
      type: 'Polygon',
      coordinates: [[
        [-122.805, 38.498],
        [-122.795, 38.498],
        [-122.795, 38.502],
        [-122.805, 38.502],
        [-122.805, 38.498]
      ]]
    }
  },
  {
    id: 'austin-suburban-002',
    price: 320000,
    area: 2.1,
    verificationScore: 78,
    terrainType: 'suburban',
    videoUrl: '/videos/austin-suburban.mp4',
    videoThumbnail: '/thumbnails/austin.jpg',
    coordinates: [-97.7, 30.3],
    address: 'Cedar Park, TX 78613',
    description: 'Residential development land near Austin',
    polygon: {
      type: 'Polygon',
      coordinates: [[
        [-97.705, 30.298],
        [-97.695, 30.298],
        [-97.695, 30.302],
        [-97.705, 30.302],
        [-97.705, 30.298]
      ]]
    }
  },
  {
    id: 'boulder-mountain-003',
    price: 450000,
    area: 8.7,
    verificationScore: 65,
    terrainType: 'mountain',
    videoUrl: '/videos/boulder-mountain.mp4',
    videoThumbnail: '/thumbnails/boulder.jpg',
    coordinates: [-105.3, 40.0],
    address: 'Nederland, Boulder County, CO 80466',
    description: 'Mountain land with pine forest and seasonal creek',
    polygon: {
      type: 'Polygon',
      coordinates: [[
        [-105.31, 39.995],
        [-105.29, 39.995],
        [-105.29, 40.005],
        [-105.31, 40.005],
        [-105.31, 39.995]
      ]]
    }
  },
  {
    id: 'miami-coastal-004',
    price: 1200000,
    area: 1.8,
    verificationScore: 42,
    terrainType: 'coastal',
    videoUrl: '/videos/miami-coastal.mp4',
    videoThumbnail: '/thumbnails/miami.jpg',
    coordinates: [-80.2, 25.8],
    address: 'Homestead, Miami-Dade County, FL 33030',
    description: 'Coastal development land near Biscayne Bay',
    polygon: {
      type: 'Polygon',
      coordinates: [[
        [-80.205, 25.798],
        [-80.195, 25.798],
        [-80.195, 25.802],
        [-80.205, 25.802],
        [-80.205, 25.798]
      ]]
    }
  },
  {
    id: 'oregon-farmland-005',
    price: 280000,
    area: 12.3,
    verificationScore: 88,
    terrainType: 'farmland',
    videoUrl: '/videos/oregon-farmland.mp4',
    videoThumbnail: '/thumbnails/oregon.jpg',
    coordinates: [-123.0, 45.0],
    address: 'McMinnville, Yamhill County, OR 97128',
    description: 'Organic certified farmland in Willamette Valley',
    polygon: {
      type: 'Polygon',
      coordinates: [[
        [-123.01, 44.995],
        [-122.99, 44.995],
        [-122.99, 45.005],
        [-123.01, 45.005],
        [-123.01, 44.995]
      ]]
    }
  }
]

// GeoJSON FeatureCollection for map consumption
export const mockPlotsGeoJSON: GeoJSON.FeatureCollection = {
  type: 'FeatureCollection',
  features: mockPlots.map(plot => ({
    type: 'Feature',
    id: plot.id,
    geometry: plot.polygon,
    properties: {
      id: plot.id,
      price: plot.price,
      area: plot.area,
      verificationScore: plot.verificationScore,
      terrainType: plot.terrainType,
      videoThumbnail: plot.videoThumbnail,
      address: plot.address,
      description: plot.description
    }
  }))
}

// Helper function to get verification color
export function getVerificationColor(score: number): string {
  if (score >= 70) return '#22c55e' // green-500
  if (score >= 40) return '#f97316' // orange-500
  return '#ef4444' // red-500
}

// Helper function to create test plot near user location
export function createTestPlot(userLng: number, userLat: number): PlotData {
  const offset = 0.0006 // approximately 63.6m for 1 acre square
  return {
    id: 'test-plot-001',
    price: 85000,
    area: 1.0,
    verificationScore: 0, // This makes it red
    terrainType: 'farmland',
    videoUrl: '/videos/test-plot.mp4',
    videoThumbnail: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400',
    coordinates: [userLng + 0.001 + offset/2, userLat + 0.001 + offset/2],
    address: 'Test Location (Near You)',
    description: 'TEST PROPERTY - 1 Acre vacant land available for immediate development. This is a test listing to demonstrate the platform features.',
    polygon: {
      type: 'Polygon',
      coordinates: [[
        [userLng + 0.001, userLat + 0.001],
        [userLng + 0.001 + offset, userLat + 0.001],
        [userLng + 0.001 + offset, userLat + 0.001 + offset],
        [userLng + 0.001, userLat + 0.001 + offset],
        [userLng + 0.001, userLat + 0.001]
      ]]
    },
    owner: {
      name: 'John Doe',
      phone: '+1 (555) 123-4567',
      email: 'john.doe@example.com',
      avatar: 'https://i.pravatar.cc/150?img=12'
    }
  }
}

export default mockPlots