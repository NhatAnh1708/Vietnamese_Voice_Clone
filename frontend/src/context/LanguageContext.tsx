"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'vi';

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  changeLanguage: (lang: Language) => void;
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
    "recordOrUpload": "Record or Upload",
    "voiceUploaded": "Voice uploaded",
    "historyAppearHere": "Your history will appear here",
    "documentsAppearHere": "Your documents will appear here",
    
    // Header
    "notification": "Notification",
    "notifications": "Notifications",
    "myProfile": "My Profile",
    "settings": "Settings",
    "signOut": "Sign Out",
    "myWorkspace": "My Workspace",
    
    // Main Content
    "textToSpeech": "Text-to-Speech",
    "typePasteText": "Type or paste text here...",
    "storyGenre": "Story Genre",
    "narrate": "Narrate",
    "comedy": "Comedy",
    "podcast": "Podcast",
    "horror": "Horror",
    "backgroundAudio": "Background Audio",
    
    // Generate Controls
    "generateSpeech": "Generate Speech",
    
    // Right Nav
    "voice": "Voice",
    "emotion": "Emotion",
    "pitch": "Pitch",
    "ambientSound": "Ambient Sound",
    "speed": "Speed",
    "female": "Female",
    "male": "Male",
    "none": "None",
    "happy": "Happy",
    "lower": "Lower",
    "higher": "Higher",
    "less": "Less",
    "more": "More",
    "slower": "Slower",
    "faster": "Faster",
    "defaultSettings": "Default Settings",
    "advancedConfiguration": "Advanced Configuration",
    "emotionDisabledNote": "Emotion mode is disabled when using advanced configuration",
    
    // Emotions
    "Truyền Cảm": "Expressive",
    "Trầm ấm": "Warm",
    "Vui Vẻ": "Happy",
    
    // Player
    "currentAudio": "Current Audio",
    "processingText": "Processing text",
    
    // Notifications
    "apiError": "Error",
    "apiSuccess": "Success",
    "speechGenerationSuccess": "Speech generated successfully!",
    "speechGenerationError": "Could not generate speech. Please try again."
  },
  vi: {
    // Navigation
    "voices": "Giọng nói",
    "history": "Lịch sử",
    "documents": "Tài liệu",
    "addVoice": "Thêm giọng nói",
    "recordOrUpload": "Ghi âm hoặc tải lên tệp",
    "voiceUploaded": "Giọng nói đã được thêm",
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
    "backgroundAudio": "Âm thanh nền",
    
    // Generate Controls
    "generateSpeech": "Tạo giọng nói",
    
    // Right Nav
    "voice": "Giọng nói",
    "emotion": "Giọng đọc",
    "pitch": "Cao độ",
    "ambientSound": "Âm thanh nền",
    "speed": "Tốc độ",
    "female": "Nữ",
    "male": "Nam",
    "none": "Không",
    "happy": "Vui vẻ",
    "lower": "Thấp hơn",
    "higher": "Cao hơn",
    "less": "Ít hơn",
    "more": "Nhiều hơn",
    "slower": "Chậm hơn",
    "faster": "Nhanh hơn",
    "defaultSettings": "Cài đặt mặc định",
    "advancedConfiguration": "Cấu hình nâng cao",
    "emotionDisabledNote": "Chế độ giọng đọc bị vô hiệu hóa khi sử dụng cấu hình nâng cao",
    
    // Player
    "currentAudio": "Âm thanh hiện tại",
    "processingText": "Đang xử lý văn bản",
    
    // Notifications
    "apiError": "Lỗi",
    "apiSuccess": "Thành công",
    "speechGenerationSuccess": "Tạo giọng nói thành công!",
    "speechGenerationError": "Không thể tạo giọng nói. Vui lòng thử lại."
  }
};

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  toggleLanguage: () => {},
  changeLanguage: () => {},
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
  
  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
    setTranslations(translationMap[lang]);
    localStorage.setItem('language', lang);
  };
  
  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, changeLanguage, translations }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}