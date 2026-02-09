"use client"

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Shield, Filter, DollarSign, MessageCircle, Calendar, Search, Bot, Send, X, MapPin, Loader2, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { MapProvider, useMap } from '@/components/map/MapProvider'
import LandMap from '@/components/map/LandMap'
import MapControls from '@/components/map/MapControls'
import PlotPopup from '@/components/map/PlotPopup'
import { mockPlotsGeoJSON, mockPlots, type PlotData, createTestPlot } from '@/lib/mockPlots'
import { useGeocoding } from '@/hooks/useGeocoding'

interface ChatMessage {
  id: number
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  listings?: any[]
  searchSummary?: string
}

interface DBListing {
  id: string
  title: string | null
  description: string | null
  totalArea: number | null
  coordinates: number[]
  address: string | null
  city: string | null
  state: string | null
  geojsonPolygon: any
  aiVerificationScore: number | null
  videoUrl: string | null
  noiseLevelDb: number | null
  terrainClass: string | null
  soilColor: string | null
  waterSource: string | null
  propertyType: string
  hasStructureDetected: boolean
  schoolsNearbyCount: number | null
  hospitalsNearbyCount: number | null
  marketsNearbyCount: number | null
  askingPrice: number | null
  pricePerSqm: number | null
  currency: string
  images: string[]
  thumbnailUrl: string | null
  viewCount: number
  inquiryCount: number
  status: string
  createdAt: string
  sellerId: string
}

function BuyerMapContent() {
  const [selectedPlot, setSelectedPlot] = useState<string | null>(null)
  const [popupPosition, setPopupPosition] = useState<{ x: number, y: number } | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showChat, setShowChat] = useState(false)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [currentMessage, setCurrentMessage] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    terrainTypes: [] as string[],
    priceRange: { min: 0, max: 10000000 },
    areaRange: { min: 0, max: 100 },
    minVerification: 0
  })
  const [dbListings, setDbListings] = useState<DBListing[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [useMockData, setUseMockData] = useState(false)
  const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null)
  const [isChatLoading, setIsChatLoading] = useState(false)
  const [chatSearchResults, setChatSearchResults] = useState<any[]>([])
  const [activeFilters, setActiveFilters] = useState<string>('')
  const chatEndRef = useRef<HTMLDivElement>(null)
  const { flyToPlot } = useMap()
  const { geocode, loading: geocodeLoading, error: geocodeError } = useGeocoding()

  // Get user's location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => {
          console.log('Geolocation error:', error)
          // Default to Chennai, India
          setUserLocation({ lat: 13.0827, lng: 80.2707 })
        }
      )
    }
  }, [])

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  // Fetch listings from database
  const fetchListings = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.terrainTypes.length > 0) {
        params.append('terrainTypes', filters.terrainTypes.join(','))
      }
      params.append('minPrice', filters.priceRange.min.toString())
      params.append('maxPrice', filters.priceRange.max.toString())
      params.append('minArea', filters.areaRange.min.toString())
      params.append('maxArea', filters.areaRange.max.toString())
      params.append('minVerification', (filters.minVerification / 100).toString())
      params.append('status', 'LIVE')
      params.append('limit', '100')

      const response = await fetch(`/api/listings/search?${params.toString()}`)

      if (!response.ok) {
        throw new Error('Failed to fetch listings')
      }

      const data = await response.json()
      setDbListings(data.listings || [])
      setUseMockData(false)
    } catch (error) {
      console.error('Error fetching listings:', error)
      // Fallback to mock data if API fails
      setUseMockData(true)
    } finally {
      setIsLoading(false)
    }
  }, [filters])

  // Fetch on mount and when filters change
  useEffect(() => {
    fetchListings()
  }, [fetchListings])

  // Convert database listings to PlotData format
  const convertedPlots: PlotData[] = useMemo(() => {
    if (useMockData) return mockPlots

    return dbListings.map(listing => ({
      id: listing.id,
      price: listing.askingPrice || 0,
      area: listing.totalArea || 0,
      verificationScore: listing.aiVerificationScore ? listing.aiVerificationScore * 100 : 0,
      terrainType: (listing.terrainClass as any) || 'farmland',
      videoThumbnail: listing.thumbnailUrl || '/placeholder-land.jpg',
      address: `${listing.address || ''}, ${listing.city || ''}, ${listing.state || ''}`.trim(),
      description: listing.description || 'No description available',
      polygon: listing.geojsonPolygon || {
        type: 'Polygon',
        coordinates: [[
          [listing.coordinates[1] - 0.001, listing.coordinates[0] - 0.001],
          [listing.coordinates[1] + 0.001, listing.coordinates[0] - 0.001],
          [listing.coordinates[1] + 0.001, listing.coordinates[0] + 0.001],
          [listing.coordinates[1] - 0.001, listing.coordinates[0] + 0.001],
          [listing.coordinates[1] - 0.001, listing.coordinates[0] - 0.001]
        ]]
      },
      coordinates: [listing.coordinates[1], listing.coordinates[0]] as [number, number]
    }))
  }, [dbListings, useMockData])

  const allPlotsRaw = convertedPlots
  const allPlots = convertedPlots
  const selectedPlotData = selectedPlot ? allPlots.find(p => p.id === selectedPlot) : null

  // Memoize the plot features to prevent unnecessary re-renders
  const plotFeatures = useMemo(() => {
    return allPlots.map(plot => ({
      type: 'Feature' as const,
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
  }, [allPlots.length]) // Only re-compute when number of plots changes

  const handlePlotClick = (plotId: string) => {
    setSelectedPlot(plotId)
    // Position popup in center of screen for demo
    setPopupPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 })
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    try {
      const results = await geocode(searchQuery)
      if (results.length > 0) {
        const result = results[0]
        flyToPlot([parseFloat(result.lon), parseFloat(result.lat)])
      }
    } catch (error) {
      console.error('Geocoding error:', error)
    }
  }

  // Gemini AI Chat Submit Handler
  const handleChatSubmit = async () => {
    if (!currentMessage.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now(),
      role: 'user',
      content: currentMessage,
      timestamp: new Date()
    }

    setChatMessages(prev => [...prev, userMessage])
    const msgToProcess = currentMessage
    setCurrentMessage('')
    setIsChatLoading(true)

    try {
      const response = await fetch('/api/gemini/chat-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: msgToProcess,
          userLocation: userLocation
        })
      })

      if (!response.ok) {
        throw new Error('Chat search failed')
      }

      const data = await response.json()

      // Update listings with search results
      if (data.listings && data.listings.length > 0) {
        setChatSearchResults(data.listings)
        setActiveFilters(data.searchSummary || '')

        // Update the main listings display
        setDbListings(data.listings)
        setUseMockData(false)

        // Fly to first result
        if (data.listings[0]?.coordinates?.length >= 2) {
          flyToPlot([data.listings[0].coordinates[1], data.listings[0].coordinates[0]])
        }
      }

      const aiResponse: ChatMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
        listings: data.listings,
        searchSummary: data.searchSummary
      }
      setChatMessages(prev => [...prev, aiResponse])

    } catch (error) {
      console.error('Chat error:', error)
      const errorResponse: ChatMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: "I'm having trouble searching right now. Please try again or use the manual filters.",
        timestamp: new Date()
      }
      setChatMessages(prev => [...prev, errorResponse])
    } finally {
      setIsChatLoading(false)
    }
  }

  // Quick search suggestions
  const quickSearches = [
    "Modern house with garden",
    "Agricultural land near city",
    "Land with water source",
    "Properties with schools nearby",
    "Budget friendly plots"
  ]

  const handleQuickSearch = async (query: string) => {
    setCurrentMessage(query)

    const userMessage: ChatMessage = {
      id: Date.now(),
      role: 'user',
      content: query,
      timestamp: new Date()
    }

    setChatMessages(prev => [...prev, userMessage])
    setIsChatLoading(true)

    try {
      const response = await fetch('/api/gemini/chat-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: query,
          userLocation: userLocation
        })
      })

      if (!response.ok) throw new Error('Search failed')

      const data = await response.json()

      if (data.listings?.length > 0) {
        setChatSearchResults(data.listings)
        setActiveFilters(data.searchSummary || '')
        setDbListings(data.listings)
        setUseMockData(false)

        if (data.listings[0]?.coordinates?.length >= 2) {
          flyToPlot([data.listings[0].coordinates[1], data.listings[0].coordinates[0]])
        }
      }

      const aiResponse: ChatMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
        listings: data.listings,
        searchSummary: data.searchSummary
      }
      setChatMessages(prev => [...prev, aiResponse])
    } catch (error) {
      console.error('Quick search error:', error)
      const errorResponse: ChatMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: "Sorry, I couldn't complete that search. Please try again.",
        timestamp: new Date()
      }
      setChatMessages(prev => [...prev, errorResponse])
    } finally {
      setIsChatLoading(false)
      setCurrentMessage('')
    }
  }

  const toggleTerrainFilter = (terrain: string) => {
    setFilters(prev => ({
      ...prev,
      terrainTypes: prev.terrainTypes.includes(terrain)
        ? prev.terrainTypes.filter(t => t !== terrain)
        : [...prev.terrainTypes, terrain]
    }))
  }

  const clearFilters = () => {
    setFilters({
      terrainTypes: [],
      priceRange: { min: 0, max: 10000000 },
      areaRange: { min: 0, max: 100 },
      minVerification: 0
    })
  }

  return (
    <div className="relative h-screen">
      {/* Top Navigation */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-white shadow-sm">
        <div className="flex items-center justify-between px-6 py-3">
          <Link href="/" className="flex items-center space-x-2">
            <Shield className="h-6 w-6 text-green-600" />
            <span className="font-bold text-lg text-gray-900">LandVerify AI</span>
          </Link>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="flex">
                <Input
                  type="text"
                  placeholder="Search location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-64 rounded-r-none"
                />
                <Button
                  onClick={handleSearch}
                  disabled={geocodeLoading}
                  className="rounded-l-none px-3"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className={showFilters ? 'bg-green-50 border-green-600' : ''}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {(filters.terrainTypes.length > 0 || filters.minVerification > 0) && (
                  <span className="ml-1 bg-green-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {filters.terrainTypes.length + (filters.minVerification > 0 ? 1 : 0)}
                  </span>
                )}
              </Button>
              <Button variant="outline" size="sm">
                <DollarSign className="h-4 w-4 mr-2" />
                Price
              </Button>
            </div>

            <Link href="/dashboard">
              <Button variant="outline" size="sm">Dashboard</Button>
            </Link>
            <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-20 w-96 bg-white rounded-lg shadow-xl border border-gray-200 mt-2">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Filters</h3>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear All
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowFilters(false)}>
                  ×
                </Button>
              </div>
            </div>

            {/* Terrain Type Filter */}
            <div className="mb-4">
              <h4 className="font-medium text-sm mb-2">Terrain Type</h4>
              <div className="flex flex-wrap gap-2">
                {['vineyard', 'suburban', 'mountain', 'coastal', 'farmland'].map(terrain => (
                  <button
                    key={terrain}
                    onClick={() => toggleTerrainFilter(terrain)}
                    className={`px-3 py-1 text-sm rounded-full border transition-colors ${filters.terrainTypes.includes(terrain)
                      ? 'bg-green-600 text-white border-green-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-green-600'
                      }`}
                  >
                    {terrain.charAt(0).toUpperCase() + terrain.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range Filter */}
            <div className="mb-4">
              <h4 className="font-medium text-sm mb-2">Price Range</h4>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.priceRange.min}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    priceRange: { ...prev.priceRange, min: Number(e.target.value) }
                  }))}
                  className="w-24 text-sm"
                />
                <span className="text-gray-500">to</span>
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters.priceRange.max}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    priceRange: { ...prev.priceRange, max: Number(e.target.value) }
                  }))}
                  className="w-24 text-sm"
                />
              </div>
            </div>

            {/* Area Range Filter */}
            <div className="mb-4">
              <h4 className="font-medium text-sm mb-2">Area (acres)</h4>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.areaRange.min}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    areaRange: { ...prev.areaRange, min: Number(e.target.value) }
                  }))}
                  className="w-20 text-sm"
                />
                <span className="text-gray-500">to</span>
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters.areaRange.max}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    areaRange: { ...prev.areaRange, max: Number(e.target.value) }
                  }))}
                  className="w-20 text-sm"
                />
              </div>
            </div>

            {/* Verification Score Filter */}
            <div className="mb-2">
              <h4 className="font-medium text-sm mb-2">Minimum Verification Score: {filters.minVerification}%</h4>
              <input
                type="range"
                min="0"
                max="100"
                value={filters.minVerification}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  minVerification: Number(e.target.value)
                }))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Results Count */}
            <div className="mt-4 pt-3 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Showing <span className="font-semibold">{allPlots.length}</span> properties
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Map Container */}
      <div className="absolute top-16 left-0 right-0 bottom-0">
        <LandMap
          plots={plotFeatures as any}
          onPlotClick={handlePlotClick}
          className="h-full"
        />
        <MapControls />
      </div>

      {/* Plot Sidebar - Left Side */}
      {selectedPlotData && (
        <div className="absolute top-20 left-4 w-80 bg-white rounded-lg shadow-lg z-25 max-h-[calc(100vh-6rem)] overflow-auto">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{
                    backgroundColor: selectedPlotData.verificationScore >= 70 ? '#22c55e' :
                      selectedPlotData.verificationScore >= 40 ? '#f97316' : '#ef4444'
                  }}
                />
                <span className="text-sm font-medium text-gray-600">
                  {selectedPlotData.verificationScore >= 70 ? 'Verified' :
                    selectedPlotData.verificationScore >= 40 ? 'Partial' : 'Unverified'}
                </span>
                <Shield className="h-3 w-3 text-gray-400" />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setSelectedPlot(null); setPopupPosition(null) }}
                className="h-8 w-8 p-0"
              >
                ×
              </Button>
            </div>

            <h3 className="font-semibold text-lg text-gray-900">
              ${selectedPlotData.price.toLocaleString()}
            </h3>
            <p className="text-sm text-gray-600">
              {selectedPlotData.area} acres • ${Math.round(selectedPlotData.price / selectedPlotData.area / 1000)}k/acre
            </p>
          </div>

          <div className="p-4">
            <p className="text-sm text-gray-700 mb-3">{selectedPlotData.description}</p>

            <div className="text-sm space-y-1 mb-4">
              <div><strong>Location:</strong> {selectedPlotData.address}</div>
              <div><strong>Terrain:</strong> <span className="capitalize">{selectedPlotData.terrainType}</span></div>
              <div><strong>Verification:</strong> {selectedPlotData.verificationScore}% confidence</div>
            </div>

            {/* Owner Profile Section */}
            {
              selectedPlotData.owner && (
                <div className="bg-gray-50 rounded-lg p-3 mb-4 border border-gray-200">
                  <h4 className="font-semibold text-sm text-gray-900 mb-2">Property Owner</h4>
                  <div className="flex items-center space-x-3">
                    {selectedPlotData.owner.avatar && (
                      <img
                        src={selectedPlotData.owner.avatar}
                        alt={selectedPlotData.owner.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-sm text-gray-900">{selectedPlotData.owner.name}</p>
                      <p className="text-xs text-gray-600">{selectedPlotData.owner.email}</p>
                      <p className="text-xs text-gray-600">{selectedPlotData.owner.phone}</p>
                    </div>
                  </div>
                </div>
              )
            }

            <div className="flex space-x-2 mb-4">
              <Button size="sm" onClick={() => setShowChat(true)} className="flex-1">
                <MessageCircle className="h-3 w-3 mr-1" />
                Chat with AI
              </Button>
              <Button size="sm" variant="outline" className="flex-1">
                <Calendar className="h-3 w-3 mr-1" />
                Schedule Visit
              </Button>
            </div>
          </div >
        </div >
      )
      }

      {/* AI Chatbot Toggle Button */}
      {!showChat && (
        <button
          onClick={() => setShowChat(true)}
          className="absolute bottom-6 right-6 z-30 bg-gradient-to-r from-green-600 to-emerald-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            <span className="font-medium">AI Search</span>
          </div>
        </button>
      )}

      {/* AI Chat Panel - New Gemini Powered Search */}
      {showChat && (
        <div className="absolute bottom-4 right-4 w-96 bg-white rounded-xl shadow-2xl z-30 overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <Bot className="w-5 h-5" />
                <h3 className="font-semibold">AI Property Search</h3>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowChat(false)} className="text-white hover:bg-white/20">
                <X className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-green-100 text-sm mt-1">
              Powered by Gemini AI • Search in natural language
            </p>
          </div>

          {/* Active Filters Display */}
          {activeFilters && (
            <div className="px-4 py-2 bg-green-50 border-b border-green-100">
              <div className="flex items-center gap-2 text-sm text-green-800">
                <Filter className="w-3 h-3" />
                <span className="truncate">{activeFilters}</span>
              </div>
            </div>
          )}

          {/* Chat Messages */}
          <div className="h-72 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {chatMessages.length === 0 && (
              <div className="text-center">
                <div className="text-gray-500 text-sm mb-4">
                  <Sparkles className="w-8 h-8 mx-auto mb-2 text-green-600" />
                  <p className="font-medium text-gray-700">Ask me to find properties!</p>
                  <p className="text-xs mt-1">I understand natural language queries</p>
                </div>

                {/* Quick Search Suggestions */}
                <div className="space-y-2 mt-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Try these:</p>
                  {quickSearches.map((query, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleQuickSearch(query)}
                      className="block w-full text-left px-3 py-2 text-sm bg-white rounded-lg border border-gray-200 hover:border-green-500 hover:bg-green-50 transition-colors"
                    >
                      {query}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {chatMessages.map((message) => (
              <div key={message.id} className={`${message.role === 'user' ? 'flex justify-end' : 'flex justify-start'}`}>
                <div className={`max-w-[85%] ${message.role === 'user' ? '' : ''}`}>
                  <div className={`p-3 rounded-xl text-sm ${message.role === 'user'
                      ? 'bg-green-600 text-white rounded-br-none'
                      : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'
                    }`}>
                    {message.content}
                  </div>

                  {/* Show listing results count */}
                  {message.role === 'assistant' && message.listings && message.listings.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        <MapPin className="w-3 h-3" />
                        {message.listings.length} properties found
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Loading State */}
            {isChatLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 p-3 rounded-xl rounded-bl-none shadow-sm">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Searching properties...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t bg-white">
            <div className="flex gap-2">
              <Input
                type="text"
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !isChatLoading && handleChatSubmit()}
                placeholder="e.g., Modern house with garden in Chennai..."
                className="flex-1 text-sm"
                disabled={isChatLoading}
              />
              <Button
                size="sm"
                onClick={handleChatSubmit}
                disabled={!currentMessage.trim() || isChatLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">
              {userLocation ? `📍 Using your location (${userLocation.lat.toFixed(2)}, ${userLocation.lng.toFixed(2)})` : '📍 Getting your location...'}
            </p>
          </div>
        </div>
      )}

      {/* Search Results List - Google Maps Style */}
      {chatSearchResults.length > 0 && !selectedPlot && (
        <div className="absolute top-20 left-4 w-80 max-h-[calc(100vh-8rem)] bg-white rounded-lg shadow-lg z-20 overflow-hidden">
          <div className="p-3 border-b bg-gray-50">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">{chatSearchResults.length} Results</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setChatSearchResults([]); setActiveFilters(''); fetchListings() }}
                className="text-xs"
              >
                Clear
              </Button>
            </div>
            {activeFilters && (
              <p className="text-xs text-gray-500 mt-1 truncate">{activeFilters}</p>
            )}
          </div>

          <div className="overflow-y-auto max-h-[calc(100vh-12rem)]">
            {chatSearchResults.map((listing, idx) => (
              <div
                key={listing.id}
                onClick={() => {
                  handlePlotClick(listing.id)
                  if (listing.coordinates?.length >= 2) {
                    flyToPlot([listing.coordinates[1], listing.coordinates[0]])
                  }
                }}
                className="p-3 border-b hover:bg-green-50 cursor-pointer transition-colors"
              >
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
                    {listing.thumbnailUrl ? (
                      <img src={listing.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <MapPin className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">{listing.title || 'Property'}</h4>
                    <p className="text-xs text-gray-500 truncate">
                      {[listing.city, listing.state].filter(Boolean).join(', ')}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-green-600 font-semibold text-sm">
                        ₹{listing.askingPrice ? (listing.askingPrice / 100000).toFixed(1) : '0'}L
                      </span>
                      <span className="text-gray-400 text-xs">•</span>
                      <span className="text-gray-600 text-xs">
                        {listing.totalArea?.toFixed(1) || '0'} acres
                      </span>
                    </div>
                    {listing.houseStyle && (
                      <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                        {listing.houseStyle}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Plot Popup (alternative to sidebar) */}
      {
        selectedPlot && popupPosition && !showChat && (
          <PlotPopup
            plot={selectedPlotData!}
            position={popupPosition}
            onClose={() => {
              setSelectedPlot(null)
              setPopupPosition(null)
            }}
            onChatClick={() => setShowChat(true)}
            onScheduleClick={(plotId) => {
              alert(`Schedule visit for ${plotId}`)
            }}
            onVideoClick={(plotId) => {
              alert(`Play video for ${plotId}`)
            }}
          />
        )
      }
    </div >
  )
}

export default function BuyerMapExplorer() {
  return (
    <MapProvider>
      <BuyerMapContent />
    </MapProvider>
  )
}