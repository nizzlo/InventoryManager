@echo off
echo ===============================================
echo    Creating Deployment Package
echo ===============================================
echo.

echo Creating deployment package...
echo This will take a moment...

cd /d "%~dp0..\.."

if exist "InventoryManager-Deployment.zip" del "InventoryManager-Deployment.zip"

echo.
echo Packaging essential files...
echo - Application source code
echo - Database schema and migrations  
echo - Deployment scripts
echo - Configuration files
echo.

:: Create a temporary folder structure
if exist "temp-deployment" rmdir /s /q "temp-deployment"
mkdir "temp-deployment"

:: Copy essential files
xcopy "src" "temp-deployment\src" /E /I /Q
xcopy "prisma" "temp-deployment\prisma" /E /I /Q  
xcopy "public" "temp-deployment\public" /E /I /Q
xcopy "deployment" "temp-deployment\deployment" /E /I /Q
copy "package.json" "temp-deployment\"
copy "package-lock.json" "temp-deployment\"
copy "next.config.js" "temp-deployment\" 2>nul
copy "tsconfig.json" "temp-deployment\"
copy ".env.local" "temp-deployment\" 2>nul
copy "docker-compose.yml" "temp-deployment\"
copy "tailwind.config.js" "temp-deployment\" 2>nul
copy "postcss.config.js" "temp-deployment\" 2>nul

:: Create the deployment package using Windows built-in compression
powershell Compress-Archive -Path "temp-deployment\*" -DestinationPath "InventoryManager-Deployment.zip" -CompressionLevel Optimal

:: Cleanup
rmdir /s /q "temp-deployment"

echo.
echo ===============================================
echo   ✅ Deployment package created!
echo   📦 File: InventoryManager-Deployment.zip
echo ===============================================
echo.
echo This package contains everything needed to run
echo the Inventory Manager on another computer.
echo.
echo Next steps:
echo 1. Copy the ZIP file to your dad's PC
echo 2. Extract it to C:\InventoryManager\
echo 3. Run FIRST-TIME-SETUP.bat
echo 4. Use START-INVENTORY-MANAGER.bat to run
echo.

pause
