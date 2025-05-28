'use client';
import { 
  MicrophoneIcon, 
  ClockIcon, 
  PlusIcon,
  DocumentTextIcon,
  SunIcon, 
  MoonIcon
} from '@heroicons/react/24/outline';
import { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { getApiUrl, API_ENDPOINTS } from '@/utils/api';
import { useLanguage } from '@/context/LanguageContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useNotification } from '@/context/NotificationContext';

export default function LeftNav() {
  const [activeTab, setActiveTab] = useState('voices');
  const { darkMode, toggleDarkMode } = useTheme();
  const { language, toggleLanguage, translations } = useLanguage();
  const pathname = usePathname();
  const { addNotification } = useNotification();
  
  // Add voice upload functionality
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedVoiceFile, setUploadedVoiceFile] = useState<string | null>(null);
  
  // Check for existing uploaded voice on component mount
  useEffect(() => {
    const savedVoiceFileName = localStorage.getItem('voice_file_name');
    if (savedVoiceFileName) {
      setUploadedVoiceFile(savedVoiceFileName);
    }
  }, []);
  
  // Function to trigger file input click
  const triggerFileInput = () => {
    console.log('triggerFileInput called!');
    fileInputRef.current?.click();
  };
  
  // Function to remove uploaded voice
  const removeUploadedVoice = () => {
    console.log('removeUploadedVoice called in LeftNav');
    setUploadedVoiceFile(null);
    localStorage.removeItem('voice_path');
    localStorage.removeItem('voice_file_name');
    
    // Trigger custom event to update main component
    window.dispatchEvent(new CustomEvent('voiceRemoved'));
    console.log('Voice removed from LeftNav and event dispatched');
  };
  
  // Function to handle voice file upload
  const handleVoiceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('handleVoiceUpload called!');
    const file = e.target.files?.[0];
    console.log('Selected file:', file);
    if (!file) return;
    
    // Check if file is mp3
    if (!file.type.includes('audio/mpeg')) {
      console.log('File type error:', file.type);
      addNotification('error', translations.fileTypeError || 'File Type Error', translations.onlyMP3Allowed || 'Only MP3 files are allowed');
      return;
    }
    
    console.log('File type check passed, creating FormData...');
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      // Get auth token from localStorage
      const authToken = localStorage.getItem('auth_token');
      console.log('Auth token:', authToken ? 'found' : 'not found');
      if (!authToken) {
        addNotification('error', translations.authError || 'Authentication Error', translations.loginRequired || 'Please log in');
        return;
      }
      
      console.log('Sending upload request...');
      const response = await fetch(getApiUrl(API_ENDPOINTS.uploadVoice), {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${authToken}`
        },
        body: formData,
      });
      console.log('Fetch completed, response received');
      
      console.log('Upload response status:', response.status);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: "Unknown error" }));
        const errorMessage = errorData.detail || "Error uploading voice file";
        console.log('Upload error:', errorMessage);
        addNotification('error', translations.uploadError || 'Upload Error', errorMessage);
        throw new Error("Error uploading voice file");
      }
      
      const data = await response.json();
      console.log("Voice upload response:", data);
      
      if (data.file_path) {
        console.log('Upload successful! File path:', data.file_path);
        addNotification('success', translations.uploadSuccess || 'Upload Success', translations.voiceFileUploaded || 'Voice file uploaded successfully');
        // Store the voice path in localStorage for use when generating speech
        localStorage.setItem('voice_path', data.file_path);
        localStorage.setItem('voice_file_name', file.name);
        
        // Update local state
        console.log('Setting uploaded voice file:', file.name);
        setUploadedVoiceFile(file.name);
        
        // Trigger custom event to update main component
        console.log('Triggering voiceUploaded event with:', {
          voicePath: data.file_path,
          voiceFileName: file.name
        });
        window.dispatchEvent(new CustomEvent('voiceUploaded', {
          detail: {
            voicePath: data.file_path,
            voiceFileName: file.name
          }
        }));
      }
    } catch (error) {
      console.error("Error uploading voice file:", error);
      console.log("Error details:", {
        message: error instanceof Error ? error.message : "Unknown error",
        type: error instanceof TypeError ? "Network/CORS error" : "Other error"
      });
      addNotification('error', translations.uploadError || 'Upload Error', error instanceof Error ? error.message : "Unknown error");
    } finally {
      console.log('Upload process finished, resetting file input...');
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

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
            onClick={() => setActiveTab('voices')}
            className={`flex items-center w-full p-2 rounded-md ${activeTab === 'voices' ? (darkMode ? 'bg-gray-700' : 'bg-gray-100') : (darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50')}`}
          >
            <MicrophoneIcon className={`h-5 w-5 mr-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
            <span className="text-sm">{translations.voices}</span>
          </Link>
          
          <Link href="/history"
            onClick={() => setActiveTab('history')}
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
            {/* Hidden file input for voice upload */}
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleVoiceUpload}
              accept=".mp3"
              className="hidden"
            />
            
            {uploadedVoiceFile ? (
              /* Show uploaded voice with remove option */
              <div className={`flex items-center justify-between w-full py-2 px-3 border rounded-md text-sm ${
                darkMode ? 'border-gray-600 bg-gray-800' : 'border-gray-300 bg-gray-50'
              }`}>
                <div className="flex items-center min-w-0 flex-1">
                  <div className={`w-2 h-2 rounded-full mr-2 flex-shrink-0 ${
                    darkMode ? 'bg-green-400' : 'bg-green-500'
                  }`}></div>
                  <span className={`truncate ${
                    darkMode ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    {uploadedVoiceFile}
                  </span>
                </div>
                <button
                  onClick={removeUploadedVoice}
                  className={`ml-2 p-1 rounded-full flex-shrink-0 ${
                    darkMode 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  <PlusIcon className="h-3 w-3 transform rotate-45" />
                </button>
              </div>
            ) : (
              /* Show add voice button */
              <button 
                onClick={triggerFileInput}
                className={`flex items-center justify-center w-full py-2 px-3 border border-dashed rounded-md text-sm ${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-800' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                {translations.addVoice}
              </button>
            )}
            
            <p className={`mt-2 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {uploadedVoiceFile 
                ? (translations.voiceUploaded || "Voice uploaded successfully")
                : (translations.recordOrUpload || "Record your voice or upload files")
              }
            </p>
          </div>
        )}
        
        {activeTab === 'history' && pathname !== '/history' && (
          <div className={`border-t pt-4 text-sm ${darkMode ? 'border-gray-700 text-gray-400' : 'border-gray-200 text-gray-500'}`}>
            {translations.historyAppearHere}
          </div>
        )}

        {activeTab === 'documents' && (
          <div className={`border-t pt-4 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <h3 className={`font-medium mb-3 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {language === 'vi' ? 'Hướng dẫn Voice Clone' : 'Voice Clone Guide'}
              </h3>
              
              <div className="space-y-3">
                <div>
                  <h4 className={`font-medium text-xs mb-1 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    {language === 'vi' ? '1. Tải lên file audio:' : '1. Upload audio file:'}
                  </h4>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {language === 'vi' 
                      ? 'Nhấn "Thêm giọng nói" và chọn file MP3 chất lượng cao (ít nhất 30 giây).' 
                      : 'Click "Add Voice" and select a high-quality MP3 file (at least 30 seconds).'}
                  </p>
                </div>
                
                <div>
                  <h4 className={`font-medium text-xs mb-1 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    {language === 'vi' ? '2. Tạo giọng nói:' : '2. Generate speech:'}
                  </h4>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {language === 'vi' 
                      ? 'Nhập văn bản và nhấn "Tạo giọng nói". Hệ thống sẽ sử dụng giọng bạn đã tải lên.' 
                      : 'Enter text and click "Generate Speech". The system will use your uploaded voice.'}
                  </p>
                </div>
                
                <div>
                  <h4 className={`font-medium text-xs mb-1 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    {language === 'vi' ? '3. Lưu ý:' : '3. Notes:'}
                  </h4>
                  <ul className={`text-xs space-y-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    <li>
                      {language === 'vi' 
                        ? '• File âm thanh rõ ràng, không nhiễu' 
                        : '• Clear audio file without noise'}
                    </li>
                    <li>
                      {language === 'vi' 
                        ? '• Độ dài 30 giây - 2 phút là tối ưu' 
                        : '• 30 seconds - 2 minutes length is optimal'}
                    </li>
                    <li>
                      {language === 'vi' 
                        ? '• Chỉ hỗ trợ định dạng MP3' 
                        : '• Only MP3 format supported'}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
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