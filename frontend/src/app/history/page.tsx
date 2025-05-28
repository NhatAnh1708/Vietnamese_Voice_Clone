'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { getApiUrl, API_ENDPOINTS } from '@/utils/api';
import { useLanguage } from '@/context/LanguageContext';
import Header from '@/components/Header';
import { PlayIcon, PauseIcon, TrashIcon, ArrowDownTrayIcon } from '@heroicons/react/24/solid';

interface HistoryEntry {
  id: string;
  text: string;
  audio_url: string;
  settings: {
    language: string;
    voice_name?: string;
    voice?: string;
    emotion: string;
    genre: string;
    background_audio?: string;
    advanced_config?: boolean;
    pitch?: number;
    speed?: number;
    stability?: number;
    ambient_sound?: number;
  };
  created_at: string;
}

export default function HistoryPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [expandedText, setExpandedText] = useState<string | null>(null);
  const { darkMode } = useTheme();
  const { language, translations } = useLanguage();
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  // Process URLs to include token
  const getAuthenticatedUrl = (url: string): string => {
    if (!url || !authToken) return url;
    
    // Check if the URL has query parameters already
    const hasQueryParams = url.includes('?');
    const separator = hasQueryParams ? '&' : '?';
    
    // Append token to the URL
    return `${url}${separator}token=${authToken}`;
  };

  // Check authentication status
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      setAuthToken(token);
      setIsAuthenticated(true);
    } else {
      router.push('/login');
    }
  }, [router]);

  // Fetch history data
  useEffect(() => {
    if (isAuthenticated && authToken) {
      fetchHistory();
    }
  }, [isAuthenticated, authToken]);

  // Handle audio element
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const audio = new Audio();
      audio.onended = () => setCurrentlyPlaying(null);
      setAudioElement(audio);
      
      return () => {
        audio.pause();
        audio.src = '';
      };
    }
  }, []);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(getApiUrl(API_ENDPOINTS.speechHistory), {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      if (response.status === 401) {
        localStorage.removeItem('auth_token');
        setIsAuthenticated(false);
        router.push('/login');
        return;
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch history');
      }
      
      const data = await response.json();
      setHistory(data);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    setIsAuthenticated(false);
    router.push('/login');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(language === 'en' ? 'en-US' : 'vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const playAudio = (id: string, url: string) => {
    if (audioElement && authToken) {
      if (currentlyPlaying === id) {
        audioElement.pause();
        setCurrentlyPlaying(null);
      } else {
        // First try with the token in the URL
        const audioUrlWithAuth = getAuthenticatedUrl(url);
        audioElement.src = audioUrlWithAuth;
        audioElement.play().catch(error => {
          console.error('Error playing audio with URL token:', error);
          
          // If direct URL with token fails, try fetch with authentication header
          fetch(url, {
            headers: {
              'Authorization': `Bearer ${authToken}`
            }
          })
          .then(response => {
            if (!response.ok) throw new Error('Failed to fetch audio');
            return response.blob();
          })
          .then(blob => {
            const blobUrl = URL.createObjectURL(blob);
            audioElement.src = blobUrl;
            audioElement.play().catch(e => console.error('Error playing blob audio:', e));
            setCurrentlyPlaying(id);
          })
          .catch(err => {
            console.error('Error fetching audio with authentication:', err);
            setCurrentlyPlaying(null);
          });
        });
        setCurrentlyPlaying(id);
      }
    }
  };

  const downloadAudio = async (url: string, filename: string) => {
    if (!authToken) return;
    
    try {
      // Fetch the audio file with authentication
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to download audio file');
      }
      
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `synsere-${filename}.wav`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the blob URL
      setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
    } catch (error) {
      console.error('Error downloading audio:', error);
      alert(language === 'en' ? 'Error downloading audio file' : 'Lỗi khi tải tệp âm thanh');
    }
  };

  const toggleTextExpand = (id: string) => {
    if (expandedText === id) {
      setExpandedText(null);
    } else {
      setExpandedText(id);
    }
  };

  const deleteHistoryEntry = async (id: string) => {
    try {
      const response = await fetch(getApiUrl(`${API_ENDPOINTS.speechHistory}/${id}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      if (response.ok) {
        // Refresh history
        fetchHistory();
      }
    } catch (error) {
      console.error('Error deleting history entry:', error);
    }
  };

  // Helper to get the correct voice name from the entry
  const getVoiceName = (entry: HistoryEntry): string => {
    return entry.settings.voice_name || entry.settings.voice || '';
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'}`}>
      <Header 
        isSmallScreen={false} 
        onToggleLeftNav={() => {}} 
        showMobileLeftNav={false}
        isAuthenticated={isAuthenticated}
        onLogout={handleLogout}
      />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">
          {language === 'en' ? 'Speech History' : 'Lịch sử giọng nói'}
        </h1>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : history.length === 0 ? (
          <div className={`p-8 text-center rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white shadow'}`}>
            <p className="text-lg">
              {language === 'en' ? 'No history found. Generate some speech to see it here!' : 'Không tìm thấy lịch sử. Tạo giọng nói để xem tại đây!'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {history.map((entry) => (
              <div 
                key={entry.id} 
                className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white shadow'}`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className={`text-sm mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {formatDate(entry.created_at)}
                    </p>
                    <div 
                      onClick={() => toggleTextExpand(entry.id)}
                      className="cursor-pointer"
                    >
                      <p className={`text-lg font-medium mb-2 ${expandedText === entry.id ? '' : 'line-clamp-2'}`}>
                        {entry.text}
                      </p>
                      {entry.text.length > 100 && (
                        <button 
                          className={`text-xs font-medium mb-2 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}
                        >
                          {expandedText === entry.id ? 
                            (language === 'en' ? 'Show less' : 'Thu gọn') : 
                            (language === 'en' ? 'Show more' : 'Xem thêm')}
                        </button>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                        {getVoiceName(entry)}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                        {entry.settings.emotion}
                      </span>
                      {entry.settings.genre && (
                        <span className={`px-2 py-1 rounded-full text-xs ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                          {entry.settings.genre}
                        </span>
                      )}
                      {entry.settings.background_audio && (
                        <span className={`px-2 py-1 rounded-full text-xs ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                          {entry.settings.background_audio.replace(/_/g, ' ')}
                        </span>
                      )}
                      {entry.settings.advanced_config && (
                        <span className={`px-2 py-1 rounded-full text-xs ${darkMode ? 'bg-blue-600' : 'bg-blue-100 text-blue-800'}`}>
                          {language === 'en' ? 'Advanced' : 'Nâng cao'}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => playAudio(entry.id, entry.audio_url)}
                      className={`p-2 rounded-full ${darkMode ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-indigo-500 hover:bg-indigo-600'} text-white`}
                      aria-label={currentlyPlaying === entry.id ? "Pause" : "Play"}
                    >
                      {currentlyPlaying === entry.id ? (
                        <PauseIcon className="h-5 w-5" />
                      ) : (
                        <PlayIcon className="h-5 w-5" />
                      )}
                    </button>
                    
                    <button
                      onClick={() => downloadAudio(entry.audio_url, `speech-${entry.id.substring(0, 8)}`)}
                      className={`p-2 rounded-full ${darkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'} text-white`}
                      aria-label="Download"
                    >
                      <ArrowDownTrayIcon className="h-5 w-5" />
                    </button>
                    
                    <button
                      onClick={() => deleteHistoryEntry(entry.id)}
                      className={`p-2 rounded-full ${darkMode ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600'} text-white`}
                      aria-label="Delete"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}