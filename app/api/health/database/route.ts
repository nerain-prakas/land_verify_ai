import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * GET /api/health/database - Check Supabase database connectivity
 * Returns health status for client-side monitoring
 */
export async function GET() {
  try {
    // Simple database ping
    await prisma.$queryRaw`SELECT 1`
    
    return NextResponse.json({
      isHealthy: true,
      timestamp: new Date().toISOString(),
      service: 'supabase-postgresql'
    }, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    })

  } catch (error) {
    return NextResponse.json({
      isHealthy: false,
      error: error instanceof Error ? error.message : 'Health check failed',
      timestamp: new Date().toISOString(),
      service: 'supabase-postgresql'
    }, { 
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    })
  }
}