# 📦 Multi-Platform Deployment Package Checklist

## Files to Copy for Cross-Platform Support

### 📁 Essential Application Files (Same for both platforms)
- [ ] **src/** folder (entire application source)
- [ ] **prisma/** folder (database schema and migrations)
- [ ] **public/** folder (static assets)
- [ ] **package.json** (dependencies and scripts)
- [ ] **package-lock.json** (exact dependency versions)
- [ ] **next.config.js** (Next.js configuration)
- [ ] **tsconfig.json** (TypeScript configuration)
- [ ] **.env.local** (environment variables)
- [ ] **docker-compose.yml** (database setup)

### 📁 Windows Deployment Scripts (deployment/ folder)
- [ ] **START-INVENTORY-MANAGER.bat** (Windows startup script)
- [ ] **STOP-INVENTORY-MANAGER.bat** (Windows shutdown script)
- [ ] **FIRST-TIME-SETUP.bat** (Windows setup script)
- [ ] **README-SETUP.md** (Windows setup instructions)
- [ ] **CREATE-DEPLOYMENT-PACKAGE.bat** (Windows packaging script)

### 📁 Mac Deployment Scripts (deployment/ folder)
- [ ] **start-inventory-manager.sh** (Mac startup script)
- [ ] **stop-inventory-manager.sh** (Mac shutdown script)
- [ ] **first-time-setup.sh** (Mac setup script)
- [ ] **README-SETUP-MAC.md** (Mac setup instructions)
- [ ] **create-mac-deployment-package.sh** (Mac packaging script)

## 🚀 Platform-Specific Setup Instructions

### Windows Setup
1. **Prerequisites**: Node.js + Docker Desktop
2. **Extract** to `C:\InventoryManager\`
3. **Run** `FIRST-TIME-SETUP.bat` (one-time)
4. **Daily use**: `START-INVENTORY-MANAGER.bat`
5. **Stop**: Close window or `STOP-INVENTORY-MANAGER.bat`

### Mac Setup
1. **Prerequisites**: Node.js + Docker Desktop
2. **Extract** to `~/InventoryManager/`
3. **Run** `first-time-setup.sh` (one-time)
4. **Daily use**: `start-inventory-manager.sh`
5. **Stop**: Close terminal or `stop-inventory-manager.sh`

## 🔧 Key Differences Between Platforms

### Windows (.bat files)
- Uses batch script syntax
- Docker Desktop path: `C:\Program Files\Docker\Docker\Docker Desktop.exe`
- Browser opening: `start http://localhost:3000`
- Process killing: `taskkill /f /im node.exe`

### Mac (.sh files)
- Uses bash script syntax
- Docker Desktop path: `/Applications/Docker.app`
- Browser opening: `open "http://localhost:3000"`
- Process killing: `pkill -f "npm start"`

## 🛡️ Data Persistence (Same on both platforms)
- **Database data**: Stored in Docker volume `postgres_data`
- **Survives**: App restarts, computer restarts, Docker restarts
- **Persistent**: Until manually deleted with `docker volume rm`

## 📞 Troubleshooting by Platform

### Windows Common Issues:
1. **"Port already in use"** → Close startup window and try again
2. **Docker not starting** → Ensure Docker Desktop is running (whale icon in system tray)
3. **Permission errors** → Run as Administrator
4. **Path issues** → Use full paths in batch files

### Mac Common Issues:
1. **"Permission denied"** → Run `chmod +x *.sh` in deployment folder
2. **Docker not starting** → Ensure Docker Desktop is running (whale icon in menu bar)
3. **Scripts won't run** → Right-click and select "Open" instead of double-clicking
4. **Homebrew conflicts** → Ensure system Node.js is used

## 📋 Cross-Platform Testing Checklist
- [ ] Windows: Prerequisites install correctly
- [ ] Windows: First-time setup runs without errors
- [ ] Windows: Daily startup works consistently
- [ ] Windows: Application stops cleanly
- [ ] Mac: Prerequisites install correctly
- [ ] Mac: First-time setup runs without errors
- [ ] Mac: Daily startup works consistently
- [ ] Mac: Application stops cleanly
- [ ] Both: Database data persists between restarts
- [ ] Both: Docker containers clean up properly

---
*Package supports: Windows 10/11 and macOS 10.15+*
*Created on: September 6, 2025*
