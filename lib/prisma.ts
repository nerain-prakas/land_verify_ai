import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Enhanced Prisma client with connection retry logic
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    errorFormat: 'pretty',
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Database health check helper
export async function checkDatabaseHealth(): Promise<{ healthy: boolean; error?: string }> {
  try {
    await prisma.$queryRaw`SELECT 1`
    return { healthy: true }
  } catch (error: any) {
    console.error('❌ Database health check failed:', error.message)
    return { 
      healthy: false, 
      error: error.message || 'Unknown database error'
    }
  }
}

// Connection test on startup (only in development)
if (process.env.NODE_ENV === 'development') {
  prisma.$connect()
    .then(() => {
      console.log('✅ Database connected successfully')
    })
    .catch((error) => {
      console.error('❌ Database connection failed on startup:')
      console.error('   Error:', error.message)
      console.error('   Host:', process.env.DATABASE_URL?.match(/@([^:]+)/)?.[1] || 'unknown')
      console.error('   Port:', process.env.DATABASE_URL?.match(/:([0-9]+)\//)? process.env.DATABASE_URL?.match(/:([0-9]+)\//)?.[1] : 'unknown')
      console.error('\n💡 Troubleshooting:')
      console.error('   1. Check if Supabase database is paused')
      console.error('   2. Verify DATABASE_URL in .env.local')
      console.error('   3. Run: node scripts/test-db.js')
    })
}

export default prisma
