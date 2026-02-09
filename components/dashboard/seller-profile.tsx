"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Edit2, 
  Save, 
  X, 
  CheckCircle,
  AlertCircle,
  Home,
  DollarSign,
  Eye,
  MessageCircle
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

interface Listing {
  id: string
  title: string
  address: string
  city: string
  state: string
  totalArea: number
  askingPrice: number
  status: 'PENDING' | 'VERIFIED' | 'LIVE' | 'SOLD' | 'REJECTED'
  aiVerificationScore: number
  propertyType: string
  thumbnailUrl: string | null
  viewCount: number
  inquiryCount: number
  createdAt: string
}

interface SellerProfileProps {
  user: {
    id: string
    clerkId: string
    email: string
    firstName: string | null
    lastName: string | null
    imageUrl: string | null
    phone: string | null
    address: string | null
    city: string | null
    state: string | null
    zipCode: string | null
    country: string | null
    bio: string | null
    isVerified: boolean
  }
  listings: Listing[]
  missingFields?: string[]
  allMissingFields?: string[]
  completionPercentage?: number
}

export default function SellerProfile({ user, listings, missingFields = [], allMissingFields = [], completionPercentage = 100 }: SellerProfileProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [formData, setFormData] = useState({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    phone: user.phone || '',
    address: user.address || '',
    city: user.city || '',
    state: user.state || '',
    zipCode: user.zipCode || '',
    country: user.country || '',
    bio: user.bio || ''
  })
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    setSaveMessage(null)
    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (response.ok) {
        setSaveMessage({ type: 'success', text: 'Profile updated successfully!' })
        setIsEditing(false)
        // Reload after a brief moment to show updated data
        setTimeout(() => window.location.reload(), 1000)
      } else {
        setSaveMessage({ type: 'error', text: 'Failed to save. Please try again.' })
      }
    } catch (error) {
      console.error('Failed to update profile:', error)
      setSaveMessage({ type: 'error', text: 'Network error. Please try again.' })
    } finally {
      setIsSaving(false)
    }
  }

  const isFieldMissing = (field: string) => missingFields.includes(field) || allMissingFields.includes(field)

  const getStatusBadge = (status: string) => {
    const styles = {
      PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      VERIFIED: 'bg-blue-100 text-blue-800 border-blue-300',
      LIVE: 'bg-green-100 text-green-800 border-green-300',
      SOLD: 'bg-gray-100 text-gray-800 border-gray-300',
      REJECTED: 'bg-red-100 text-red-800 border-red-300'
    }
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium border ${styles[status as keyof typeof styles]}`}>
        {status}
      </span>
    )
  }

  const liveListings = listings.filter(l => l.status === 'LIVE')
  const pendingListings = listings.filter(l => l.status === 'PENDING' || l.status === 'VERIFIED')
  const totalViews = listings.reduce((sum, l) => sum + l.viewCount, 0)
  const totalInquiries = listings.reduce((sum, l) => sum + l.inquiryCount, 0)

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Home className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Live Listings</p>
              <p className="text-2xl font-bold">{liveListings.length}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold">{pendingListings.length}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Eye className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Views</p>
              <p className="text-2xl font-bold">{totalViews}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <MessageCircle className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Inquiries</p>
              <p className="text-2xl font-bold">{totalInquiries}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Missing Fields Warning Banner */}
      {missingFields.length > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold text-amber-800">Required Information Missing</h3>
            <p className="text-sm text-amber-700 mt-1">
              Please fill in the following fields: <strong>{missingFields.join(', ')}</strong>
            </p>
            <p className="text-xs text-amber-600 mt-1">
              Click "Edit Profile" below to add the missing information.
            </p>
          </div>
          {completionPercentage < 100 && (
            <div className="text-right flex-shrink-0">
              <span className={`text-sm font-bold ${
                completionPercentage < 50 ? 'text-red-600' :
                completionPercentage < 80 ? 'text-amber-600' : 'text-green-600'
              }`}>{completionPercentage}%</span>
              <p className="text-xs text-gray-500">Complete</p>
            </div>
          )}
        </div>
      )}

      {/* Save Status Message */}
      {saveMessage && (
        <div className={`rounded-lg p-3 text-sm ${
          saveMessage.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-700' 
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {saveMessage.type === 'success' ? '✓' : '✗'} {saveMessage.text}
        </div>
      )}

      {/* Profile Information */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            {user.imageUrl && (
              <Image
                src={user.imageUrl}
                alt={`${user.firstName} ${user.lastName}`}
                width={80}
                height={80}
                className="rounded-full"
              />
            )}
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                {user.firstName} {user.lastName}
                {user.isVerified && (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                )}
              </h2>
              <p className="text-gray-600">Seller Profile</p>
            </div>
          </div>
          
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} variant="outline">
              <Edit2 className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={isSaving}>
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
              <Button onClick={() => setIsEditing(false)} variant="outline">
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-1">
                <Mail className="w-4 h-4" />
                Email
              </label>
              <Input value={user.email} disabled className="bg-gray-50" />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-1">
                <User className="w-4 h-4" />
                First Name
              </label>
              <Input
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                disabled={!isEditing}
                className={!isEditing ? 'bg-gray-50' : ''}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-1">
                <User className="w-4 h-4" />
                Last Name
              </label>
              <Input
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                disabled={!isEditing}
                className={!isEditing ? 'bg-gray-50' : ''}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-1">
                <Phone className="w-4 h-4" />
                Phone
                {isFieldMissing('phone') && <span className="text-red-500 text-xs">*required</span>}
              </label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                disabled={!isEditing}
                placeholder="Enter phone number"
                className={`${!isEditing ? 'bg-gray-50' : ''} ${isFieldMissing('phone') && !formData.phone ? 'border-red-300 bg-red-50' : ''}`}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-1">
                <MapPin className="w-4 h-4" />
                Address
                {isFieldMissing('address') && <span className="text-red-500 text-xs">*required</span>}
              </label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                disabled={!isEditing}
                placeholder="Enter address"
                className={`${!isEditing ? 'bg-gray-50' : ''} ${isFieldMissing('address') && !formData.address ? 'border-red-300 bg-red-50' : ''}`}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1">
                  City {isFieldMissing('city') && <span className="text-red-500 text-xs">*</span>}
                </label>
                <Input
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  disabled={!isEditing}
                  placeholder="Enter city"
                  className={`${!isEditing ? 'bg-gray-50' : ''} ${isFieldMissing('city') && !formData.city ? 'border-red-300 bg-red-50' : ''}`}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1">
                  State {isFieldMissing('state') && <span className="text-red-500 text-xs">*</span>}
                </label>
                <Input
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  disabled={!isEditing}
                  placeholder="Enter state"
                  className={`${!isEditing ? 'bg-gray-50' : ''} ${isFieldMissing('state') && !formData.state ? 'border-red-300 bg-red-50' : ''}`}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1">Zip Code</label>
                <Input
                  value={formData.zipCode}
                  onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                  disabled={!isEditing}
                  className={!isEditing ? 'bg-gray-50' : ''}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1">Country</label>
                <Input
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  disabled={!isEditing}
                  className={!isEditing ? 'bg-gray-50' : ''}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <label className="text-sm font-medium text-gray-700 mb-1">Bio</label>
          <textarea
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            disabled={!isEditing}
            className={`w-full p-2 border rounded-md ${!isEditing ? 'bg-gray-50' : ''}`}
            rows={3}
            placeholder="Tell buyers about yourself..."
          />
        </div>
      </Card>

      {/* My Listings */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">My Listings</h3>
          <Link href="/dashboard">
            <Button>Add New Listing</Button>
          </Link>
        </div>

        {listings.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Home className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p>No listings yet</p>
            <Link href="/dashboard">
              <Button className="mt-4">Create Your First Listing</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {listings.map((listing) => (
              <Card key={listing.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-gray-200 relative">
                  {listing.thumbnailUrl ? (
                    <Image
                      src={listing.thumbnailUrl}
                      alt={listing.title || 'Land listing'}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Home className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    {getStatusBadge(listing.status)}
                  </div>
                </div>
                
                <div className="p-4 space-y-2">
                  <h4 className="font-semibold text-lg truncate">
                    {listing.title || 'Untitled Property'}
                  </h4>
                  
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {listing.city}, {listing.state}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{listing.totalArea.toFixed(2)} acres</span>
                    <span className="font-semibold text-green-600">
                      ₹{(listing.askingPrice / 100000).toFixed(2)}L
                    </span>
                  </div>
                  
                  {listing.aiVerificationScore && (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>AI Score: {(listing.aiVerificationScore * 100).toFixed(0)}%</span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" /> {listing.viewCount} views
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-3 h-3" /> {listing.inquiryCount} inquiries
                    </span>
                  </div>
                  
                  <Link href={`/dashboard/listing/${listing.id}`}>
                    <Button className="w-full mt-2" variant="outline" size="sm">
                      View Details
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
