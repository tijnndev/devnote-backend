@echo off
echo ========================================
echo Converting all createdAt to DateTime
echo ========================================
echo.
echo Step 1: Generating Prisma Client...
npx prisma generate
if %errorlevel% neq 0 (
    echo ERROR: Failed to generate Prisma client
    echo Make sure all dev servers are stopped!
    pause
    exit /b 1
)
echo.
echo Step 2: Creating migration...
npx prisma migrate dev --name convert_createdAt_to_datetime
if %errorlevel% neq 0 (
    echo ERROR: Failed to create migration
    pause
    exit /b 1
)
echo.
echo Step 3: Rebuilding backend...
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Failed to build
    pause
    exit /b 1
)
echo.
echo ========================================
echo SUCCESS! All timestamps are now DateTime
echo ========================================
echo.
echo Next steps:
echo 1. Test locally with: npm run dev
echo 2. Deploy to production
echo 3. Run migration on production: npx prisma migrate deploy
echo.
pause
