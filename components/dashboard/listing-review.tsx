"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { MapPin, DollarSign, CheckCircle, AlertTriangle } from 'lucide-react'

interface ListingReviewProps {
  documentData: any
  videoData: any
  onSuccess: () => void
}

export default function ListingReview({ documentData, videoData, onSuccess }: ListingReviewProps) {
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [creating, setCreating] = useState(false)

  const handleCreateListing = async () => {
    setCreating(true)
    
    try {
      // Simulate listing creation
      await new Promise(resolve => setTimeout(resolve, 2000))
      onSuccess()
    } catch (error) {
      console.error('Failed to create listing:', error)
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Step 3: Review & List Your Property</h2>
        <p className="text-gray-600">
          Review the AI analysis results and set your listing details.
        </p>
      </div>

      {/* AI Summary */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <h3 className="font-semibold text-green-800">AI Verification Complete</h3>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-green-800 mb-2">Property Details</h4>
            <div className="text-sm space-y-1">
              <div><strong>Owner:</strong> {documentData.ownerName}</div>
              <div><strong>Plot:</strong> {documentData.plotNumber}</div>
              <div><strong>Area:</strong> {documentData.totalArea} acres</div>
              <div><strong>Verification:</strong> <span className="text-green-600">{documentData.verificationScore}% authentic</span></div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-green-800 mb-2">Land Analysis</h4>
            <div className="text-sm space-y-1">
              <div><strong>Terrain:</strong> {videoData.visualInsights.terrainType}</div>
              <div><strong>Soil:</strong> {videoData.visualInsights.soilQuality}</div>
              <div><strong>Noise Level:</strong> {videoData.audioInsights.noiseLevel}</div>
              <div><strong>Structures:</strong> {videoData.visualInsights.builtStructures.join(', ')}</div>
            </div>
          </div>
        </div>

        <div className="mt-4 p-4 bg-white rounded-lg">
          <h4 className="font-medium mb-2">AI-Generated Property Summary</h4>
          <p className="text-sm text-gray-700">
            Well-maintained {documentData.totalArea}-acre {videoData.visualInsights.terrainType} property with 
            {videoData.visualInsights.soilQuality} soil quality. Features include {videoData.visualInsights.builtStructures.join(' and ')}. 
            Located in a {videoData.audioInsights.noiseLevel} {videoData.visualInsights.accessibility} area with 
            {videoData.visualInsights.vegetationDensity} vegetation coverage. 
            Certificate verification shows {documentData.verificationScore}% authenticity with 
            {videoData.visualInsights.boundaryMatch}% boundary match confidence.
          </p>
        </div>
      </div>

      {/* Listing Form */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="font-semibold mb-4">Listing Details</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Asking Price (USD)
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="450000"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            {price && (
              <p className="text-xs text-gray-500 mt-1">
                ${(parseFloat(price) / documentData.totalArea).toFixed(0)}/acre
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add any additional details about the property, access roads, utilities, etc."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Map Preview */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="font-semibold mb-4 flex items-center">
          <MapPin className="h-4 w-4 mr-2" />
          Map Preview
        </h3>
        
        <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
          <div className="text-center">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">Interactive map will show here</p>
            <p className="text-sm text-gray-500">
              Red zone overlay with video thumbnail at {documentData.coordinates?.[0]?.toFixed(4)}, {documentData.coordinates?.[1]?.toFixed(4)}
            </p>
          </div>
        </div>
      </div>

      {/* Create Listing Button */}
      <div className="flex justify-center">
        <Button
          onClick={handleCreateListing}
          disabled={!price || creating}
          className="bg-green-600 hover:bg-green-700 px-8 py-3"
          size="lg"
        >
          {creating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Creating Listing...
            </>
          ) : (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Create Live Listing
            </>
          )}
        </Button>
      </div>
    </div>
  )
}