"use client";

import { 
  AdjustmentsHorizontalIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import { useTheme } from '@/context/ThemeContext';
import { getApiUrl, API_ENDPOINTS } from '@/utils/api';
import { useLanguage } from '@/context/LanguageContext';
import CustomDropdown from './CustomDropdown';

interface RightNavProps {
  isCompact: boolean; // Truyền vào từ component cha để xác định hiển thị gọn hay đầy đủ
  disabled?: boolean;
  voice: string;
  setVoice: (v: string) => void;
  emotion: string;
  setEmotion: (e: string) => void;
  useAdvancedConfig: boolean;
  setUseAdvancedConfig: (use: boolean) => void;
  pitch: number;
  setPitch: (p: number) => void;
  speed: number;
  setSpeed: (s: number) => void;
  stability: number;
  setStability: (s: number) => void;
  ambientSound: number;
  setAmbientSound: (a: number) => void;
  hasCustomVoice?: boolean;
}

export default function RightNav({ 
  isCompact, 
  disabled = false, 
  voice, 
  setVoice, 
  emotion, 
  setEmotion,
  useAdvancedConfig,
  setUseAdvancedConfig,
  pitch,
  setPitch,
  speed,
  setSpeed,
  stability,
  setStability,
  ambientSound,
  setAmbientSound,
  hasCustomVoice = false
}: RightNavProps) {
  const { darkMode } = useTheme();
  const { translations, language } = useLanguage();
  
  // Debug log for hasCustomVoice prop
  useEffect(() => {
    console.log('RightNav hasCustomVoice changed:', hasCustomVoice);
  }, [hasCustomVoice]);

  // Define min, max values for each parameter
  const paramRanges = {
    pitch: { min: 0.5, max: 1.5, default: 1.0 },
    ambientSound: { min: 0.0, max: 1.0, default: 0.2 },
    speed: { min: 0.5, max: 2.0, default: 1.0 },
    stability: { min: 0.0, max: 1.0, default: 0.8 }
  };

  // Options for voice
  const voiceOptions = [
    { 
      id: 'Nguyễn Ngọc Ngạn', 
      name: 'Nguyễn Ngọc Ngạn',
    },
    { 
      id: 'Đình Soạn',
      name: 'Đình Soạn',
    },
    {
      id: 'Hồng Nhung',
      name: 'Hồng Nhung',
    },
    {
      id: 'Bảo Linh',
      name: 'Bảo Linh',
    }
  ];
  
  // Mood options
  const moodOptions = [
    { 
      id: 'Truyền Cảm', 
      name: 'Truyền Cảm',
    },
    { 
      id: 'Vui Vẻ', 
      name: 'Vui Vẻ',
    },
    { 
      id: 'Buồn Bã', 
      name: 'Buồn Bã',
    },
    { 
      id: 'Tự tin', 
      name: 'Tự tin',
    },
    { 
      id: 'Rụt rè', 
      name: 'Rụt rè',
    },
  ];
  
  // Helper functions remain the same
  const toPercent = (value: number, min: number, max: number): string => {
    return ((value - min) / (max - min) * 100).toFixed(0);
  };

  const fromPercent = (percent: number, min: number, max: number): number => {
    return min + (percent / 100) * (max - min);
  };

  const resetToDefault = () => {
    setPitch(paramRanges.pitch.default);
    setAmbientSound(paramRanges.ambientSound.default);
    setSpeed(paramRanges.speed.default);
    setStability(paramRanges.stability.default);
  };

  const [syncing, setSyncing] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");

  const handleSyncModel = async () => {
    setSyncing(true);
    setSyncMessage("");
    try {
      const response = await fetch(getApiUrl(API_ENDPOINTS.loadModel));
      if (!response.ok) {
        throw new Error("Lỗi khi sync model");
      }
      setSyncMessage("Tải model thành công!");
    } catch (error) {
      console.error("Error syncing model:", error);
      setSyncMessage("Tải model thất bại!");
    } finally {
      setSyncing(false);
      setShowSyncModal(true);
    }
  };

  // Nếu là chế độ compact (cho màn hình nhỏ), sẽ hiển thị dạng gọn lại
  if (isCompact) {
    return (
      <div className={`w-full ${
        darkMode 
          ? 'bg-gray-900 border-gray-700 text-white dark-mode' 
          : 'bg-white border-gray-200 text-gray-800 light-mode'
      }`}>
        {/* Compact header */}
        <div className={`p-3 mb-3 border rounded-lg ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h2 className="flex items-center text-base font-medium">
            <AdjustmentsHorizontalIcon className={`h-4 w-4 mr-2 ${
              darkMode ? 'text-gray-300' : 'text-gray-600'
            }`} />
            {translations.settings}
          </h2>
        </div>
        
        {/* Compact content */}
        <div className="space-y-4">
          {/* Voice and Emotion in one row */}
          <div className="grid grid-cols-2 gap-2">
            <CustomDropdown
              label={translations.voice}
              value={voice}
              options={voiceOptions}
              onChange={setVoice}
              compact={true}
              disabled={disabled || hasCustomVoice}
            />
            
            <CustomDropdown
              label={translations.emotion}
              value={emotion}
              options={moodOptions}
              onChange={setEmotion}
              compact={true}
              disabled={disabled || useAdvancedConfig || hasCustomVoice}
            />
          </div>

          {/* Checkbox toggle for more configuration */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="advancedConfigToggleCompact"
              checked={useAdvancedConfig}
              onChange={() => setUseAdvancedConfig(!useAdvancedConfig)}
              className={`h-4 w-4 mr-2 rounded border ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-blue-500' 
                  : 'bg-white border-gray-300 text-blue-600'
              }`}
              disabled={disabled}
            />
            <label 
              htmlFor="advancedConfigToggleCompact" 
              className={`text-sm font-medium ${
                darkMode ? 'text-gray-200' : 'text-gray-700'
              }`}
            >
              {translations.advancedConfiguration}
            </label>
          </div>
          
          {/* Note explaining disabled emotion when advanced config is enabled */}
          {useAdvancedConfig && (
            <div className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {translations.emotionDisabledNote}
            </div>
          )}

          {/* Controls in a compact grid - only show if useAdvancedConfig is true */}
          {useAdvancedConfig && (
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              {/* Pitch Control */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className={`text-xs font-medium ${
                    darkMode ? 'text-gray-200' : 'text-gray-800'
                  }`}>{translations.pitch}</label>
                  <span className={`text-xs ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>{pitch.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={toPercent(pitch, paramRanges.pitch.min, paramRanges.pitch.max)}
                  onChange={(e) => setPitch(fromPercent(parseInt(e.target.value), paramRanges.pitch.min, paramRanges.pitch.max))}
                  className={`w-full h-1 ${darkMode ? 'accent-white' : 'accent-gray-900'}`}
                  disabled={disabled}
                />
              </div>

              {/* Speed Control */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className={`text-xs font-medium ${
                    darkMode ? 'text-gray-200' : 'text-gray-800'
                  }`}>{translations.speed}</label>
                  <span className={`text-xs ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>{speed.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={toPercent(speed, paramRanges.speed.min, paramRanges.speed.max)}
                  onChange={(e) => setSpeed(fromPercent(parseInt(e.target.value), paramRanges.speed.min, paramRanges.speed.max))}
                  className={`w-full h-1 ${darkMode ? 'accent-white' : 'accent-gray-900'}`}
                  disabled={disabled}
                />
              </div>

              {/* Ambient Sound Control */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className={`text-xs font-medium ${
                    darkMode ? 'text-gray-200' : 'text-gray-800'
                  }`}>{translations.ambientSound}</label>
                  <span className={`text-xs ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>{ambientSound.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={toPercent(ambientSound, paramRanges.ambientSound.min, paramRanges.ambientSound.max)}
                  onChange={(e) => setAmbientSound(fromPercent(parseInt(e.target.value), paramRanges.ambientSound.min, paramRanges.ambientSound.max))}
                  className={`w-full h-1 ${darkMode ? 'accent-white' : 'accent-gray-900'}`}
                  disabled={disabled}
                />
              </div>

              {/* Stability Control */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className={`text-xs font-medium ${
                    darkMode ? 'text-gray-200' : 'text-gray-800'
                  }`}>{translations.stability}</label>
                  <span className={`text-xs ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>{stability.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={toPercent(stability, paramRanges.stability.min, paramRanges.stability.max)}
                  onChange={(e) => setStability(fromPercent(parseInt(e.target.value), paramRanges.stability.min, paramRanges.stability.max))}
                  className={`w-full h-1 ${darkMode ? 'accent-white' : 'accent-gray-900'}`}
                  disabled={disabled}
                />
              </div>
            </div>
          )}

          {/* Reset Button - only show if useAdvancedConfig is true */}
          {useAdvancedConfig && (
            <button
              onClick={resetToDefault}
              className={`w-full mt-2 flex items-center justify-center py-2 px-3 border rounded-md shadow-sm text-xs ${
                darkMode 
                  ? 'bg-gray-800 border-gray-600 text-gray-200 hover:bg-gray-700' 
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
              disabled={disabled}
            >
              <ArrowPathIcon className="h-3 w-3 mr-1" />
              {translations.defaultSettings}
            </button>
          )}

          {/* Nút Sync Model */}
          <button
            onClick={handleSyncModel}
            disabled={syncing || disabled}
            className="w-full mt-2 flex items-center justify-center py-2 px-3 rounded-md shadow-sm text-xs bg-black text-white font-semibold hover:bg-gray-800 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {syncing ? translations.loadingModel : translations.syncModel}
          </button>
        </div>
      </div>
    );
  }

  // Phiên bản đầy đủ cho màn hình lớn/trung bình
  return (
    <nav className={`w-96 border-l flex flex-col h-full ${
      darkMode 
        ? 'bg-gray-900 border-gray-700 text-white dark-mode' 
        : 'bg-white border-gray-200 text-gray-800 light-mode'
    }`}>
      {/* Fixed header */}
      <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <h2 className="flex items-center text-lg font-medium">
          <AdjustmentsHorizontalIcon className={`h-5 w-5 mr-2 ${
            darkMode ? 'text-gray-300' : 'text-gray-600'
          }`} />
          {translations.settings}
        </h2>
      </div>
      
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6">
          {/* Voice Selection - Thay select bằng custom dropdown */}
          <CustomDropdown
            label={translations.voice}
            value={voice}
            options={voiceOptions}
            onChange={setVoice}
            disabled={disabled || hasCustomVoice}
          />

          {/* Mood Selection - Thay select bằng custom dropdown */}
          <CustomDropdown
            label={translations.emotion}
            value={emotion}
            options={moodOptions}
            onChange={setEmotion}
            disabled={disabled || useAdvancedConfig || hasCustomVoice}
          />

          {/* Checkbox toggle for more configuration */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="advancedConfigToggle"
              checked={useAdvancedConfig}
              onChange={() => setUseAdvancedConfig(!useAdvancedConfig)}
              className={`h-5 w-5 mr-3 rounded border ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-blue-500' 
                  : 'bg-white border-gray-300 text-blue-600'
              }`}
              disabled={disabled}
            />
            <label 
              htmlFor="advancedConfigToggle" 
              className={`text-base font-medium ${
                darkMode ? 'text-gray-200' : 'text-gray-700'
              }`}
            >
              {translations.advancedConfiguration}
            </label>
          </div>
          
          {/* Note explaining disabled emotion when advanced config is enabled */}
          {useAdvancedConfig && (
            <div className={`text-sm mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {translations.emotionDisabledNote}
            </div>
          )}

          {/* Additional configuration - only show if useAdvancedConfig is true */}
          {useAdvancedConfig && (
            <>
              {/* Pitch Control */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className={`text-sm font-medium ${
                    darkMode ? 'text-gray-200' : 'text-gray-800'
                  }`}>{translations.pitch}</label>
                  <span className={`text-sm font-medium ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>{pitch.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={toPercent(pitch, paramRanges.pitch.min, paramRanges.pitch.max)}
                  onChange={(e) => setPitch(fromPercent(parseInt(e.target.value), paramRanges.pitch.min, paramRanges.pitch.max))}
                  className={`w-full ${darkMode ? 'accent-white' : 'accent-gray-900'}`}
                  disabled={disabled}
                />
                <div className={`flex justify-between text-xs mt-2 ${
                  darkMode ? 'text-gray-400' : 'text-gray-700'
                }`}>
                  <span>{translations.lower}</span>
                  <span>{translations.higher}</span>
                </div>
              </div>

              {/* Ambient Sound Control */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className={`text-sm font-medium ${
                    darkMode ? 'text-gray-200' : 'text-gray-800'
                  }`}>{translations.ambientSound}</label>
                  <span className={`text-sm font-medium ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>{ambientSound.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={toPercent(ambientSound, paramRanges.ambientSound.min, paramRanges.ambientSound.max)}
                  onChange={(e) => setAmbientSound(fromPercent(parseInt(e.target.value), paramRanges.ambientSound.min, paramRanges.ambientSound.max))}
                  className={`w-full ${darkMode ? 'accent-white' : 'accent-gray-900'}`}
                  disabled={disabled}
                />
                <div className={`flex justify-between text-xs mt-2 ${
                  darkMode ? 'text-gray-400' : 'text-gray-700'
                }`}>
                  <span>{translations.less}</span>
                  <span>{translations.more}</span>
                </div>
              </div>

              {/* Speed Control */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className={`text-sm font-medium ${
                    darkMode ? 'text-gray-200' : 'text-gray-800'
                  }`}>{translations.speed}</label>
                  <span className={`text-sm font-medium ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>{speed.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={toPercent(speed, paramRanges.speed.min, paramRanges.speed.max)}
                  onChange={(e) => setSpeed(fromPercent(parseInt(e.target.value), paramRanges.speed.min, paramRanges.speed.max))}
                  className={`w-full ${darkMode ? 'accent-white' : 'accent-gray-900'}`}
                  disabled={disabled}
                />
                <div className={`flex justify-between text-xs mt-2 ${
                  darkMode ? 'text-gray-400' : 'text-gray-700'
                }`}>
                  <span>{translations.slower}</span>
                  <span>{translations.faster}</span>
                </div>
              </div>

              {/* Stability Control */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className={`text-sm font-medium ${
                    darkMode ? 'text-gray-200' : 'text-gray-800'
                  }`}>{translations.stability}</label>
                  <span className={`text-sm font-medium ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>{stability.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={toPercent(stability, paramRanges.stability.min, paramRanges.stability.max)}
                  onChange={(e) => setStability(fromPercent(parseInt(e.target.value), paramRanges.stability.min, paramRanges.stability.max))}
                  className={`w-full ${darkMode ? 'accent-white' : 'accent-gray-900'}`}
                  disabled={disabled}
                />
                <div className={`flex justify-between text-xs mt-2 ${
                  darkMode ? 'text-gray-400' : 'text-gray-700'
                }`}>
                  <span>{translations.variable}</span>
                  <span>{translations.stable}</span>
                </div>
              </div>

              {/* Reset Button */}
              <button
                onClick={resetToDefault}
                className={`w-full mt-8 flex items-center justify-center py-2.5 px-4 border rounded-md shadow-sm text-sm font-medium ${
                  darkMode 
                    ? 'bg-gray-800 border-gray-600 text-gray-200 hover:bg-gray-700' 
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
                disabled={disabled}
              >
                <ArrowPathIcon className="h-4 w-4 mr-2" />
                {translations.defaultSettings}
              </button>
            </>
          )}

          {/* Nút Sync Model */}
          <button
            onClick={handleSyncModel}
            disabled={syncing || disabled}
            className="w-full mt-2 flex items-center justify-center py-2 px-3 rounded-md shadow-sm text-xs bg-black text-white font-semibold hover:bg-gray-800 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {syncing ? translations.loadingModel : translations.syncModel}
          </button>
        </div>
      </div>
      
      {/* Footer */}
      <div className={`p-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className={`text-xs text-center ${
          darkMode ? 'text-gray-400' : 'text-gray-500'
        }`}>
          © 2025 Synsere. All rights reserved.
        </div>
      </div>

      {/* Popup thông báo sync model */}
      {showSyncModal && (
        <div className="fixed top-6 right-6 z-50">
          <div className="bg-white border border-gray-300 rounded-lg shadow-lg px-6 py-4 min-w-[220px] text-center flex flex-col items-center">
            <div className="mb-2 text-base font-semibold text-gray-800">{syncMessage}</div>
            <button
              onClick={() => setShowSyncModal(false)}
              className="mt-1 px-3 py-1 bg-black text-white rounded hover:bg-gray-800 text-sm"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}