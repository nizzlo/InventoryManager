# Inventory Manager - Start Scripts

## 🚀 Start Options

### ✅ **Recommended: Default Start Script**
```bash
./start-inventory-manager.sh
```
- Uses **development mode** for optimal image display
- Best for daily use and development
- Images work perfectly
- Fast startup and hot reloading

### 🔧 **Development Mode (Explicit)**
```bash
./start-inventory-manager-dev.sh
```
- Same as above, explicitly labeled as development mode
- Use if you want to be clear about running in dev mode

### 🏭 **Production Mode**
```bash
./start-inventory-manager-production.sh
```
- Uses production build with optimized performance
- ✅ **Fixed**: Images now work properly via API routes
- Best for production deployment testing
- Faster performance than development mode

## 📋 **Summary**

- **For regular use**: Use `start-inventory-manager.sh`
- **Images working**: ✅ Development mode, ✅ Production mode (fixed!)
- **Performance**: Production mode is faster, development mode has hot reloading

## 🔧 **Technical Notes**

The image display issue in production mode has been **FIXED** by implementing:

1. **Custom API routes**: Images are served via `/api/uploads/[filename]` in production
2. **Environment detection**: Automatically switches between direct file access (dev) and API routes (prod)
3. **Improved caching**: Better cache headers for optimal performance
4. **Robust fallbacks**: Proper error handling and placeholder images

Both development and production modes now work seamlessly with uploaded images!
