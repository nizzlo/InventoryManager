# 📦 Deployment Package Checklist

## Files to Copy to Dad's PC

### 📁 Essential Application Files
- [ ] **src/** folder (entire application source)
- [ ] **prisma/** folder (database schema and migrations)
- [ ] **public/** folder (static assets)
- [ ] **package.json** (dependencies and scripts)
- [ ] **package-lock.json** (exact dependency versions)
- [ ] **next.config.js** (Next.js configuration)
- [ ] **tsconfig.json** (TypeScript configuration)
- [ ] **.env.local** (environment variables)
- [ ] **docker-compose.yml** (database setup)

### 📁 Deployment Scripts (from deployment/ folder)
- [ ] **START-INVENTORY-MANAGER.bat** (main startup script)
- [ ] **STOP-INVENTORY-MANAGER.bat** (shutdown script)
- [ ] **BUILD-FOR-PRODUCTION.bat** (build script)
- [ ] **README-SETUP.md** (setup instructions)
- [ ] **Create-Desktop-Shortcut.vbs** (desktop shortcut creator)

## 🚀 Setup Steps for Dad's PC

### 1. Prerequisites Installation
- [ ] Install Node.js from https://nodejs.org/ (LTS version)
- [ ] Install Docker Desktop from https://www.docker.com/products/docker-desktop/
- [ ] Ensure both are working by restarting the computer

### 2. Application Setup
- [ ] Create folder: `C:\InventoryManager\`
- [ ] Copy all files to this folder
- [ ] Double-click `BUILD-FOR-PRODUCTION.bat` (one-time setup)
- [ ] Test by running `START-INVENTORY-MANAGER.bat`

### 3. Optional Enhancements
- [ ] Run `Create-Desktop-Shortcut.vbs` for easy browser access
- [ ] Pin the START bat file to taskbar for quick access
- [ ] Customize app name in `.env.local` if needed

## 🔧 Troubleshooting Tips

### Common Issues:
1. **"Port already in use"** → Run STOP script first
2. **Docker not starting** → Ensure Docker Desktop is running
3. **Database connection errors** → Check if port 5433 is free
4. **Build errors** → Ensure Node.js is properly installed

### Support Files:
- Error logs will appear in command prompt windows
- Database data is stored in Docker volume (persistent)
- App configuration is in `.env.local`

---
*Package created on: September 6, 2025*
