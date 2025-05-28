"use client";
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';

interface GenerateControlsProps {
  text: string;
  onGenerate: () => void;
  isCompact?: boolean; // Thêm prop để hỗ trợ hiển thị trên màn hình nhỏ
  disabled?: boolean;
  isLoading?: boolean;
}

export default function GenerateControls({ text, onGenerate, isCompact = false, disabled = false, isLoading = false }: GenerateControlsProps) {
  const { darkMode } = useTheme();
  const { translations } = useLanguage();

  // ResponsiveResponsive
  if (isCompact) {
    return (
      <div className={`flex flex-col px-5 py-4 space-y-3 ${
        darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        {/* Generate Button */}
        <button
          onClick={onGenerate}
          disabled={disabled || isLoading}
          className={`w-full py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            darkMode 
              ? 'bg-white text-[#111827] hover:bg-gray-100'
              : 'bg-[#111827] text-white hover:bg-gray-800'
          } ${(disabled || isLoading) ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-current mr-2"></div>
              {translations.processing || "Processing..."}
            </div>
          ) : (
            translations.generateSpeech
          )}
        </button>
      </div>
    );
  }

  // UI ban đầu cho màn hình lớn
  return (
    <div className={`flex items-center justify-end px-5 py-4 ${
      darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      {/* Generate Button */}
      <button
        onClick={onGenerate}
        disabled={disabled || isLoading}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
          darkMode 
            ? 'bg-white text-[#111827] hover:bg-gray-100'    // chế độ tối
            : 'bg-[#111827] text-white hover:bg-gray-800'     // chế độ sáng
        } ${(disabled || isLoading) ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-current mr-2"></div>
            {translations.processing || "Processing..."}
          </div>
        ) : (
          translations.generateSpeech
        )}
      </button>
    </div>
  );
}