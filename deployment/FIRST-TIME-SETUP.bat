@echo off
title Inventory Manager - First Time Setup
color 0A

echo.
echo ===============================================
echo    INVENTORY MANAGER - FIRST TIME SETUP
echo ===============================================
echo.
echo This will set up your Inventory Manager application
echo Please ensure you have installed:
echo   - Node.js (from nodejs.org)
echo   - Docker Desktop (from docker.com)
echo.
pause

echo.
echo [STEP 1] Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js not found! Please install it from https://nodejs.org/
    echo    Choose the LTS version and restart your computer after installation.
    pause
    exit /b 1
) else (
    echo ✅ Node.js found
)

echo.
echo [STEP 2] Checking Docker installation...
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker not found! Please install Docker Desktop from https://docker.com/
    echo    Make sure Docker Desktop is running (whale icon in system tray).
    pause
    exit /b 1
) else (
    echo ✅ Docker found
)

echo.
echo [STEP 3] Installing application dependencies...
call npm install
if errorlevel 1 (
    echo ❌ Failed to install dependencies!
    pause
    exit /b 1
) else (
    echo ✅ Dependencies installed
)

echo.
echo [STEP 4] Building application...
call npm run build
if errorlevel 1 (
    echo ❌ Failed to build application!
    pause
    exit /b 1
) else (
    echo ✅ Application built successfully
)

echo.
echo [STEP 5] Setting up database...
call npx prisma generate
call docker-compose up -d
timeout /t 5 /nobreak > nul
call npx prisma migrate deploy
call npx prisma db seed

echo.
echo ===============================================
echo    ✅ SETUP COMPLETE!
echo ===============================================
echo.
echo Your Inventory Manager is now ready to use!
echo.
echo To start the application:
echo   → Double-click "START-INVENTORY-MANAGER.bat"
echo.
echo To stop the application:
echo   → Double-click "STOP-INVENTORY-MANAGER.bat"
echo.
echo The application will open at: http://localhost:3000
echo.
pause
