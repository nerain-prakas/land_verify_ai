import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { checkDatabaseHealth } from '@/lib/prisma'
import { getOrCreateUser } from '@/lib/user-management'
import SellerProfile from '@/components/dashboard/seller-profile'
import BuyerProfile from '@/components/dashboard/buyer-profile'

// Mark as dynamic since this page uses auth()
export const dynamic = 'force-dynamic'

interface ProfilePageProps {
  searchParams: Promise<{ showCompletion?: string }>
}

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
  // Fix headers() issue - use auth() with try/catch
  let userId: string | null = null

  try {
    const authResult = await auth()
    userId = authResult.userId
  } catch (error) {
    console.error('Auth error:', error)
    redirect('/sign-in')
  }

  if (!userId) {
    redirect('/sign-in')
  }

  // Check database health before attempting queries
  const healthCheck = await checkDatabaseHealth()
  if (!healthCheck.healthy) {
    console.error('⚠️ Database health check failed:', healthCheck.error)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
          <div className="text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Database Connection Error
            </h2>
            <p className="text-gray-600 mb-4">
              Unable to connect to the database. Please try again.
            </p>
            <div className="bg-red-50 border border-red-200 rounded p-4 mb-4">
              <p className="text-sm text-red-800 font-mono text-left">
                {healthCheck.error}
              </p>
            </div>
            <div className="text-left bg-blue-50 border border-blue-200 rounded p-4 mb-4">
              <p className="text-sm font-semibold text-blue-900 mb-2">
                💡 Quick Fixes:
              </p>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Check <a href="https://supabase.com/dashboard" target="_blank" className="underline">Supabase Dashboard</a></li>
                <li>• Verify database is not paused</li>
                <li>• Check your internet connection</li>
                <li>• Wait a moment and refresh</li>
              </ul>
            </div>
            <Link
              href="/api/health"
              target="_blank"
              className="inline-block bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700 mb-2 mr-2"
            >
              Check Health Status
            </Link>
            <Link
              href="/profile"
              className="inline-block bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              Retry
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Get or create user with missing data analysis
  let user
  try {
    user = await getOrCreateUser(userId, {
      includeMissingFields: true,
      enrichProfile: true
    })
  } catch (error) {
    console.error('Database connection error:', error)
    // Return error page if database is unreachable
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8">
          <h1 className="text-2xl font-bold text-red-800 mb-4">Database Connection Error</h1>
          <p className="text-red-600 mb-4">
            Unable to connect to the database. This might be because:
          </p>
          <ul className="text-left text-red-600 mb-6 list-disc list-inside">
            <li>Your Supabase database is paused (free tier auto-pauses after inactivity)</li>
            <li>Network connectivity issues</li>
            <li>Database credentials need to be updated</li>
          </ul>
          <div className="bg-white rounded p-4 mb-4">
            <p className="font-semibold mb-2">To fix this:</p>
            <ol className="text-left list-decimal list-inside text-sm space-y-2">
              <li>Go to your <a href="https://supabase.com/dashboard" className="text-blue-600 underline" target="_blank">Supabase Dashboard</a></li>
              <li>Check if your database is paused and click "Resume" if needed</li>
              <li>Verify your DATABASE_URL in .env.local is correct</li>
              <li>Refresh this page after the database is active</li>
            </ol>
          </div>
          <Link href="/profile" className="inline-block bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700">
            Retry Connection
          </Link>
        </div>
      </div>
    )
  }

  // User is guaranteed to exist (getOrCreateUser creates if needed)
  if (!user) {
    return <div className="p-8 text-center">User not found</div>
  }

  console.log(`🎯 Showing ${user.role} profile for: ${user.email}`)

  // Check if user needs to upload missing data
  const extendedUser = user as any
  const profileAnalysis = extendedUser._profileAnalysis

  // Build missing fields list for inline warning
  const missingFields: string[] = profileAnalysis?.criticalMissing || []
  const allMissingFields: string[] = profileAnalysis?.missingFields || []

  // Render profile with inline warnings (no popup)
  if (user.role === 'SELLER') {
    return (
      <SellerProfile
        user={user as any}
        listings={(user.listings || []).map((listing: any) => ({
          ...listing,
          title: listing.title || 'Untitled Property',
          createdAt: listing.createdAt.toISOString()
        }))}
        missingFields={missingFields}
        allMissingFields={allMissingFields}
        completionPercentage={profileAnalysis?.completionPercentage || 0}
      />
    )
  }

  return (
    <BuyerProfile
      user={user as any}
      meetingRequests={(user.buyerMeetings || []).map((meeting: any) => ({
        ...meeting,
        selectedTime: meeting.selectedTime ? meeting.selectedTime.toISOString() : null,
        createdAt: meeting.createdAt.toISOString(),
        listing: {
          ...meeting.listing,
          title: meeting.listing.title || 'Untitled Property'
        }
      }))}
    />
  )
}
