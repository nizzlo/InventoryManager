@echo off
title Inventory Manager - Auto-Start Everything
color 0A

echo ===============================================
echo    Starting Inventory Manager Application
echo ===============================================
echo.

cd /d "%~dp0.."

echo [1/5] Checking Docker Desktop...
:: Check if Docker Desktop is running
docker info >nul 2>&1
if errorlevel 1 (
    echo Docker Desktop is not running. Starting Docker Desktop...
    echo Please wait, this may take 30-60 seconds...
    
    :: Try multiple common Docker Desktop installation paths
    set "dockerFound=false"
    
    if exist "C:\Program Files\Docker\Docker\Docker Desktop.exe" (
        start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"
        set "dockerFound=true"
    ) else if exist "C:\Users\%USERNAME%\AppData\Local\Docker\Docker Desktop.exe" (
        start "" "C:\Users\%USERNAME%\AppData\Local\Docker\Docker Desktop.exe"
        set "dockerFound=true"
    ) else if exist "%ProgramFiles%\Docker\Docker\Docker Desktop.exe" (
        start "" "%ProgramFiles%\Docker\Docker\Docker Desktop.exe"
        set "dockerFound=true"
    ) else (
        echo Docker Desktop executable not found in common locations.
        echo Please start Docker Desktop manually from your Start menu.
        echo Look for the whale icon in your system tray when ready.
        echo Then run this script again.
        pause
        exit /b 1
    )
    
    if "%dockerFound%"=="true" (
        :: Wait for Docker to start (with timeout and progress)
        set /a timeout=90
        echo Starting Docker Desktop...
        :wait_docker
        timeout /t 3 /nobreak >nul
        docker info >nul 2>&1
        if not errorlevel 1 goto docker_ready
        set /a timeout-=3
        if %timeout% gtr 0 (
            echo Waiting for Docker Desktop to start... (%timeout% seconds remaining)
            goto wait_docker
        )
        
        echo ERROR: Docker Desktop is taking too long to start.
        echo Please wait for the whale icon to appear in your system tray,
        echo then run this script again.
        pause
        exit /b 1
        
        :docker_ready
        echo ✅ Docker Desktop is now running!
    )
) else (
    echo ✅ Docker Desktop is already running!
)

echo [2/5] Starting Docker database...
docker-compose up -d
if errorlevel 1 (
    echo ERROR: Failed to start database. Docker Desktop might need more time.
    echo Please wait 30 seconds and try running this script again.
    pause
    exit /b 1
)

echo [3/5] Installing dependencies (this may take a few minutes on first run)...
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install dependencies!
    pause
    exit /b 1
)

echo [4/5] Setting up database...
call npx prisma generate
call npx prisma migrate deploy
if not exist ".env.local" (
    echo Creating default configuration...
    echo NEXT_PUBLIC_APP_NAME="Inventory Manager" > .env.local
    echo DATABASE_URL="postgresql://postgres:postgres@localhost:5433/inventory" >> .env.local
)

echo [5/5] Starting application...
echo.
echo ===============================================
echo   ✅ Application started at: http://localhost:3000
echo   🌐 Opening browser automatically...
echo.
echo   💡 TO STOP: Simply close this window (click X)
echo   ⚠️  Keep this window open while using the app
echo   🐳 Docker Desktop will keep running after you close this
echo ===============================================
echo.

timeout /t 3 /nobreak > nul
start http://localhost:3000

:: Start the application
call npm start

:: Cleanup when application stops
echo.
echo Cleaning up...
docker-compose down > nul 2>&1
echo.
echo ✅ Application stopped safely.
echo 🐳 Docker Desktop is still running (this is normal)
echo You can now close this window.
pause
