'use server'

import { auth, currentUser } from '@clerk/nextjs/server'
import { UserRole } from '@prisma/client'
import { updateUserRole, syncUserFromClerk } from '@/lib/user-sync'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

/**
 * Server action to handle role selection for new users
 * Updates both Clerk metadata and Supabase record
 */
export async function selectUserRole(role: UserRole): Promise<{
  success: boolean;
  error?: string;
  redirectTo?: string;
}> {
  try {
    // Ensure user is authenticated
    const { userId } = await auth()
    if (!userId) {
      return { success: false, error: 'Authentication required' }
    }

    // Validate role
    if (!Object.values(UserRole).includes(role)) {
      return { success: false, error: 'Invalid role selected' }
    }

    console.log(`🔄 Processing role selection: ${userId} → ${role}`)

    // Update role in both Clerk and Supabase
    const updateResult = await updateUserRole(userId, role)
    
    if (!updateResult.success) {
      return { success: false, error: updateResult.error }
    }

    // Sync full profile from Clerk to ensure consistency
    const syncResult = await syncUserFromClerk(userId)
    
    if (!syncResult.success) {
      console.warn('⚠️  Profile sync failed but role was updated:', syncResult.error)
    }

    // Revalidate relevant paths
    revalidatePath('/dashboard')
    revalidatePath('/profile')
    revalidatePath('/explore')

    console.log(`✅ Role selection completed: ${userId} → ${role}`)

    // Determine redirect destination based on role
    const redirectTo = role === UserRole.SELLER ? '/dashboard' : '/explore'

    return { 
      success: true, 
      redirectTo 
    }

  } catch (error) {
    console.error('❌ Role selection error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update role' 
    }
  }
}

/**
 * Server action to sync user profile from Clerk
 * Useful for manual data refresh or after Clerk profile updates
 */
export async function refreshUserProfile(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { userId } = await auth()
    if (!userId) {
      return { success: false, error: 'Authentication required' }
    }

    const syncResult = await syncUserFromClerk(userId)
    
    if (!syncResult.success) {
      return { success: false, error: syncResult.error }
    }

    // Revalidate profile-related paths
    revalidatePath('/profile')
    revalidatePath('/dashboard')

    return { success: true }

  } catch (error) {
    console.error('❌ Profile refresh error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to refresh profile' 
    }
  }
}

/**
 * Server action to handle initial user setup after sign-up
 * Creates user record and sets initial role
 */
export async function initializeUser(role: UserRole): Promise<{
  success: boolean;
  error?: string;
  user?: any;
}> {
  try {
    const { userId } = await auth()
    if (!userId) {
      return { success: false, error: 'Authentication required' }
    }

    // First, set the role
    const roleResult = await updateUserRole(userId, role)
    if (!roleResult.success) {
      return { success: false, error: roleResult.error }
    }

    // Then sync the full profile
    const syncResult = await syncUserFromClerk(userId)
    if (!syncResult.success) {
      return { success: false, error: syncResult.error }
    }

    console.log(`✅ User initialized: ${userId} as ${role}`)

    return { 
      success: true, 
      user: syncResult.user 
    }

  } catch (error) {
    console.error('❌ User initialization error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to initialize user' 
    }
  }
}

/**
 * Server action to check if user has completed role selection
 */
export async function checkRoleSelection(): Promise<{
  hasRole: boolean;
  role?: UserRole;
  needsSelection: boolean;
}> {
  try {
    const user = await currentUser()
    
    if (!user) {
      return { hasRole: false, needsSelection: true }
    }

    const role = user.publicMetadata.role as UserRole
    
    return {
      hasRole: !!role,
      role: role,
      needsSelection: !role
    }

  } catch (error) {
    console.error('❌ Role check error:', error)
    return { hasRole: false, needsSelection: true }
  }
}