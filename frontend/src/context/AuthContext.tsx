'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import Cookies from 'js-cookie';
import { getApiUrl, API_ENDPOINTS } from '../utils/api';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  loginWithGoogle: (token: string) => Promise<boolean>;
  logout: () => void;
  refreshAuthState: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const refreshAuthState = () => {
    const authCookie = Cookies.get('isAuthenticated');
    const authToken = localStorage.getItem('auth_token');
    
    // Consider authenticated if either cookie or localStorage has valid auth
    const shouldBeAuthenticated = authCookie === 'true' || !!authToken;
    
    if (shouldBeAuthenticated !== isAuthenticated) {
      setIsAuthenticated(shouldBeAuthenticated);
    }
  };

  useEffect(() => {
    refreshAuthState();

    // Listen for storage changes (e.g., when another tab logs in/out)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth_token' || e.key === null) {
        refreshAuthState();
      }
    };

    // Listen for focus events (when user comes back to tab after OAuth)
    const handleFocus = () => {
      refreshAuthState();
    };

    // Custom event listener for manual auth state refresh
    const handleAuthRefresh = () => {
      refreshAuthState();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('authRefresh', handleAuthRefresh);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('authRefresh', handleAuthRefresh);
    };
  }, []);

  const login = async (username: string, password: string) => {
    console.log('🔑 AuthContext: Starting login for:', username);
    
    try {
      console.log('📡 AuthContext: Trying URL:', getApiUrl(API_ENDPOINTS.login));
      
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
      
      const response = await fetch(getApiUrl(API_ENDPOINTS.login), {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Accept": "application/json",
        },
        body: new URLSearchParams({
          username: username,
          password: password,
        }),
        signal: controller.signal,
        mode: 'cors', // Explicitly set CORS mode
      });

      clearTimeout(timeoutId);
      console.log('📊 AuthContext: API response status:', response.status);

      if (!response.ok) {
        console.log('❌ AuthContext: Login failed with status:', response.status);
        try {
          const errorText = await response.text();
          console.log('❌ AuthContext: Error response:', errorText);
        } catch (e) {
          console.log('❌ AuthContext: Could not read error response');
        }
        return false;
      }

      const data = await response.json();
      console.log('✅ AuthContext: Login successful, got token');
      
      localStorage.setItem('auth_token', data.access_token);
      setIsAuthenticated(true);
      Cookies.set('isAuthenticated', 'true', { expires: 7 });
      
      console.log('✅ AuthContext: Auth state updated');
      return true;
    } catch (error) {
      console.error('💥 AuthContext: Login error:', error);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          console.error('💥 AuthContext: Request timed out');
        } else if (error.message.includes('Failed to fetch')) {
          console.error('💥 AuthContext: Network error - cannot reach backend');
        }
      }
      
      return false;
    }
  };

  const loginWithGoogle = async (token: string) => {
    try {
      const response = await fetch(getApiUrl(API_ENDPOINTS.googleLogin), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      localStorage.setItem('auth_token', data.access_token);
      setIsAuthenticated(true);
      Cookies.set('isAuthenticated', 'true', { expires: 7 });
      return true;
    } catch (error) {
      console.error('Google login error:', error);
      return false;
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    Cookies.remove('isAuthenticated');
    localStorage.removeItem('auth_token');
    
    // Clear voice file cache to prevent issues
    localStorage.removeItem('voice_path');
    localStorage.removeItem('voice_file_name');
    
    // Dispatch event to clear voice from all components
    window.dispatchEvent(new CustomEvent('voiceRemoved'));
    
    // Clear any other cached data
    // You can add more cache clearing logic here if needed
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, loginWithGoogle, logout, refreshAuthState }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 