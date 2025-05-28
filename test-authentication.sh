#!/bin/bash

echo "🔐 Testing Both Authentication Methods (External Access)"
echo "========================================================"

# Test 1: Backend API Connectivity
echo "1. 🔍 Testing Backend API Connectivity..."
curl -s -f http://0.0.0.0:8000/docs > /dev/null
if [ $? -eq 0 ]; then
    echo "   ✅ Backend API is accessible at http://0.0.0.0:8000"
else
    echo "   ❌ Backend API is not accessible"
    exit 1
fi

# Test 2: Traditional Login Test
echo ""
echo "2. 🔑 Testing Traditional Login..."
echo "   Trying admin@gmail.com / admin123..."

RESPONSE=$(curl -s -X POST "http://0.0.0.0:8000/api/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin@gmail.com&password=admin123")

if echo "$RESPONSE" | grep -q "access_token"; then
    echo "   ✅ Traditional login successful!"
    TOKEN=$(echo "$RESPONSE" | sed -n 's/.*"access_token":"\([^"]*\)".*/\1/p')
    echo "   📝 Token: ${TOKEN:0:20}..."
else
    echo "   ❌ Traditional login failed"
    echo "   Response: $RESPONSE"
fi

# Test 3: Registration Test (with test user)
echo ""
echo "3. 📝 Testing Registration..."
echo "   Trying test@test.com / testpassword..."

REGISTER_RESPONSE=$(curl -s -X POST "http://0.0.0.0:8000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@test.com",
    "name": "Test User", 
    "password": "testpassword"
  }')

if echo "$REGISTER_RESPONSE" | grep -q '"id"'; then
    echo "   ✅ Registration successful!"
    echo "   📝 New user created: test@test.com"
    
    # Test login with new user
    echo "   🔍 Testing login with new user..."
    LOGIN_RESPONSE=$(curl -s -X POST "http://0.0.0.0:8000/api/auth/login" \
      -H "Content-Type: application/x-www-form-urlencoded" \
      -d "username=test@test.com&password=testpassword")
    
    if echo "$LOGIN_RESPONSE" | grep -q "access_token"; then
        echo "   ✅ New user login successful!"
    else
        echo "   ❌ New user login failed"
    fi
elif echo "$REGISTER_RESPONSE" | grep -q "already registered"; then
    echo "   ⚠️  User already exists, testing login instead..."
    LOGIN_RESPONSE=$(curl -s -X POST "http://0.0.0.0:8000/api/auth/login" \
      -H "Content-Type: application/x-www-form-urlencoded" \
      -d "username=test@test.com&password=testpassword")
    
    if echo "$LOGIN_RESPONSE" | grep -q "access_token"; then
        echo "   ✅ Existing user login successful!"
    else
        echo "   ❌ Existing user login failed"
    fi
else
    echo "   ❌ Registration failed"
    echo "   Response: $REGISTER_RESPONSE"
fi

# Test 4: Google OAuth Configuration Check
echo ""
echo "4. 🌐 Testing Google OAuth Configuration..."

# Check if Google Client ID environment is set in frontend
GOOGLE_CHECK=$(curl -s http://0.0.0.0:3000 | grep -o "GOOGLE_CLIENT_ID" || echo "")

if [ -n "$GOOGLE_CHECK" ]; then
    echo "   ✅ Google OAuth is configured"
    echo "   📝 Check browser console at http://0.0.0.0:3000 for GOOGLE_CLIENT_ID"
else
    echo "   ⚠️  Google OAuth may not be configured"
    echo "   📝 Set NEXT_PUBLIC_GOOGLE_CLIENT_ID in frontend environment"
fi

# Test 5: Frontend Connectivity
echo ""
echo "5. 🌐 Testing Frontend Connectivity..."
curl -s -f http://0.0.0.0:3000 > /dev/null
if [ $? -eq 0 ]; then
    echo "   ✅ Frontend is accessible at http://0.0.0.0:3000"
else
    echo "   ❌ Frontend is not accessible"
fi

# Test 6: External Network Access
echo ""
echo "6. 🌍 Testing External Network Access..."
EXTERNAL_IP=$(curl -s ifconfig.me || curl -s ipinfo.io/ip)
if [ -n "$EXTERNAL_IP" ]; then
    echo "   📡 Server External IP: $EXTERNAL_IP"
    echo "   🌐 External Frontend Access: http://$EXTERNAL_IP:3000"
    echo "   🌐 External Backend Access: http://$EXTERNAL_IP:8000"
else
    echo "   ⚠️  Could not determine external IP"
fi

echo ""
echo "🎯 AUTHENTICATION SUMMARY"
echo "========================="
echo ""
echo "🔑 TRADITIONAL LOGIN (Backend Authentication):"
echo "   📧 Email: admin@gmail.com"
echo "   🔒 Password: admin123"
echo "   🌐 API: POST http://0.0.0.0:8000/api/auth/login"
echo ""
echo "🔑 USER REGISTRATION:"
echo "   🌐 API: POST http://0.0.0.0:8000/api/auth/register"
echo "   📝 Create new account with email/password"
echo ""
echo "🔑 GOOGLE OAUTH:"
echo "   ⚙️  Requires NEXT_PUBLIC_GOOGLE_CLIENT_ID in frontend"
echo "   🌐 Frontend: http://0.0.0.0:3000/login"
echo ""
echo "🚀 QUICK TEST STEPS:"
echo "   1. Go to http://0.0.0.0:3000"
echo "   2. Try login with admin@gmail.com / admin123"
echo "   3. Try creating new account via Register button"
echo "   4. Try Google OAuth (if configured)"
echo ""
if [ -n "$EXTERNAL_IP" ]; then
echo "🌍 EXTERNAL ACCESS:"
echo "   Frontend: http://$EXTERNAL_IP:3000"
echo "   Backend: http://$EXTERNAL_IP:8000"
echo ""
fi
echo "✅ Authentication test completed!" 