# Troubleshooting Common Errors

## Fixed Issues

### 1. ✅ Image Picker Error - "Cannot read property 'Images' of undefined"

**Error:**
```
ERROR  Error taking photo: [TypeError: Cannot read property 'Images' of undefined]
```

**Cause:**
Incorrect usage of `ImagePicker.MediaType.Images` in FormStep3.js

**Fix:**
Changed to `ImagePicker.MediaTypeOptions.Images` in both camera and gallery functions.

**Files Modified:**
- `mobile/src/components/FormStep3.js`

---

## Active Issues

### 2. ⚠️ Network Error During Registration

**Error:**
```
ERROR  Registration error: [AxiosError: Network Error]
```

**Possible Causes:**
1. Backend server is not running
2. IP address has changed
3. Device/emulator cannot reach the backend server
4. Firewall blocking the connection

**Solutions:**

#### Step 1: Check Backend Server
```bash
cd backend
npm start
```
Server should start on `http://localhost:5000`

#### Step 2: Find Your IP Address

**Windows:**
```bash
ipconfig
```
Look for "IPv4 Address" under your active network adapter

**Mac/Linux:**
```bash
ifconfig
# or
ip addr show
```

#### Step 3: Update API Configuration

Edit `mobile/src/config/apiConfig.js`:
```javascript
export const API_CONFIG = {
  BASE_URL: 'http://YOUR_IP_ADDRESS:5000/api',  // ← Update this
  TIMEOUT: 30000,
  HEADERS: {
    'Content-Type': 'application/json',
  },
};
```

**Example:**
```javascript
BASE_URL: 'http://192.168.1.100:5000/api',
```

#### Step 4: Test Connection

**From mobile device/emulator:**
1. Open browser
2. Navigate to `http://YOUR_IP_ADDRESS:5000`
3. You should see "CTU Admission Portal API"

**From command line:**
```bash
curl http://YOUR_IP_ADDRESS:5000
```

#### Step 5: Check Firewall

**Windows:**
- Open Windows Defender Firewall
- Allow Node.js through firewall
- Allow port 5000

**Mac:**
- System Preferences → Security & Privacy → Firewall
- Allow incoming connections for Node

#### Step 6: Restart Everything

1. Stop backend server (Ctrl+C)
2. Stop mobile app (Ctrl+C)
3. Start backend: `cd backend && npm start`
4. Start mobile: `cd mobile && npm start`

---

## Network Configuration Tips

### For Physical Device Testing

1. **Same WiFi Network**
   - Ensure phone and computer are on the same WiFi network
   - Some networks block device-to-device communication

2. **Mobile Hotspot**
   - Connect computer to phone's hotspot
   - Use computer's IP address in that network

3. **USB Debugging**
   - Use `adb reverse tcp:5000 tcp:5000`
   - Then use `http://localhost:5000/api` in config

### For Emulator Testing

**Android Emulator:**
- Use `http://10.0.2.2:5000/api` (special alias for host machine)

**iOS Simulator:**
- Use `http://localhost:5000/api` (direct access to host)

---

## Quick Fixes

### Reset Everything
```bash
# Backend
cd backend
rm -rf node_modules
npm install
npm start

# Mobile
cd mobile
rm -rf node_modules
npm install
npm start
```

### Clear Cache
```bash
cd mobile
npm start -- --reset-cache
```

### Check Logs
```bash
# Backend logs
cd backend
npm start

# Mobile logs
cd mobile
npm start
# Then press 'j' to open debugger
```

---

## Current Configuration

**Backend:**
- Port: 5000
- URL: `http://localhost:5000`

**Mobile API Config:**
- Current IP: `172.16.193.246`
- Port: 5000
- Full URL: `http://172.16.193.246:5000/api`

**Note:** If you're getting network errors, the IP address `172.16.193.246` may have changed. Follow Step 2 above to find your current IP.

---

## Testing Checklist

- [ ] Backend server is running
- [ ] Can access `http://localhost:5000` from browser
- [ ] IP address is correct in `apiConfig.js`
- [ ] Phone/emulator is on same network
- [ ] Firewall allows port 5000
- [ ] No VPN interfering with connection
- [ ] MongoDB is running and connected

---

## Additional Resources

- [Expo Network Debugging](https://docs.expo.dev/guides/troubleshooting-proxies/)
- [React Native Network Issues](https://reactnative.dev/docs/network)
- [MongoDB Connection Guide](https://www.mongodb.com/docs/manual/reference/connection-string/)
