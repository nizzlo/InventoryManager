@echo off
echo ===============================================
echo    Stopping Inventory Manager Application
echo ===============================================
echo.

cd /d "%~dp0.."

echo Stopping application servers...
taskkill /f /im node.exe 2>nul
taskkill /f /im npm.cmd 2>nul

echo Stopping database...
docker-compose down

echo.
echo ===============================================
echo   Inventory Manager stopped successfully!
echo ===============================================
echo.

pause
