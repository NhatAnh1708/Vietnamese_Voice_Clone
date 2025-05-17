"use client";
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import LeftNav from "@/components/LeftNav";
import RightNav from "@/components/RightNav";
import StoryGenre from "@/components/StoryGenre";
import PlayerFooter from "@/components/PlayerFooter";
import GenerateControls from "@/components/GenerateControls";
import { PlayIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { useRouter } from 'next/navigation';

// Định nghĩa type cho request text2speech
interface Text2SpeechRequest {
  language: string;
  input_text: string;
  reference_audio?: string;
  sex: string;
  emotion: string;
  normalize_text: boolean;
  verbose: boolean;
  audio_background?: string;
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
  const [showPlayer, setShowPlayer] = useState(true);
  const [showMiniPlayer, setShowMiniPlayer] = useState(false);
  const [text, setText] = useState("");
  const [showMobileLeftNav, setShowMobileLeftNav] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [voice, setVoice] = useState("Nữ");
  const [emotion, setEmotion] = useState("Truyền Cảm");
  const [selectedGenre, setSelectedGenre] = useState('comedy');
  
  // Authentication states
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  
  // Thêm state để xác định kích thước màn hình
  const [screenSize, setScreenSize] = useState({
    isLarge: true,    // > 1000px
    isMedium: false,  // 760px-1000px
    isSmall: false    // < 760px
  });
  
  // Mapping selectedGenre sang file audio background
  const genreToAudioBackground: Record<string, string> = {
    narrate: 'narrate-background.mp3',
    comedy: 'comedy-background.mp3',
    podcast: 'podcast-background.mp3',
    horror: 'horror-background.mp3',
  };
  const audioBackground = genreToAudioBackground[selectedGenre] || '';
  
  useEffect(() => {
    // Check for token in localStorage on component mount
    const token = localStorage.getItem('auth_token');
    if (token) {
      setAuthToken(token);
      setIsAuthenticated(true);
    } else {
      // Redirect to login if no token is found
      router.push('/login');
    }
  }, [router]);
  
  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    setAuthToken(null);
    setIsAuthenticated(false);
    router.push('/login');
  };
  
  const handleGenerate = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    setIsLoading(true);
    setAudioUrl(undefined);
    // Chuẩn bị dữ liệu gửi lên backend
    const requestData: Text2SpeechRequest = {
      language: language || "vi",
      input_text: text || "Xin chào bạn, tôi là chatbot của DONYAI",
      sex: voice,
      emotion: emotion,
      normalize_text: true,
      verbose: true,
      audio_background: audioBackground,
    };
    try {
      const response = await fetch("http://localhost:8000/api/text-to-speech", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify(requestData),
      });
      
      if (response.status === 401) {
        // Unauthorized, token might have expired
        localStorage.removeItem('auth_token');
        setIsAuthenticated(false);
        router.push('/login');
        return;
      }
      
      if (!response.ok) {
        throw new Error("Lỗi khi gọi API text2speech");
      }
      
      const data = await response.json();
      console.log("Kết quả text2speech:", data);
      // Xử lý kết quả trả về: lấy đường dẫn file audio và build url public
      if (data.audio_file) {
        // Nếu backend trả về đường dẫn tuyệt đối, chỉ lấy tên file
        const filename = data.audio_file.split("/").pop();
        // Giả sử backend phục vụ file qua endpoint /api/audio/{filename}
        const audioUrl = `http://localhost:8000/api/audio/${filename}`;
        setAudioUrl(audioUrl);
        
        // Save to history
        try {
          const historyData = {
            text: text,
            audio_url: audioUrl,
            settings: {
              language: language,
              voice: voice,
              emotion: emotion,
              genre: selectedGenre
            }
          };
          
          const historyResponse = await fetch("http://localhost:8000/api/auth/speech-history", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${authToken}`
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
      }
    } catch (error) {
      console.error("Lỗi khi gọi API text2speech:", error);
      setAudioUrl(undefined);
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
  
  // If not authenticated, show nothing while redirecting
  if (!isAuthenticated) {
    return null;
  }
  
  return (
    <div className={`flex flex-col h-screen ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
      <Header 
        isSmallScreen={screenSize.isSmall || screenSize.isMedium} 
        onToggleLeftNav={toggleMobileLeftNav}
        showMobileLeftNav={showMobileLeftNav}
        isAuthenticated={isAuthenticated}
        onLogout={handleLogout}
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
          
          {/* Nội dung chính */}
          <div className="flex-1 flex flex-col">
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
            <StoryGenre selectedGenre={selectedGenre} setSelectedGenre={setSelectedGenre} />
            
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
          </div>
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