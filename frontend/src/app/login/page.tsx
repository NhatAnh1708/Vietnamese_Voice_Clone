'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';
import { signIn } from "next-auth/react";

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
    try {
      const success = await login(username, password);
      if (success) {
        router.push('/');
      } else {
        setError('Invalid username or password');
        setCaptcha(generateCaptcha());
        setCaptchaInput('');
      }
    } catch (err) {
      setError('An error occurred during login');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side */}
      <div className="hidden md:flex w-1/2 bg-[#162447] flex-col items-center justify-center text-white p-12 relative">
        <div className="flex flex-col items-center z-10">
          <div className="bg-white rounded-2xl p-6 mb-8 shadow-lg">
            <img src="/background.svg" alt="Welcome" width={220} height={180} />
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Username or Email</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none text-black placeholder:text-gray-400"
                placeholder="Enter Your Username or Email"
                value={username}
                onChange={e => setUsername(e.target.value)}
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
            />
            <div className="flex items-center gap-3">
              <div className="flex-1 flex items-center gap-2">
                <input
                  type="text"
                  value={captcha}
                  readOnly
                  className="w-28 px-2 py-2 border border-gray-300 rounded-md bg-gray-100 text-center font-mono text-lg tracking-widest select-none text-black"
                />
                <button type="button" onClick={() => setCaptcha(generateCaptcha())} className="p-2 rounded bg-black text-white hover:bg-gray-900" title="Refresh Captcha">
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
              />
            </div>
            {error && <div className="text-red-500 text-sm text-center">{error}</div>}
            <button
              type="submit"
              className="w-full py-2 px-4 bg-black hover:bg-gray-900 text-white font-semibold rounded-md shadow focus:outline-none focus:ring-2 focus:ring-black"
            >
              Login
            </button>
            <div className="flex items-center my-2">
              <div className="flex-grow border-t border-gray-300" />
              <span className="mx-2 text-gray-400 text-xs">OR</span>
              <div className="flex-grow border-t border-gray-300" />
            </div>
            <div className="flex gap-3">
              <button type="button" className="flex-1 flex items-center justify-center gap-2 border border-gray-900 rounded-md py-2 bg-black text-white hover:bg-gray-900 disabled:bg-gray-300 disabled:text-white" disabled>
                <span className="bg-gray-100 rounded p-1"><svg width="20" height="20" viewBox="0 0 48 48"><path fill="#F35325" d="M4 36V12l17 12z"/><path fill="#81BC06" d="M4 12l17 12 7-7.5L44 14V4H4z"/><path fill="#05A6F0" d="M4 36l17-12 7 7.5L44 34v10H4z"/><path fill="#FFBA08" d="M44 14l-16 10 16 10z"/></svg></span>
                <span className="text-sm">Login Via Microsoft</span>
              </button>
              <button
                type="button"
                onClick={() => signIn("google")}
                className="flex-1 flex items-center justify-center gap-2 border border-gray-900 rounded-md py-2 bg-black text-white hover:bg-gray-900"
              >
                <span className="bg-gray-100 rounded p-1"> {/* Google SVG icon */} </span>
                <span className="text-sm">Login Via Google</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export const config = {
  matcher: [
    // Match tất cả trừ các thư mục/file tĩnh phổ biến
    "/((?!api|_next/static|_next/image|favicon.ico|images/|.*\\.svg$|.*\\.jpg$|.*\\.jpeg$|.*\\.png$|.*\\.gif$|.*\\.webp$|.*\\.ico$|.*\\.txt$|.*\\.xml$).*)",
  ],
}; 