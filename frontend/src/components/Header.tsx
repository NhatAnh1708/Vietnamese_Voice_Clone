'use client';
import { BellIcon, ChevronDownIcon, UserCircleIcon, Bars3Icon } from '@heroicons/react/24/outline';
import { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import Link from 'next/link';

interface HeaderProps {
  isSmallScreen: boolean;
  onToggleLeftNav: () => void;
  showMobileLeftNav: boolean;
  isAuthenticated?: boolean;
  onLogout?: () => void;
}

interface UserData {
  id: string;
  email: string;
  name: string;
}

export default function Header({ isSmallScreen, onToggleLeftNav, showMobileLeftNav, isAuthenticated = false, onLogout }: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { darkMode } = useTheme();
  const { translations } = useLanguage();
  const [userData, setUserData] = useState<UserData | null>(null);

  const notificationRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const notifications = [
    { id: 1, sender: 'System', message: 'Welcome to SYNSERE', read: false }
  ];

  // Fetch user data if authenticated
  useEffect(() => {
    const fetchUserData = async () => {
      if (!isAuthenticated) {
        return;
      }

      try {
        const token = localStorage.getItem('auth_token');
        if (!token) return;
        
        const response = await fetch('http://localhost:8000/api/auth/user', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setUserData(data);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [isAuthenticated]);

  // Effect for clicking outside to close dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        notificationRef.current && 
        !notificationRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
      
      if (
        profileMenuRef.current && 
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setShowProfileMenu(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [notificationRef, profileMenuRef]);

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    setShowProfileMenu(false);
  };

  // Function to get the user's initials for the avatar
  const getUserInitials = (): string => {
    if (!userData || !userData.name) return 'G';
    
    const nameParts = userData.name.split(' ');
    if (nameParts.length === 1) {
      return nameParts[0].charAt(0).toUpperCase();
    }
    
    return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
  };

  return (
    <header className={`flex items-center justify-between p-4 border-b ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
      <div className="flex items-center">
        {/* Nút hiển thị LeftNav khi màn hình < 1001px */}
        {isSmallScreen && (
          <button
            onClick={onToggleLeftNav}
            className={`mr-3 p-2 rounded-md transition-colors ${
              darkMode 
                ? 'text-gray-300 hover:bg-gray-800' 
                : 'text-gray-700 hover:bg-gray-100'
            } ${showMobileLeftNav ? 'bg-gray-700' : ''}`}
          >
            <Bars3Icon className="h-5 w-5" />
          </button>
        )}
        
        <Link href="/" className={`text-2xl font-bold transition-colors ${darkMode ? 'text-white hover:text-gray-300' : 'text-gray-800 hover:text-gray-600'}`}>
          SYNSERE
        </Link>
      </div>
      
      <div className="flex items-center">
        {isAuthenticated && (
          <>
            {/* Notification Section */}
            <div className="relative flex items-center" ref={notificationRef}>
              <button 
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowProfileMenu(false);
                }}
                className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} relative`}
                aria-label={translations.notification}
              >
                <BellIcon className={`h-6 w-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                {notifications.some(n => !n.read) && (
                  <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
                )}
              </button>

              {/* Chỉ hiển thị text khi không phải màn hình nhỏ */}
              {!isSmallScreen && (
                <span className={`text-sm font-medium ml-2 ${darkMode ? 'text-white' : 'text-gray-700'}`}>
                  {translations.notifications}
                </span>
              )}

              {showNotifications && (
                <div className={`absolute top-full mt-2 ${isSmallScreen ? 'right-0' : 'left-0'} w-72 rounded-md shadow-lg border z-10 ${
                  darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}>
                  <div className={`p-3 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      {translations.notifications}
                    </h3>
                  </div>
                  <div className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                    {notifications.map(notification => (
                      <div key={notification.id} className="p-3">
                        <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                          {notification.sender}
                        </p>
                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {notification.message}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Khoảng cách nhỏ giữa Notification và Avatar */}
            <div className="w-6"></div>
          </>
        )}

        {/* Profile Section */}
        <div className="relative" ref={profileMenuRef}>
          <button 
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            className="flex items-center focus:outline-none"
            aria-label={translations.myProfile}
          >
            {isSmallScreen ? (
              <UserCircleIcon className={`h-8 w-8 ${
                darkMode ? 'text-gray-300' : 'text-gray-600'
              }`} />
            ) : (
              <>
                {/* Avatar with user initials */}
                <div className={`h-[36px] w-[36px] rounded-full flex items-center justify-center ${
                  darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-300 text-gray-700'
                }`}>
                  <span className="text-sm font-medium">{getUserInitials()}</span>
                </div>

                <div className="w-4"></div>

                <div className="text-left">
                  <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {isAuthenticated ? userData?.name || 'Loading...' : 'Guest'}
                  </p>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {isAuthenticated ? translations.myWorkspace : 'Not logged in'}
                  </p>
                </div>

                <div className="w-8"></div>

                <ChevronDownIcon className={`h-4 w-4 transition-transform ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                } ${showProfileMenu ? 'transform rotate-180' : ''}`} />
              </>
            )}
          </button>

          {showProfileMenu && (
            <div className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg z-10 ${
              darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
            }`}>
              <div className={`py-1 ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {isAuthenticated ? (
                  <>
                    <Link 
                      href="/profile" 
                      className={`block px-4 py-2 text-sm ${
                        darkMode 
                          ? 'text-gray-300 hover:bg-gray-700' 
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      Profile
                    </Link>
                    <Link 
                      href="/settings" 
                      className={`block px-4 py-2 text-sm ${
                        darkMode 
                          ? 'text-gray-300 hover:bg-gray-700' 
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className={`block w-full text-left px-4 py-2 text-sm ${
                        darkMode 
                          ? 'text-red-400 hover:bg-gray-700' 
                          : 'text-red-600 hover:bg-gray-100'
                      }`}
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link 
                      href="/login" 
                      className={`block px-4 py-2 text-sm ${
                        darkMode 
                          ? 'text-gray-300 hover:bg-gray-700' 
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      Login
                    </Link>
                    <Link 
                      href="/register" 
                      className={`block px-4 py-2 text-sm ${
                        darkMode 
                          ? 'text-gray-300 hover:bg-gray-700' 
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      Register
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}