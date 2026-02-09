"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { 
  Map, 
  Satellite, 
  MapPin, 
  RotateCcw, 
  Mountain, 
  Trees, 
  Building, 
  Waves, 
  Wheat,
  Info,
  ChevronUp,
  ChevronDown
} from 'lucide-react'
import { useMap } from './MapProvider'
import { getVerificationColor } from '@/lib/mockPlots'

interface MapControlsProps {
  onLocationClick?: () => void
  className?: string
}

export default function MapControls({ 
  onLocationClick,
  className = ''
}: MapControlsProps) {
  const { map } = useMap()
  const [currentLayer, setCurrentLayer] = useState<'osm' | 'satellite'>('osm')
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null)
  const [showLegend, setShowLegend] = useState(false)

  const handleLayerToggle = () => {
    if (!map) return

    const newLayer = currentLayer === 'osm' ? 'satellite' : 'osm'
    
    if (newLayer === 'satellite') {
      // Switch to satellite view (requires MapTiler key)
      const maptilerKey = process.env.NEXT_PUBLIC_MAPTILER_KEY
      if (maptilerKey) {
        map.setStyle(`https://api.maptiler.com/maps/hybrid/style.json?key=${maptilerKey}`)
      } else {
        // Fallback to another satellite provider or show message
        console.warn('Satellite view requires NEXT_PUBLIC_MAPTILER_KEY')
        return
      }
    } else {
      // Switch back to OSM
      map.setStyle({
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
      })
    }
    
    setCurrentLayer(newLayer)
  }

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setUserLocation({ lat: latitude, lng: longitude })
        
        if (map) {
          map.flyTo({
            center: [longitude, latitude],
            zoom: 15,
            duration: 2000
          })
          
          // Add user location marker
          if (map.getSource('user-location')) {
            map.removeLayer('user-location-marker')
            map.removeSource('user-location')
          }
          
          map.addSource('user-location', {
            type: 'geojson',
            data: {
              type: 'Point',
              coordinates: [longitude, latitude]
            }
          })
          
          map.addLayer({
            id: 'user-location-marker',
            type: 'circle',
            source: 'user-location',
            paint: {
              'circle-radius': 8,
              'circle-color': '#3b82f6',
              'circle-stroke-color': '#ffffff',
              'circle-stroke-width': 2
            }
          })
        }
        
        onLocationClick?.()
      },
      (error) => {
        console.error('Error getting location:', error)
        alert('Unable to get your location')
      }
    )
  }

  const handleResetBounds = () => {
    if (!map) return
    
    const source = map.getSource('plots')
    if (source && 'getData' in source) {
      // Fit to all plots
      const data = (source as any)._data
      if (data && data.features && data.features.length > 0) {
        const bounds = new (window as any).maplibregl.LngLatBounds()
        data.features.forEach((feature: any) => {
          if (feature.geometry.type === 'Polygon') {
            feature.geometry.coordinates[0].forEach((coord: [number, number]) => {
              bounds.extend(coord)
            })
          }
        })
        map.fitBounds(bounds, { padding: 50 })
      }
    }
  }

  const terrainIcons = {
    vineyard: <Trees className="h-3 w-3" />,
    suburban: <Building className="h-3 w-3" />,
    mountain: <Mountain className="h-3 w-3" />,
    coastal: <Waves className="h-3 w-3" />,
    farmland: <Wheat className="h-3 w-3" />
  }

  return (
    <div className={`absolute bottom-4 left-4 z-10 space-y-2 ${className}`}>
      {/* Collapsible Legend */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Legend Toggle Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowLegend(!showLegend)}
          className="w-full h-8 px-2 flex items-center gap-2 hover:bg-gray-50"
        >
          <Info className="h-3 w-3" />
          <span className="text-xs font-medium">Legend</span>
          {showLegend ? (
            <ChevronDown className="h-3 w-3 ml-auto" />
          ) : (
            <ChevronUp className="h-3 w-3 ml-auto" />
          )}
        </Button>
        
        {/* Expandable Legend Content */}
        {showLegend && (
          <div className="p-3 pt-0 border-t border-gray-100">
            {/* Verification Scale */}
            <div className="space-y-2 mb-3">
              <div className="text-xs font-medium text-gray-700">Verification</div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-2 rounded-sm"
                    style={{ backgroundColor: getVerificationColor(80) }}
                  />
                  <span className="text-xs text-gray-600">Verified</span>
                </div>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-2 rounded-sm"
                    style={{ backgroundColor: getVerificationColor(55) }}
                  />
                  <span className="text-xs text-gray-600">Partial</span>
                </div>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-2 rounded-sm"
                    style={{ backgroundColor: getVerificationColor(25) }}
                  />
                  <span className="text-xs text-gray-600">Unverified</span>
                </div>
              </div>
            </div>

            {/* Terrain Types - Compact */}
            <div className="space-y-2">
              <div className="text-xs font-medium text-gray-700">Terrain</div>
              <div className="grid grid-cols-3 gap-1">
                {Object.entries(terrainIcons).slice(0, 5).map(([type, icon]) => (
                  <div key={type} className="flex items-center gap-1" title={type}>
                    {icon}
                    <span className="text-xs text-gray-600 capitalize truncate">
                      {type.slice(0, 4)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Control Buttons */}
      <div className="bg-white rounded-lg shadow-lg p-1 flex flex-col gap-1">
        {/* Layer Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLayerToggle}
          className="h-8 w-8 p-0"
          title={`Switch to ${currentLayer === 'osm' ? 'Satellite' : 'Map'} view`}
        >
          {currentLayer === 'osm' ? (
            <Satellite className="h-4 w-4" />
          ) : (
            <Map className="h-4 w-4" />
          )}
        </Button>

        {/* Current Location */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCurrentLocation}
          className="h-8 w-8 p-0"
          title="Go to current location"
        >
          <MapPin className="h-4 w-4" />
        </Button>

        {/* Reset Bounds */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleResetBounds}
          className="h-8 w-8 p-0"
          title="Fit all plots"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}