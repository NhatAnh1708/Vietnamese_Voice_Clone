'use client';

import { useState } from 'react';
import { getApiUrl, API_ENDPOINTS } from '../utils/api';

export default function ApiTest() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testApiConnectivity = async () => {
    setIsLoading(true);
    setTestResults([]);
    
    addResult('🚀 Starting comprehensive authentication test...');
    addResult(`Environment: NODE_ENV=${process.env.NODE_ENV}`);
    addResult(`API URL: ${process.env.NEXT_PUBLIC_API_URL || 'NOT SET'}`);
    addResult(`Base API URL: ${getApiUrl()}`);
    addResult(`Google Client ID: ${process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? 'SET' : 'NOT SET'}`);

    // Test 1: Basic connectivity to backend
    try {
      addResult('🔍 Testing basic connectivity...');
      const response = await fetch(getApiUrl('/docs'), {
        method: 'GET',
      });
      
      if (response.ok) {
        addResult('✅ Backend is accessible (docs page loaded)');
      } else {
        addResult(`❌ Backend docs failed: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      addResult(`❌ Backend connectivity error: ${error}`);
    }

    // Test 2: Test login endpoint with dummy data (should fail but be reachable)
    try {
      addResult('🔍 Testing traditional login endpoint...');
      const response = await fetch(getApiUrl(API_ENDPOINTS.login), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          username: 'test@test.com',
          password: 'wrongpassword',
        }),
      });
      
      addResult(`📡 Login endpoint response: ${response.status} ${response.statusText}`);
      
      if (response.status === 401) {
        addResult('✅ Traditional login endpoint is working (expected 401 for wrong credentials)');
      } else if (response.status === 422) {
        addResult('✅ Traditional login endpoint is working (validation error)');
      } else if (response.ok) {
        addResult('✅ Traditional login endpoint is working');
      } else {
        const errorText = await response.text();
        addResult(`❌ Traditional login endpoint error: ${errorText}`);
      }
    } catch (error) {
      addResult(`❌ Traditional login endpoint error: ${error}`);
    }

    // Test 3: Test admin login credentials
    try {
      addResult('🔍 Testing admin login credentials...');
      const response = await fetch(getApiUrl(API_ENDPOINTS.login), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          username: 'admin@gmail.com',
          password: 'admin123',
        }),
      });
      
      addResult(`📡 Admin login response: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const data = await response.json();
        addResult('✅ Admin login successful! Traditional auth is working');
        addResult(`Token received: ${data.access_token?.substring(0, 20)}...`);
      } else if (response.status === 401) {
        addResult('❌ Admin login failed - wrong credentials or user not created');
      } else {
        const errorText = await response.text();
        addResult(`❌ Admin login error: ${errorText}`);
      }
    } catch (error) {
      addResult(`❌ Admin login test error: ${error}`);
    }

    // Test 4: Test register endpoint
    try {
      addResult('🔍 Testing register endpoint...');
      const response = await fetch(getApiUrl(API_ENDPOINTS.register), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@test.com',
          name: 'Test User',
          password: 'testpassword',
        }),
      });
      
      addResult(`📡 Register endpoint response: ${response.status} ${response.statusText}`);
      
      if (response.status === 400 || response.status === 422) {
        addResult('✅ Register endpoint is reachable (expected 400/422 for duplicate/invalid data)');
      } else if (response.ok) {
        addResult('✅ Register endpoint is working - new registration successful');
      } else {
        const errorText = await response.text();
        addResult(`❌ Register endpoint error: ${errorText}`);
      }
    } catch (error) {
      addResult(`❌ Register endpoint error: ${error}`);
    }

    // Test 5: Check Google OAuth configuration
    try {
      addResult('🔍 Testing Google OAuth configuration...');
      const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      
      if (googleClientId) {
        addResult('✅ Google Client ID is configured');
        const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'localhost:3000';
        const redirectUri = `${currentOrigin}/api/auth/google-redirect`;
        addResult(`📡 Google redirect URI: ${redirectUri}`);
        
        // Test if Google redirect endpoint exists
        const response = await fetch('/api/auth/google-redirect?test=1', {
          method: 'GET',
        });
        
        if (response.status === 200 || response.status === 400) {
          addResult('✅ Google redirect endpoint is accessible');
        } else {
          addResult(`❌ Google redirect endpoint issue: ${response.status}`);
        }
      } else {
        addResult('❌ Google Client ID is NOT configured');
        addResult('⚠️  Google OAuth login will not work');
      }
    } catch (error) {
      addResult(`❌ Google OAuth test error: ${error}`);
    }

    // Test 6: Summary
    addResult('📋 AUTHENTICATION SUMMARY:');
    addResult('1. Traditional Login: Use admin@gmail.com / admin123');
    addResult('2. Google OAuth: Make sure NEXT_PUBLIC_GOOGLE_CLIENT_ID is set');
    addResult('3. Register: Create new account with email/password');
    addResult('✅ API connectivity test completed');
    setIsLoading(false);
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg mb-4">
      <h3 className="text-lg font-bold mb-2">🔐 Authentication Test Panel</h3>
      <p className="text-sm text-gray-600 mb-3">
        Test both traditional login and Google OAuth authentication
      </p>
      
      <button
        onClick={testApiConnectivity}
        disabled={isLoading}
        className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 ${
          isLoading ? 'cursor-not-allowed' : ''
        }`}
      >
        {isLoading ? 'Testing...' : 'Test Authentication Systems'}
      </button>

      {testResults.length > 0 && (
        <div className="mt-4">
          <h4 className="font-semibold mb-2">Test Results:</h4>
          <div className="bg-black text-green-400 p-3 rounded text-sm font-mono max-h-64 overflow-y-auto">
            {testResults.map((result, index) => (
              <div key={index}>{result}</div>
            ))}
          </div>
        </div>
      )}
      
      <div className="mt-4 p-3 bg-blue-50 rounded text-sm">
        <h5 className="font-semibold text-blue-800 mb-1">💡 Quick Test Guide:</h5>
        <ul className="text-blue-700 space-y-1">
          <li>• Run test to check backend connectivity</li>
          <li>• Try login with: admin@gmail.com / admin123</li>
          <li>• Test Google OAuth (if configured)</li>
          <li>• Try registering a new account</li>
        </ul>
      </div>
    </div>
  );
} 