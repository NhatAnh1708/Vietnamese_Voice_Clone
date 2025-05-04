"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'vi';

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  translations: Record<string, string>;
}

// Define translations for both languages
const translationMap: Record<Language, Record<string, string>> = {
  en: {


    // Navigation
    "voices": "Voices",
    "history": "History",
    "documents": "Documents",
    "addVoice": "Add Voice",
    "recordOrUpload": "Record your voice or upload files",
    "historyAppearHere": "Your history will appear here",
    "documentsAppearHere": "Your documents will appear here",
    
    // Header
    "notification": "Notification",
    "notifications": "Notifications",
    "myProfile": "My Profile",
    "settings": "Settings",
    "signOut": "Sign out",
    "myWorkspace": "My Workspace",
    
    // Main Content
    "textToSpeech": "Text-to-Speech",
    "typePasteText": "Type or paste your text here...",
    "storyGenre": "Story genre",
    "narrate": "Narrate",
    "comedy": "Comedy",
    "podcast": "Podcast",
    "horror": "Horror",
    
    // Generate Controls
    "creditsRemaining": "credits remaining",
    "generateSpeech": "Generate Speech",
    
    // Right Nav
    "voice": "Voice",
    "emotion": "Emotion",
    "pitch": "Pitch",
    "ambientSound": "Ambient Sound",
    "speed": "Speed",
    "stability": "Stability",
    "female": "Female",
    "male": "Male",
    "none": "None",
    "happy": "Happy",
    "sad": "Sad",
    "confident": "Confident",
    "shy": "Shy",
    "lower": "Lower",
    "higher": "Higher",
    "less": "Less",
    "more": "More",
    "slower": "Slower",
    "faster": "Faster",
    "variable": "Variable",
    "stable": "Stable",
    "defaultSettings": "Default Settings",
    
    // Player
    "currentAudio": "Current audio",
    "processingText": "Processing your text"
  },
  vi: {
    // Navigation
    "voices": "Giọng nói",
    "history": "Lịch sử",
    "documents": "Tài liệu",
    "addVoice": "Thêm giọng nói",
    "recordOrUpload": "Ghi âm hoặc tải lên tệp",
    "historyAppearHere": "Lịch sử của bạn sẽ xuất hiện ở đây",
    "documentsAppearHere": "Tài liệu của bạn sẽ xuất hiện ở đây",
    
    // Header
    "notification": "Thông báo",
    "notifications": "Thông báo",
    "myProfile": "Hồ sơ của tôi",
    "settings": "Cài đặt",
    "signOut": "Đăng xuất",
    "myWorkspace": "Hồ sơ của tôi",
    
    // Main Content
    "textToSpeech": "Text-to-Speech",
    "typePasteText": "Nhập hoặc dán văn bản ở đây...",
    "storyGenre": "Thể loại truyện",
    "narrate": "Tự sự",
    "comedy": "Truyện hài",
    "podcast": "Podcast",
    "horror": "Kinh dị",
    
    // Generate Controls
    "creditsRemaining": "tín dụng còn lại",
    "generateSpeech": "Tạo giọng nói",
    
    // Right Nav
    "voice": "Giọng nói",
    "emotion": "Cảm xúc",
    "pitch": "Cao độ",
    "ambientSound": "Âm thanh nền",
    "speed": "Tốc độ",
    "stability": "Độ ổn định",
    "female": "Nữ",
    "male": "Nam",
    "none": "Không",
    "happy": "Vui vẻ",
    "sad": "Buồn bã",
    "confident": "Tự tin",
    "shy": "Nhút nhát",
    "lower": "Thấp hơn",
    "higher": "Cao hơn",
    "less": "Ít hơn",
    "more": "Nhiều hơn",
    "slower": "Chậm hơn",
    "faster": "Nhanh hơn",
    "variable": "Thay đổi",
    "stable": "Ổn định",
    "defaultSettings": "Cài đặt mặc định",
    
    // Player
    "currentAudio": "Âm thanh hiện tại",
    "processingText": "Đang xử lý văn bản"
  }
};

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  toggleLanguage: () => {},
  translations: translationMap.en,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');
  const [translations, setTranslations] = useState(translationMap.en);
  
  // Load saved language preference from localStorage on component mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'vi')) {
      setLanguage(savedLanguage);
      setTranslations(translationMap[savedLanguage]);
    }
  }, []);
  
  const toggleLanguage = () => {
    const newLanguage = language === 'en' ? 'vi' : 'en';
    setLanguage(newLanguage);
    setTranslations(translationMap[newLanguage]);
    localStorage.setItem('language', newLanguage);
  };
  
  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, translations }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}