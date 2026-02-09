import { clerkClient } from '@clerk/nextjs/server'
import { UserRole } from './roles'

/**
 * Set user role in Clerk metadata
 */
export async function setUserRole(userId: string, role: UserRole) {
  const client = await clerkClient()
  
  await client.users.updateUserMetadata(userId, {
    publicMetadata: {
      role,
    },
  })
}

/**
 * Create or update user in database after Clerk signup
 */
export async function syncUserToDatabase(clerkUser: {
  id: string
  emailAddresses: Array<{ emailAddress: string }>
  firstName: string | null
  lastName: string | null
  imageUrl: string
  publicMetadata: Record<string, unknown>
}) {
  // This would integrate with your Prisma client
  // Example implementation:
  /*
  const role = clerkUser.publicMetadata.role as UserRole || 'BUYER'
  
  await prisma.user.upsert({
    where: { clerkId: clerkUser.id },
    update: {
      email: clerkUser.emailAddresses[0].emailAddress,
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      imageUrl: clerkUser.imageUrl,
      role,
    },
    create: {
      clerkId: clerkUser.id,
      email: clerkUser.emailAddresses[0].emailAddress,
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      imageUrl: clerkUser.imageUrl,
      role,
    },
  })
  */
}
