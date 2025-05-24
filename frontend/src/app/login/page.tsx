'use client';
console.log('GOOGLE_CLIENT_ID:', process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';

declare global {
  interface Window {
    google: any;
  }
}

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [googleLoginUrl, setGoogleLoginUrl] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, loginWithGoogle } = useAuth();

  useEffect(() => {
    setIsClient(true);
    console.log('Current origin:', window.location.origin);

    // Create Google login URL dynamically based on current origin
    const currentOrigin = window.location.origin;
    const redirectUri = encodeURIComponent(`${currentOrigin}/api/auth/google-redirect`);
    const googleUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=code&scope=email%20profile&access_type=offline`;
    setGoogleLoginUrl(googleUrl);
    console.log('Dynamic Google login URL:', googleUrl);

    // Check for error in URL params
    const urlError = searchParams.get('error');
    const errorDetails = searchParams.get('details');
    if (urlError) {
      let errorMessage = `Authentication Error: ${urlError}`;
      if (errorDetails) {
        errorMessage += `\nDetails: ${errorDetails}`;
      }
      setError(errorMessage);
      console.error(errorMessage);
    }
  }, [searchParams]);

  const initiateGoogleLogin = () => {
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!googleClientId) {
      console.error('Google Client ID is not defined');
      setError('Google login configuration is missing');
      return;
    }

    const redirectUri = encodeURIComponent(`${window.location.origin}/api/auth/google-redirect`);
    const scope = encodeURIComponent('email profile');
    const responseType = 'token';
    
    const authUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${googleClientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=${responseType}`;
    
    const popup = window.open(authUrl, 'googleLogin', 'width=500,height=600');
    
    const checkPopup = setInterval(() => {
      if (popup?.closed) {
        clearInterval(checkPopup);
        console.log('Google login popup closed');
      }
    }, 500);

    window.addEventListener('message', async (event) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === 'GOOGLE_LOGIN_SUCCESS' && event.data?.token) {
        try {
          const success = await loginWithGoogle(event.data.token);
          if (success) {
            router.push('/');
          } else {
            setError('Google login failed. Please try again.');
          }
        } catch (err) {
          console.error('Google login error:', err);
          setError('An error occurred during Google login');
        }
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    console.log('🚀 Login form submitted');
    
    setIsLoading(true);
    console.log('🔐 Starting login process...');
    
    // Add a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.log('⏰ Login timeout after 10 seconds');
      setIsLoading(false);
      setError('Login request timed out. Please try again.');
    }, 10000);
    
    try {
      console.log('📞 Calling login API...');
      const success = await login(username, password);
      console.log('📈 Login API result:', success);
      
      clearTimeout(timeoutId);
      
      if (success) {
        console.log('✅ Login successful, redirecting...');
        // Add a small delay to ensure state is updated
        setTimeout(() => {
          window.location.href = '/';
        }, 100);
      } else {
        console.log('❌ Login failed - invalid credentials');
        setError('Invalid email or password');
        setIsLoading(false);
      }
    } catch (err) {
      console.error('💥 Login error:', err);
      clearTimeout(timeoutId);
      setError('An error occurred during login. Please check your connection.');
      setIsLoading(false);
    }
  };

  if (!isClient) {
    return null; // Return null on server-side to avoid hydration mismatch
  }

  return (
    <>
      <div className="min-h-screen flex">
        {/* Left side */}
        <div className="hidden md:flex w-1/2 bg-[#162447] flex-col items-center justify-center text-white p-12 relative">
          <div className="flex flex-col items-center z-10">
            <div className="bg-white rounded-2xl p-6 mb-8 shadow-lg">
              <Image src="/background.svg" alt="Welcome" width={220} height={180} />
            </div>
            <h2 className="text-3xl font-bold mb-2">Synsere AI - Text to Speech</h2>
            <p className="text-base text-center opacity-80">Ứng dụng tạo audio từ văn bản</p>
          </div>
          {/* Hexagon background effect */}
          <div className="absolute inset-0 z-0">
            <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-2xl rotate-12" />
            <div className="absolute bottom-10 right-10 w-24 h-24 bg-white/10 rounded-2xl -rotate-12" />
          </div>
        </div>
        {/* Right side */}
        <div className="flex w-full md:w-1/2 items-center justify-center bg-white">
          <div className="max-w-md w-full space-y-8 p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Login To Continue</h2>
            
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <span className="block sm:inline whitespace-pre-wrap">{error}</span>
              </div>
            )}
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none text-black placeholder:text-gray-400"
                  placeholder="Enter Your Email"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <a href="#" className="text-xs text-blue-600 hover:underline">Forgot Password?</a>
              </div>
              <input
                type="password"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none text-black placeholder:text-gray-400"
                placeholder="Enter Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={isLoading}
              />
              <button
                type="submit"
                className={`w-full py-2 px-4 bg-black hover:bg-gray-900 text-white font-semibold rounded-md shadow focus:outline-none focus:ring-2 focus:ring-black ${
                  isLoading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
                disabled={isLoading}
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </button>
              <div className="flex items-center my-2">
                <div className="flex-grow border-t border-gray-300" />
                <span className="mx-2 text-gray-400 text-xs">OR</span>
                <div className="flex-grow border-t border-gray-300" />
              </div>
              <div className="flex flex-col gap-3">
                <a 
                  href={googleLoginUrl}
                  className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold rounded-md shadow focus:outline-none focus:ring-2 focus:ring-gray-200"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Sign in with Google
                </a>
                <a 
                  href="/register" 
                  className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-md shadow focus:outline-none focus:ring-2 focus:ring-indigo-400 text-center"
                >
                  Register New Account
                </a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
} 