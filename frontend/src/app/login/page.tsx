'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';

function generateCaptcha() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [captcha, setCaptcha] = useState(generateCaptcha());
  const [captchaInput, setCaptchaInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (captchaInput !== captcha) {
      setError('Captcha is incorrect');
      setCaptcha(generateCaptcha());
      setCaptchaInput('');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Connect to the FastAPI backend for authentication
      const response = await fetch("http://localhost:8000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          username: username, // Backend expects 'username' for email
          password: password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Login failed");
      }

      const data = await response.json();
      
      // Store token in localStorage
      localStorage.setItem('auth_token', data.access_token);
      
      // Redirect to home page
      router.push('/');
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during login');
      setCaptcha(generateCaptcha());
      setCaptchaInput('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
            <div className="flex items-center gap-3">
              <div className="flex-1 flex items-center gap-2">
                <input
                  type="text"
                  value={captcha}
                  readOnly
                  className="w-28 px-2 py-2 border border-gray-300 rounded-md bg-gray-100 text-center font-mono text-lg tracking-widest select-none text-black"
                />
                <button 
                  type="button" 
                  onClick={() => setCaptcha(generateCaptcha())} 
                  className="p-2 rounded bg-black text-white hover:bg-gray-900" 
                  title="Refresh Captcha"
                  disabled={isLoading}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582M20 20v-5h-.581M5.423 19A9 9 0 106.6 6.6l1.4 1.4" /></svg>
                </button>
              </div>
              <input
                type="text"
                required
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none text-black placeholder:text-gray-400"
                placeholder="Enter Captcha"
                value={captchaInput}
                onChange={e => setCaptchaInput(e.target.value.toUpperCase())}
                maxLength={6}
                disabled={isLoading}
              />
            </div>
            {error && <div className="text-red-500 text-sm text-center">{error}</div>}
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
            <div className="flex gap-3">
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
  );
} 