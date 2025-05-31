"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

type LanguageContextType = {
  currentLanguage: string;
  changeLanguage: (lang: string) => void;
};

const LanguageContext = createContext<LanguageContextType>({
  currentLanguage: 'en',
  changeLanguage: () => {},
});

export const useLanguage = () => useContext(LanguageContext);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [currentLanguage, setCurrentLanguage] = useState<string>('en');
  
  useEffect(() => {
    // Get language from cookie or localStorage in App Router
    const storedLang = 
      document.cookie.split('; ')
        .find(row => row.startsWith('NEXT_LOCALE='))
        ?.split('=')[1] ||
      localStorage.getItem('NEXT_LOCALE') ||
      navigator.language.split('-')[0] ||
      'en';
    
    setCurrentLanguage(storedLang);
  }, []);
  
  const changeLanguage = (lang: string) => {
    // Store the language preference
    document.cookie = `NEXT_LOCALE=${lang}; max-age=31536000; path=/`;
    localStorage.setItem('NEXT_LOCALE', lang);
    setCurrentLanguage(lang);
    
    // In App Router, we need to reload the page to change the language
    // This is a simple approach - a more complex approach would involve
    // the internationalized routing pattern from Next.js docs
    const params = new URLSearchParams(searchParams);
    const url = pathname + (params.toString() ? `?${params.toString()}` : '');
    window.location.reload();
  };
  
  return (
    <LanguageContext.Provider value={{ currentLanguage, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageProvider;
