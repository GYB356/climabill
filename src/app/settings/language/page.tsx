"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'next-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Save, Globe, Check } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import LanguageSelector from '@/components/layout/LanguageSelector';

const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧', label: 'English' },
  { code: 'es', name: 'Español', flag: '🇪🇸', label: 'Spanish' },
  { code: 'fr', name: 'Français', flag: '🇫🇷', label: 'French' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪', label: 'German' },
  { code: 'zh', name: '中文', flag: '🇨🇳', label: 'Chinese' },
];

export default function LanguageSettingsPage() {
  const { t } = useTranslation('common');
  const { toast } = useToast();
  const router = useRouter();
  const { currentLanguage, changeLanguage } = useLanguage();
  
  const [selectedLanguage, setSelectedLanguage] = useState(currentLanguage);
  const [loading, setLoading] = useState(false);
  const [detectedLanguage, setDetectedLanguage] = useState<string | null>(null);
  
  // Detect browser language on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const browserLang = navigator.language.split('-')[0];
      const supported = languages.find(lang => lang.code === browserLang);
      if (supported) {
        setDetectedLanguage(browserLang);
      }
    }
  }, []);
  
  // Handle language selection
  const handleLanguageChange = (value: string) => {
    setSelectedLanguage(value);
  };
  
  // Save language preference
  const saveLanguage = async () => {
    setLoading(true);
    try {
      // Change the language using our language context
      changeLanguage(selectedLanguage);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: t('settings.languageSaved', 'Language settings saved'),
        description: t('settings.languageSavedDescription', 'Your language preference has been saved.'),
        duration: 3000,
      });
    } catch (error) {
      console.error('Error saving language settings:', error);
      toast({
        title: t('errors.generic'),
        description: t('settings.saveError', 'Failed to save settings. Please try again.'),
        variant: 'destructive',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Use detected browser language
  const useDetectedLanguage = () => {
    if (detectedLanguage) {
      setSelectedLanguage(detectedLanguage);
    }
  };
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{t('settings.languageSettings', 'Language Settings')}</h1>
        <LanguageSelector />
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>{t('settings.languagePreferences', 'Language Preferences')}</CardTitle>
          <CardDescription>
            {t('settings.languageDescription', 'Select your preferred language for the application interface')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {detectedLanguage && currentLanguage !== detectedLanguage && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4 flex items-start gap-3">
              <Globe className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-800">
                  {t('settings.detectedLanguage', 'Browser language detected')}
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  {t('settings.detectedLanguageDescription', 'We detected that your browser language is')} {languages.find(l => l.code === detectedLanguage)?.name} ({languages.find(l => l.code === detectedLanguage)?.flag}).
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={useDetectedLanguage}
                >
                  {t('settings.useDetectedLanguage', 'Use browser language')}
                </Button>
              </div>
            </div>
          )}
          
          <div className="space-y-4">
            <h3 className="font-medium">{t('settings.selectLanguage', 'Select Language')}</h3>
            
            <RadioGroup 
              value={selectedLanguage} 
              onValueChange={handleLanguageChange}
              className="grid grid-cols-1 gap-2"
            >
              {languages.map((language) => (
                <div
                  key={language.code}
                  className={`flex items-center space-x-2 border rounded-md p-3 transition-colors ${
                    selectedLanguage === language.code
                      ? 'bg-primary/5 border-primary'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <RadioGroupItem value={language.code} id={`language-${language.code}`} />
                  <Label
                    htmlFor={`language-${language.code}`}
                    className="flex items-center cursor-pointer flex-1"
                  >
                    <span className="text-xl mr-3">{language.flag}</span>
                    <div className="flex-1">
                      <span className="font-medium">{language.name}</span>
                      <span className="text-muted-foreground ml-2 text-sm">({language.label})</span>
                    </div>
                    {currentLanguage === language.code && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          
          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-medium">{t('settings.languageInfo', 'About Language Support')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('settings.languageInfoDescription', 'ClimaBill is available in multiple languages. The application will use your selected language for all interface elements, but some user-generated content may remain in its original language.')}
            </p>
            <p className="text-sm text-muted-foreground">
              {t('settings.missingTranslations', 'If you find any missing or incorrect translations, please contact our support team.')}
            </p>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end">
        <Button 
          onClick={saveLanguage}
          disabled={loading || selectedLanguage === currentLanguage}
          className="w-[150px]"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('settings.saving', 'Saving...')}
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {t('buttons.save')}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
