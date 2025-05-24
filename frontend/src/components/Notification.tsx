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
  
  // Auto-close notification after 5 seconds
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);
  
  if (!show) return null;
  
  return (
    <div className="fixed top-6 right-6 z-50 animate-fade-in">
      <div 
        className={`max-w-sm rounded-lg shadow-lg border ${
          darkMode 
            ? type === 'success' 
              ? 'bg-gray-800 border-green-700' 
              : 'bg-gray-800 border-red-700'
            : type === 'success' 
              ? 'bg-white border-green-200' 
              : 'bg-white border-red-200'
        }`}
      >
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
                onClick={onClose}
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 