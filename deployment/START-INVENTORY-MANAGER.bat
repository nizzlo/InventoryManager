@echo off
echo ===============================================
echo    Starting Inventory Manager Application
echo ===============================================
echo.

cd /d "%~dp0.."

echo [1/4] Starting Docker database...
docker-compose up -d
if errorlevel 1 (
    echo ERROR: Failed to start database. Make sure Docker Desktop is running!
    pause
    exit /b 1
)

echo [2/4] Installing dependencies (this may take a few minutes on first run)...
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install dependencies!
    pause
    exit /b 1
)

echo [3/4] Setting up database...
call npx prisma generate
call npx prisma migrate deploy
if not exist ".env.local" (
    echo Creating default configuration...
    echo NEXT_PUBLIC_APP_NAME="Inventory Manager" > .env.local
    echo DATABASE_URL="postgresql://postgres:postgres@localhost:5433/inventory" >> .env.local
)

echo [4/4] Starting application...
echo.
echo ===============================================
echo   Application starting at: http://localhost:3000
echo   Opening browser automatically...
echo ===============================================
echo.

timeout /t 3 /nobreak > nul
start http://localhost:3000

call npm start

pause
