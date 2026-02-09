"use client"

import { useState, useCallback, useRef } from 'react'

interface GeocodeResult {
  lat: string
  lon: string
  display_name: string
  place_id: string
  type: string
  importance: number
}

interface GeocodingState {
  loading: boolean
  error: string | null
  results: GeocodeResult[]
}

interface UseGeocodingReturn extends GeocodingState {
  geocode: (address: string) => Promise<GeocodeResult[]>
  reverseGeocode: (lat: number, lon: number) => Promise<string>
  clearResults: () => void
}

/**
 * Hook for geocoding using OpenStreetMap Nominatim API
 * 
 * Usage Policy:
 * - Maximum 1 request per second
 * - Must include User-Agent header
 * - Free for non-commercial use
 * - For high-volume usage, consider hosting your own Nominatim instance
 * 
 * @see https://operations.osmfoundation.org/policies/nominatim/
 */
export function useGeocoding(): UseGeocodingReturn {
  const [state, setState] = useState<GeocodingState>({
    loading: false,
    error: null,
    results: []
  })

  const lastRequestTime = useRef<number>(0)

  // Rate-limited request function
  const makeRequest = useCallback(
    async (url: string) => {
      // Ensure at least 1 second between requests
      const now = Date.now()
      const timeSinceLastRequest = now - lastRequestTime.current
      if (timeSinceLastRequest < 1000) {
        await new Promise(resolve => setTimeout(resolve, 1000 - timeSinceLastRequest))
      }
      
      lastRequestTime.current = Date.now()

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'LandVerifyAI/1.0 (contact@landverifyai.com)'
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      return response.json()
    },
    []
  )

  /**
   * Geocode an address to coordinates
   * 
   * @param address - The address to geocode
   * @returns Promise resolving to array of geocoding results
   */
  const geocode = useCallback(async (address: string): Promise<GeocodeResult[]> => {
    if (!address.trim()) {
      setState(prev => ({ ...prev, results: [], error: null }))
      return []
    }

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const encodedAddress = encodeURIComponent(address)
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=5&addressdetails=1&extratags=1`
      
      const results = await makeRequest(url)
      
      setState(prev => ({
        ...prev,
        loading: false,
        results,
        error: null
      }))
      
      return results
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Geocoding failed'
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
        results: []
      }))
      throw error
    }
  }, [makeRequest])

  /**
   * Reverse geocode coordinates to address
   * 
   * @param lat - Latitude
   * @param lon - Longitude
   * @returns Promise resolving to formatted address string
   */
  const reverseGeocode = useCallback(async (lat: number, lon: number): Promise<string> => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`
      
      const result = await makeRequest(url)
      
      setState(prev => ({ ...prev, loading: false, error: null }))
      
      return result.display_name || `${lat}, ${lon}`
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Reverse geocoding failed'
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }))
      return `${lat}, ${lon}` // Fallback to coordinates
    }
  }, [makeRequest])

  const clearResults = useCallback(() => {
    setState(prev => ({ ...prev, results: [], error: null }))
  }, [])

  return {
    loading: state.loading,
    error: state.error,
    results: state.results,
    geocode,
    reverseGeocode,
    clearResults
  }
}

export default useGeocoding