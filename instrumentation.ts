// Next.js Instrumentation - runs at server startup before any routes
// Suppresses Clerk's async headers() warnings in Next.js 15

export async function register() {
  if (process.env.NODE_ENV === 'development') {
    const originalError = console.error
    const originalWarn = console.warn

    console.error = (...args: any[]) => {
      const msg = String(args[0] || '')
      if (
        msg.includes('headers()') &&
        (msg.includes('sync-dynamic-apis') ||
          msg.includes('should be awaited') ||
          msg.includes('iteration'))
      ) {
        return
      }
      originalError.apply(console, args)
    }

    console.warn = (...args: any[]) => {
      const msg = String(args[0] || '')
      if (
        msg.includes('headers()') &&
        (msg.includes('sync-dynamic-apis') ||
          msg.includes('should be awaited') ||
          msg.includes('iteration'))
      ) {
        return
      }
      originalWarn.apply(console, args)
    }
  }
}
