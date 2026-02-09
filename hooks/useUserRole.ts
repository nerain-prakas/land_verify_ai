'use client'

import { useUser } from '@clerk/nextjs'
import { UserRole } from '@/lib/roles'

export function useUserRole() {
  const { user, isLoaded } = useUser()
  
  const role = (user?.publicMetadata?.role as UserRole) || null
  
  return {
    role,
    isSeller: role === 'SELLER',
    isBuyer: role === 'BUYER',
    isLoaded,
    user,
  }
}
