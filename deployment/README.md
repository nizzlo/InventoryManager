# 📦 Inventory Manager - Cross-Platform Deployment

## 🎯 Quick Start Guide

### **Choose Your Platform:**

📁 **For Windows Users:**
- Navigate to the `windows/` folder
- Follow instructions in `windows/README-SETUP.md`
- Use the `.bat` files to run the application

📁 **For Mac Users:**  
- Navigate to the `mac/` folder
- Follow instructions in `mac/README-SETUP.md`
- Use the `.sh` files to run the application

## 🚀 What's Inside

### 📂 `windows/` folder contains:
- `FIRST-TIME-SETUP.bat` - One-time installation wizard
- `START-INVENTORY-MANAGER.bat` - Daily startup script (recommended)
- `START-INVENTORY-MANAGER-SIMPLE.bat` - Alternative startup script
- `START-INVENTORY-MANAGER-AUTO.bat` - Enhanced startup with auto-detection
- `STOP-INVENTORY-MANAGER.bat` - Manual shutdown script
- `BUILD-FOR-PRODUCTION.bat` - Production build script
- `CREATE-DEPLOYMENT-PACKAGE.bat` - Package creation script
- `Create-Desktop-Shortcut.vbs` - Browser shortcut creator
- `README-SETUP.md` - Complete Windows setup instructions

### 📂 `mac/` folder contains:
- `first-time-setup.sh` - One-time installation wizard
- `start-inventory-manager.sh` - Daily startup script
- `stop-inventory-manager.sh` - Manual shutdown script  
- `create-mac-deployment-package.sh` - Package creation script
- `README-SETUP.md` - Complete Mac setup instructions

### 📂 Root level documentation:
- `DEPLOYMENT-CHECKLIST.md` - Original Windows deployment guide
- `CROSS-PLATFORM-DEPLOYMENT-CHECKLIST.md` - Complete cross-platform guide

## ⚡ Super Quick Start

### For Windows:
1. Install Node.js + Docker Desktop
2. Extract to `C:\InventoryManager\`
3. Run `windows/FIRST-TIME-SETUP.bat`
4. Daily: Run `windows/START-INVENTORY-MANAGER.bat`

### For Mac:
1. Install Node.js + Docker Desktop  
2. Extract to `~/InventoryManager/`
3. Run `mac/first-time-setup.sh`
4. Daily: Run `mac/start-inventory-manager.sh`

## 🛡️ Data Safety
- **Your inventory data is safe** and persists between restarts
- Database is stored in Docker volumes (not affected by app restarts)
- Same data structure and features on both platforms

## 📞 Support
- Platform-specific issues: Check the respective README files
- General application issues: Contact the developer
- Database questions: See the cross-platform deployment checklist

---
**Compatible with:** Windows 10/11 and macOS 10.15+  
**Created:** September 6, 2025
