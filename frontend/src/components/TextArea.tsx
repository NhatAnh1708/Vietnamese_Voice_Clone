"use client";
import { useState } from "react";
import { PlayIcon } from "@heroicons/react/24/outline";
import { useTheme } from '@/context/ThemeContext';

export default function TextArea() {
  const { darkMode } = useTheme();
  const [text, setText] = useState("");

  return (
    <div className={`flex-1 flex flex-col p-5 relative ${
      darkMode ? 'bg-gray-900' : 'bg-white'
    }`}>
      {/* Header */}
      <div className="mb-4">
        <h2 className={`text-lg font-bold tracking-wide ${
          darkMode ? 'text-gray-100' : 'text-gray-900'
        }`}>
          Text-to-Speech
        </h2>
      </div>

      {/* Text Area Container - giảm chiều cao bằng cách thêm h-[calc(100%-5rem)] */}
      <div className="flex-1 mb-8 relative outline-none focus:outline-none border-none h-[calc(50%-5rem)]">
        <textarea 
          value={text}
          onChange={(e) => setText(e.target.value)}
          className={`w-full h-full p-4 rounded-lg resize-none outline-none focus:outline-none border-none ${
            darkMode 
              ? 'bg-gray-800 text-gray-100 placeholder-gray-500' 
              : 'bg-white text-gray-900 placeholder-gray-400'
          }`}
          placeholder="Type or paste your text here..."
        />

        {/* Floating Action Button */}
        {text && (
          <div className={`absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-full shadow-lg flex items-center ${
            darkMode 
              ? 'bg-gray-800 border border-gray-700' 
              : 'bg-white border border-gray-200'
          }`}>
            <PlayIcon className={`h-4 w-4 mr-2 ${
              darkMode ? 'text-gray-300' : 'text-gray-600'
            }`} />
            <span className={`text-sm truncate max-w-xs ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              {text.substring(0, 30)}{text.length > 30 ? '...' : ''}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}