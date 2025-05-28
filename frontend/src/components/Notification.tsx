"use client";
import { useEffect, useState } from 'react';
import { CheckCircleIcon, XCircleIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { useTheme } from '@/context/ThemeContext';

interface NotificationProps {
  type: 'success' | 'error';
  title: string;
  message: string;
  show: boolean;
  onClose: () => void;
}

export default function Notification({ type, title, message, show, onClose }: NotificationProps) {
  const { darkMode } = useTheme();
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      setProgress(100);
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose();
      }, 5000);

      const progressTimer = setInterval(() => {
        setProgress(prev => Math.max(0, prev - 2));
      }, 100);

      return () => {
        clearTimeout(timer);
        clearInterval(progressTimer);
      };
    }
  }, [show, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-fade-in">
      <div className={`rounded-lg shadow-lg overflow-hidden ${
        darkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className="p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {type === 'success' ? (
                <CheckCircleIcon className="h-5 w-5 text-green-500" />
              ) : (
                <XCircleIcon className="h-5 w-5 text-red-500" />
              )}
            </div>
            <div className="ml-3 w-0 flex-1">
              <p className={`text-sm font-medium ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {title}
              </p>
              <p className={`mt-1 text-sm ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {message}
              </p>
            </div>
            <div className="ml-4 flex-shrink-0 flex">
              <button
                className={`inline-flex rounded-md focus:outline-none ${
                  darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-600'
                }`}
                onClick={() => {
                  setIsVisible(false);
                  onClose();
                }}
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
        {/* Progress bar */}
        <div className={`h-1 w-full ${
          darkMode 
            ? type === 'success' 
              ? 'bg-green-700' 
              : 'bg-red-700'
            : type === 'success' 
              ? 'bg-green-200' 
              : 'bg-red-200'
        }`}>
          <div 
            className={`h-full transition-all duration-100 ${
              darkMode 
                ? type === 'success' 
                  ? 'bg-green-500' 
                  : 'bg-red-500'
                : type === 'success' 
                  ? 'bg-green-400' 
                  : 'bg-red-400'
            }`}
            style={{ 
              width: `${progress}%`
            }}
          />
        </div>
      </div>
    </div>
  );
} 