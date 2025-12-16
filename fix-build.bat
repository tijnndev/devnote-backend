@echo off
echo === DevNote Backend Fix Script ===
echo.

echo Step 1: Stopping any running processes...
echo Please manually stop any running dev servers (Ctrl+C in terminals)
pause

echo.
echo Step 2: Regenerating Prisma Client...
call npx prisma generate
if %errorlevel% neq 0 (
    echo ERROR: Prisma generate failed!
    pause
    exit /b 1
)

echo.
echo Step 3: Creating migration...
call npx prisma migrate dev --name add_defaults_and_unique_constraints
if %errorlevel% neq 0 (
    echo ERROR: Migration failed!
    pause
    exit /b 1
)

echo.
echo Step 4: Building TypeScript...
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Build failed!
    pause
    exit /b 1
)

echo.
echo === SUCCESS! ===
echo.
echo Next steps:
echo 1. Test locally: npm run dev
echo 2. Commit changes: git add . && git commit -m "Fix: Schema defaults and build errors"
echo 3. Push to deploy: git push
echo.
pause
