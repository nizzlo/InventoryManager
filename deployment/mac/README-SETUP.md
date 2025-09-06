# Inventory Manager - Setup Guide for Mac

## 🚀 Quick Start for Mac

### Prerequisites (One-time setup)
1. **Install Node.js** (if not already installed):
   - Download from: https://nodejs.org/
   - Choose "LTS" version (recommended)
   - Run the installer and follow the prompts

2. **Install Docker Desktop** (for database):
   - Download from: https://www.docker.com/products/docker-desktop/
   - Install and start Docker Desktop
   - Make sure Docker is running (you'll see the whale icon in menu bar)

### 📁 Application Setup

1. **Extract the application folder** to a location like:
   ```
   ~/InventoryManager/
   ```

2. **Double-click** the `first-time-setup.sh` file (one-time setup)
   - If prompted, choose "Run" or "Open"
   - This will install everything needed

3. **Double-click** the `start-inventory-manager.sh` file
   - This will automatically:
     - **Start Docker Desktop** (if not running)
     - Start the database
     - Start the application
     - Open your web browser

4. **Access the application**:
   - The app will open automatically in your browser
   - Or manually go to: http://localhost:3000

### ⏱️ Startup Time
- **First time**: 2-3 minutes (Docker starts + dependencies install)
- **Subsequent times**: 30-60 seconds (just Docker + app startup)

### 🛑 To Stop the Application
- **Simply close the terminal window** (click the red X button)
- The application and database will stop automatically
- Alternative: Double-click `stop-inventory-manager.sh`

### 🔧 Troubleshooting
- If you see "permission denied" errors, open Terminal and run:
  ```bash
  cd ~/InventoryManager/deployment
  chmod +x *.sh
  ```
- If scripts won't run, right-click and select "Open" instead of double-clicking
- If you see "port already in use" errors, close the terminal window and try again
- If Docker issues occur, make sure Docker Desktop is running (whale icon in menu bar)

### 🔧 Configuration
- To change the app name, edit `.env.local` file:
  ```
  NEXT_PUBLIC_APP_NAME="Your Custom Name Here"
  ```

---
*For technical support, contact the application developer*
