'use client'

import Link from 'next/link'
import { useUserRole } from '@/hooks/useUserRole'
import { UserButton } from '@clerk/nextjs'
import { Home, Map, LayoutDashboard, LogIn, User } from 'lucide-react'

export function Navigation() {
  const { role, isSeller, isBuyer, isLoaded, user } = useUserRole()

  return (
    <nav className="border-b bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-emerald-600">
                LandVerify AI
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-6">
            <Link
              href="/"
              className="flex items-center space-x-1 text-gray-700 hover:text-emerald-600"
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>

            {isLoaded && user && (
              <>
                {isSeller && (
                  <Link
                    href="/dashboard"
                    className="flex items-center space-x-1 text-gray-700 hover:text-emerald-600"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                )}

                {isBuyer && (
                  <Link
                    href="/explore"
                    className="flex items-center space-x-1 text-gray-700 hover:text-emerald-600"
                  >
                    <Map className="h-4 w-4" />
                    <span>Explore</span>
                  </Link>
                )}

                <Link
                  href="/profile"
                  className="flex items-center space-x-1 text-gray-700 hover:text-emerald-600"
                >
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </>
            )}

            {/* User Button / Auth */}
            {isLoaded && (
              <>
                {user ? (
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-600">
                      {isSeller ? '🏢 Seller' : '🛒 Buyer'}
                    </span>
                    <UserButton afterSignOutUrl="/" />
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <Link
                      href="/role-selection"
                      className="flex items-center space-x-1 text-gray-700 hover:text-emerald-600"
                    >
                      <LogIn className="h-4 w-4" />
                      <span>Login</span>
                    </Link>
                    <Link
                      href="/role-selection"
                      className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                    >
                      Get Started
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
