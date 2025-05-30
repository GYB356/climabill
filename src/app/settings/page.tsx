"use client";

import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CogIcon, GlobeIcon, DatabaseIcon, BarChartIcon, UserIcon, BellIcon, LockIcon, CreditCardIcon } from 'lucide-react';
import LanguageSelector from '@/components/layout/LanguageSelector';

interface SettingCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
}

const SettingCard = ({ icon, title, description, href }: SettingCardProps) => {
  const router = useRouter();
  
  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push(href)}>
      <CardHeader className="flex flex-row items-center gap-4 pb-2">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          {icon}
        </div>
        <div>
          <CardTitle className="text-lg">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-sm">{description}</CardDescription>
      </CardContent>
      <CardFooter>
        <Button variant="ghost" className="w-full justify-center" onClick={() => router.push(href)}>
          Manage
        </Button>
      </CardFooter>
    </Card>
  );
};

export default function SettingsPage() {
  const { t } = useTranslation('common');
  
  const settingsCategories = [
    {
      icon: <GlobeIcon className="h-4 w-4 text-primary" />,
      title: t('settings.language', 'Language'),
      description: t('settings.languageDescription', 'Change the application language and region settings'),
      href: '/settings/language',
    },
    {
      icon: <DatabaseIcon className="h-4 w-4 text-primary" />,
      title: t('settings.cacheSettings', 'Cache Settings'),
      description: t('settings.cacheDescription', 'Manage how data is cached to improve performance'),
      href: '/settings/cache',
    },
    {
      icon: <BarChartIcon className="h-4 w-4 text-primary" />,
      title: t('settings.dataVisualization', 'Data Visualization'),
      description: t('settings.dataVisualizationDescription', 'Customize how charts and graphs are displayed'),
      href: '/settings/visualization',
    },
    {
      icon: <UserIcon className="h-4 w-4 text-primary" />,
      title: t('settings.account', 'Account'),
      description: t('settings.accountDescription', 'Manage your account details and profile information'),
      href: '/settings/account',
    },
    {
      icon: <BellIcon className="h-4 w-4 text-primary" />,
      title: t('settings.notifications', 'Notifications'),
      description: t('settings.notificationsDescription', 'Configure notification preferences and alerts'),
      href: '/settings/notifications',
    },
    {
      icon: <LockIcon className="h-4 w-4 text-primary" />,
      title: t('settings.security', 'Security'),
      description: t('settings.securityDescription', 'Manage security settings and authentication methods'),
      href: '/settings/security',
    }
  ];
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{t('settings.settings', 'Settings')}</h1>
        <LanguageSelector />
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {settingsCategories.map((category, index) => (
          <SettingCard
            key={index}
            icon={category.icon}
            title={category.title}
            description={category.description}
            href={category.href}
          />
        ))}
      </div>
      
      <div className="mt-8 bg-gray-50 rounded-lg p-4 border">
        <div className="flex items-start gap-3">
          <CogIcon className="h-5 w-5 text-gray-500 mt-0.5" />
          <div>
            <h3 className="font-medium text-gray-900">{t('settings.recentUpdates', 'Recent Updates')}</h3>
            <ul className="mt-2 space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                {t('settings.cachingAdded', 'Added multi-level caching for improved performance')}
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                {t('settings.languageAdded', 'Added support for 5 languages (English, Spanish, French, German, Chinese)')}
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                {t('settings.visualizationAdded', 'Enhanced data visualization with interactive charts')}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
