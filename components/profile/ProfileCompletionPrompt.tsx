"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { updateProfileAction } from '@/lib/actions/profile-actions'
import { 
  Upload, 
  User, 
  Phone, 
  MapPin, 
  Building, 
  AlertTriangle,
  CheckCircle,
  Camera,
  FileText,
  X
} from 'lucide-react'
import Image from 'next/image'

interface ProfileCompletionProps {
  user: any
  profileAnalysis: {
    completionPercentage: number
    missingFields: string[]
    missingCategories: string[]
    criticalMissing: string[]
    recommendedUploads: string[]
    nextSteps: string[]
  }
  allowSkip?: boolean
}

export default function ProfileCompletionPrompt({ 
  user, 
  profileAnalysis, 
  allowSkip = false 
}: ProfileCompletionProps) {
  const [activeTab, setActiveTab] = useState('basic')
  const [formData, setFormData] = useState({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    phone: user.phone || '',
    address: user.address || '',
    city: user.city || '',
    state: user.state || '',
    companyName: user.companyName || '',
    businessType: user.businessType || '',
    budgetRange: user.budgetRange || '',
    preferredLocation: user.preferredLocation || ''
  })
  const [uploading, setUploading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isCritical = profileAnalysis.criticalMissing.length > 0
  const completionColor = profileAnalysis.completionPercentage < 50 ? 'red' : 
                         profileAnalysis.completionPercentage < 80 ? 'yellow' : 'green'

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSaveBasicInfo = async () => {
    setIsSubmitting(true)
    try {
      // Save all non-empty fields from the form
      const updateData = Object.fromEntries(
        Object.entries(formData).filter(([key, value]) => value && value.trim() !== '')
      )
      
      if (Object.keys(updateData).length > 0) {
        const result = await updateProfileAction(updateData)
        if (result.success) {
          // Close the prompt and redirect to dashboard after successful save
          window.location.href = '/dashboard'
        } else {
          console.error('Failed to update profile:', result.error)
          alert('Failed to save profile. Please try again.')
        }
      } else {
        // No data to save, just close
        window.location.href = '/dashboard'
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {isCritical ? '⚠️ Complete Your Profile' : '✨ Enhance Your Profile'}
              </h2>
              <p className="text-gray-600 mt-1">
                {isCritical 
                  ? 'Some required information is missing. Please complete to continue.'
                  : 'Add more details to improve your experience'}
              </p>
            </div>
            {allowSkip && (
              <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Profile Completion</span>
              <span className={`font-bold ${
                completionColor === 'red' ? 'text-red-600' :
                completionColor === 'yellow' ? 'text-yellow-600' : 'text-green-600'
              }`}>
                {profileAnalysis.completionPercentage}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all ${
                  completionColor === 'red' ? 'bg-red-500' :
                  completionColor === 'yellow' ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${profileAnalysis.completionPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Critical Missing Alert */}
          {profileAnalysis.criticalMissing.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-red-600 mr-3 mt-0.5" />
                <div>
                  <h3 className="text-red-800 font-semibold mb-1">
                    Required Information Missing
                  </h3>
                  <p className="text-red-700 text-sm">
                    These fields are required: {profileAnalysis.criticalMissing.join(', ')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Name Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name {profileAnalysis.missingFields.includes('firstName') && '*'}
              </label>
              <Input
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                placeholder="Enter first name"
                className={profileAnalysis.criticalMissing.includes('firstName') ? 'border-red-300' : ''}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name {profileAnalysis.missingFields.includes('lastName') && '*'}
              </label>
              <Input
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                placeholder="Enter last name"
                className={profileAnalysis.criticalMissing.includes('lastName') ? 'border-red-300' : ''}
              />
            </div>
          </div>

          {/* Contact Info */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Phone className="w-4 h-4 inline-block mr-2" />
              Phone Number {profileAnalysis.missingFields.includes('phone') && '*'}
            </label>
            <Input
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="Enter phone number"
              className={profileAnalysis.criticalMissing.includes('phone') ? 'border-red-300' : ''}
            />
          </div>

          {/* Action Items */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Action Items
            </h3>
            <div className="space-y-3">
              {profileAnalysis.nextSteps
                .filter(step => !step.toLowerCase().includes('business license'))
                .slice(0, 3).map((step, index) => (
                <div key={index} className="flex items-center p-3 bg-blue-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-blue-600 mr-3" />
                  <span className="text-blue-800">{step}</span>
                </div>
              ))}
            </div>
          </div>

          <Button 
            onClick={handleSaveBasicInfo}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            Save Information
          </Button>
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 border-t">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {isCritical && (
                <span className="text-red-600 font-medium">
                  ⚠️ Profile completion required to access all features
                </span>
              )}
            </div>
            <div className="flex space-x-3">
              {allowSkip && !isCritical && (
                <Button variant="outline" onClick={() => window.location.href = '/dashboard'}>
                  Skip for Now
                </Button>
              )}
              <Button 
                onClick={handleSaveBasicInfo}
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? 'Saving...' : 'Save Information'}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}