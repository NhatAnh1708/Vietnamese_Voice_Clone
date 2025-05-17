"use client";
import { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { useTheme } from '@/context/ThemeContext';

interface CustomDropdownProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  compact?: boolean;
  disabled?: boolean;
}

export default function CustomDropdown({ 
  options, 
  value, 
  onChange, 
  label, 
  compact = false,
  disabled = false
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { darkMode } = useTheme();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Đóng dropdown khi click bên ngoài
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Xử lý chọn option
  const handleSelect = (option: string) => {
    onChange(option);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {label && (
        <label className={`block ${compact ? 'text-xs' : 'text-sm'} font-medium mb-${compact ? '1' : '2'} ${
          darkMode ? 'text-gray-200' : 'text-gray-800'
        }`}>{label}</label>
      )}
      
      {/* Button giả lập select */}
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between border rounded-md ${
          compact ? 'pl-2 pr-7 py-1 text-xs' : 'pl-3 pr-10 py-2 text-sm'
        } ${
          darkMode 
            ? 'bg-gray-800 border-gray-600 text-white hover:bg-gray-700' 
            : 'bg-white border-gray-300 text-gray-800 hover:bg-gray-50'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        type="button"
        disabled={disabled}
      >
        <span>{value}</span>
        <ChevronDownIcon className={`${
          compact ? 'h-4 w-4' : 'h-5 w-5'
        } transition-transform ${
          isOpen ? 'transform rotate-180' : ''
        } ${
          darkMode ? 'text-gray-400' : 'text-gray-500'
        } absolute right-2`} />
      </button>
      
      {/* Dropdown menu */}
      {isOpen && (
        <div className={`absolute z-10 mt-1 w-full rounded-md shadow-lg border overflow-hidden ${
          darkMode 
            ? 'bg-gray-800 border-gray-600' 
            : 'bg-white border-gray-200'
        }`}>
          <ul className="max-h-60 overflow-auto py-1">
            {options.map((option) => (
              <li 
                key={option}
                onClick={() => handleSelect(option)}
                className={`px-3 py-2 ${compact ? 'text-xs' : 'text-sm'} cursor-pointer ${
                  value === option
                    ? darkMode
                      ? 'bg-gray-700 text-white'
                      : 'bg-gray-100 text-gray-900'
                    : ''
                } ${
                  darkMode
                    ? 'text-gray-200 hover:bg-gray-700'
                    : 'text-gray-800 hover:bg-gray-100'
                }`}
              >
                {option}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}