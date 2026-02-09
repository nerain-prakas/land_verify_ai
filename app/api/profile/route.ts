import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getUserProfile, checkDatabaseHealth, syncUserFromClerk } from '@/lib/user-sync'
import { updateUserProfile } from '@/lib/user-management'
import { UserRole } from '@prisma/client'

/**
 * GET /api/profile - Get current user's profile with comprehensive data
 * Includes related data: Listings for Sellers, Meetings for Buyers
 * Provides fallback response when database is offline
 */
export async function GET() {
  try {
    // Ensure proper auth handling for Next.js 15+
    const authResult = await auth()
    const { userId } = authResult

    if (!userId) {
      return NextResponse.json({
        error: 'Unauthorized',
        code: 'AUTH_REQUIRED'
      }, { status: 401 })
    }

    console.log(`🔍 Fetching profile for user: ${userId}`)

    // Get user profile with database health check
    const profileResult = await getUserProfile(userId)

    if (profileResult.error && !profileResult.user) {
      return NextResponse.json({
        error: profileResult.error,
        code: 'PROFILE_FETCH_FAILED',
        isOffline: profileResult.isOffline
      }, { status: 500 })
    }

    // Prepare response with role-specific data
    const responseData: any = {
      user: profileResult.user,
      isOffline: profileResult.isOffline,
      message: profileResult.isOffline
        ? 'Profile retrieved in offline mode from Clerk data'
        : 'Profile retrieved successfully from database'
    }

    // Add role-specific statistics
    if (profileResult.user) {
      if (profileResult.user.role === UserRole.SELLER) {
        responseData.stats = {
          totalListings: profileResult.user.listings?.length || 0,
          liveListings: profileResult.user.listings?.filter(l => l.status === 'LIVE').length || 0,
          pendingListings: profileResult.user.listings?.filter(l => l.status === 'PENDING').length || 0,
          totalMeetings: profileResult.user.sellerMeetings?.length || 0
        }
      } else if (profileResult.user.role === UserRole.BUYER) {
        responseData.stats = {
          totalMeetings: profileResult.user.buyerMeetings?.length || 0,
          pendingMeetings: profileResult.user.buyerMeetings?.filter(m => m.status === 'PENDING').length || 0,
          acceptedMeetings: profileResult.user.buyerMeetings?.filter(m => m.status === 'ACCEPTED').length || 0,
          completedMeetings: profileResult.user.buyerMeetings?.filter(m => m.status === 'COMPLETED').length || 0
        }
      }
    }

    return NextResponse.json(responseData)

  } catch (error) {
    console.error('❌ Profile API error:', error)

    // Check if it's a database connectivity issue
    const healthCheck = await checkDatabaseHealth()

    return NextResponse.json({
      error: 'Failed to retrieve profile',
      code: 'INTERNAL_ERROR',
      isOffline: !healthCheck.isHealthy,
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

/**
 * POST /api/profile/sync - Force sync user profile from Clerk
 */
export async function POST() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({
        error: 'Unauthorized'
      }, { status: 401 })
    }

    console.log(`🔄 Force syncing profile for user: ${userId}`)

    const syncResult = await syncUserFromClerk(userId)

    if (!syncResult.success) {
      return NextResponse.json({
        error: syncResult.error || 'Sync failed',
        code: 'SYNC_FAILED'
      }, { status: 500 })
    }

    return NextResponse.json({
      user: syncResult.user,
      message: 'Profile synced successfully from Clerk'
    })

  } catch (error) {
    console.error('❌ Profile sync API error:', error)
    return NextResponse.json({
      error: 'Failed to sync profile',
      code: 'SYNC_ERROR'
    }, { status: 500 })
  }
}

// PATCH /api/profile - Update current user's profile
export async function PATCH(req: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const {
      firstName,
      lastName,
      phone,
      address,
      city,
      state,
      country,
      imageUrl
    } = body

    // Use updateUserProfile helper for consistent updates
    const updatedUser = await updateUserProfile(userId, {
      firstName,
      lastName,
      phone,
      address,
      city,
      state,
      country,
      imageUrl
    })

    return NextResponse.json({
      user: updatedUser,
      message: 'Profile updated successfully'
    })

  } catch (error) {
    console.error('❌ Profile update error:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}
