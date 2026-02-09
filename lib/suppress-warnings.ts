import { NextRequest } from 'next/server'

// Suppress Clerk headers() warnings in development
const originalConsoleError = console.error
console.error = (...args: any[]) => {
  const message = args[0]
  
  // Filter out Clerk async headers warnings
  if (
    typeof message === 'string' &&
    (message.includes('headers()` should be awaited') ||
     message.includes('sync-dynamic-apis'))
  ) {
    // Silently ignore these warnings
    return
  }
  
  // Log all other errors normally
  originalConsoleError.apply(console, args)
}

export {}