'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import Header from '@/components/Header';

interface UserData {
  id: string;
  email: string;
  name: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { darkMode } = useTheme();
  const { language, translations } = useLanguage();
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editableName, setEditableName] = useState('');
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
        const response = await fetch('http://localhost:8000/api/auth/user', {
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
        setEditableName(data.name);
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
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    if (!editableName.trim()) {
      setError('Name cannot be empty');
      return;
    }
    
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        router.push('/login');
        return;
      }
      
      const response = await fetch(`http://localhost:8000/api/auth/update-profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: editableName
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
      
      const data = await response.json();
      setUserData(data);
      setSuccess('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile. Please try again.');
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
            {language === 'en' ? 'User Profile' : 'Hồ sơ người dùng'}
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
              <div className={`bg-opacity-10 rounded-lg p-6 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <h2 className="text-xl font-semibold mb-4">
                  {language === 'en' ? 'Personal Information' : 'Thông tin cá nhân'}
                </h2>
                
                {isEditing ? (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        {language === 'en' ? 'Full Name' : 'Họ và tên'}
                      </label>
                      <input
                        type="text"
                        value={editableName}
                        onChange={(e) => setEditableName(e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        placeholder={language === 'en' ? 'Enter your name' : 'Nhập tên của bạn'}
                      />
                    </div>
                    
                    <div className="flex space-x-3">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        {language === 'en' ? 'Save Changes' : 'Lưu thay đổi'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(false);
                          setEditableName(userData?.name || '');
                        }}
                        className={`px-4 py-2 rounded-md ${
                          darkMode 
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {language === 'en' ? 'Cancel' : 'Hủy'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {language === 'en' ? 'Full Name' : 'Họ và tên'}
                        </p>
                        <p className="font-medium">{userData?.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {language === 'en' ? 'Email Address' : 'Địa chỉ email'}
                        </p>
                        <p className="font-medium">{userData?.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {language === 'en' ? 'User ID' : 'ID người dùng'}
                        </p>
                        <p className="font-medium">{userData?.id}</p>
                      </div>
                      
                      <button
                        onClick={() => setIsEditing(true)}
                        className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        {language === 'en' ? 'Edit Profile' : 'Chỉnh sửa hồ sơ'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            <div>
              <div className={`bg-opacity-10 rounded-lg p-6 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <h2 className="text-xl font-semibold mb-4">
                  {language === 'en' ? 'Account Information' : 'Thông tin tài khoản'}
                </h2>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {language === 'en' ? 'Account Type' : 'Loại tài khoản'}
                    </p>
                    <p className="font-medium">
                      {language === 'en' ? 'Standard User' : 'Người dùng tiêu chuẩn'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {language === 'en' ? 'Status' : 'Trạng thái'}
                    </p>
                    <p className="font-medium">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {language === 'en' ? 'Active' : 'Hoạt động'}
                      </span>
                    </p>
                  </div>
                  
                  <a 
                    href="/settings" 
                    className="mt-4 block text-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {language === 'en' ? 'Account Settings' : 'Cài đặt tài khoản'}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 