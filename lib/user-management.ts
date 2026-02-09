import { currentUser } from '@clerk/nextjs/server'
import { prisma } from './prisma'
import { UserRole } from './roles'

/**
 * Get or create user from Clerk authentication data
 * This handles the first-time login flow and subsequent data retrieval
 * Also detects and flags missing profile data that needs to be uploaded
 */
export async function getOrCreateUser(clerkUserId: string, options?: {
  includeMissingFields?: boolean
  enrichProfile?: boolean
}) {
  try {
    // First, try to find existing user in database
    let user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      include: {
        listings: {
          orderBy: { createdAt: 'desc' }
        },
        buyerMeetings: {
          include: {
            listing: {
              select: {
                id: true,
                title: true,
                address: true,
                city: true,
                state: true,
                videoUrl: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    // If user exists, check for missing data and return enhanced info
    if (user) {
      console.log(`✓ Retrieved existing user: ${user.email} (${user.role})`)
      
      if (options?.includeMissingFields) {
        const profileAnalysis = analyzeProfileCompleteness(user)
        return {
          ...user,
          _profileAnalysis: profileAnalysis
        }
      }
      
      return user
    }

    // User doesn't exist - create new user from Clerk data
    console.log('🆕 Creating new user from Clerk data...')
    
    const clerkUser = await currentUser()
    if (!clerkUser) {
      throw new Error('Clerk user not found')
    }

    // Extract role from Clerk metadata (set during role selection)
    const role = (clerkUser.publicMetadata?.role as UserRole) || 'BUYER'
    
    // Extract user details from Clerk
    const email = clerkUser.emailAddresses?.[0]?.emailAddress || ''
    const firstName = clerkUser.firstName || ''
    const lastName = clerkUser.lastName || ''
    const fullName = `${firstName} ${lastName}`.trim() || email.split('@')[0]
    
    // Extract phone number if available
    const phone = clerkUser.phoneNumbers?.[0]?.phoneNumber || null

    // Create new user record
    user = await prisma.user.create({
      data: {
        clerkId: clerkUserId,
        email: email,
        firstName: firstName,
        lastName: lastName,
        phone: phone,
        imageUrl: clerkUser.imageUrl || null,
        role: role,
        // Initialize optional fields as null - user can update later
        address: null,
        city: null,
        state: null,
        country: 'India', // Default country
        isVerified: clerkUser.emailAddresses?.[0]?.verification?.status === 'verified' || false,
      },
      include: {
        listings: true,
        buyerMeetings: {
          include: {
            listing: {
              select: {
                id: true,
                title: true,
                address: true,
                city: true,
                state: true,
                videoUrl: true
              }
            }
          }
        }
      }
    })

    console.log(`✅ Created new ${role} user: ${email}`)
    
    // Analyze profile completeness for new user
    if (options?.includeMissingFields) {
      const profileAnalysis = analyzeProfileCompleteness(user)
      return {
        ...user,
        _profileAnalysis: profileAnalysis,
        _isNewUser: true
      }
    }
    
    return user

  } catch (error) {
    console.error('❌ Error in getOrCreateUser:', error)
    throw error
  }
}

/**
 * Update user profile with new data
 */
export async function updateUserProfile(
  clerkUserId: string, 
  updateData: {
    firstName?: string
    lastName?: string
    phone?: string
    address?: string
    city?: string
    state?: string
    country?: string
    imageUrl?: string
  }
) {
  try {
    // Calculate full name if firstName or lastName changed
    let fullName: string | undefined
    if (updateData.firstName !== undefined || updateData.lastName !== undefined) {
      const user = await prisma.user.findUnique({
        where: { clerkId: clerkUserId },
        select: { firstName: true, lastName: true }
      })
      
      const newFirstName = updateData.firstName ?? user?.firstName ?? ''
      const newLastName = updateData.lastName ?? user?.lastName ?? ''
      fullName = `${newFirstName} ${newLastName}`.trim()
    }

    const updatedUser = await prisma.user.update({
      where: { clerkId: clerkUserId },
      data: {
        ...updateData,
        ...(fullName && { fullName }),
        updatedAt: new Date()
      },
      include: {
        listings: {
          orderBy: { createdAt: 'desc' }
        },
        buyerMeetings: {
          include: {
            listing: {
              select: {
                id: true,
                title: true,
                address: true,
                city: true,
                state: true,
                videoUrl: true
              }
            }
          }
        }
      }
    })

    console.log(`✓ Updated user profile: ${updatedUser.email}`)
    return updatedUser

  } catch (error) {
    console.error('❌ Error updating user profile:', error)
    throw error
  }
}

/**
 * Get user statistics for dashboard display
 */
export async function getUserStats(clerkUserId: string, role: UserRole) {
  try {
    if (role === 'SELLER') {
      const stats = await prisma.user.findUnique({
        where: { clerkId: clerkUserId },
        select: {
          listings: {
            select: {
              id: true,
              status: true,
              askingPrice: true,
              viewCount: true,
              inquiryCount: true
            }
          },
          _count: {
            select: {
              listings: true
            }
          }
        }
      })

      if (!stats) return null

      const totalListings = stats.listings.length
      const liveListings = stats.listings.filter(l => l.status === 'LIVE').length
      const pendingListings = stats.listings.filter(l => l.status === 'PENDING').length
      const soldListings = stats.listings.filter(l => l.status === 'SOLD').length
      
      const totalViews = stats.listings.reduce((sum, l) => sum + (l.viewCount || 0), 0)
      const totalInquiries = stats.listings.reduce((sum, l) => sum + (l.inquiryCount || 0), 0)
      
      const totalRevenue = stats.listings
        .filter(l => l.status === 'SOLD')
        .reduce((sum, l) => sum + (l.askingPrice || 0), 0)

      return {
        totalListings,
        liveListings,
        pendingListings,
        soldListings,
        totalViews,
        totalInquiries,
        totalRevenue
      }

    } else {
      // Buyer stats
      const stats = await prisma.user.findUnique({
        where: { clerkId: clerkUserId },
        select: {
          buyerMeetings: {
            select: {
              id: true,
              status: true
            }
          },
          // Note: We'd need to add saved listings relationship for this
          _count: {
            select: {
              buyerMeetings: true
            }
          }
        }
      })

      if (!stats) return null

      const totalMeetings = stats.buyerMeetings.length
      const pendingMeetings = stats.buyerMeetings.filter(m => m.status === 'PENDING').length
      const acceptedMeetings = stats.buyerMeetings.filter(m => m.status === 'ACCEPTED').length
      const completedMeetings = stats.buyerMeetings.filter(m => m.status === 'COMPLETED').length

      return {
        totalMeetings,
        pendingMeetings,
        acceptedMeetings,
        completedMeetings
      }
    }

  } catch (error) {
    console.error('❌ Error getting user stats:', error)
    return null
  }
}

/**
 * Analyze profile completeness and identify missing data
 */
export function analyzeProfileCompleteness(user: any) {
  const requiredFields = {
    essential: ['firstName', 'lastName', 'email'],
    contact: ['phone'],
    location: ['address', 'city', 'state'],
    profile: ['imageUrl'],
    seller: ['companyName', 'businessType'],
    buyer: ['budgetRange', 'preferredLocation']
  }
  
  const analysis = {
    completionPercentage: 0,
    missingFields: [] as string[],
    missingCategories: [] as string[],
    totalFields: 0,
    completedFields: 0,
    criticalMissing: [] as string[], // Fields that block functionality
    recommendedUploads: [] as string[], // Files/data that should be uploaded
    nextSteps: [] as string[]
  }
  
  // Essential fields (always required)
  let totalFieldCount = requiredFields.essential.length + requiredFields.contact.length + requiredFields.profile.length
  let completedFieldCount = 0
  
  // Check essential fields
  for (const field of requiredFields.essential) {
    if (user[field]) {
      completedFieldCount++
    } else {
      analysis.missingFields.push(field)
      analysis.criticalMissing.push(field)
    }
  }
  
  // Check contact info
  for (const field of requiredFields.contact) {
    if (user[field]) {
      completedFieldCount++
    } else {
      analysis.missingFields.push(field)
      if (field === 'phone') analysis.criticalMissing.push(field)
    }
  }
  
  // Check profile picture
  if (user.imageUrl) {
    completedFieldCount++
  } else {
    analysis.missingFields.push('imageUrl')
    analysis.recommendedUploads.push('profile_picture')
  }
  
  // Role-specific fields
  if (user.role === 'SELLER') {
    totalFieldCount += requiredFields.location.length + requiredFields.seller.length
    
    // Location is critical for sellers
    for (const field of requiredFields.location) {
      if (user[field]) {
        completedFieldCount++
      } else {
        analysis.missingFields.push(field)
        analysis.criticalMissing.push(field)
      }
    }
    
    // Business info
    for (const field of requiredFields.seller) {
      if (user[field]) {
        completedFieldCount++
      } else {
        analysis.missingFields.push(field)
      }
    }
    
    // Seller-specific uploads (only verification documents, no business license required)
    if (!user.businessVerificationDoc) {
      analysis.recommendedUploads.push('verification_documents')
    }
    
  } else if (user.role === 'BUYER') {
    totalFieldCount += requiredFields.buyer.length
    
    // Buyer preferences
    for (const field of requiredFields.buyer) {
      if (user[field]) {
        completedFieldCount++
      } else {
        analysis.missingFields.push(field)
      }
    }
  }
  
  // Calculate completion
  analysis.totalFields = totalFieldCount
  analysis.completedFields = completedFieldCount
  analysis.completionPercentage = Math.round((completedFieldCount / totalFieldCount) * 100)
  
  // Identify missing categories
  if (analysis.missingFields.some(f => requiredFields.essential.includes(f))) {
    analysis.missingCategories.push('essential_info')
  }
  if (analysis.missingFields.some(f => requiredFields.contact.includes(f))) {
    analysis.missingCategories.push('contact_info')
  }
  if (analysis.missingFields.some(f => requiredFields.location.includes(f))) {
    analysis.missingCategories.push('location_info')
  }
  if (analysis.missingFields.includes('imageUrl')) {
    analysis.missingCategories.push('profile_picture')
  }
  
  // Generate next steps
  analysis.nextSteps = generateNextSteps(user, analysis)
  
  return analysis
}

/**
 * Generate actionable next steps for profile completion
 */
function generateNextSteps(user: any, analysis: any): string[] {
  const steps: string[] = []
  
  // Critical missing fields first
  if (analysis.criticalMissing.includes('firstName') || analysis.criticalMissing.includes('lastName')) {
    steps.push('Complete your name information')
  }
  
  if (analysis.criticalMissing.includes('phone')) {
    steps.push('Add and verify your phone number')
  }
  
  if (user.role === 'SELLER' && analysis.criticalMissing.some((f: string) => ['address', 'city', 'state'].includes(f))) {
    steps.push('Complete your business address')
  }
  
  // Upload recommendations
  if (analysis.recommendedUploads.includes('profile_picture')) {
    steps.push('Upload a professional profile picture')
  }
  
  if (user.role === 'SELLER') {
    if (analysis.missingFields.includes('companyName')) {
      steps.push('Add your company/business name')
    }
    if (!user.listings || user.listings.length === 0) {
      steps.push('Create your first property listing')
    }
  }
  
  if (user.role === 'BUYER') {
    if (analysis.missingFields.includes('budgetRange')) {
      steps.push('Set your budget preferences')
    }
    if (analysis.missingFields.includes('preferredLocation')) {
      steps.push('Specify preferred locations')
    }
  }
  
  // Generic steps
  if (analysis.completionPercentage < 50) {
    steps.push('Complete profile setup to unlock all features')
  }
  
  return steps
}

/**
 * Check if user needs to upload missing data
 */
export function needsDataUpload(user: any): {
  needsUpload: boolean
  missingData: string[]
  uploadTypes: string[]
  priority: 'critical' | 'high' | 'medium' | 'low'
} {
  const analysis = analyzeProfileCompleteness(user)
  
  const result = {
    needsUpload: analysis.completionPercentage < 100,
    missingData: analysis.missingFields,
    uploadTypes: analysis.recommendedUploads,
    priority: 'low' as 'critical' | 'high' | 'medium' | 'low'
  }
  
  // Determine priority
  if (analysis.criticalMissing.length > 0) {
    result.priority = 'critical'
  } else if (analysis.completionPercentage < 50) {
    result.priority = 'high'
  } else if (analysis.completionPercentage < 80) {
    result.priority = 'medium'
  }
  
  return result
}