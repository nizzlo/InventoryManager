@echo off
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
echo   Application starting at: http://localhost:3000
echo   Opening browser automatically...
echo ===============================================
echo.

timeout /t 3 /nobreak > nul
start http://localhost:3000

echo.
echo ===============================================
echo   💡 IMPORTANT: Keep this window open!
echo   The application will stop when you close this window.
echo   To stop the application, simply close this window
echo   or press Ctrl+C
echo ===============================================
echo.

call npm start

echo.
echo Application stopped. Cleaning up...
docker-compose stop > nul 2>&1
echo Database stopped.
echo You can now safely close this window.
pause
