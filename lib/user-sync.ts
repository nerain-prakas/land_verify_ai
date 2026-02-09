import { currentUser, clerkClient } from '@clerk/nextjs/server'
import { PrismaClient, UserRole, User, LandListing, MeetingRequest } from '@prisma/client'
import { headers } from 'next/headers'

const prisma = new PrismaClient()

// Enhanced user type with relations
export type UserWithRelations = User & {
  listings?: LandListing[]
  buyerMeetings?: (MeetingRequest & { listing: Partial<LandListing> })[]
  sellerMeetings?: MeetingRequest[]
}

// Health check for Supabase connection
export async function checkDatabaseHealth(): Promise<{ isHealthy: boolean; error?: string }> {
  try {
    await prisma.$queryRaw`SELECT 1`
    return { isHealthy: true }
  } catch (error) {
    console.error('❌ Database health check failed:', error)
    return {
      isHealthy: false,
      error: error instanceof Error ? error.message : 'Database connection failed'
    }
  }
}

/**
 * Core user synchronization function
 * Checks Supabase for existing user, if missing fetches from Clerk and creates new record
 */
export async function getOrCreateUser(clerkId: string): Promise<UserWithRelations | null> {
  try {
    // First check database health
    const healthCheck = await checkDatabaseHealth()
    if (!healthCheck.isHealthy) {
      console.warn('⚠️  Database unhealthy, using fallback mode')
      return null
    }

    // Try to find existing user in Supabase
    let user = await prisma.user.findUnique({
      where: { clerkId },
      include: {
        listings: {
          orderBy: { createdAt: 'desc' },
          take: 10 // Limit for performance
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
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        sellerMeetings: {
          include: {
            listing: {
              select: {
                id: true,
                title: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    })

    if (user) {
      console.log(`✓ Found existing user: ${user.email} (${user.role})`)
      return user
    }

    // User doesn't exist, fetch from Clerk and create
    console.log('🔄 User not found in Supabase, fetching from Clerk...')

    const clerkUser = await currentUser()
    if (!clerkUser) {
      console.error('❌ No Clerk user found for ID:', clerkId)
      return null
    }

    // Extract role from Clerk public metadata
    const role = (clerkUser.publicMetadata.role as UserRole) || UserRole.BUYER
    const fullName = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim()

    // Create new user in Supabase
    const newUserData = {
      clerkId: clerkUser.id,
      email: clerkUser.emailAddresses[0]?.emailAddress || '',
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      fullName: fullName || null,
      imageUrl: clerkUser.imageUrl,
      role: role,
      phone: clerkUser.phoneNumbers[0]?.phoneNumber || null,
      // Initialize additional fields as null
      address: null,
      city: null,
      state: null,
      zipCode: null,
      country: 'India', // Default
      bio: null,
      isVerified: false
    }

    user = await prisma.user.create({
      data: newUserData,
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
        },
        sellerMeetings: {
          include: {
            listing: {
              select: {
                id: true,
                title: true
              }
            }
          }
        }
      }
    })

    console.log(`✅ Created new user in Supabase: ${user.email} (${user.role})`)
    return user

  } catch (error) {
    console.error('❌ User sync error:', error)

    // Return null on database errors to trigger fallback mode
    if (error instanceof Error && error.message.includes('connect')) {
      return null
    }

    throw error
  }
}

/**
 * Update user role in both Clerk metadata and Supabase
 * This is used when users first select their account type
 */
export async function updateUserRole(clerkId: string, newRole: UserRole): Promise<{ success: boolean; error?: string }> {
  try {
    // Check database health first
    const healthCheck = await checkDatabaseHealth()
    if (!healthCheck.isHealthy) {
      return {
        success: false,
        error: 'Database unavailable. Please try again later.'
      }
    }

    // Update role in Clerk metadata
    const client = await clerkClient()
    await client.users.updateUserMetadata(clerkId, {
      publicMetadata: {
        role: newRole
      }
    })

    console.log(`✓ Updated Clerk metadata for ${clerkId}: role = ${newRole}`)

    // Update or create user in Supabase
    const user = await prisma.user.upsert({
      where: { clerkId },
      update: {
        role: newRole,
        updatedAt: new Date()
      },
      create: {
        clerkId,
        role: newRole,
        email: '', // Will be populated by next getOrCreateUser call
        fullName: null,
        firstName: null,
        lastName: null,
        imageUrl: null,
        phone: null
      }
    })

    console.log(`✅ Role updated successfully: ${clerkId} → ${newRole}`)

    return { success: true }

  } catch (error) {
    console.error('❌ Role update error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update role'
    }
  }
}

/**
 * Sync user profile from Clerk to Supabase
 * Updates existing user data with latest Clerk information
 */
export async function syncUserFromClerk(clerkId: string): Promise<{ success: boolean; user?: UserWithRelations; error?: string }> {
  try {
    const healthCheck = await checkDatabaseHealth()
    if (!healthCheck.isHealthy) {
      return { success: false, error: 'Database unavailable' }
    }

    const clerkUser = await currentUser()
    if (!clerkUser || clerkUser.id !== clerkId) {
      return { success: false, error: 'Clerk user not found or ID mismatch' }
    }

    const role = (clerkUser.publicMetadata.role as UserRole) || UserRole.BUYER
    const fullName = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim()

    const updatedUser = await prisma.user.upsert({
      where: { clerkId },
      update: {
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        fullName: fullName || null,
        imageUrl: clerkUser.imageUrl,
        role: role,
        phone: clerkUser.phoneNumbers[0]?.phoneNumber || null,
        updatedAt: new Date()
      },
      create: {
        clerkId: clerkUser.id,
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        fullName: fullName || null,
        imageUrl: clerkUser.imageUrl,
        role: role,
        phone: clerkUser.phoneNumbers[0]?.phoneNumber || null,
        country: 'India'
      },
      include: {
        listings: {
          orderBy: { createdAt: 'desc' },
          take: 10
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
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        sellerMeetings: {
          include: {
            listing: {
              select: {
                id: true,
                title: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    })

    return { success: true, user: updatedUser }

  } catch (error) {
    console.error('❌ User sync error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Sync failed'
    }
  }
}

/**
 * Get user profile with fallback for offline database
 */
export async function getUserProfile(clerkId: string): Promise<{
  user?: UserWithRelations;
  isOffline: boolean;
  error?: string;
}> {
  try {
    const user = await getOrCreateUser(clerkId)

    if (!user) {
      // Database is offline, return Clerk data as fallback
      const clerkUser = await currentUser()
      if (clerkUser && clerkUser.id === clerkId) {
        const role = (clerkUser.publicMetadata.role as UserRole) || UserRole.BUYER
        const fullName = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim()

        // Create mock user object for offline mode
        const fallbackUser: UserWithRelations = {
          id: 'offline-' + clerkId,
          clerkId: clerkUser.id,
          email: clerkUser.emailAddresses[0]?.emailAddress || '',
          firstName: clerkUser.firstName,
          lastName: clerkUser.lastName,
          fullName: fullName || null,
          imageUrl: clerkUser.imageUrl,
          role: role,
          phone: clerkUser.phoneNumbers[0]?.phoneNumber || null,
          address: null,
          city: null,
          state: null,
          zipCode: null,
          country: null,
          bio: null,
          isVerified: false,
          verifiedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          listings: [],
          buyerMeetings: [],
          sellerMeetings: []
        }

        return { user: fallbackUser, isOffline: true }
      }

      return { isOffline: true, error: 'No user data available' }
    }

    return { user, isOffline: false }

  } catch (error) {
    console.error('❌ Get user profile error:', error)
    return {
      isOffline: true,
      error: error instanceof Error ? error.message : 'Failed to get profile'
    }
  }
}

/**
 * Utility to ensure proper header handling for Next.js 15+
 */
export async function getRequestHeaders() {
  try {
    return await headers()
  } catch (error) {
    console.warn('⚠️  Headers not available in this context')
    return new Headers()
  }
}