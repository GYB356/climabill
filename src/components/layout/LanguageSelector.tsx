"use client";

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useTranslation } from 'next-i18next';
import { Fragment, useState } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon, GlobeAltIcon } from '@heroicons/react/24/outline';

const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
];

export const LanguageSelector = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { t } = useTranslation('common');
  
  // Get current language from cookie or localStorage
  const getCurrentLanguage = () => {
    // Try to get from cookie first
    const cookieLang = document.cookie.split('; ')
      .find(row => row.startsWith('NEXT_LOCALE='))
      ?.split('=')[1];
      
    // Then from localStorage
    const localStorageLang = localStorage.getItem('NEXT_LOCALE');
    
    // Return found language or default to 'en'
    const langCode = cookieLang || localStorageLang || 'en';
    return languages.find(lang => lang.code === langCode) || languages[0];
  };
  
  // Find current language
  const currentLanguage = getCurrentLanguage();
  
  // Handle language change
  const changeLanguage = (locale: string) => {
    document.cookie = `NEXT_LOCALE=${locale}; max-age=31536000; path=/`;
    localStorage.setItem('NEXT_LOCALE', locale);
    
    // In App Router, we need to reload the page to change the language
    window.location.reload();
  };
  
  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
          <GlobeAltIcon className="-ml-0.5 h-5 w-5 text-gray-400" aria-hidden="true" />
          <span className="hidden sm:inline-block">{currentLanguage.flag} {currentLanguage.name}</span>
          <span className="sm:hidden">{currentLanguage.flag}</span>
          <ChevronDownIcon className="-mr-1 h-5 w-5 text-gray-400" aria-hidden="true" />
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            {languages.map((language) => (
              <Menu.Item key={language.code}>
                {({ active }) => (
                  <button
                    onClick={() => changeLanguage(language.code)}
                    className={`
                      ${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} 
                      ${currentLanguage.code === language.code ? 'bg-gray-50 font-medium' : ''}
                      group flex w-full items-center px-4 py-2 text-sm
                    `}
                  >
                    <span className="mr-2">{language.flag}</span> {language.name}
                  </button>
                )}
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default LanguageSelector;
