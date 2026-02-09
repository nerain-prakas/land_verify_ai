


































"use client"

import { useEffect, useRef, useState } from 'react'
import { Map as MapLibreMap, NavigationControl, GeoJSONSource, LngLatBounds } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useMap } from './MapProvider'
import { getVerificationColor } from '@/lib/mockPlots'
import type { GeoJSON } from 'geojson'

interface PlotFeature extends GeoJSON.Feature {
  properties: {
    id: string
    price: number
    verificationScore: number
    videoThumbnail?: string
    [key: string]: any
  }
}

interface LandMapProps {
  plots: PlotFeature[]
  onPlotClick?: (plotId: string) => void
  className?: string
  height?: string
}

export default function LandMap({ 
  plots, 
  onPlotClick,
  className = '',
  height = '600px'
}: LandMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const { map, setMap, selectPlot, setHoveredPlot } = useMap()
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const mapInitialized = useRef(false)

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || mapInitialized.current) return

    console.log('🗺️ Initializing MapLibre GL map...')
    mapInitialized.current = true
    
    try {
      const mapInstance = new MapLibreMap({
        container: mapContainer.current,
        style: {
          version: 8,
          sources: {
            'osm-raster': {
              type: 'raster',
              tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
              tileSize: 256,
              attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }
          },
          layers: [
            {
              id: 'osm-raster-layer',
              type: 'raster',
              source: 'osm-raster'
            }
          ]
        },
        center: [80.2707, 13.0827], // Center on Chennai, India
        zoom: 10,
        attributionControl: false
      })

      console.log('✅ MapLibre GL instance created')

      // Add error handler  
      mapInstance.on('error', (e) => {
        console.error('❌ MapLibre GL error:', e)
        setError('Map failed to load. Please refresh the page.')
      })

      // Add load handler
      mapInstance.on('load', () => {
        console.log('✅ Map loaded successfully')
      })

      // Add navigation controls (zoom in/out)
      mapInstance.addControl(new NavigationControl({
        showCompass: true,
        showZoom: true,
        visualizePitch: true
      }), 'top-right')

      // Set map instance in context
      setMap(mapInstance)
      setError(null)

      return () => {
        console.log('🧹 Cleaning up map instance')
        mapInitialized.current = false
        setMap(null)
        mapInstance.remove()
      }
    } catch (err) {
      console.error('❌ Failed to initialize map:', err)
      setError('Failed to initialize map. Please check your internet connection.')
      mapInitialized.current = false
    }
  }, [setMap])

  // Add plots to map when loaded
  useEffect(() => {
    if (!map || !plots.length || isLoaded) return

    const handleLoad = () => {
      try {
        console.log('Loading map with plots:', plots.length)
        // Add plots source
        map.addSource('plots', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: plots
          }
        })

        // Add fill layer with color based on verification score
        map.addLayer({
          id: 'plots-fill',
          type: 'fill',
          source: 'plots',
          paint: {
            'fill-color': [
              'case',
              ['>=', ['get', 'verificationScore'], 70], '#22c55e', // green
              ['>=', ['get', 'verificationScore'], 40], '#f97316', // orange
              '#ef4444' // red
            ],
            'fill-opacity': [
              'case',
              ['boolean', ['feature-state', 'hover'], false],
              0.8,
              0.6
            ]
          }
        })

        // Add border layer
        map.addLayer({
          id: 'plots-border',
          type: 'line',
          source: 'plots',
          paint: {
            'line-color': '#dc2626',
            'line-width': 2,
            'line-opacity': 0.9
          }
        })

        // Fit map to show all plots
        if (plots.length > 0) {
          const bounds = new LngLatBounds()
          plots.forEach(plot => {
            if (plot.geometry.type === 'Polygon') {
              plot.geometry.coordinates[0].forEach(coord => {
                bounds.extend(coord as [number, number])
              })
            }
          })
          map.fitBounds(bounds, { padding: 50 })
        }

        // Add click handler
        map.on('click', 'plots-fill', (e) => {
          if (e.features && e.features[0]) {
            const plotId = e.features[0].properties?.id
            if (plotId) {
              selectPlot(plotId)
              onPlotClick?.(plotId)
            }
          }
        })

        // Add hover handlers
        map.on('mouseenter', 'plots-fill', (e) => {
          if (e.features && e.features[0]) {
            const plotId = e.features[0].properties?.id
            if (plotId) {
              map.getCanvas().style.cursor = 'pointer'
              setHoveredPlot(plotId)
              map.setFeatureState(
                { source: 'plots', id: e.features[0].id },
                { hover: true }
              )
            }
          }
        })

        map.on('mouseleave', 'plots-fill', (e) => {
          map.getCanvas().style.cursor = ''
          setHoveredPlot(null)
          if (e.features) {
            e.features.forEach(feature => {
              map.setFeatureState(
                { source: 'plots', id: feature.id },
                { hover: false }
              )
            })
          }
        })

        setIsLoaded(true)
        console.log('Map loaded successfully')
      } catch (error) {
        console.error('Error adding plots to map:', error)
        console.error('Error details:', error instanceof Error ? error.message : 'Unknown error')
      }
    }

    if (map.isStyleLoaded()) {
      handleLoad()
    } else {
      map.on('styledata', handleLoad)
    }

    return () => {
      map.off('styledata', handleLoad)
    }
  }, [map, plots, isLoaded, selectPlot, setHoveredPlot, onPlotClick])

  // Update plots data when plots change
  useEffect(() => {
    if (!map || !isLoaded) return

    const source = map.getSource('plots') as GeoJSONSource
    if (source) {
      source.setData({
        type: 'FeatureCollection',
        features: plots
      })
    }
  }, [map, plots, isLoaded])

  return (
    <div className={`relative ${className}`} style={{ height: className?.includes('h-full') ? '100%' : height }}>
      <div 
        ref={mapContainer} 
        className="w-full h-full rounded-lg"
      />
      {error && (
        <div className="absolute inset-0 bg-red-50 rounded-lg flex items-center justify-center">
          <div className="text-center p-4">
            <div className="text-red-600 text-4xl mb-4">⚠️</div>
            <h3 className="text-red-800 font-semibold mb-2">Map Load Error</h3>
            <p className="text-red-600 text-sm mb-4">{error}</p>
            <button 
              onClick={() => {
                setError(null)
                mapInitialized.current = false
                window.location.reload()
              }}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
            >
              Retry
            </button>
          </div>
        </div>
      )}
      {!isLoaded && !error && (
        <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading map...</p>
            <p className="text-gray-500 text-xs mt-1">Connecting to OpenStreetMap</p>
          </div>
        </div>
      )}
    </div>
  )
}