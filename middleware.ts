import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in-buyer(.*)',
  '/sign-in-seller(.*)',
  '/sign-up-buyer(.*)',
  '/sign-up-seller(.*)',
  '/api/webhooks(.*)',
  '/api/listings(.*)',  // Public listings API for explore page
  '/api/health(.*)',     // Health check endpoint
  '/explore(.*)',
  '/test(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  // Allow public routes to pass through
  if (isPublicRoute(req)) {
    return NextResponse.next()
  }

  // Protect all other routes
  // Use auth().protect() to automatically handle redirection to sign-in 
  // and preserve the original URL as redirect_url/callbackUrl
  const { userId } = await auth()
  
  if (!userId) {
    // Redirect to sign-in if no user
    const signInUrl = new URL('/sign-in-buyer', req.url)
    signInUrl.searchParams.set('redirect_url', req.url)
    return NextResponse.redirect(signInUrl)
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
