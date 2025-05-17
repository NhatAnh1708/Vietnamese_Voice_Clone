'use client';
import { 
  MicrophoneIcon, 
  ClockIcon, 
  PlusIcon,
  DocumentTextIcon,
  SunIcon, 
  MoonIcon
} from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function LeftNav() {
  const [activeTab, setActiveTab] = useState('voices');
  const { darkMode, toggleDarkMode } = useTheme();
  const { language, toggleLanguage, translations } = useLanguage();
  const pathname = usePathname();

  // Set active tab based on pathname
  useEffect(() => {
    if (pathname === '/') {
      setActiveTab('voices');
    } else if (pathname === '/history') {
      setActiveTab('history');
    } else if (pathname === '/documents') {
      setActiveTab('documents');
    }
  }, [pathname]);

  return (
    <nav className={`w-64 border-r p-4 flex flex-col h-full ${darkMode ? 'bg-gray-900 text-white border-gray-700' : 'bg-white text-gray-800 border-gray-200'}`}>
      {/* Main Content */}
      <div className="flex-1">
        {/* Navigation Tabs */}
        <div className="space-y-1 mb-6">
          <Link href="/"
            className={`flex items-center w-full p-2 rounded-md ${activeTab === 'voices' ? (darkMode ? 'bg-gray-700' : 'bg-gray-100') : (darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50')}`}
          >
            <MicrophoneIcon className={`h-5 w-5 mr-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
            <span className="text-sm">{translations.voices}</span>
          </Link>
          
          <Link href="/history"
            className={`flex items-center w-full p-2 rounded-md ${activeTab === 'history' ? (darkMode ? 'bg-gray-700' : 'bg-gray-100') : (darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50')}`}
          >
            <ClockIcon className={`h-5 w-5 mr-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
            <span className="text-sm">{translations.history}</span>
          </Link>

          <button
            onClick={() => setActiveTab('documents')}
            className={`flex items-center w-full p-2 rounded-md ${activeTab === 'documents' ? (darkMode ? 'bg-gray-700' : 'bg-gray-100') : (darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50')}`}
          >
            <DocumentTextIcon className={`h-5 w-5 mr-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
            <span className="text-sm">{translations.documents}</span>
          </button>
        </div>
        
        {/* Tab Content */}
        {activeTab === 'voices' && (
          <div className={`border-t pt-4 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <button className={`flex items-center justify-center w-full py-2 px-3 border border-dashed rounded-md text-sm ${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-800' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
              <PlusIcon className="h-4 w-4 mr-2" />
              {translations.addVoice}
            </button>
            <p className={`mt-2 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {translations.recordOrUpload}
            </p>
          </div>
        )}
        
        {activeTab === 'history' && pathname !== '/history' && (
          <div className={`border-t pt-4 text-sm ${darkMode ? 'border-gray-700 text-gray-400' : 'border-gray-200 text-gray-500'}`}>
            {translations.historyAppearHere}
          </div>
        )}

        {activeTab === 'documents' && (
          <div className={`border-t pt-4 text-sm ${darkMode ? 'border-gray-700 text-gray-400' : 'border-gray-200 text-gray-500'}`}>
            {translations.documentsAppearHere}
          </div>
        )}
      </div>

      {/* Settings Footer */}
      <div className={`mt-auto pt-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center">
          {/* Dark/Light Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            aria-label="Toggle dark mode"
          >
            {darkMode ? (
              <SunIcon className="h-5 w-5 text-yellow-400" />
            ) : (
              <MoonIcon className="h-5 w-5 text-gray-600" />
            )}
          </button>

          {/* Language Toggle Component - Adjusted text positions */}
          <div 
            onClick={toggleLanguage}
            className={`relative flex items-center w-16 h-8 ml-3 rounded-full cursor-pointer transition-colors duration-300 ${
              darkMode ? 'bg-gray-700' : 'bg-gray-200'
            }`}
            aria-label="Toggle language"
          >
            {/* Sliding Circle with Flag */}
            <div 
              className={`absolute w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-300 ${
                language === "en" ? "transform translate-x-0" : "transform translate-x-8"
              } ${darkMode ? 'bg-gray-800 shadow' : 'bg-white shadow'}`}
            >
              {language === "en" ? (
                // Improved UK Flag circular version
                <div className="w-6 h-6 rounded-full border border-gray-200 shadow-sm overflow-hidden relative bg-blue-800">
                  {/* Base blue background */}
                  <div className="absolute inset-0 bg-blue-800"></div>
                  
                  {/* White cross (St. George's Cross) */}
                  <div className="absolute inset-0">
                    <div className="absolute left-0 right-0 top-1/2 h-1 bg-white transform -translate-y-1/2"></div>
                    <div className="absolute top-0 bottom-0 left-1/2 w-1 bg-white transform -translate-x-1/2"></div>
                  </div>
                  
                  {/* Red cross (St. George's Cross) */}
                  <div className="absolute inset-0">
                    <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-red-600 transform -translate-y-1/2"></div>
                    <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-red-600 transform -translate-x-1/2"></div>
                  </div>
                  
                  {/* White diagonal (St. Patrick's Cross + St. Andrew's Cross) */}
                  <div className="absolute w-8 h-0.5 bg-white origin-center transform rotate-45 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"></div>
                  <div className="absolute w-8 h-0.5 bg-white origin-center transform -rotate-45 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"></div>
                  
                  {/* Red diagonal (St. Patrick's Cross) */}
                  <div className="absolute w-6 h-0.5 bg-red-600 origin-center transform rotate-45 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"></div>
                  <div className="absolute w-6 h-0.5 bg-red-600 origin-center transform -rotate-45 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"></div>
                </div>
              ) : (
                // Vietnam Flag circular version
                <div className="w-6 h-6 rounded-full overflow-hidden border border-gray-200 shadow-sm flex items-center justify-center bg-red-600">
                  <div className="text-yellow-400 text-lg" style={{ lineHeight: 0, marginTop: '-1px' }}>★</div>
                </div>
              )}
            </div>
            {/* Text Labels - Adjusted positions to be closer to the flag */}
            <span
              className={`absolute left-3 text-xs font-bold transition-opacity duration-300 ${
                language === "vi" ? "opacity-100" : "opacity-0"
              } ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}
            >
              VI
            </span>
            <span
              className={`absolute right-3 text-xs font-bold transition-opacity duration-300 ${
                language === "en" ? "opacity-100" : "opacity-0"
              } ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}
            >
              EN
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
}