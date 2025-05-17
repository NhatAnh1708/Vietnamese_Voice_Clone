'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

function generateCaptcha() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [captcha, setCaptcha] = useState(generateCaptcha());
  const [captchaInput, setCaptchaInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // If already authenticated, redirect to home
    const token = localStorage.getItem('auth_token');
    if (token) {
      router.push('/');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validate captcha
    if (captchaInput !== captcha) {
      setError('Captcha is incorrect');
      setCaptcha(generateCaptcha());
      setCaptchaInput('');
      return;
    }
    
    // Validate password match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    // Validate password strength
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Connect to the FastAPI backend for registration
      const response = await fetch("http://localhost:8000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          name,
          password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Registration failed");
      }

      // Registration successful
      setRegistrationSuccess(true);
      
      // Reset form
      setEmail('');
      setName('');
      setPassword('');
      setConfirmPassword('');
      setCaptchaInput('');
      setCaptcha(generateCaptcha());
      
      // Automatically navigate to login after 3 seconds
      setTimeout(() => {
        router.push('/login');
      }, 3000);
      
    } catch (err) {
      console.error('Registration error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during registration');
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
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Create an Account</h2>
          
          {registrationSuccess && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
              <strong className="font-bold">Success! </strong>
              <span className="block sm:inline">Your account has been created successfully.</span>
              <p>Redirecting to login page...</p>
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
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={isLoading || registrationSuccess}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none text-black placeholder:text-gray-400"
                placeholder="Enter Your Full Name"
                value={name}
                onChange={e => setName(e.target.value)}
                disabled={isLoading || registrationSuccess}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none text-black placeholder:text-gray-400"
                placeholder="Create Password (min 8 characters)"
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={isLoading || registrationSuccess}
                minLength={8}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input
                type="password"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none text-black placeholder:text-gray-400"
                placeholder="Confirm Your Password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                disabled={isLoading || registrationSuccess}
              />
            </div>
            
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
                  disabled={isLoading || registrationSuccess}
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
                disabled={isLoading || registrationSuccess}
              />
            </div>
            
            {error && <div className="text-red-500 text-sm text-center">{error}</div>}
            
            <button
              type="submit"
              className={`w-full py-2 px-4 bg-black hover:bg-gray-900 text-white font-semibold rounded-md shadow focus:outline-none focus:ring-2 focus:ring-black ${
                (isLoading || registrationSuccess) ? 'opacity-70 cursor-not-allowed' : ''
              }`}
              disabled={isLoading || registrationSuccess}
            >
              {isLoading ? 'Creating Account...' : 'Register'}
            </button>
            
            <div className="flex items-center my-2">
              <div className="flex-grow border-t border-gray-300" />
              <span className="mx-2 text-gray-400 text-xs">OR</span>
              <div className="flex-grow border-t border-gray-300" />
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-600">Already have an account?</p>
              <a 
                href="/login" 
                className="block w-full mt-2 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-md shadow focus:outline-none focus:ring-2 focus:ring-indigo-400 text-center"
              >
                Login
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 