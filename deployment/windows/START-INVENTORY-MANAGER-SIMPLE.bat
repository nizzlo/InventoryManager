@echo off
title Inventory Manager - Click X to Stop
color 0A

:: Set up cleanup on exit
set "cleanup_script=%temp%\inventory_cleanup.bat"
echo @echo off > "%cleanup_script%"
echo cd /d "%~dp0..\.." >> "%cleanup_script%"
echo docker-compose down ^>nul 2^>^&1 >> "%cleanup_script%"
echo del "%~f0" 2^>nul >> "%cleanup_script%"

:: Register cleanup script to run on exit
reg add "HKCU\Software\Microsoft\Command Processor" /v AutoRun /d "if exist \"%cleanup_script%\" call \"%cleanup_script%\"" /f >nul 2>&1

echo ===============================================
echo    Starting Inventory Manager Application
echo ===============================================
echo.

cd /d "%~dp0..\.."

echo [1/5] Checking Docker Desktop...
:: Check if Docker Desktop is running
docker info >nul 2>&1
if errorlevel 1 (
    echo Docker Desktop is not running. Starting Docker Desktop...
    echo Please wait, this may take 30-60 seconds...
    
    :: Try to start Docker Desktop
    start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    
    :: Wait for Docker to start (with timeout)
    set /a timeout=60
    :wait_docker
    timeout /t 2 /nobreak >nul
    docker info >nul 2>&1
    if not errorlevel 1 goto docker_ready
    set /a timeout-=2
    if %timeout% gtr 0 (
        echo Waiting for Docker Desktop to start... (%timeout% seconds remaining)
        goto wait_docker
    )
    
    echo ERROR: Docker Desktop failed to start automatically.
    echo Please start Docker Desktop manually and try again.
    echo You should see the whale icon in your system tray when ready.
    pause
    exit /b 1
    
    :docker_ready
    echo ✅ Docker Desktop is now running!
) else (
    echo ✅ Docker Desktop is already running!
)

echo [2/5] Starting Docker database...
docker-compose up -d
if errorlevel 1 (
    echo ERROR: Failed to start database. Docker Desktop might need more time to start.
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
echo ===============================================
echo.

timeout /t 3 /nobreak > nul
start http://localhost:3000

:: Start the application and cleanup on exit
call npm start

:: Cleanup when application stops
echo.
echo Cleaning up...
docker-compose down > nul 2>&1
reg delete "HKCU\Software\Microsoft\Command Processor" /v AutoRun /f >nul 2>&1
if exist "%cleanup_script%" del "%cleanup_script%" 2>nul
echo.
echo ✅ Application stopped safely.
echo You can now close this window.
pause
