"use client";
import {
  XMarkIcon,
  PlayIcon,
  PauseIcon,
  ArrowDownTrayIcon,
  ShareIcon,
  ForwardIcon,
  BackwardIcon
} from "@heroicons/react/24/outline";
import { useState, useRef, useEffect } from "react";
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';

interface PlayerFooterProps {
  onClose: () => void;
  isCompact?: boolean;
  audioUrl?: string;
  isLoading?: boolean;
}

export default function PlayerFooter({ onClose, isCompact = false, audioUrl, isLoading = false }: PlayerFooterProps) {
  const { darkMode } = useTheme();
  const { translations } = useLanguage();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAudioReady, setIsAudioReady] = useState(false);
  const [progress, setProgress] = useState(33);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const [windowWidth, setWindowWidth] = useState(0);
  
  // Đặt các hook audio player ở đầu component
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  // Effect để lấy kích thước cửa sổ an toàn (client-side only)
  useEffect(() => {
    // Chỉ chạy trên client-side
    setWindowWidth(window.innerWidth);
    
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  const updateProgressFromClick = (clientX: number) => {
    if (progressBarRef.current) {
      const rect = progressBarRef.current.getBoundingClientRect();
      const clickPosition = clientX - rect.left;
      const newProgress = (clickPosition / rect.width) * 100;
      setProgress(Math.max(0, Math.min(100, newProgress)));
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    updateProgressFromClick(e.clientX);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDraggingRef.current) {
      updateProgressFromClick(e.clientX);
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    isDraggingRef.current = true;
    updateProgressFromClick(e.touches[0].clientX);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (isDraggingRef.current && e.touches[0]) {
      updateProgressFromClick(e.touches[0].clientX);
    }
  };

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleMouseUp);
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' + secs : secs}`;
  };
  
  // Cập nhật thời gian hiện tại
  useEffect(() => {
    if (!audioUrl) return;
    const audio = audioRef.current;
    if (!audio) return;
    const update = () => setCurrentTime(audio.currentTime);
    const loaded = () => setDuration(audio.duration);
    audio.addEventListener("timeupdate", update);
    audio.addEventListener("loadedmetadata", loaded);
    return () => {
      audio.removeEventListener("timeupdate", update);
      audio.removeEventListener("loadedmetadata", loaded);
    };
  }, [audioUrl]);
  
  // Reset isPlaying và isAudioReady khi audioUrl đổi
  useEffect(() => {
    setIsPlaying(false);
    setIsAudioReady(false);
  }, [audioUrl]);
  
  // Play/pause
  useEffect(() => {
    if (!audioUrl || !isAudioReady) return;
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) audio.play();
    else audio.pause();
  }, [isPlaying, audioUrl, isAudioReady]);
  
  // Seek
  const seek = (time: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, Math.min(duration, time));
    setCurrentTime(audio.currentTime);
  };
  
  // Progress bar click
  const handleBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    seek(percent * duration);
  };
  
  // Version for small screens
  if (isCompact) {
    return (
      <div className={`fixed bottom-0 left-0 right-0 h-16 flex flex-col px-3 z-50 shadow-sm ${
        darkMode 
          ? 'bg-gray-900 border-t border-gray-700' 
          : 'bg-white border-t border-gray-200'
      }`}>
        {/* Progress Bar */}
        <div 
          ref={progressBarRef}
          className={`h-1 rounded-full cursor-pointer relative w-full mt-1 ${
            darkMode ? 'bg-gray-700' : 'bg-gray-200'
          }`}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          <div 
            className={`h-full rounded-full absolute top-0 left-0 ${
              darkMode ? 'bg-gray-300' : 'bg-gray-900'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
        
        {/* Controls and time */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center">
            {/* Thêm lại các nút điều hướng ±5s */}
            <button
              className={`mr-1 p-1 rounded-full ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              <BackwardIcon className="h-4 w-4" />
            </button>
          
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`p-1 rounded-full ${
                darkMode ? 'bg-gray-800' : 'bg-gray-100' 
              }`}
            >
              {isPlaying ? (
                <PauseIcon className={`h-5 w-5 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`} />
              ) : (
                <PlayIcon className={`h-5 w-5 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`} />
              )}
            </button>
            
            <button
              className={`ml-1 p-1 rounded-full ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              <ForwardIcon className="h-4 w-4" />
            </button>
            
            <div className="ml-3">
              <div className={`text-xs ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                {translations.currentAudio}
              </div>
              {isLoading ? (
                <div className="flex items-center text-[10px] text-blue-600 animate-pulse">
                  <span>Đang xử lý...</span>
                  <svg className="ml-1 w-3 h-3 animate-spin" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                </div>
              ) : (
                <div className="flex text-[10px] space-x-2">
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                    {formatTime(currentTime)}
                  </span>
                  <span className={darkMode ? 'text-gray-500' : 'text-gray-400'}>
                    /
                  </span>
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                    {formatTime(duration)}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {/* Audio player */}
          {audioUrl && (
            <audio
              ref={audioRef}
              src={audioUrl}
              onEnded={() => setIsPlaying(false)}
              onLoadedMetadata={() => setIsAudioReady(true)}
              style={{ display: 'none' }}
            />
          )}
          
          <div className="flex space-x-2">
            <button className={`p-1 rounded-full ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              <ArrowDownTrayIcon className="h-4 w-4" />
            </button>
            
            {/* Thêm nút Share vào phiên bản compact */}
            <button className={`p-1 rounded-full ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              <ShareIcon className="h-4 w-4" />
            </button>
            
            <button 
              onClick={onClose}
              className={`p-1 rounded-full ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Phiên bản UI cho màn hình trung bình (761px-920px)
  // Thay đổi để tránh truy cập window trực tiếp
  const isNarrowMedium = windowWidth >= 761 && windowWidth <= 920;
  
  // Full version for medium and large screens
  if (audioUrl) {
    return (
      <div className={`fixed bottom-0 ${
        windowWidth > 1000 ? 'left-64' : 'left-0'
      } ${
        windowWidth < 760 ? 'right-0' : 'right-96'
      } h-20 flex items-center px-6 z-50 shadow-sm ${
        darkMode 
          ? 'bg-gray-900 border-t border-gray-700' 
          : 'bg-white border-t border-gray-200'
      }`}>
        <div className="w-full max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex flex-col flex-1">
            <div className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{translations.currentAudio}</div>
            <div className="flex items-center">
              {/* Nút lùi 5s */}
              <button
                onClick={() => seek(currentTime - 5)}
                className={`p-2 rounded-full ${darkMode ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-100'}`}
                title="Lùi 5 giây"
              >
                <BackwardIcon className="h-5 w-5" />
              </button>
              {/* Nút play/pause */}
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`mx-2 p-2 rounded-full ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}
                title={isPlaying ? "Tạm dừng" : "Phát"}
              >
                {isPlaying ? (
                  <PauseIcon className={`h-6 w-6 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`} />
                ) : (
                  <PlayIcon className={`h-6 w-6 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`} />
                )}
              </button>
              {/* Nút tiến 5s */}
              <button
                onClick={() => seek(currentTime + 5)}
                className={`p-2 rounded-full ${darkMode ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-100'}`}
                title="Tiến 5 giây"
              >
                <ForwardIcon className="h-5 w-5" />
              </button>
              {/* Thanh progress đẹp */}
              <div className="flex-1 mx-4">
                <div className="flex items-center">
                  <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{formatTime(currentTime)}</span>
                  <div
                    className={`relative flex-1 h-2 mx-2 rounded-full cursor-pointer ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
                    onClick={handleBarClick}
                  >
                    <div
                      className={`absolute top-0 left-0 h-2 rounded-full ${darkMode ? 'bg-blue-400' : 'bg-blue-600'}`}
                      style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                    />
                  </div>
                  <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{formatTime(duration)}</span>
                </div>
              </div>
              {/* Audio element ẩn */}
              <audio
                ref={audioRef}
                src={audioUrl}
                onEnded={() => setIsPlaying(false)}
                onLoadedMetadata={() => setIsAudioReady(true)}
                style={{ display: 'none' }}
              />
              {/* Nút đóng */}
              <button
                onClick={onClose}
                className={`ml-4 p-2 rounded-full ${darkMode ? 'text-gray-400 hover:bg-gray-800 hover:bg-opacity-50 hover:text-gray-200' : 'text-gray-700 hover:bg-gray-100'}`}
                title="Đóng"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`fixed bottom-0 ${
      windowWidth > 1000 ? 'left-64' : 'left-0'
    } ${
      windowWidth < 760 ? 'right-0' : 'right-96'
    } h-20 flex items-center px-6 z-50 shadow-sm ${
      darkMode 
        ? 'bg-gray-900 border-t border-gray-700' 
        : 'bg-white border-t border-gray-200'
    }`}>
      <div className="w-full max-w-7xl mx-auto flex items-center">
        <div className="flex items-center">
          <button
            className={`p-2 rounded-full ${
              darkMode 
                ? 'hover:bg-gray-800 hover:bg-opacity-50' 
                : 'hover:bg-gray-100'
            }`}
            title="Go back 5 seconds"
          >
            <BackwardIcon className={`h-5 w-5 ${
              darkMode 
                ? 'text-gray-300 hover:text-gray-100' 
                : 'text-gray-700 hover:text-gray-900'
            }`} />
          </button>
          
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`p-2 rounded-full mx-2 ${
              darkMode 
                ? 'hover:bg-gray-800 hover:bg-opacity-50' 
                : 'hover:bg-gray-100'
            }`}
          >
            {isPlaying ? (
              <PauseIcon className={`h-6 w-6 ${
                darkMode 
                  ? 'text-gray-300 hover:text-gray-100' 
                  : 'text-gray-700 hover:text-gray-900'
              }`} />
            ) : (
              <PlayIcon className={`h-6 w-6 ${
                darkMode 
                  ? 'text-gray-300 hover:text-gray-100' 
                  : 'text-gray-700 hover:text-gray-900'
              }`} />
            )}
          </button>
          
          <button
            className={`p-2 rounded-full ${
              darkMode 
                ? 'hover:bg-gray-800 hover:bg-opacity-50' 
                : 'hover:bg-gray-100'
            }`}
            title="Forward 5 seconds"
          >
            <ForwardIcon className={`h-5 w-5 ${
              darkMode 
                ? 'text-gray-300 hover:text-gray-100' 
                : 'text-gray-700 hover:text-gray-900'
            }`} />
          </button>
        </div>
        
        <div className="flex-1 flex items-center mx-6">
          {/* Ẩn label ở kích thước màn hình trung bình hẹp */}
          {!isNarrowMedium && (
            <div className="w-32">
              <div className={`text-sm font-medium ${
                darkMode ? 'text-gray-200' : 'text-gray-800'
              }`}>{translations.currentAudio}</div>
              {isLoading ? (
                <div className="flex items-center text-xs text-blue-600 animate-pulse">
                  <span>Đang xử lý...</span>
                  <svg className="ml-1 w-3 h-3 animate-spin" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                </div>
              ) : (
                <div className={`text-xs ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>{translations.processingText}</div>
              )}
            </div>
          )}
          
          <div className={`flex-1 flex flex-col ${isNarrowMedium ? 'ml-2' : 'mx-4'}`}>
            <div 
              ref={progressBarRef}
              className={`h-2 rounded-full cursor-pointer relative ${
                darkMode ? 'bg-gray-700' : 'bg-gray-200'
              }`}
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
            >
              {isLoading ? (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-2/3 h-2 bg-blue-200 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 animate-pulse rounded-full" style={{ width: '60%' }}></div>
                  </div>
                </div>
              ) : (
                <div 
                  className={`h-full rounded-full absolute top-0 left-0 ${
                    darkMode ? 'bg-gray-300' : 'bg-gray-900'
                  }`}
                  style={{ width: `${progress}%` }}
                />
              )}
            </div>
            
            <div className="flex justify-between text-xs mt-1">
              <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                {formatTime(currentTime)}
              </span>
              <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                {formatTime(duration)}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-2 ml-2">
          <button 
            className={`p-2 rounded-full ${
              darkMode 
                ? 'text-gray-400 hover:bg-gray-800 hover:bg-opacity-50 hover:text-gray-200' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <ArrowDownTrayIcon className="h-5 w-5" />
          </button>
          
          {/* Bỏ điều kiện !isNarrowMedium để luôn hiển thị nút Share */}
          <button 
            className={`p-2 rounded-full ${
              darkMode 
                ? 'text-gray-400 hover:bg-gray-800 hover:bg-opacity-50 hover:text-gray-200' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <ShareIcon className="h-5 w-5" />
          </button>
          
          <button
            onClick={onClose}
            className={`p-2 rounded-full ${
              darkMode 
                ? 'text-gray-400 hover:bg-gray-800 hover:bg-opacity-50 hover:text-gray-200' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}