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
  Heart,
  Clock,
  MessageCircle
} from 'lucide-react'
import Image from 'next/image'

interface MeetingRequest {
  id: string
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED'
  selectedTime: string | null
  location: string | null
  createdAt: string
  listing: {
    id: string
    title: string
    address: string
    city: string
    state: string
    thumbnailUrl: string | null
  }
}

interface BuyerProfileProps {
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
  meetingRequests?: MeetingRequest[]
}

export default function BuyerProfile({ user, meetingRequests = [] }: BuyerProfileProps) {
  const [isEditing, setIsEditing] = useState(false)
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
    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (response.ok) {
        setIsEditing(false)
        window.location.reload()
      }
    } catch (error) {
      console.error('Failed to update profile:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      ACCEPTED: 'bg-green-100 text-green-800 border-green-300',
      REJECTED: 'bg-red-100 text-red-800 border-red-300',
      COMPLETED: 'bg-blue-100 text-blue-800 border-blue-300',
      CANCELLED: 'bg-gray-100 text-gray-800 border-gray-300'
    }
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium border ${styles[status as keyof typeof styles]}`}>
        {status}
      </span>
    )
  }

  const pendingMeetings = meetingRequests.filter(m => m.status === 'PENDING')
  const acceptedMeetings = meetingRequests.filter(m => m.status === 'ACCEPTED')
  const completedMeetings = meetingRequests.filter(m => m.status === 'COMPLETED')

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pending Requests</p>
              <p className="text-2xl font-bold">{pendingMeetings.length}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Accepted Meetings</p>
              <p className="text-2xl font-bold">{acceptedMeetings.length}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MessageCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Inquiries</p>
              <p className="text-2xl font-bold">{meetingRequests.length}</p>
            </div>
          </div>
        </Card>
      </div>

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
              <p className="text-gray-600">Buyer Profile</p>
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
              </label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                disabled={!isEditing}
                className={!isEditing ? 'bg-gray-50' : ''}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-1">
                <MapPin className="w-4 h-4" />
                Address
              </label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                disabled={!isEditing}
                className={!isEditing ? 'bg-gray-50' : ''}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1">City</label>
                <Input
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  disabled={!isEditing}
                  className={!isEditing ? 'bg-gray-50' : ''}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1">State</label>
                <Input
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  disabled={!isEditing}
                  className={!isEditing ? 'bg-gray-50' : ''}
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
            placeholder="Tell sellers about yourself and what you're looking for..."
          />
        </div>
      </Card>

      {/* Meeting Requests */}
      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4">My Meeting Requests</h3>

        {meetingRequests.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Heart className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p>No meeting requests yet</p>
            <p className="text-sm mt-2">Start exploring properties to connect with sellers</p>
          </div>
        ) : (
          <div className="space-y-4">
            {meetingRequests.map((meeting) => (
              <Card key={meeting.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-16 h-16 bg-gray-200 rounded relative overflow-hidden">
                      {meeting.listing.thumbnailUrl ? (
                        <Image
                          src={meeting.listing.thumbnailUrl}
                          alt={meeting.listing.title || 'Property'}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <MapPin className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="font-semibold">
                        {meeting.listing.title || 'Property Inquiry'}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {meeting.listing.city}, {meeting.listing.state}
                      </p>
                      {meeting.selectedTime && (
                        <p className="text-xs text-gray-500 mt-1">
                          <Clock className="w-3 h-3 inline mr-1" />
                          {new Date(meeting.selectedTime).toLocaleString()}
                        </p>
                      )}
                      {meeting.location && (
                        <p className="text-xs text-gray-500">
                          <MapPin className="w-3 h-3 inline mr-1" />
                          {meeting.location}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {getStatusBadge(meeting.status)}
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
