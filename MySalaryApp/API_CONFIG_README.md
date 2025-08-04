# API Configuration Guide

## Current Configuration
- **Server URL**: `http://192.168.31.132:3001/api` ✅ WORKING
- **Server Port**: 3001 (from server/.env file)
- **Client Configuration**: `src/config/api.ts`

## How to Change API URL

### Method 1: Edit Configuration File (RECOMMENDED)
Edit file: `src/config/api.ts`

```typescript
export const API_CONFIG = {
  BASE_URL: 'http://YOUR_NEW_IP:3001/api',  // Change IP here
  // ...
};
```

### Method 2: Quick Fix in api.ts
Edit file: `src/services/api.ts`
- Find: `import { API_BASE_URL, API_CONFIG } from '../config/api';`
- Replace the import with: `const API_BASE_URL = 'http://YOUR_NEW_IP:3001/api';`

## Troubleshooting Network Issues

1. **Check Server Status**:
   ```bash
   curl http://192.168.31.132:3001/api/countries
   ```

2. **Verify Port in Server**:
   - Check `server/.env` file for PORT variable
   - Default fallback is 3002 if PORT not set

3. **Network Connectivity**:
   - Ensure device/simulator is on same network
   - For iOS Simulator: Use computer's IP address
   - For Android Emulator: Use `http://10.0.2.2:3001/api`

4. **Alternative URLs to Try**:
   - `http://localhost:3001/api` (Android emulator only)
   - `http://127.0.0.1:3001/api` (Local testing)
   - `http://YOUR_COMPUTER_IP:3001/api` (Network access)

## Current Network Setup
- Server binds to: `0.0.0.0:3001` (all interfaces)
- Client connects to: `192.168.31.132:3001` ✅ WORKING

## Files Modified
- ✅ `src/config/api.ts` - New configuration file
- ✅ `src/services/api.ts` - Updated to use config
- ✅ Added logging for debugging

## Testing Connection
The app will log connection details in console:
- 🔧 API Service initialized
- 📡 Base URL: http://192.168.31.188:3001/api
- === API REQUEST === with full details