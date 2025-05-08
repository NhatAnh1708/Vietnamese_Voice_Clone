"use client";
import { useState, useEffect } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';

interface GenerateControlsProps {
  text: string;
  onGenerate: () => void;
  isCompact?: boolean; // Thêm prop để hỗ trợ hiển thị trên màn hình nhỏ
  disabled?: boolean;
}

export default function GenerateControls({ text, onGenerate, isCompact = false, disabled = false }: GenerateControlsProps) {
  const { darkMode } = useTheme();
  const { translations } = useLanguage();
  const [wordCount, setWordCount] = useState(0);
  const maxWords = 4000;
  const credits = 850;

  useEffect(() => {
    setWordCount(text.trim().split(/\s+/).length);
  }, [text]);

  // ResponsiveResponsive
  if (isCompact) {
    return (
      <div className={`flex flex-col px-5 py-4 space-y-3 ${
        darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        {/* Generate Button */}
        <button
          onClick={onGenerate}
          disabled={wordCount > maxWords || disabled}
          className={`w-full py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
          wordCount > maxWords 
          ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                  : darkMode 
                  ? 'bg-white text-[#111827] hover:bg-gray-100'
          : 'bg-[#111827] text-white hover:bg-gray-800'
          }`}
        >
          {translations.generateSpeech}
        </button>
        
        {/* Credits & Word Counter */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="relative w-3 h-3">
              <div className={`absolute inset-0 rounded-full ${
                darkMode ? 'bg-white' : 'bg-[#111827]'
              }`} />
            </div>
            <span className={`text-sm ${
              darkMode ? 'text-gray-400' : 'text-[#111827]'
            }`}>
              {credits} {translations.creditsRemaining}
            </span>
          </div>

          <span className={`text-sm ${
            wordCount > maxWords 
              ? 'text-red-500' 
              : darkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            {wordCount}/{maxWords}
          </span>
        </div>
      </div>
    );
  }

  // UI ban đầu cho màn hình lớn
  return (
    <div className={`flex items-center justify-between px-5 py-4 ${
      darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-center space-x-4">
        {/* Credits Circle */}
        <div className="flex items-center space-x-2">
          <div className="relative w-3 h-3">
            <div className={`absolute inset-0 rounded-full ${
              darkMode ? 'bg-white' : 'bg-[#111827]'
            }`} />
          </div>
          <span className={`text-sm ${
            darkMode ? 'text-gray-400' : 'text-[#111827]'
          }`}>
            {credits} {translations.creditsRemaining}
          </span>
        </div>

        {/* Word Counter */}
        <span className={`text-sm ${
          wordCount > maxWords 
            ? 'text-red-500' 
            : darkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>
          {wordCount}/{maxWords}
        </span>
      </div>

      {/* Generate Button */}
      <button
        onClick={onGenerate}
        disabled={wordCount > maxWords || disabled}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
        wordCount > maxWords 
        ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                : darkMode 
                ? 'bg-white text-[#111827] hover:bg-gray-100'    // chế độ tối
        : 'bg-[#111827] text-white hover:bg-gray-800'     // chế độ sáng
        }`}
      >
        {translations.generateSpeech}
      </button>
    </div>
  );
}