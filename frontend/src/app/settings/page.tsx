'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { getApiUrl, API_ENDPOINTS } from '@/utils/api';
import { useLanguage } from '@/context/LanguageContext';
import Header from '@/components/Header';

interface UserData {
  id: string;
  email: string;
  name: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const { darkMode, toggleTheme } = useTheme();
  const { language, changeLanguage, translations } = useLanguage();
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  useEffect(() => {
    // Check authentication status
    const token = localStorage.getItem('auth_token');
    if (!token) {
      router.push('/login');
      return;
    }
    
    setIsAuthenticated(true);
    
    // Fetch user data
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(getApiUrl(API_ENDPOINTS.user), {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          if (response.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('auth_token');
            router.push('/login');
            return;
          }
          throw new Error('Failed to fetch user data');
        }
        
        const data = await response.json();
        setUserData(data);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Failed to load profile data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, [router]);
  
  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    router.push('/login');
  };
  
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    // Validate passwords
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('All password fields are required');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long');
      return;
    }
    
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        router.push('/login');
        return;
      }
      
      const response = await fetch(getApiUrl(API_ENDPOINTS.changePassword), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword
        })
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Failed to change password');
      }
      
      setSuccess('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      console.error('Error changing password:', error);
      setError(error.message || 'Failed to change password. Please try again.');
    }
  };
  
  if (!isAuthenticated || isLoading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'}`}>
        <Header 
          isSmallScreen={false} 
          onToggleLeftNav={() => {}} 
          showMobileLeftNav={false}
          isAuthenticated={isAuthenticated}
          onLogout={handleLogout}
        />
        <div className="flex justify-center items-center h-[calc(100vh-64px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'}`}>
      <Header 
        isSmallScreen={false} 
        onToggleLeftNav={() => {}} 
        showMobileLeftNav={false}
        isAuthenticated={isAuthenticated}
        onLogout={handleLogout}
      />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className={`rounded-lg shadow-lg p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h1 className="text-2xl font-bold mb-6">
            {language === 'en' ? 'Account Settings' : 'Cài đặt tài khoản'}
          </h1>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
              <span className="block sm:inline">{success}</span>
            </div>
          )}
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              {/* Password Change Section */}
              <div className={`bg-opacity-10 rounded-lg p-6 mb-6 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <h2 className="text-xl font-semibold mb-4">
                  {language === 'en' ? 'Change Password' : 'Đổi mật khẩu'}
                </h2>
                
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      {language === 'en' ? 'Current Password' : 'Mật khẩu hiện tại'}
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder={language === 'en' ? 'Enter current password' : 'Nhập mật khẩu hiện tại'}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      {language === 'en' ? 'New Password' : 'Mật khẩu mới'}
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder={language === 'en' ? 'Enter new password' : 'Nhập mật khẩu mới'}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      {language === 'en' ? 'Confirm New Password' : 'Xác nhận mật khẩu mới'}
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder={language === 'en' ? 'Confirm new password' : 'Xác nhận mật khẩu mới'}
                    />
                  </div>
                  
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#111827] text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-[#111827] transition-colors duration-200"
                  >
                    {language === 'en' ? 'Change Password' : 'Đổi mật khẩu'}
                  </button>
                </form>
              </div>
            </div>
            
            <div>
              {/* App Settings */}
              <div className={`bg-opacity-10 rounded-lg p-6 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <h2 className="text-xl font-semibold mb-4">
                  {language === 'en' ? 'Application Settings' : 'Cài đặt ứng dụng'}
                </h2>
                
                <div className="space-y-6">
                  {/* Theme Selection */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {language === 'en' ? 'Theme' : 'Giao diện'}
                    </label>
                    <div className="flex flex-col space-y-2">
                      <button
                        onClick={toggleTheme}
                        className={`w-full px-4 py-3 rounded-md transition-colors duration-200 text-center font-medium ${
                          darkMode 
                            ? 'bg-[#111827] text-white hover:bg-gray-700 active:bg-gray-700' 
                            : 'bg-gray-200 text-gray-800 hover:bg-[#111827] hover:text-white active:bg-[#111827] active:text-white'
                        }`}
                      >
                        {darkMode 
                          ? (language === 'en' ? 'Dark Mode' : 'Chế độ tối') 
                          : (language === 'en' ? 'Light Mode' : 'Chế độ sáng')}
                      </button>
                      <span className="text-xs text-gray-500 text-center">
                        {language === 'en' 
                          ? 'Click to toggle light/dark mode' 
                          : 'Nhấn để chuyển đổi chế độ sáng/tối'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Language Selection */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {language === 'en' ? 'Language' : 'Ngôn ngữ'}
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => changeLanguage('en')}
                        className={`px-4 py-3 rounded-md transition-colors duration-200 text-center font-medium ${
                          language === 'en' 
                            ? 'bg-[#111827] text-white hover:bg-gray-700 active:bg-gray-700' 
                            : 'bg-gray-200 text-gray-800 hover:bg-[#111827] hover:text-white active:bg-[#111827] active:text-white'
                        }`}
                      >
                        English
                      </button>
                      <button
                        onClick={() => changeLanguage('vi')}
                        className={`px-4 py-3 rounded-md transition-colors duration-200 text-center font-medium ${
                          language === 'vi' 
                            ? 'bg-[#111827] text-white hover:bg-gray-700 active:bg-gray-700' 
                            : 'bg-gray-200 text-gray-800 hover:bg-[#111827] hover:text-white active:bg-[#111827] active:text-white'
                        }`}
                      >
                        Tiếng Việt
                      </button>
                    </div>
                  </div>
                  
                  {/* Additional Settings */}
                  <div>
                    <h3 className="font-medium mb-2">
                      {language === 'en' ? 'Account Security' : 'Bảo mật tài khoản'}
                    </h3>
                    <a 
                      href="/profile" 
                      className="block text-center px-4 py-2 bg-[#111827] text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-[#111827] transition-colors duration-200"
                    >
                      {language === 'en' ? 'Back to Profile' : 'Quay lại hồ sơ'}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}