# Inventory Manager - Simple Setup Guide

## 🚀 Quick Start for Windows PC

### Prerequisites (One-time setup)
1. **Install Node.js** (if not already installed):
   - Download from: https://nodejs.org/
   - Choose "LTS" version (recommended)
   - Run the installer and follow the prompts

2. **Install Docker Desktop** (for database):
   - Download from: https://www.docker.com/products/docker-desktop/
   - Install and start Docker Desktop
   - Make sure Docker is running (you'll see the whale icon in system tray)

### 📁 Application Setup

1. **Extract the application folder** to a location like:
   ```
   C:\InventoryManager\
   ```

2. **Double-click** the `START-INVENTORY-MANAGER.bat` file
   - This will automatically:
     - Start the database
     - Install dependencies (first time only)
     - Start the application
     - Open your web browser

3. **Access the application**:
   - The app will open automatically in your browser
   - Or manually go to: http://localhost:3000

### 🛑 To Stop the Application
- **Simply close the command prompt window** (click the X button)
- The application and database will stop automatically
- Alternative: Double-click `STOP-INVENTORY-MANAGER.bat`

### 📞 Troubleshooting
- If you see "port already in use" errors, run the STOP script first
- If Docker issues occur, make sure Docker Desktop is running
- For other issues, check the command prompt windows for error messages

### 🔧 Configuration
- To change the app name, edit `.env.local` file:
  ```
  NEXT_PUBLIC_APP_NAME="Your Custom Name Here"
  ```

---
*For technical support, contact the application developer*
