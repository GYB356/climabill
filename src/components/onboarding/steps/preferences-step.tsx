'use client';

import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, AlertCircle, BellRing, Share2, Moon, Sun } from 'lucide-react';

interface PreferencesData {
  notifications: {
    email: boolean;
    inApp: boolean;
    slack: boolean;
  };
  dataSharing: boolean;
  theme: string;
}

interface OnboardingPreferencesStepProps {
  data: PreferencesData;
  updateData: (data: Partial<PreferencesData>) => void;
}

export function OnboardingPreferencesStep({ data, updateData }: OnboardingPreferencesStepProps) {
  const [activeTab, setActiveTab] = useState('notifications');
  const [preferences, setPreferences] = useState<PreferencesData>(data || {
    notifications: {
      email: true,
      inApp: true,
      slack: false
    },
    dataSharing: false,
    theme: 'light'
  });

  // Handle notification toggle
  const handleNotificationToggle = (channel: keyof typeof preferences.notifications, checked: boolean) => {
    const updatedNotifications = {
      ...preferences.notifications,
      [channel]: checked
    };
    
    const updatedPreferences = {
      ...preferences,
      notifications: updatedNotifications
    };
    
    setPreferences(updatedPreferences);
    updateData({ notifications: updatedNotifications });
  };

  // Handle data sharing toggle
  const handleDataSharingToggle = (checked: boolean) => {
    const updatedPreferences = {
      ...preferences,
      dataSharing: checked
    };
    
    setPreferences(updatedPreferences);
    updateData({ dataSharing: checked });
  };

  // Handle theme change
  const handleThemeChange = (theme: string) => {
    const updatedPreferences = {
      ...preferences,
      theme
    };
    
    setPreferences(updatedPreferences);
    updateData({ theme });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center p-6 bg-primary/5 rounded-lg mb-6">
        <Settings className="h-12 w-12 text-primary" />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <BellRing className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="data-sharing" className="flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            <span className="hidden sm:inline">Data Sharing</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Sun className="h-4 w-4" />
            <span className="hidden sm:inline">Appearance</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Choose how you want to receive notifications from ClimaBill.
          </p>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive important updates and reports via email
                </p>
              </div>
              <Switch
                id="email-notifications"
                checked={preferences.notifications.email}
                onCheckedChange={(checked) => handleNotificationToggle('email', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="in-app-notifications">In-App Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications within the ClimaBill application
                </p>
              </div>
              <Switch
                id="in-app-notifications"
                checked={preferences.notifications.inApp}
                onCheckedChange={(checked) => handleNotificationToggle('inApp', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="slack-notifications">Slack Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications in your Slack workspace
                </p>
              </div>
              <Switch
                id="slack-notifications"
                checked={preferences.notifications.slack}
                onCheckedChange={(checked) => handleNotificationToggle('slack', checked)}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="data-sharing" className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Control how your data is shared for benchmarking and analytics.
          </p>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="data-sharing">Anonymous Data Sharing</Label>
                <p className="text-sm text-muted-foreground">
                  Share anonymized data to improve industry benchmarks
                </p>
              </div>
              <Switch
                id="data-sharing"
                checked={preferences.dataSharing}
                onCheckedChange={handleDataSharingToggle}
              />
            </div>

            <Alert variant="info" className="bg-blue-50 text-blue-800 border-blue-200">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Your data is always anonymized and aggregated before sharing. This helps improve industry benchmarks and provides you with more accurate comparisons.
              </AlertDescription>
            </Alert>
          </div>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Customize the appearance of ClimaBill.
          </p>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Theme</Label>
              <RadioGroup
                value={preferences.theme}
                onValueChange={handleThemeChange}
                className="flex space-x-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="light" id="theme-light" />
                  <Label htmlFor="theme-light" className="flex items-center space-x-2 cursor-pointer">
                    <Sun className="h-4 w-4" />
                    <span>Light</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="dark" id="theme-dark" />
                  <Label htmlFor="theme-dark" className="flex items-center space-x-2 cursor-pointer">
                    <Moon className="h-4 w-4" />
                    <span>Dark</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="system" id="theme-system" />
                  <Label htmlFor="theme-system" className="cursor-pointer">System</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <Alert className="mt-6 bg-green-50 text-green-800 border-green-200">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          You can change these preferences at any time in the Settings section.
        </AlertDescription>
      </Alert>
    </div>
  );
}
