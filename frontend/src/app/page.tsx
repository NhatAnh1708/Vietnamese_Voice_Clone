"use client";
import { useState, useEffect, useRef } from "react";
import Header from "@/components/Header";
import LeftNav from "@/components/LeftNav";
import RightNav from "@/components/RightNav";
import StoryGenre from "@/components/StoryGenre";
import PlayerFooter from "@/components/PlayerFooter";
import GenerateControls from "@/components/GenerateControls";
import Notification from "@/components/Notification";
import { PlayIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { useRouter } from 'next/navigation';
import { useNotification } from '@/context/NotificationContext';
import { useAuth } from '@/context/AuthContext';
import { getApiUrl, API_ENDPOINTS } from '../utils/api';

// Định nghĩa type cho request text2speech
interface Text2SpeechRequest {
  language: string;
  input_text: string;
  voice_path?: string;
  voice_name?: string; // Make optional
  emotion?: string; // Make optional
  normalize_text: boolean;
  verbose: boolean;
  audio_background?: string;
  use_parameters: boolean;
  pitch?: number;
  speed?: number;
  stability?: number;
  ambient_sound?: string; // Change from number to string
  use_voice_path: boolean;
}

// Auth types
interface LoginRequest {
  username: string; // email
  password: string;
}

interface LoginResponse {
  access_token: string;
  token_type: string;
}

export default function Home() {
  const router = useRouter();
  const { darkMode } = useTheme();
  const { language, translations } = useLanguage();
  const { addNotification } = useNotification();
  const { isAuthenticated, refreshAuthState } = useAuth();
  
  // Add client-side mount state to prevent hydration mismatches
  const [isMounted, setIsMounted] = useState(false);
  
  // Simple auth state - don't depend on complex AuthContext
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  const [showPlayer, setShowPlayer] = useState(true);
  const [showMiniPlayer, setShowMiniPlayer] = useState(false);
  const [text, setText] = useState("");
  const [showMobileLeftNav, setShowMobileLeftNav] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [voice, setVoice] = useState("Nguyễn Ngọc Ngạn");
  const [emotion, setEmotion] = useState("Truyền Cảm");
  const [selectedGenre, setSelectedGenre] = useState('comedy');
  const [selectedBackground, setSelectedBackground] = useState('comedy_audio_1');
  
  // Added parameters for voice customization
  const [useAdvancedConfig, setUseAdvancedConfig] = useState(false);
  const [pitch, setPitch] = useState(1.0);
  const [speed, setSpeed] = useState(1.0);
  const [stability, setStability] = useState(0.8);
  const [ambientSound, setAmbientSound] = useState(0.2);
  
  // Authentication states
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  
  // Thêm state để xác định kích thước màn hình
  const [screenSize, setScreenSize] = useState({
    isLarge: true,    // > 1000px
    isMedium: false,  // 760px-1000px
    isSmall: false    // < 760px
  });
  
  // Mapping for background audio files
  const backgroundToAudioFile: Record<string, string> = {
    // Narrate backgrounds
    narrate_audio_1: 'narrate_audio_1.mp3',
    narrate_audio_2: 'narrate_audio_2.mp3',
    narrate_audio_3: 'narrate_audio_3.mp3',
    
    // Comedy backgrounds
    comedy_audio_1: 'comedy_audio_1.mp3',
    comedy_audio_2: 'comedy_audio_2.mp3',
    comedy_audio_3: 'comedy_audio_3.mp3',
    
    // Podcast backgrounds
    podcast_audio_1: 'podcast_audio_1.mp3',
    podcast_audio_2: 'podcast_audio_2.mp3',
    podcast_audio_3: 'podcast_audio_3.mp3',
    
    // Horror backgrounds
    horror_audio_1: 'horror_audio_1.mp3',
    horror_audio_2: 'horror_audio_2.mp3',
    horror_audio_3: 'horror_audio_3.mp3',
  };
  
  const audioBackground = backgroundToAudioFile[selectedBackground] || '';
  
  const [notification, setNotification] = useState({
    show: false,
    type: 'success' as 'success' | 'error',
    title: '',
    message: ''
  });
  
  // Add state for voice upload
  const [voicePath, setVoicePath] = useState<string | null>(null);
  const [voiceFileName, setVoiceFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Function to show a notification
  const showNotification = (type: 'success' | 'error', title: string, message: string) => {
    setNotification({
      show: true,
      type,
      title,
      message
    });
  };
  
  // Function to hide the notification
  const hideNotification = () => {
    setNotification(prev => ({ ...prev, show: false }));
  };
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Simplified authentication check
  useEffect(() => {
    if (!isMounted) return;
    
    const token = localStorage.getItem('auth_token');
    
    if (token) {
      // We have a token, consider authenticated
      setIsUserAuthenticated(true);
    } else {
      // No token, redirect to login
      setIsUserAuthenticated(false);
      router.push('/login');
    }
    setAuthChecked(true);
  }, [isMounted, isUserAuthenticated, router]);

  // Handle URL cleanup after OAuth redirect
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('t')) {
      // Remove the timestamp parameter from URL without causing a page reload
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, []);
  
  const handleLogout = () => {
    // Clear local auth state first
    setIsUserAuthenticated(false);
    setAuthToken(null);
    
    // Clear localStorage and cookies
    localStorage.removeItem('auth_token');
    localStorage.removeItem('voice_path');
    localStorage.removeItem('voice_file_name');
    document.cookie = 'isAuthenticated=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    
    // Dispatch voice removal event
    window.dispatchEvent(new CustomEvent('voiceRemoved'));
    
    // Force redirect with cache busting
    setTimeout(() => {
      window.location.href = '/login?t=' + new Date().getTime();
    }, 100);
  };
  
  // Function to convert display name to API format (kebab-case)
  const formatVoiceNameForApi = (displayName: string): string => {
    // Replace spaces with hyphens and convert to lowercase
    return displayName
      .normalize("NFD") // Normalize diacritics
      .replace(/[\u0300-\u036f]/g, "") // Remove combining diacritical marks
      .toLowerCase()
      .replace(/\s+/g, '-'); // Replace spaces with hyphens
  };
  
  // Check for voice path in localStorage
  useEffect(() => {
    const savedVoicePath = localStorage.getItem('voice_path');
    const savedVoiceFileName = localStorage.getItem('voice_file_name');
    console.log('Initial check - savedVoicePath:', savedVoicePath, 'savedVoiceFileName:', savedVoiceFileName);
    if (savedVoicePath) {
      setVoicePath(savedVoicePath);
      setVoiceFileName(savedVoiceFileName);
    }
    
    // Listen for voice upload events
    const handleVoiceUploaded = (event: CustomEvent) => {
      console.log('Voice uploaded event received:', event.detail);
      const { voicePath, voiceFileName } = event.detail;
      setVoicePath(voicePath);
      setVoiceFileName(voiceFileName);
      console.log('State updated - voicePath:', voicePath, 'voiceFileName:', voiceFileName);
    };
    
    // Listen for voice removal events
    const handleVoiceRemoved = () => {
      console.log('Voice removed event received in main page');
      setVoicePath(null);
      setVoiceFileName(null);
    };
    
    window.addEventListener('voiceUploaded', handleVoiceUploaded as EventListener);
    window.addEventListener('voiceRemoved', handleVoiceRemoved as EventListener);
    
    return () => {
      window.removeEventListener('voiceUploaded', handleVoiceUploaded as EventListener);
      window.removeEventListener('voiceRemoved', handleVoiceRemoved as EventListener);
    };
  }, []);
  
  // Debug effect to track voice state changes
  useEffect(() => {
    console.log('Voice state changed:', { voicePath, voiceFileName });
  }, [voicePath, voiceFileName]);
  
  // Debug effect to track audio URL changes
  useEffect(() => {
    console.log('Audio URL state changed:', audioUrl);
  }, [audioUrl]);
  
  const handleGenerate = async () => {
    console.log("🎵 Starting handleGenerate function");
    
    if (!text.trim()) {
      addNotification('error', translations.validationError, translations.enterText);
      return;
    }

    setIsLoading(true);

    try {
      // Get current auth token
      const currentAuthToken = localStorage.getItem('auth_token');
      console.log('Current auth token exists:', !!currentAuthToken);
      
      if (!currentAuthToken) {
        console.log('No auth token found, redirecting to login');
        router.push('/login');
        return;
      }

      // Build request data
      const requestData: Text2SpeechRequest = {
        language,
        input_text: text,
        normalize_text: true,
        verbose: true,
        use_parameters: useAdvancedConfig,
        use_voice_path: false,
      };

      // Add optional fields conditionally
      if (voice && voice !== "Default") {
        requestData.voice_name = formatVoiceNameForApi(voice);
      }
      
      if (emotion && emotion !== "Default") {
        requestData.emotion = formatVoiceNameForApi(emotion);
      }
      
      if (selectedBackground && selectedBackground !== "None") {
        requestData.audio_background = selectedBackground;
      }

      // Add advanced config if enabled
      if (useAdvancedConfig) {
        requestData.pitch = pitch;
        requestData.speed = speed;
        requestData.stability = stability;
        requestData.ambient_sound = ambientSound.toString();
      }

      // Add voice file if uploaded
      if (voicePath) {
        requestData.voice_path = voicePath;
        requestData.use_voice_path = true;
      }

      console.log('Request headers:', {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${(currentAuthToken || authToken)?.substring(0, 20)}...`
      });
      console.log('Request body:', JSON.stringify(requestData, null, 2));
      
      console.log('About to call fetch...');
      const response = await fetch(getApiUrl(API_ENDPOINTS.textToSpeech), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${currentAuthToken || authToken}`
        },
        body: JSON.stringify(requestData),
      }).catch(fetchError => {
        console.error('Fetch error:', fetchError);
        throw fetchError;
      });
      
      console.log('Fetch completed successfully');
      console.log('API response status:', response.status);
      console.log('Response headers:', response.headers);
      
      if (response.status === 401) {
        // Unauthorized, token might have expired
        localStorage.removeItem('auth_token');
        router.push('/login');
        return;
      }

      if (!response.ok) {
        // Show error notification via NotificationContext
        try {
          const errorData = await response.json();
          console.log('API Error Response:', errorData);
          
          // Handle validation errors with array of error objects
          let errorMessage = translations.speechGenerationError;
          if (errorData.detail) {
            if (Array.isArray(errorData.detail)) {
              // FastAPI validation errors
              errorMessage = errorData.detail.map((err: any) => err.msg).join(', ');
            } else if (typeof errorData.detail === 'string') {
              errorMessage = errorData.detail;
            }
          }
          
          addNotification('error', translations.apiError, errorMessage);
        } catch (parseError) {
          console.log('Failed to parse error response:', parseError);
          addNotification('error', translations.apiError, translations.speechGenerationError);
        }
        throw new Error("Lỗi khi gọi API text2speech");
      }

      const data = await response.json();
      console.log("Kết quả text2speech:", data);
      // Xử lý kết quả trả về: lấy đường dẫn file audio và build url public
      if (data.audio_file) {
        // Nếu backend trả về đường dẫn tuyệt đối, chỉ lấy tên file
        const filename = data.audio_file.split("/").pop();
        console.log('Audio filename:', filename);
        // Add the auth token as a query parameter to the audio URL
        const audioUrl = `${getApiUrl(API_ENDPOINTS.audio)}/${filename}?token=${currentAuthToken || authToken}`;
        console.log('Generated audio URL:', audioUrl);
        setAudioUrl(audioUrl);
        console.log('Audio URL set in state:', audioUrl);
        
        // Show success notification via NotificationContext
        addNotification('success', translations.apiSuccess, translations.speechGenerationSuccess);
        
        // Save to history
        try {
          const historyData = {
            text: text,
            audio_url: audioUrl,
            settings: {
              language: language,
              voice_name: voice,  // Store the actual voice name
              voice_api_name: formatVoiceNameForApi(voice),  // Store the API voice name for reference
              emotion: emotion,
              emotion_api_name: formatVoiceNameForApi(emotion),
              genre: selectedGenre,
              background_audio: selectedBackground,
              advanced_config: useAdvancedConfig,
              // Include the advanced parameters if they're being used
              ...(useAdvancedConfig && {
                pitch: pitch,
                speed: speed,
                stability: stability,
                ambient_sound: ambientSound
              })
            }
          };
          
          const historyResponse = await fetch(getApiUrl(API_ENDPOINTS.speechHistory), {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${currentAuthToken || authToken}`
            },
            body: JSON.stringify(historyData),
          });
          
          if (historyResponse.ok) {
            console.log("Saved to history successfully");
          } else {
            console.error("Failed to save to history");
          }
        } catch (historyError) {
          console.error("Error saving to history:", historyError);
        }
      } else {
        setAudioUrl(undefined);
        addNotification('error', translations.apiError, translations.speechGenerationError);
      }
    } catch (error) {
      console.error("Lỗi khi gọi API text2speech:", error);
      console.log("Error type:", typeof error);
      console.log("Error name:", error instanceof Error ? error.name : 'Unknown');
      console.log("Error message:", error instanceof Error ? error.message : error);
      console.log("Error stack:", error instanceof Error ? error.stack : 'No stack');
      setAudioUrl(undefined);
      // Send error to notification system if not already shown
      addNotification('error', translations.apiError, translations.speechGenerationError);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle mobile left nav
  const toggleMobileLeftNav = () => {
    setShowMobileLeftNav(!showMobileLeftNav);
  };
  
  // Effect để theo dõi sự thay đổi kích thước màn hình
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setScreenSize({
        isLarge: width > 1000,
        isMedium: width <= 1000 && width >= 760,
        isSmall: width < 760
      });
      
      // Tự động ẩn mobile left nav khi chuyển sang màn hình lớn
      if (width > 1000) {
        setShowMobileLeftNav(false);
      }
    };
    
    // Kiểm tra kích thước ban đầu
    handleResize();
    
    // Thêm event listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // Determine what to render based on simple auth state
  const shouldShowLoading = !authChecked;
  const shouldShowAuthenticatedContent = authChecked && isUserAuthenticated;

  if (shouldShowLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-xl">Loading...</p>
        </div>
      </div>
    );
  }

  if (shouldShowAuthenticatedContent) {
    return (
      <div className={`flex flex-col h-screen ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
        <Header 
          isSmallScreen={screenSize.isSmall || screenSize.isMedium} 
          onToggleLeftNav={toggleMobileLeftNav}
          showMobileLeftNav={showMobileLeftNav}
          isAuthenticated={isUserAuthenticated}
          onLogout={handleLogout}
        />
        
        {/* Notification component */}
        <Notification
          type={notification.type}
          title={notification.title}
          message={notification.message}
          show={notification.show}
          onClose={hideNotification}
        />
        
        <div className="flex flex-1 overflow-hidden relative">
          {/* LeftNav cho màn hình lớn */}
          {screenSize.isLarge && <LeftNav />}
          
          {/* Main content */}
          <main className={`flex-1 flex flex-col overflow-auto relative ${
            darkMode ? 'bg-gray-900' : 'bg-white'
          }`}>
            {/* Tiêu đề */}
            <div className="p-5 pb-2">
              <h2 className={`text-lg font-bold tracking-wide ${
                darkMode ? 'text-gray-100' : 'text-black'
              }`}>
                {translations.textToSpeech}
              </h2>
            </div>
            
            {/* Voice File Display - Show uploaded voice file */}
            {voicePath && voiceFileName && (
              <div className="px-5 pb-3">
                <div className={`flex items-center justify-between p-3 rounded-lg border ${
                  darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-3 ${
                      darkMode ? 'bg-green-400' : 'bg-green-500'
                    }`}></div>
                    <div>
                      <div className={`text-sm font-medium ${
                        darkMode ? 'text-gray-200' : 'text-gray-800'
                      }`}>
                        {translations.voiceUploaded || "Voice Uploaded"}
                      </div>
                      <div className={`text-xs ${
                        darkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {voiceFileName}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      console.log('Remove voice button clicked in main component');
                      setVoicePath(null);
                      setVoiceFileName(null);
                      localStorage.removeItem('voice_path');
                      localStorage.removeItem('voice_file_name');
                      // Trigger custom event to update other components
                      window.dispatchEvent(new CustomEvent('voiceRemoved'));
                      console.log('Voice removed and event dispatched');
                    }}
                    className={`p-2 rounded-full ${
                      darkMode 
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}
                    disabled={isLoading}
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
            
            {/* Textarea - Tăng chiều cao */}
            <div className="px-5 py-3">
              <div className="relative h-[310px]"> {/* Tăng từ 260px lên 310px */}
                <textarea 
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className={`w-full h-full p-4 rounded-lg resize-none outline-none border ${
                    darkMode 
                      ? 'bg-gray-800 text-gray-100 border-gray-700 placeholder-gray-500' 
                      : 'bg-white text-black border-gray-200 placeholder-gray-400'
                  }`}
                  placeholder={translations.typePasteText}
                  disabled={isLoading}
                />
              </div>
            </div>
            
            {/* Thêm khoảng cách trước StoryGenre */}
            <div className="h-3"></div>
            
            {/* Story Genre Component */}
            <StoryGenre 
              selectedGenre={selectedGenre} 
              setSelectedGenre={setSelectedGenre}
              selectedBackground={selectedBackground}
              setSelectedBackground={setSelectedBackground}
            />
            
            {/* RightNav dạng nhỏ gọn cho màn hình nhỏ */}
            {screenSize.isSmall && (
              <div className="px-5 py-3">
                <RightNav
                  isCompact={true}
                  disabled={isLoading}
                  voice={voice}
                  setVoice={setVoice}
                  emotion={emotion}
                  setEmotion={setEmotion}
                  useAdvancedConfig={useAdvancedConfig}
                  setUseAdvancedConfig={setUseAdvancedConfig}
                  pitch={pitch}
                  setPitch={setPitch}
                  speed={speed}
                  setSpeed={setSpeed}
                  stability={stability}
                  setStability={setStability}
                  ambientSound={ambientSound}
                  setAmbientSound={setAmbientSound}
                  hasCustomVoice={!!voicePath}
                />
              </div>
            )}
            
            {/* Thêm khoảng cách trước Generate Controls */}
            <div className="h-2"></div>
            
            {/* Generate Controls */}
            <GenerateControls 
              text={text}
              onGenerate={handleGenerate}
              isCompact={screenSize.isSmall}
              disabled={isLoading}
            />
            
            {/* Điều chỉnh khoảng cách dưới để chỉ còn 0.8cm với Player Footer */}
            {/* 0.8cm ≈ 8px */}
            <div className="h-8"></div>
            
            {/* Mini Player Trigger */}
            {!showPlayer && (
              <div
                onClick={() => {
                  setShowPlayer(true);
                  setShowMiniPlayer(false);
                }}
                className={`absolute bottom-0 left-0 right-0 h-1 cursor-ns-resize hover:h-2 transition-all ${
                  darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
                }`}
              ></div>
            )}
          </main>
          
          {/* Ẩn RightNav khi màn hình nhỏ */}
          {!screenSize.isSmall && (
            <RightNav
              isCompact={false}
              disabled={isLoading}
              voice={voice}
              setVoice={setVoice}
              emotion={emotion}
              setEmotion={setEmotion}
              useAdvancedConfig={useAdvancedConfig}
              setUseAdvancedConfig={setUseAdvancedConfig}
              pitch={pitch}
              setPitch={setPitch}
              speed={speed}
              setSpeed={setSpeed}
              stability={stability}
              setStability={setStability}
              ambientSound={ambientSound}
              setAmbientSound={setAmbientSound}
              hasCustomVoice={!!voicePath}
            />
          )}
        </div>
        
        {/* LeftNav dạng mobile overlay - FINAL VERSION */}
        {showMobileLeftNav && (
          <div className="fixed inset-0 z-50">
            {/* Backdrop thay bằng div riêng với style inline */}
            <div 
              className="absolute inset-0" 
              style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
              onClick={() => setShowMobileLeftNav(false)}
            ></div>
            
            {/* LeftNav panel với style riêng */}
            <div 
              className={`absolute top-0 left-0 bottom-0 w-64 shadow-xl ${
                darkMode ? 'bg-gray-900' : 'bg-white'
              }`}
              style={{ zIndex: 10 }}
            >
              {/* Header area */}
              <div className={`p-4 flex justify-between items-center border-b ${
                darkMode ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  SYNSERE
                </h2>
                {/* Nút đóng ở góc trên bên phải */}
                <button
                  onClick={() => setShowMobileLeftNav(false)}
                  className={`p-2 rounded-full ${
                    darkMode 
                      ? 'bg-gray-800 text-gray-400 hover:text-white' 
                      : 'bg-gray-100 text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
              
              {/* Main content của LeftNav */}
              <div className="h-[calc(100%-112px)] overflow-y-auto">
                <LeftNav />
              </div>
              
              {/* Thêm nút chuyển đổi mode và ngôn ngữ ở mobile left nav */}
              <div className={`p-4 flex items-center justify-between ${
                darkMode ? 'border-gray-700' : 'border-gray-200'
              }`}>          
              </div>
            </div>
            
            {/* Nút đóng dạng vòm bên ngoài LeftNav */}
            <div 
              className="absolute top-1/3 left-64"
              style={{ zIndex: 11 }}
            >
              <button
                onClick={() => setShowMobileLeftNav(false)}
                className={`flex items-center px-4 py-3 rounded-r-full shadow-lg ${
                  darkMode 
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                <XMarkIcon className="h-5 w-5 mr-1" />
                <span>{language === 'en' ? 'Close' : 'Đóng'}</span>
              </button>
            </div>
          </div>
        )}
        
        {/* Full Player Footer */}
        {showPlayer && (
          <PlayerFooter 
            onClose={() => {
              setShowPlayer(false);
              setShowMiniPlayer(true);
            }}
            isCompact={screenSize.isSmall}
            audioUrl={audioUrl}
            isLoading={isLoading}
          />
        )}
        
        {/* Mini Player (alternative version) - Điều chỉnh vị trí */}
        {showMiniPlayer && (
          <div 
            onClick={() => setShowPlayer(true)}
            className={`fixed bottom-0 ${
              screenSize.isLarge 
                ? 'left-64 right-96' 
                : screenSize.isMedium 
                  ? 'left-0 right-96' 
                  : 'left-0 right-0'
            } h-8 flex items-center justify-center cursor-pointer ${
              darkMode 
                ? 'bg-gray-800 border-t border-gray-700 hover:bg-gray-700' 
                : 'bg-gray-100 border-t border-gray-300 hover:bg-gray-200'
            }`}
          >
            <PlayIcon className={`h-4 w-4 mr-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
            <span className={`text-sm truncate max-w-xs ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            </span>
          </div>
        )}
      </div>
    );
  }

  // If not authenticated, show login prompt or redirect
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Please Log In</h1>
        <p className="mb-4">You need to be logged in to access this page.</p>
        <button 
          onClick={() => router.push('/login')}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Go to Login
        </button>
      </div>
    </div>
  );
}