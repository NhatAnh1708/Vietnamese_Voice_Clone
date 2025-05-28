# 🔐 Authentication Guide - Synsere TTS (External Access)

## ✅ **CẢ 2 PHƯƠNG THỨC ĐĂNG NHẬP ĐÃ ĐƯỢC SETUP**

### 🔑 **1. TRADITIONAL LOGIN (Backend Authentication)**

**API Endpoint:** `POST /api/auth/login`

**Cách sử dụng:**
1. Vào http://0.0.0.0:3000/login
2. Nhập email/password
3. Click "Login"

**Test Credentials:**
- **Email:** `admin@gmail.com`
- **Password:** `admin123`

**Hoặc tạo tài khoản mới:**
- Click "Register New Account"
- Điền thông tin và tạo tài khoản mới

---

### 🌐 **2. GOOGLE OAUTH LOGIN**

**API Endpoint:** `POST /api/auth/google-login`

**Cách sử dụng:**
1. Vào http://0.0.0.0:3000/login
2. Click "Sign in with Google"
3. Đăng nhập bằng tài khoản Google

**Note:** Cần có `NEXT_PUBLIC_GOOGLE_CLIENT_ID` được configure trong frontend environment.

---

## 🚀 **QUICK TEST STEPS**

### **Test Traditional Login:**
```bash
# Test admin login
curl -X POST "http://0.0.0.0:8000/api/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin@gmail.com&password=admin123"
```

### **Test Registration:**
```bash
# Create new user
curl -X POST "http://0.0.0.0:8000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "name": "New User",
    "password": "securepassword"
  }'
```

### **Test Frontend:**
1. **Traditional Login:** http://0.0.0.0:3000/login
   - Sử dụng: `admin@gmail.com` / `admin123`
   
2. **Registration:** http://0.0.0.0:3000/register
   - Tạo tài khoản mới với email/password
   
3. **Google OAuth:** http://0.0.0.0:3000/login
   - Click "Sign in with Google"

---

## 🌍 **EXTERNAL ACCESS**

### **Docker Network Binding:**
```yaml
# docker-compose.yml ports configuration
ports:
  - "0.0.0.0:3000:3000"  # Frontend
  - "0.0.0.0:8000:8000"  # Backend
  - "0.0.0.0:27017:27017" # MongoDB
```

### **Access URLs:**
- **Frontend:** http://0.0.0.0:3000
- **Backend API:** http://0.0.0.0:8000
- **API Docs:** http://0.0.0.0:8000/docs

### **From External Network:**
- **Frontend:** http://YOUR_SERVER_IP:3000
- **Backend:** http://YOUR_SERVER_IP:8000

---

## 📋 **API ENDPOINTS SUMMARY**

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/login` | Traditional login với email/password |
| `POST` | `/api/auth/register` | Đăng ký tài khoản mới |
| `POST` | `/api/auth/google-login` | Google OAuth login |
| `GET` | `/api/auth/user` | Lấy thông tin user hiện tại |

---

## 🛠️ **DEVELOPMENT COMMANDS**

### **Create Admin User:**
```bash
docker compose exec backend uv run python create_admin.py
```

### **Test Authentication (External Access):**
```bash
./test-authentication.sh
```

### **Restart Containers:**
```bash
docker compose down && docker compose up -d
```

### **Check External IP:**
```bash
curl ifconfig.me
# hoặc
curl ipinfo.io/ip
```

---

## ✅ **VERIFICATION CHECKLIST**

- [x] Backend API accessible at http://0.0.0.0:8000
- [x] Frontend accessible at http://0.0.0.0:3000  
- [x] Traditional login với admin@gmail.com / admin123
- [x] Registration API tạo user mới
- [x] Login API authenticate user
- [x] Google OAuth setup (cần GOOGLE_CLIENT_ID)
- [x] MongoDB lưu trữ user data
- [x] External network access

---

## 🎯 **KẾT LUẬN**

**CẢ 2 PHƯƠNG THỨC ĐĂNG NHẬP ĐÃ HOẠT ĐỘNG:**

1. **✅ Traditional Login:** Sử dụng backend authentication với email/password
2. **✅ Google OAuth:** Sử dụng Google account (cần configure GOOGLE_CLIENT_ID)

**🌐 Access URLs:**
- **Local:** http://0.0.0.0:3000/login
- **External:** http://YOUR_SERVER_IP:3000/login

**Bạn có thể test ngay bây giờ!** 🚀 