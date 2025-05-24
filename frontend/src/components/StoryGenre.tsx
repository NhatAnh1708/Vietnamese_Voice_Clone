"use client";
import { useState, useEffect } from 'react';
import { BookOpenIcon, FaceSmileIcon, RadioIcon, MoonIcon } from '@heroicons/react/24/outline';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';

interface StoryGenreProps {
  selectedGenre: string;
  setSelectedGenre: (g: string) => void;
  selectedBackground: string;
  setSelectedBackground: (b: string) => void;
}

export default function StoryGenre({ 
  selectedGenre, 
  setSelectedGenre, 
  selectedBackground,
  setSelectedBackground 
}: StoryGenreProps) {
  const { darkMode } = useTheme();
  const { translations, language } = useLanguage();
  const [showBackgrounds, setShowBackgrounds] = useState(false);
  
  // When selectedGenre changes, automatically show backgrounds
  useEffect(() => {
    setShowBackgrounds(true);
  }, [selectedGenre]);
  
  const genres = [
    { id: 'narrate', name: translations.narrate, icon: <BookOpenIcon className="w-4 h-4" /> },
    { id: 'comedy', name: translations.comedy, icon: <FaceSmileIcon className="w-4 h-4" /> },
    { id: 'podcast', name: translations.podcast, icon: <RadioIcon className="w-4 h-4" /> },
    { id: 'horror', name: translations.horror, icon: <MoonIcon className="w-4 h-4" /> },
  ];
  
  // Background options for each genre
  const backgroundOptions = {
    narrate: [
      { id: 'narrate_audio_1', name: language === 'vi' ? 'Tự sự Audio 1' : 'Narrate Audio 1' },
      { id: 'narrate_audio_2', name: language === 'vi' ? 'Tự sự Audio 2' : 'Narrate Audio 2' },
      { id: 'narrate_audio_3', name: language === 'vi' ? 'Tự sự Audio 3' : 'Narrate Audio 3' },
    ],
    comedy: [
      { id: 'comedy_audio_1', name: language === 'vi' ? 'Hài Audio 1' : 'Comedy Audio 1' },
      { id: 'comedy_audio_2', name: language === 'vi' ? 'Hài Audio 2' : 'Comedy Audio 2' },
      { id: 'comedy_audio_3', name: language === 'vi' ? 'Hài Audio 3' : 'Comedy Audio 3' },
    ],
    podcast: [
      { id: 'podcast_audio_1', name: language === 'vi' ? 'Podcast Audio 1' : 'Podcast Audio 1' },
      { id: 'podcast_audio_2', name: language === 'vi' ? 'Podcast Audio 2' : 'Podcast Audio 2' },
      { id: 'podcast_audio_3', name: language === 'vi' ? 'Podcast Audio 3' : 'Podcast Audio 3' },
    ],
    horror: [
      { id: 'horror_audio_1', name: language === 'vi' ? 'Kinh dị Audio 1' : 'Horror Audio 1' },
      { id: 'horror_audio_2', name: language === 'vi' ? 'Kinh dị Audio 2' : 'Horror Audio 2' },
      { id: 'horror_audio_3', name: language === 'vi' ? 'Kinh dị Audio 3' : 'Horror Audio 3' },
    ],
  };
  
  const handleGenreClick = (genreId: string) => {
    if (selectedGenre === genreId) {
      // Toggle background visibility when clicking the already selected genre
      setShowBackgrounds(!showBackgrounds);
    } else {
      // Select the new genre and show backgrounds
      setSelectedGenre(genreId);
      setShowBackgrounds(true);
      // Select the first background by default when changing genre
      setSelectedBackground(backgroundOptions[genreId as keyof typeof backgroundOptions][0].id);
    }
  };
  
  // Get backgrounds for the currently selected genre
  const currentBackgrounds = backgroundOptions[selectedGenre as keyof typeof backgroundOptions] || [];
  
  return (
    <div className={`sticky bottom-20 md:bottom-16 pt-3 border-t pb-1 px-5 ${
      darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      <h2 className={`text-sm font-semibold mb-3 ${
        darkMode ? 'text-gray-100' : 'text-gray-600'
      }`}>{translations.storyGenre}</h2>
      
      {/* Genre Selector - horizontal layout */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {genres.map((genre) => (
          <button
            key={genre.id}
            onClick={() => handleGenreClick(genre.id)}
            className={`p-2 border rounded-lg flex items-center justify-center transition-all duration-150 ease-in-out ${
              selectedGenre === genre.id
                ? darkMode 
                  ? 'border-gray-600 bg-gray-800 text-gray-200 ring-1 ring-gray-600'
                  : 'border-gray-300 bg-white shadow-sm shadow-gray-200/60 ring-1 ring-gray-200 text-gray-800'
                : darkMode
                  ? 'border-gray-700 bg-gray-900 hover:bg-gray-800 text-gray-300'
                  : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
            }`}
          >
            <span className="mr-2">{genre.icon}</span>
            <span className="text-sm">{genre.name}</span>
          </button>
        ))}
      </div>
      
      {/* Background Audio Selector - appears below when a genre is selected */}
      {showBackgrounds && (
        <div className={`mt-3 p-2 rounded-md border ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
        }`}>
          <h3 className={`text-xs font-medium mb-2 ${
            darkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>{translations.backgroundAudio}</h3>
          
          <div className="grid grid-cols-3 gap-2">
            {currentBackgrounds.map((background) => (
              <button
                key={background.id}
                onClick={() => setSelectedBackground(background.id)}
                className={`py-1 px-2 border rounded text-xs transition-all duration-150 ease-in-out ${
                  selectedBackground === background.id
                    ? darkMode 
                      ? 'border-blue-700 bg-blue-900 text-blue-200 ring-1 ring-blue-700'
                      : 'border-blue-300 bg-blue-50 text-blue-800 ring-1 ring-blue-300'
                    : darkMode
                      ? 'border-gray-700 bg-gray-800 hover:bg-gray-700 text-gray-300'
                      : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
                }`}
              >
                {background.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}