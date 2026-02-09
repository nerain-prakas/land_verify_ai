"use client"

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import type { Map as MapLibreMap, LngLatBoundsLike } from 'maplibre-gl'

interface MapContextType {
  map: MapLibreMap | null
  setMap: (map: MapLibreMap | null) => void
  selectedPlot: string | null
  hoveredPlot: string | null
  mapBounds: LngLatBoundsLike | null
  selectPlot: (id: string | null) => void
  setHoveredPlot: (id: string | null) => void
  flyToPlot: (coordinates: [number, number]) => void
  highlightPlot: (id: string | null) => void
  setMapBounds: (bounds: LngLatBoundsLike) => void
}

const MapContext = createContext<MapContextType | null>(null)

interface MapProviderProps {
  children: ReactNode
}

export function MapProvider({ children }: MapProviderProps) {
  const [map, setMap] = useState<MapLibreMap | null>(null)
  const [selectedPlot, setSelectedPlot] = useState<string | null>(null)
  const [hoveredPlot, setHoveredPlot] = useState<string | null>(null)
  const [mapBounds, setMapBounds] = useState<LngLatBoundsLike | null>(null)

  const selectPlot = useCallback((id: string | null) => {
    setSelectedPlot(id)
  }, [])

  const flyToPlot = useCallback((coordinates: [number, number]) => {
    if (!map) return
    
    map.flyTo({
      center: coordinates,
      zoom: 15,
      duration: 2000
    })
  }, [map])

  const highlightPlot = useCallback((id: string | null) => {
    if (!map) return

    // Remove previous highlight
    if (map.getLayer('plot-highlight')) {
      map.removeLayer('plot-highlight')
    }
    if (map.getSource('plot-highlight')) {
      map.removeSource('plot-highlight')
    }

    // Add new highlight if ID provided
    if (id) {
      const source = map.getSource('plots')
      if (source && 'querySourceFeatures' in source) {
        try {
          const features = map.querySourceFeatures('plots', {
            filter: ['==', ['get', 'id'], id]
          })
          
          if (features.length > 0) {
            map.addSource('plot-highlight', {
              type: 'geojson',
              data: features[0]
            })
            
            map.addLayer({
              id: 'plot-highlight',
              type: 'line',
              source: 'plot-highlight',
              paint: {
                'line-color': '#3b82f6',
                'line-width': 4,
                'line-opacity': 0.8
              }
            })
          }
        } catch (error) {
          console.error('Error highlighting plot:', error)
        }
      }
    }
  }, [map])

  const contextValue: MapContextType = {
    map,
    setMap,
    selectedPlot,
    hoveredPlot,
    mapBounds,
    selectPlot,
    setHoveredPlot,
    flyToPlot,
    highlightPlot,
    setMapBounds
  }

  return (
    <MapContext.Provider value={contextValue}>
      {children}
    </MapContext.Provider>
  )
}

export function useMap(): MapContextType {
  const context = useContext(MapContext)
  if (!context) {
    throw new Error('useMap must be used within a MapProvider')
  }
  return context
}

export default MapProvider