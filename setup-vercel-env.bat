@echo off
REM This script adds environment variables to Vercel
REM Make sure you're logged in to Vercel CLI first (run: vercel login)

echo ========================================
echo  Adding Environment Variables to Vercel
echo ========================================
echo.

echo Adding NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY...
echo pk_test_YWRqdXN0ZWQtYmx1ZWJpcmQtODEuY2xlcmsuYWNjb3VudHMuZGV2JA | vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production preview development

echo Adding CLERK_SECRET_KEY...
echo sk_test_Gm6KA0LeByxPBRKa0CR6fGTvOfTdE1V9O6kWTMygAA | vercel env add CLERK_SECRET_KEY production preview development

echo Adding CLERK_WEBHOOK_SECRET...
echo whsec_placeholder_update_after_creating_webhook | vercel env add CLERK_WEBHOOK_SECRET production preview development

echo Adding DATABASE_URL...
echo postgresql://postgres.nljnvldvhrkuqbrholkv:Nerain%%247305117609@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres?pgbouncer=true | vercel env add DATABASE_URL production preview development

echo Adding DIRECT_URL...
echo postgresql://postgres.nljnvldvhrkuqbrholkv:Nerain%%247305117609@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres | vercel env add DIRECT_URL production preview development

echo Adding GOOGLE_GEMINI_API_KEY...
echo AIzaSyDS-EDijQX49Gxwsm024ae2k0ljlz7vZM0 | vercel env add GOOGLE_GEMINI_API_KEY production preview development

echo Adding NEXT_PUBLIC_SUPABASE_URL...
echo https://nljnvldvhrkuqbrholkv.supabase.co | vercel env add NEXT_PUBLIC_SUPABASE_URL production preview development

echo Adding NEXT_PUBLIC_SUPABASE_ANON_KEY...
echo eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5sam52bGR2aHJrdXFicmhvbGt2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwOTkzOTYsImV4cCI6MjA4NTY3NTM5Nn0.vy82vK_ExsC5d0GTC5n6xYu2CWZtWsKlF-PXzlpReo4 | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production preview development

echo Adding SUPABASE_SERVICE_ROLE_KEY...
echo your_service_role_key | vercel env add SUPABASE_SERVICE_ROLE_KEY production preview development

echo.
echo ========================================
echo  Environment Variables Added!
echo ========================================
echo.
echo WARNING: Make sure to update SUPABASE_SERVICE_ROLE_KEY
echo Get it from: https://supabase.com/dashboard/project/nljnvldvhrkuqbrholkv/settings/api
echo.
pause
