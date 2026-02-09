import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export type UserRole = 'BUYER' | 'SELLER'

/**
 * Get the user's role from Clerk metadata
 */
export async function getUserRole(): Promise<UserRole | null> {
  const user = await currentUser()
  
  if (!user) {
    return null
  }
  
  const role = user.publicMetadata.role as UserRole
  return role || null
}

/**
 * Check if current user is a seller
 */
export async function isSeller(): Promise<boolean> {
  const role = await getUserRole()
  return role === 'SELLER'
}

/**
 * Check if current user is a buyer
 */
export async function isBuyer(): Promise<boolean> {
  const role = await getUserRole()
  return role === 'BUYER'
}

/**
 * Require user to be authenticated
 * Redirects to sign-in if not authenticated
 */
export async function requireAuth() {
  const { userId } = await auth()
  
  if (!userId) {
    redirect('/sign-in-buyer')
  }
  
  return userId
}

/**
 * Require user to be a seller
 * Redirects to appropriate page if not
 */
export async function requireSeller() {
  const userId = await requireAuth()
  const role = await getUserRole()
  
  if (role !== 'SELLER') {
    redirect('/explore')
  }
  
  return userId
}

/**
 * Require user to be a buyer
 * Redirects to appropriate page if not
 */
export async function requireBuyer() {
  const userId = await requireAuth()
  const role = await getUserRole()
  
  if (role !== 'BUYER') {
    redirect('/dashboard')
  }
  
  return userId
}

/**
 * Get user info with role
 */
export async function getUserWithRole() {
  const user = await currentUser()
  
  if (!user) {
    return null
  }
  
  return {
    id: user.id,
    email: user.emailAddresses[0]?.emailAddress,
    firstName: user.firstName,
    lastName: user.lastName,
    imageUrl: user.imageUrl,
    role: (user.publicMetadata.role as UserRole) || null,
  }
}
