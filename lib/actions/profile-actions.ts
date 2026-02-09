'use server'

import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'

/**
 * Server action to update user profile data
 */
export async function updateProfileAction(updateData: any) {
  try {
    const { userId } = await auth()
    if (!userId) {
      throw new Error('Not authenticated')
    }

    // Update the user profile directly in the database
    await prisma.user.update({
      where: { clerkId: userId },
      data: updateData
    })

    console.log('✅ Profile updated successfully:', updateData)
    
    // Revalidate the profile page to show updated data
    revalidatePath('/profile')
    
    return { success: true }
    
  } catch (error) {
    console.error('❌ Profile update failed:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}