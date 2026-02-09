'use client'

import { useState, useTransition } from 'react'
import { UserRole } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { selectUserRole } from '@/lib/actions/user-actions'
import { Building2, Search, ArrowRight, CheckCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

const roleOptions = [
  {
    role: UserRole.BUYER,
    title: 'Land Buyer',
    description: 'I want to find and purchase land properties',
    icon: Search,
    features: [
      'Browse verified land listings',
      'Schedule property visits',
      'Access detailed land analysis',
      'Connect with verified sellers',
      'Get AI-powered recommendations'
    ],
    color: 'blue'
  },
  {
    role: UserRole.SELLER,
    title: 'Land Seller',
    description: 'I want to list and sell my land properties',
    icon: Building2,
    features: [
      'List properties with AI verification',
      'Manage inquiries and meetings',
      'Access seller dashboard',
      'Get market insights',
      'Verify land documents'
    ],
    color: 'green'
  }
] as const

export default function RoleSelectionPage() {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role)
    setError(null)
  }

  const handleConfirmSelection = () => {
    if (!selectedRole) return

    startTransition(async () => {
      try {
        const result = await selectUserRole(selectedRole)
        
        if (result.success) {
          // Redirect to appropriate page based on role
          if (result.redirectTo) {
            router.push(result.redirectTo)
          } else {
            router.push(selectedRole === UserRole.SELLER ? '/dashboard' : '/explore')
          }
        } else {
          setError(result.error || 'Failed to set role')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred')
      }
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Welcome to LandVerify AI
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose your account type to get started with our AI-powered land verification platform
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {roleOptions.map((option) => {
            const Icon = option.icon
            const isSelected = selectedRole === option.role
            const colorClasses = {
              blue: isSelected 
                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' 
                : 'border-gray-200 hover:border-blue-300 hover:bg-blue-25',
              green: isSelected 
                ? 'border-green-500 bg-green-50 ring-2 ring-green-200' 
                : 'border-gray-200 hover:border-green-300 hover:bg-green-25'
            }

            return (
              <Card
                key={option.role}
                className={`p-6 cursor-pointer transition-all duration-200 ${
                  colorClasses[option.color]
                }`}
                onClick={() => handleRoleSelect(option.role)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className={`p-3 rounded-lg ${
                      option.color === 'blue' 
                        ? isSelected ? 'bg-blue-100' : 'bg-blue-50' 
                        : isSelected ? 'bg-green-100' : 'bg-green-50'
                    }`}>
                      <Icon className={`w-6 h-6 ${
                        option.color === 'blue' 
                          ? isSelected ? 'text-blue-600' : 'text-blue-500'
                          : isSelected ? 'text-green-600' : 'text-green-500'
                      }`} />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {option.title}
                      </h3>
                      <p className="text-gray-600 text-sm mt-1">
                        {option.description}
                      </p>
                    </div>
                  </div>
                  
                  {isSelected && (
                    <CheckCircle className={`w-6 h-6 ${
                      option.color === 'blue' ? 'text-blue-600' : 'text-green-600'
                    }`} />
                  )}
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900 text-sm">Features included:</h4>
                  <ul className="space-y-1">
                    {option.features.map((feature, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-center">
                        <CheckCircle className={`w-3 h-3 mr-2 ${
                          option.color === 'blue' ? 'text-blue-500' : 'text-green-500'
                        }`} />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            )
          })}
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Confirm Button */}
        <div className="text-center">
          <Button
            onClick={handleConfirmSelection}
            disabled={!selectedRole || isPending}
            size="lg"
            className={`px-8 py-3 text-lg ${
              selectedRole === UserRole.BUYER
                ? 'bg-blue-600 hover:bg-blue-700'
                : selectedRole === UserRole.SELLER
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-gray-400'
            }`}
          >
            {isPending ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Setting up your account...
              </>
            ) : selectedRole ? (
              <>
                Continue as {roleOptions.find(r => r.role === selectedRole)?.title}
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            ) : (
              'Select a role to continue'
            )}
          </Button>

          {selectedRole && !isPending && (
            <p className="text-sm text-gray-500 mt-3">
              You can change your role later in your profile settings
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
