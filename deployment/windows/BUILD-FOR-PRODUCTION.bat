@echo off
echo ===============================================
echo    Building Inventory Manager for Production
echo ===============================================
echo.

cd /d "%~dp0..\.."

echo [1/3] Installing dependencies...
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install dependencies!
    pause
    exit /b 1
)

echo [2/3] Generating Prisma client...
call npx prisma generate
if errorlevel 1 (
    echo ERROR: Failed to generate Prisma client!
    pause
    exit /b 1
)

echo [3/3] Building application for production...
call npm run build
if errorlevel 1 (
    echo ERROR: Failed to build application!
    pause
    exit /b 1
)

echo.
echo ===============================================
echo   Production build completed successfully!
echo   You can now use START-INVENTORY-MANAGER.bat
echo ===============================================
echo.

pause
