# 🔐 Google OAuth Setup Guide - Fix "App doesn't comply with Google's OAuth 2.0 policy"

## ❌ **Current Error:**
```
You can't sign in to this app because it doesn't comply with Google's OAuth 2.0 policy
Error 400: invalid_request
```

## 🔧 **Root Cause:**
The error occurs because:
1. ❌ Redirect URI mismatch in Google Console
2. ❌ Domain not verified
3. ❌ App in testing mode with limited users

## ✅ **Solution: Complete Google Cloud Console Setup**

### **Step 1: Access Google Cloud Console**
1. Go to: https://console.cloud.google.com/
2. Select your project or create a new one
3. Navigate to: **APIs & Services** → **Credentials**

### **Step 2: Configure OAuth 2.0 Client**
1. Find your OAuth 2.0 Client ID: `990510508408-obseipr918cl1fr9crfbubqmqtnlgpp4.apps.googleusercontent.com`
2. Click **Edit** (pencil icon)

### **Step 3: Add All Required Redirect URIs**
In the **Authorized redirect URIs** section, add ALL these URLs:

```
http://localhost:3000/api/auth/google-redirect
http://0.0.0.0:3000/api/auth/google-redirect
http://57.155.0.162:3000/api/auth/google-redirect
https://57.155.0.162:3000/api/auth/google-redirect
```

### **Step 4: Add Authorized Origins**
In the **Authorized JavaScript origins** section, add:

```
http://localhost:3000
http://0.0.0.0:3000
http://57.155.0.162:3000
https://57.155.0.162:3000
```

### **Step 5: Configure OAuth Consent Screen**
1. Go to: **APIs & Services** → **OAuth consent screen**
2. Choose **External** user type
3. Fill in required fields:
   - **App name:** `Synsere TTS`
   - **User support email:** Your email
   - **Developer contact:** Your email
4. **Save and Continue**

### **Step 6: Publishing Status (IMPORTANT)**
Choose one of these options:

#### **Option A: Keep in Testing Mode (Quick Fix)**
- App stays in "Testing" mode
- Add your Google account as a test user:
  1. Go to **OAuth consent screen** → **Test users**
  2. Add your Gmail address
  3. Click **Save**

#### **Option B: Publish App (Production Ready)**
1. Go to **OAuth consent screen**
2. Click **Publish App**
3. Submit for verification if required

### **Step 7: Update Environment Variables**

Your current configuration is correct:
```bash
# In docker-compose.yml (already configured)
GOOGLE_CLIENT_ID=990510508408-obseipr918cl1fr9crfbubqmqtnlgpp4.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
FRONTEND_URL=http://57.155.0.162:3000
```

## 🚀 **Testing Google OAuth**

After completing the setup:

1. **Restart containers:**
   ```bash
   docker compose down
   docker compose up -d
   ```

2. **Test the login:**
   - Go to: http://57.155.0.162:3000/login
   - Click "Sign in with Google"
   - Should work without the compliance error

## 🔍 **Troubleshooting**

### **If you still get errors:**

1. **Check redirect URI exactly matches:**
   ```
   Expected: http://57.155.0.162:3000/api/auth/google-redirect
   ```

2. **Verify test users (if in testing mode):**
   - Your Google account must be added as a test user

3. **Clear browser cache:**
   ```bash
   # Chrome/Edge
   Ctrl+Shift+Delete → Clear cookies and site data
   ```

4. **Check browser console for errors:**
   - Open Developer Tools (F12)
   - Look for network errors or OAuth messages

## 📝 **Quick Verification Checklist**

- ✅ OAuth Client configured with correct redirect URIs
- ✅ Authorized origins added
- ✅ OAuth consent screen configured
- ✅ App published OR test users added
- ✅ Environment variables set correctly
- ✅ Containers restarted

## 🎯 **Expected Result**

After proper setup:
1. Visit: http://57.155.0.162:3000/login
2. Click "Sign in with Google"
3. Google login popup opens successfully
4. Login completes and redirects to main app

## 🆘 **Still Having Issues?**

If problems persist:
1. Share the exact error message from browser console
2. Verify all redirect URIs are exactly correct
3. Check if your Google account is in test users list
4. Try with a different Google account

---

**✅ This configuration supports all access methods:**
- Local: http://localhost:3000
- 0.0.0.0: http://0.0.0.0:3000  
- External: http://57.155.0.162:3000 