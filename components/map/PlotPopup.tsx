"use client"

import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '@/components/ui/button'
import { X, MessageCircle, Calendar, Play, Shield, MapPin } from 'lucide-react'
import type { PlotData } from '@/lib/mockPlots'
import { getVerificationColor } from '@/lib/mockPlots'

interface PlotPopupProps {
  plot: PlotData
  position: { x: number; y: number }
  onClose: () => void
  onChatClick: (plotId: string) => void
  onScheduleClick: (plotId: string) => void
  onVideoClick?: (plotId: string) => void
}

export default function PlotPopup({
  plot,
  position,
  onClose,
  onChatClick,
  onScheduleClick,
  onVideoClick
}: PlotPopupProps) {
  const popupRef = useRef<HTMLDivElement>(null)

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscapeKey)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscapeKey)
    }
  }, [onClose])

  const verificationColor = getVerificationColor(plot.verificationScore)
  const verificationLabel = plot.verificationScore >= 70 ? 'Verified' : 
                           plot.verificationScore >= 40 ? 'Partial' : 'Unverified'

  const popupContent = (
    <div
      ref={popupRef}
      className="fixed z-50 bg-white rounded-lg shadow-2xl border border-gray-200 max-w-sm w-80 animate-in zoom-in-95 duration-200"
      style={{
        left: Math.min(position.x, window.innerWidth - 320 - 20),
        top: Math.min(position.y, window.innerHeight - 400 - 20),
        transform: 'translate(-50%, -100%) translateY(-10px)'
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between p-4 border-b">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: verificationColor }}
            />
            <span className="text-sm font-medium text-gray-600">{verificationLabel}</span>
            <Shield className="h-3 w-3 text-gray-400" />
          </div>
          <h3 className="font-semibold text-lg text-gray-900">
            ${plot.price.toLocaleString()}
          </h3>
          <p className="text-sm text-gray-600">
            {plot.area} acres • ${Math.round(plot.price / plot.area / 1000)}k/acre
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Video Thumbnail */}
      {plot.videoThumbnail && (
        <div 
          className="relative h-32 bg-gray-100 cursor-pointer group"
          onClick={() => onVideoClick?.(plot.id)}
        >
          <img
            src={plot.videoThumbnail}
            alt={`${plot.terrainType} land video`}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none'
            }}
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
            <Play className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
            Property Tour
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        {/* Location */}
        <div className="flex items-start gap-2 mb-3">
          <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-gray-600 leading-tight">{plot.address}</p>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-700 mb-4 line-clamp-2">
          {plot.description}
        </p>

        {/* AI Summary */}
        <div className="bg-green-50 rounded-lg p-3 mb-4">
          <h4 className="font-medium text-green-800 text-sm mb-2">AI Analysis Summary</h4>
          <div className="space-y-1 text-xs text-green-700">
            <div className="flex justify-between">
              <span>Terrain:</span>
              <span className="capitalize font-medium">{plot.terrainType}</span>
            </div>
            <div className="flex justify-between">
              <span>Verification:</span>
              <span className="font-medium">{plot.verificationScore}% confidence</span>
            </div>
            <div className="flex justify-between">
              <span>Size:</span>
              <span className="font-medium">{plot.area} acres</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={() => onChatClick(plot.id)}
            className="flex-1 h-9 text-sm"
            size="sm"
          >
            <MessageCircle className="h-3 w-3 mr-1" />
            Chat with AI
          </Button>
          <Button
            onClick={() => onScheduleClick(plot.id)}
            variant="outline"
            className="flex-1 h-9 text-sm"
            size="sm"
          >
            <Calendar className="h-3 w-3 mr-1" />
            Schedule Visit
          </Button>
        </div>
      </div>
    </div>
  )

  // Render portal to body
  return typeof window !== 'undefined' 
    ? createPortal(popupContent, document.body)
    : null
}