"use client";

import { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Save, RefreshCw, Database, Memory, Server } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { clearCache } from '@/lib/caching/carbonMetricsCache';
import LanguageSelector from '@/components/layout/LanguageSelector';

// Default cache settings
const DEFAULT_CACHE_SETTINGS = {
  enabled: true,
  memoryEnabled: true,
  indexedDBEnabled: true,
  serviceWorkerEnabled: true,
  expiryTimes: {
    carbonUsage: 5 * 60 * 1000, // 5 minutes in milliseconds
    carbonOffset: 5 * 60 * 1000,
    carbonEstimate: 2 * 60 * 1000,
    carbonAnalytics: 10 * 60 * 1000
  }
};

export default function CacheSettingsPage() {
  const { t } = useTranslation('common');
  const { toast } = useToast();
  
  // State for cache settings
  const [cacheSettings, setCacheSettings] = useState(DEFAULT_CACHE_SETTINGS);
  const [loading, setLoading] = useState(false);
  const [clearingCache, setClearingCache] = useState(false);
  const [cacheSize, setCacheSize] = useState({ memory: 0, indexedDB: 0 });
  
  // Load saved cache settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('cacheSettings');
    if (savedSettings) {
      try {
        setCacheSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Error parsing cache settings:', error);
        // Reset to defaults if parsing fails
        setCacheSettings(DEFAULT_CACHE_SETTINGS);
      }
    }
    
    // Estimate cache size (this is a simulation)
    estimateCacheSize();
  }, []);
  
  // Simulate estimating cache size
  const estimateCacheSize = async () => {
    // In a real app, we would actually measure the size
    // This is a simulation for demonstration
    setTimeout(() => {
      setCacheSize({
        memory: Math.round(Math.random() * 500 + 100), // 100-600 KB
        indexedDB: Math.round(Math.random() * 2000 + 500), // 500-2500 KB
      });
    }, 500);
  };
  
  // Handle toggle changes
  const handleToggleChange = (setting: string) => {
    setCacheSettings(prev => ({
      ...prev,
      [setting]: !prev[setting as keyof typeof prev]
    }));
  };
  
  // Handle expiry time changes
  const handleExpiryTimeChange = (key: string, minutes: number) => {
    setCacheSettings(prev => ({
      ...prev,
      expiryTimes: {
        ...prev.expiryTimes,
        [key]: minutes * 60 * 1000 // Convert minutes to milliseconds
      }
    }));
  };
  
  // Save cache settings
  const saveSettings = async () => {
    setLoading(true);
    try {
      localStorage.setItem('cacheSettings', JSON.stringify(cacheSettings));
      
      // Simulate saving to server or applying changes
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: t('settings.saved', 'Settings saved'),
        description: t('settings.savedDescription', 'Your cache settings have been saved and applied.'),
        duration: 3000,
      });
    } catch (error) {
      console.error('Error saving cache settings:', error);
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
  
  // Clear all caches
  const handleClearCache = async () => {
    setClearingCache(true);
    try {
      // Clear app caches
      await clearCache();
      
      // Also clear localStorage cache settings if needed
      // localStorage.removeItem('cacheSettings');
      
      // Re-estimate cache size after clearing
      await estimateCacheSize();
      
      toast({
        title: t('settings.cacheCleared', 'Cache cleared'),
        description: t('settings.cacheClearedDescription', 'All cached data has been cleared successfully.'),
        duration: 3000,
      });
    } catch (error) {
      console.error('Error clearing cache:', error);
      toast({
        title: t('errors.generic'),
        description: t('settings.clearCacheError', 'Failed to clear cache. Please try again.'),
        variant: 'destructive',
        duration: 3000,
      });
    } finally {
      setClearingCache(false);
    }
  };
  
  // Reset to defaults
  const resetToDefaults = () => {
    setCacheSettings(DEFAULT_CACHE_SETTINGS);
    toast({
      title: t('settings.reset', 'Settings reset'),
      description: t('settings.resetDescription', 'Cache settings have been reset to defaults. Click Save to apply.'),
      duration: 3000,
    });
  };
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{t('settings.cacheSettings', 'Cache Settings')}</h1>
        <LanguageSelector />
      </div>
      
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">{t('settings.general', 'General')}</TabsTrigger>
          <TabsTrigger value="advanced">{t('settings.advanced', 'Advanced')}</TabsTrigger>
        </TabsList>
        
        {/* General Settings */}
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('settings.generalSettings', 'General Settings')}</CardTitle>
              <CardDescription>
                {t('settings.cacheDescription', 'Control how data is cached to improve performance')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="cache-enabled">{t('settings.enableCaching', 'Enable Caching')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t('settings.enableCachingDescription', 'Cache frequently accessed data to improve performance')}
                  </p>
                </div>
                <Switch 
                  id="cache-enabled"
                  checked={cacheSettings.enabled}
                  onCheckedChange={() => handleToggleChange('enabled')}
                />
              </div>
              
              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-medium">{t('settings.cacheTypes', 'Cache Types')}</h3>
                
                <div className="grid gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Memory className="h-4 w-4 text-muted-foreground" />
                      <Label htmlFor="memory-cache">{t('settings.memoryCache', 'Memory Cache')}</Label>
                    </div>
                    <Switch 
                      id="memory-cache"
                      checked={cacheSettings.memoryEnabled}
                      onCheckedChange={() => handleToggleChange('memoryEnabled')}
                      disabled={!cacheSettings.enabled}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Database className="h-4 w-4 text-muted-foreground" />
                      <Label htmlFor="indexeddb-cache">{t('settings.indexedDBCache', 'Browser Storage (IndexedDB)')}</Label>
                    </div>
                    <Switch 
                      id="indexeddb-cache"
                      checked={cacheSettings.indexedDBEnabled}
                      onCheckedChange={() => handleToggleChange('indexedDBEnabled')}
                      disabled={!cacheSettings.enabled}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Server className="h-4 w-4 text-muted-foreground" />
                      <Label htmlFor="sw-cache">{t('settings.serviceWorkerCache', 'Service Worker Cache (Offline)')}</Label>
                    </div>
                    <Switch 
                      id="sw-cache"
                      checked={cacheSettings.serviceWorkerEnabled}
                      onCheckedChange={() => handleToggleChange('serviceWorkerEnabled')}
                      disabled={!cacheSettings.enabled}
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-medium">{t('settings.cacheUsage', 'Cache Usage')}</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900">
                    <div className="text-sm font-medium">{t('settings.memoryCache', 'Memory Cache')}</div>
                    <div className="text-2xl font-bold">{cacheSize.memory} KB</div>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900">
                    <div className="text-sm font-medium">{t('settings.indexedDBCache', 'IndexedDB Cache')}</div>
                    <div className="text-2xl font-bold">{cacheSize.indexedDB} KB</div>
                  </div>
                </div>
                
                <Button 
                  variant="outline" 
                  onClick={handleClearCache}
                  disabled={clearingCache}
                  className="w-full"
                >
                  {clearingCache ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('settings.clearingCache', 'Clearing cache...')}
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      {t('settings.clearCache', 'Clear All Caches')}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Advanced Settings */}
        <TabsContent value="advanced" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('settings.advancedSettings', 'Advanced Settings')}</CardTitle>
              <CardDescription>
                {t('settings.advancedDescription', 'Fine-tune cache behavior for different data types')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium">{t('settings.expiryTimes', 'Cache Expiry Times')}</h3>
                
                <div className="grid gap-4">
                  <div className="grid grid-cols-2 items-center gap-4">
                    <Label htmlFor="usage-expiry">{t('carbon.usage', 'Carbon Usage')}</Label>
                    <Select
                      disabled={!cacheSettings.enabled}
                      value={(cacheSettings.expiryTimes.carbonUsage / 60000).toString()}
                      onValueChange={(value) => handleExpiryTimeChange('carbonUsage', parseInt(value))}
                    >
                      <SelectTrigger id="usage-expiry">
                        <SelectValue placeholder={t('settings.selectTime', 'Select time')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 {t('time.minute', 'minute')}</SelectItem>
                        <SelectItem value="5">5 {t('time.minutes', 'minutes')}</SelectItem>
                        <SelectItem value="10">10 {t('time.minutes', 'minutes')}</SelectItem>
                        <SelectItem value="15">15 {t('time.minutes', 'minutes')}</SelectItem>
                        <SelectItem value="30">30 {t('time.minutes', 'minutes')}</SelectItem>
                        <SelectItem value="60">1 {t('time.hour', 'hour')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-2 items-center gap-4">
                    <Label htmlFor="offset-expiry">{t('carbon.offset', 'Carbon Offset')}</Label>
                    <Select
                      disabled={!cacheSettings.enabled}
                      value={(cacheSettings.expiryTimes.carbonOffset / 60000).toString()}
                      onValueChange={(value) => handleExpiryTimeChange('carbonOffset', parseInt(value))}
                    >
                      <SelectTrigger id="offset-expiry">
                        <SelectValue placeholder={t('settings.selectTime', 'Select time')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 {t('time.minute', 'minute')}</SelectItem>
                        <SelectItem value="5">5 {t('time.minutes', 'minutes')}</SelectItem>
                        <SelectItem value="10">10 {t('time.minutes', 'minutes')}</SelectItem>
                        <SelectItem value="15">15 {t('time.minutes', 'minutes')}</SelectItem>
                        <SelectItem value="30">30 {t('time.minutes', 'minutes')}</SelectItem>
                        <SelectItem value="60">1 {t('time.hour', 'hour')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-2 items-center gap-4">
                    <Label htmlFor="estimate-expiry">{t('carbon.estimate', 'Carbon Estimate')}</Label>
                    <Select
                      disabled={!cacheSettings.enabled}
                      value={(cacheSettings.expiryTimes.carbonEstimate / 60000).toString()}
                      onValueChange={(value) => handleExpiryTimeChange('carbonEstimate', parseInt(value))}
                    >
                      <SelectTrigger id="estimate-expiry">
                        <SelectValue placeholder={t('settings.selectTime', 'Select time')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 {t('time.minute', 'minute')}</SelectItem>
                        <SelectItem value="2">2 {t('time.minutes', 'minutes')}</SelectItem>
                        <SelectItem value="5">5 {t('time.minutes', 'minutes')}</SelectItem>
                        <SelectItem value="10">10 {t('time.minutes', 'minutes')}</SelectItem>
                        <SelectItem value="15">15 {t('time.minutes', 'minutes')}</SelectItem>
                        <SelectItem value="30">30 {t('time.minutes', 'minutes')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-2 items-center gap-4">
                    <Label htmlFor="analytics-expiry">{t('carbon.analytics', 'Carbon Analytics')}</Label>
                    <Select
                      disabled={!cacheSettings.enabled}
                      value={(cacheSettings.expiryTimes.carbonAnalytics / 60000).toString()}
                      onValueChange={(value) => handleExpiryTimeChange('carbonAnalytics', parseInt(value))}
                    >
                      <SelectTrigger id="analytics-expiry">
                        <SelectValue placeholder={t('settings.selectTime', 'Select time')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 {t('time.minutes', 'minutes')}</SelectItem>
                        <SelectItem value="10">10 {t('time.minutes', 'minutes')}</SelectItem>
                        <SelectItem value="15">15 {t('time.minutes', 'minutes')}</SelectItem>
                        <SelectItem value="30">30 {t('time.minutes', 'minutes')}</SelectItem>
                        <SelectItem value="60">1 {t('time.hour', 'hour')}</SelectItem>
                        <SelectItem value="120">2 {t('time.hours', 'hours')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={resetToDefaults}>
                {t('settings.resetToDefaults', 'Reset to Defaults')}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-end">
        <Button 
          onClick={saveSettings}
          disabled={loading}
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
