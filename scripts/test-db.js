// Test database connection
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  log: ['error', 'warn'],
})

async function testConnection() {
  console.log('Testing database connection...\n')
  
  try {
    // Try to connect
    await prisma.$connect()
    console.log('✓ Successfully connected to database!')
    
    // Try a simple query
    const userCount = await prisma.user.count()
    console.log(`✓ Database query successful - Found ${userCount} users`)
    
    // Check if tables exist
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `
    console.log(`✓ Found ${tables.length} tables in database`)
    
    console.log('\n✅ Database is working correctly!')
    process.exit(0)
    
  } catch (error) {
    console.error('\n❌ Database connection failed!\n')
    console.error('Error:', error.message)
    
    console.log('\n🔍 Troubleshooting steps:')
    console.log('1. Check if your Supabase database is paused')
    console.log('   → Go to https://supabase.com/dashboard/project/_/settings/database')
    console.log('   → Look for a "Resume" or "Restore" button')
    console.log('')
    console.log('2. Verify your DATABASE_URL in .env.local')
    console.log('   → Should start with: postgresql://postgres:...')
    console.log('   → Port 6543 for pooled connections (pgbouncer)')
    console.log('   → Port 5432 for direct connections')
    console.log('')
    console.log('3. Check your internet connection')
    console.log('   → Make sure you can access supabase.co')
    console.log('')
    console.log('4. Verify database password')
    console.log('   → Password should be URL-encoded in connection string')
    console.log('   → Special characters need encoding (e.g., # becomes %23)')
    
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()
