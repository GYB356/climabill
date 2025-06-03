"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

interface AccessibilityContextType {
  // High contrast mode
  highContrast: boolean;
  toggleHighContrast: () => void;
  
  // Text size adjustments
  textSize: 'normal' | 'large' | 'larger';
  setTextSize: (size: 'normal' | 'large' | 'larger') => void;
  
  // Animation preferences
  reduceMotion: boolean;
  toggleReduceMotion: () => void;
  
  // Keyboard navigation mode
  keyboardMode: boolean;
  setKeyboardMode: (isActive: boolean) => void;
  
  // Color blind modes
  colorBlindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  setColorBlindMode: (mode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia') => void;
  
  // Font family for dyslexic users
  fontFamily: 'default' | 'dyslexic';
  setFontFamily: (font: 'default' | 'dyslexic') => void;
  
  // Focus indicator styles
  focusIndicator: 'default' | 'high';
  setFocusIndicator: (style: 'default' | 'high') => void;
  
  // Screen reader announcements
  announce: (message: string, assertive?: boolean) => void;
  
  // Accessibility preferences serialization
  savePreferences: () => void;
  resetPreferences: () => void;
  
  // Status
  preferencesLoaded: boolean;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
}

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  // State for accessibility preferences
  const [highContrast, setHighContrast] = useState(false);
  const [textSize, setTextSize] = useState<'normal' | 'large' | 'larger'>('normal');
  const [reduceMotion, setReduceMotion] = useState(false);
  const [keyboardMode, setKeyboardMode] = useState(false);
  const [colorBlindMode, setColorBlindMode] = useState<'none' | 'protanopia' | 'deuteranopia' | 'tritanopia'>('none');
  const [fontFamily, setFontFamily] = useState<'default' | 'dyslexic'>('default');
  const [focusIndicator, setFocusIndicator] = useState<'default' | 'high'>('default');
  const [announcement, setAnnouncement] = useState('');
  const [assertive, setAssertive] = useState(false);
  const [preferencesLoaded, setPreferencesLoaded] = useState(false);
  
  // Toggle high contrast mode
  const toggleHighContrast = () => {
    const newValue = !highContrast;
    setHighContrast(newValue);
    localStorage.setItem('highContrast', newValue.toString());
    document.documentElement.classList.toggle('high-contrast', newValue);
  };
  
  // Toggle reduced motion
  const toggleReduceMotion = () => {
    const newValue = !reduceMotion;
    setReduceMotion(newValue);
    localStorage.setItem('reduceMotion', newValue.toString());
    document.documentElement.classList.toggle('reduce-motion', newValue);
  };
  
  // Set text size
  const handleSetTextSize = (size: 'normal' | 'large' | 'larger') => {
    setTextSize(size);
    localStorage.setItem('textSize', size);
    
    // Remove existing size classes
    document.documentElement.classList.remove('text-normal', 'text-large', 'text-larger');
    // Add new size class
    document.documentElement.classList.add(`text-${size}`);
  };
  
  // Screen reader announcement
  const announce = (message: string, isAssertive = false) => {
    setAnnouncement(message);
    setAssertive(isAssertive);
    
    // Clear announcement after 3 seconds to avoid repeated announcements
    setTimeout(() => {
      setAnnouncement('');
    }, 3000);
  };
  
  // Detect keyboard navigation mode
  useEffect(() => {
    const handleFirstTab = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        setKeyboardMode(true);
        document.documentElement.classList.add('keyboard-mode');
        document.removeEventListener('keydown', handleFirstTab);
      }
    };
    
    document.addEventListener('keydown', handleFirstTab);
    return () => {
      document.removeEventListener('keydown', handleFirstTab);
    };
  }, []);

  // Apply class for keyboard focus indicator style
  useEffect(() => {
    document.documentElement.classList.toggle('focus-high', focusIndicator === 'high');
  }, [focusIndicator]);

  // Apply class for dyslexic font
  useEffect(() => {
    document.documentElement.classList.toggle('font-dyslexic', fontFamily === 'dyslexic');
  }, [fontFamily]);

  // Apply color blind mode filters
  useEffect(() => {
    // Remove all color blind mode classes first
    document.documentElement.classList.remove(
      'filter-protanopia', 
      'filter-deuteranopia', 
      'filter-tritanopia'
    );
    
    // Add the selected color blind mode class if not 'none'
    if (colorBlindMode !== 'none') {
      document.documentElement.classList.add(`filter-${colorBlindMode}`);
    }
  }, [colorBlindMode]);

  // Load user preferences from localStorage on mount
  useEffect(() => {
    // Load existing preferences
    const loadPreferences = () => {
      // High contrast
      const savedHighContrast = localStorage.getItem('a11y-highContrast') === 'true';
      setHighContrast(savedHighContrast);
      document.documentElement.classList.toggle('high-contrast', savedHighContrast);
      
      // Text size
      const savedTextSize = localStorage.getItem('a11y-textSize') as 'normal' | 'large' | 'larger' | null;
      if (savedTextSize) {
        setTextSize(savedTextSize);
        document.documentElement.classList.remove('text-normal', 'text-large', 'text-larger');
        document.documentElement.classList.add(`text-${savedTextSize}`);
      } else {
        document.documentElement.classList.add('text-normal');
      }
      
      // Reduced motion
      const savedReduceMotion = localStorage.getItem('a11y-reduceMotion') === 'true';
      setReduceMotion(savedReduceMotion);
      document.documentElement.classList.toggle('reduce-motion', savedReduceMotion);
      
      // Keyboard mode
      const savedKeyboardMode = localStorage.getItem('a11y-keyboardMode') === 'true';
      setKeyboardMode(savedKeyboardMode);
      document.documentElement.classList.toggle('keyboard-mode', savedKeyboardMode);
      
      // Color blind mode
      const savedColorBlindMode = localStorage.getItem('a11y-colorBlindMode') as 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia' | null;
      if (savedColorBlindMode) {
        setColorBlindMode(savedColorBlindMode);
      }
      
      // Font family
      const savedFontFamily = localStorage.getItem('a11y-fontFamily') as 'default' | 'dyslexic' | null;
      if (savedFontFamily) {
        setFontFamily(savedFontFamily);
      }
      
      // Focus indicator
      const savedFocusIndicator = localStorage.getItem('a11y-focusIndicator') as 'default' | 'high' | null;
      if (savedFocusIndicator) {
        setFocusIndicator(savedFocusIndicator);
      }
    };
    
    // Check system preferences
    const checkSystemPreferences = () => {
      // Check user's prefers-reduced-motion media query
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion && localStorage.getItem('a11y-reduceMotion') === null) {
        setReduceMotion(true);
        document.documentElement.classList.add('reduce-motion');
        localStorage.setItem('a11y-reduceMotion', 'true');
      }
      
      // Check user's prefers-contrast media query for high contrast
      const prefersHighContrast = window.matchMedia('(prefers-contrast: more)').matches;
      if (prefersHighContrast && localStorage.getItem('a11y-highContrast') === null) {
        setHighContrast(true);
        document.documentElement.classList.add('high-contrast');
        localStorage.setItem('a11y-highContrast', 'true');
      }
    };
    
    loadPreferences();
    checkSystemPreferences();
    setPreferencesLoaded(true);
  }, []);
  
  // Save all preferences to localStorage
  const savePreferences = useCallback(() => {
    localStorage.setItem('a11y-highContrast', highContrast.toString());
    localStorage.setItem('a11y-textSize', textSize);
    localStorage.setItem('a11y-reduceMotion', reduceMotion.toString());
    localStorage.setItem('a11y-keyboardMode', keyboardMode.toString());
    localStorage.setItem('a11y-colorBlindMode', colorBlindMode);
    localStorage.setItem('a11y-fontFamily', fontFamily);
    localStorage.setItem('a11y-focusIndicator', focusIndicator);
  }, [highContrast, textSize, reduceMotion, keyboardMode, colorBlindMode, fontFamily, focusIndicator]);

  // Reset all preferences to defaults
  const resetPreferences = useCallback(() => {
    setHighContrast(false);
    setTextSize('normal');
    setReduceMotion(false);
    setKeyboardMode(false);
    setColorBlindMode('none');
    setFontFamily('default');
    setFocusIndicator('default');
    
    // Clear localStorage
    localStorage.removeItem('a11y-highContrast');
    localStorage.removeItem('a11y-textSize');
    localStorage.removeItem('a11y-reduceMotion');
    localStorage.removeItem('a11y-keyboardMode');
    localStorage.removeItem('a11y-colorBlindMode');
    localStorage.removeItem('a11y-fontFamily');
    localStorage.removeItem('a11y-focusIndicator');
    
    // Remove classes
    document.documentElement.classList.remove(
      'high-contrast',
      'text-large',
      'text-larger',
      'reduce-motion',
      'keyboard-mode',
      'filter-protanopia',
      'filter-deuteranopia',
      'filter-tritanopia',
      'font-dyslexic',
      'focus-high'
    );
    
    document.documentElement.classList.add('text-normal');
    
    // Announce to screen readers
    announce('Accessibility preferences have been reset to defaults', true);
  }, [announce]);

  // Toggle keyboard mode
  const handleSetKeyboardMode = useCallback((isActive: boolean) => {
    setKeyboardMode(isActive);
    localStorage.setItem('a11y-keyboardMode', isActive.toString());
    document.documentElement.classList.toggle('keyboard-mode', isActive);
  }, []);

  // Set color blind mode
  const handleSetColorBlindMode = useCallback((mode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia') => {
    setColorBlindMode(mode);
    localStorage.setItem('a11y-colorBlindMode', mode);
  }, []);

  // Set font family
  const handleSetFontFamily = useCallback((font: 'default' | 'dyslexic') => {
    setFontFamily(font);
    localStorage.setItem('a11y-fontFamily', font);
  }, []);

  // Set focus indicator style
  const handleSetFocusIndicator = useCallback((style: 'default' | 'high') => {
    setFocusIndicator(style);
    localStorage.setItem('a11y-focusIndicator', style);
  }, []);

  const value = {
    highContrast,
    toggleHighContrast,
    textSize,
    setTextSize: handleSetTextSize,
    reduceMotion,
    toggleReduceMotion,
    keyboardMode,
    setKeyboardMode: handleSetKeyboardMode,
    colorBlindMode,
    setColorBlindMode: handleSetColorBlindMode,
    fontFamily,
    setFontFamily: handleSetFontFamily,
    focusIndicator,
    setFocusIndicator: handleSetFocusIndicator,
    announce,
    savePreferences,
    resetPreferences,
    preferencesLoaded
  };
  
  return (
    <AccessibilityContext.Provider value={value}>
      {children}
      
      {/* Screen reader announcements - using two regions for different priority levels */}
      <div className="sr-only" aria-live="polite" aria-atomic="true" role="status">
        {!assertive ? announcement : ''}
      </div>
      <div className="sr-only" aria-live="assertive" aria-atomic="true" role="alert">
        {assertive ? announcement : ''}
      </div>
      
      {/* Skip to main content link - visible on focus */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:p-4 focus:bg-white focus:text-black focus:shadow-lg focus:rounded"
      >
        Skip to main content
      </a>
    </AccessibilityContext.Provider>
  );
}
