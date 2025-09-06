@echo off
echo ===============================================
echo    Stopping Inventory Manager Application
echo ===============================================
echo.
echo NOTE: You can also stop the application by simply
echo       closing the START-INVENTORY-MANAGER window.
echo.

cd /d "%~dp0..\.."

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
echo TIP: Next time you can just close the startup window
echo      instead of using this stop script.
echo.

pause
