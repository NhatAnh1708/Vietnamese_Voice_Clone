"use client";
import React, { createContext, useContext, useState } from 'react';

interface AudioContextType {
  currentText: string;
  setCurrentText: (text: string) => void;
}

const AudioContext = createContext<AudioContextType>({
  currentText: '',
  setCurrentText: () => {},
});

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [currentText, setCurrentText] = useState('');

  return (
    <AudioContext.Provider value={{ currentText, setCurrentText }}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  return useContext(AudioContext);
}