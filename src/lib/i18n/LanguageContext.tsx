import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/router';

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
  const [currentLanguage, setCurrentLanguage] = useState<string>(router.locale || 'en');
  
  useEffect(() => {
    if (router.locale && router.locale !== currentLanguage) {
      setCurrentLanguage(router.locale);
    }
  }, [router.locale, currentLanguage]);
  
  const changeLanguage = (lang: string) => {
    const { pathname, asPath, query } = router;
    document.cookie = `NEXT_LOCALE=${lang}; max-age=31536000; path=/`;
    router.push({ pathname, query }, asPath, { locale: lang });
  };
  
  return (
    <LanguageContext.Provider value={{ currentLanguage, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageProvider;
