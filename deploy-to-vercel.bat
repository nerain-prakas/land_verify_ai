@echo off
echo ========================================
echo  Deploying LandVerify AI to Vercel
echo ========================================
echo.

echo Step 1: Installing Vercel CLI (if not installed)...
call npm install -g vercel
echo.

echo Step 2: Logging into Vercel...
call vercel login
echo.

echo Step 3: Linking project (should already be linked)...
call vercel link --yes
echo.

echo Step 4: Setting up environment variables...
echo.
echo Please set these environment variables in Vercel Dashboard:
echo https://vercel.com/nerain-prakash-i-js-projects-c1c92b7f/map-and-land/settings/environment-variables
echo.
echo Required variables from .env file:
echo - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
echo - CLERK_SECRET_KEY
echo - CLERK_WEBHOOK_SECRET
echo - DATABASE_URL
echo - DIRECT_URL
echo - GOOGLE_GEMINI_API_KEY
echo - NEXT_PUBLIC_SUPABASE_URL
echo - NEXT_PUBLIC_SUPABASE_ANON_KEY
echo - SUPABASE_SERVICE_ROLE_KEY
echo.
echo Press any key after you've added the environment variables...
pause
echo.

echo Step 5: Deploying to production...
call vercel --prod
echo.

echo ========================================
echo  Deployment Complete!
echo ========================================
echo.
echo Your app should now be live at:
echo https://map-and-land.vercel.app
echo.
pause
