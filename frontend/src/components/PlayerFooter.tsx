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
}

export default function PlayerFooter({ onClose, isCompact = false }: PlayerFooterProps) {
  const { darkMode } = useTheme();
  const { translations } = useLanguage();
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(33);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const [windowWidth, setWindowWidth] = useState(0);
  
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
  
  const currentTime = 65;
  const totalTime = 180;
  
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
              <div className="flex text-[10px] space-x-2">
                <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                  {formatTime(currentTime)}
                </span>
                <span className={darkMode ? 'text-gray-500' : 'text-gray-400'}>
                  /
                </span>
                <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                  {formatTime(totalTime)}
                </span>
              </div>
            </div>
          </div>
          
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
              <div className={`text-xs ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>{translations.processingText}</div>
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
              <div 
                className={`h-full rounded-full absolute top-0 left-0 ${
                  darkMode ? 'bg-gray-300' : 'bg-gray-900'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
            
            <div className="flex justify-between text-xs mt-1">
              <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                {formatTime(currentTime)}
              </span>
              <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                {formatTime(totalTime)}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-2">
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