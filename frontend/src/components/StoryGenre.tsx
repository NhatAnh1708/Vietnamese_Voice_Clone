"use client";
import { useState } from 'react';
import { BookOpenIcon, FaceSmileIcon, RadioIcon, MoonIcon } from '@heroicons/react/24/outline';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';

interface StoryGenreProps {
  selectedGenre: string;
  setSelectedGenre: (g: string) => void;
}

export default function StoryGenre({ selectedGenre, setSelectedGenre }: StoryGenreProps) {
  const { darkMode } = useTheme();
  const { translations } = useLanguage();
  
  const genres = [
    { id: 'narrate', name: translations.narrate, icon: <BookOpenIcon className="w-4 h-4" /> },
    { id: 'comedy', name: translations.comedy, icon: <FaceSmileIcon className="w-4 h-4" /> },
    { id: 'podcast', name: translations.podcast, icon: <RadioIcon className="w-4 h-4" /> },
    { id: 'horror', name: translations.horror, icon: <MoonIcon className="w-4 h-4" /> },
  ];
  
  return (
    <div className={`sticky bottom-20 md:bottom-16 pt-3 border-t pb-1 px-5 ${
      darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      <h2 className={`text-sm font-semibold mb-3 ${
        darkMode ? 'text-gray-100' : 'text-gray-600'
      }`}>{translations.storyGenre}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {genres.map((genre) => (
          <button
            key={genre.id}
            onClick={() => setSelectedGenre(genre.id)}
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
    </div>
  );
}