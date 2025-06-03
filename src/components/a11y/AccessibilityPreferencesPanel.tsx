"use client";

import React, { useState } from 'react';
import { useAccessibility } from '../../lib/a11y/accessibility-context';
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle 
} from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Check,
  Eye,
  Type,
  MousePointerClick,
  Keyboard,
  RefreshCcw,
  ChevronDown,
  ChevronUp,
  X,
  Save
} from 'lucide-react';
import { useTranslation } from 'next-i18next';

interface AccessibilityPreferencesPanelProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

/**
 * Comprehensive panel for managing accessibility preferences
 * Allows users to customize all accessibility options in one place
 */
export default function AccessibilityPreferencesPanel({
  isOpen,
  onClose,
  className = '',
}: AccessibilityPreferencesPanelProps) {
  const { t } = useTranslation('common');
  const [activeTab, setActiveTab] = useState('visual');
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Get all accessibility preferences from context
  const {
    highContrast,
    toggleHighContrast,
    textSize,
    setTextSize,
    reduceMotion,
    toggleReduceMotion,
    keyboardMode,
    setKeyboardMode,
    colorBlindMode,
    setColorBlindMode,
    fontFamily,
    setFontFamily,
    focusIndicator,
    setFocusIndicator,
    announce,
    savePreferences,
    resetPreferences,
    preferencesLoaded
  } = useAccessibility();

  // Show a preview while settings are being changed
  const showPreview = (message: string) => {
    announce(message, false);
  };

  // Save preferences and close panel
  const handleSave = () => {
    savePreferences();
    announce(t('accessibility.preferencesSaved'), true);
    onClose();
  };

  // Reset preferences
  const handleReset = () => {
    resetPreferences();
  };

  // If panel is not open, don't render anything
  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 ${className}`} role="dialog" aria-modal="true" aria-labelledby="a11y-preferences-title">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-auto shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle id="a11y-preferences-title">{t('accessibility.preferencesTitle')}</CardTitle>
            <CardDescription>{t('accessibility.preferencesDescription')}</CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label={t('accessibility.closePanel')}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="visual">
              <Eye className="mr-2 h-4 w-4" />
              <span>{t('accessibility.visual')}</span>
            </TabsTrigger>
            <TabsTrigger value="text">
              <Type className="mr-2 h-4 w-4" />
              <span>{t('accessibility.text')}</span>
            </TabsTrigger>
            <TabsTrigger value="motion">
              <MousePointerClick className="mr-2 h-4 w-4" />
              <span>{t('accessibility.motion')}</span>
            </TabsTrigger>
            <TabsTrigger value="keyboard">
              <Keyboard className="mr-2 h-4 w-4" />
              <span>{t('accessibility.keyboard')}</span>
            </TabsTrigger>
          </TabsList>

          {/* Visual Settings */}
          <TabsContent value="visual" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="high-contrast">{t('accessibility.highContrast')}</Label>
                  <p className="text-sm text-muted-foreground">{t('accessibility.highContrastDescription')}</p>
                </div>
                <Switch
                  id="high-contrast"
                  checked={highContrast}
                  onCheckedChange={(checked) => {
                    toggleHighContrast();
                    showPreview(checked ? t('accessibility.highContrastEnabled') : t('accessibility.highContrastDisabled'));
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label>{t('accessibility.colorBlindMode')}</Label>
                <p className="text-sm text-muted-foreground mb-2">{t('accessibility.colorBlindModeDescription')}</p>
                <RadioGroup
                  value={colorBlindMode}
                  onValueChange={(value) => {
                    setColorBlindMode(value as 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia');
                    showPreview(t(`accessibility.colorBlindMode${value.charAt(0).toUpperCase() + value.slice(1)}`));
                  }}
                  className="grid grid-cols-2 gap-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="none" id="color-none" />
                    <Label htmlFor="color-none">{t('accessibility.colorBlindNone')}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="protanopia" id="color-protanopia" />
                    <Label htmlFor="color-protanopia">{t('accessibility.protanopia')}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="deuteranopia" id="color-deuteranopia" />
                    <Label htmlFor="color-deuteranopia">{t('accessibility.deuteranopia')}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="tritanopia" id="color-tritanopia" />
                    <Label htmlFor="color-tritanopia">{t('accessibility.tritanopia')}</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </TabsContent>

          {/* Text Settings */}
          <TabsContent value="text" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t('accessibility.textSize')}</Label>
                <p className="text-sm text-muted-foreground mb-2">{t('accessibility.textSizeDescription')}</p>
                <RadioGroup
                  value={textSize}
                  onValueChange={(value) => {
                    setTextSize(value as 'normal' | 'large' | 'larger');
                    showPreview(t(`accessibility.textSize${value.charAt(0).toUpperCase() + value.slice(1)}`));
                  }}
                  className="grid grid-cols-3 gap-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="normal" id="text-normal" />
                    <Label htmlFor="text-normal" className="text-base">{t('accessibility.textSizeNormal')}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="large" id="text-large" />
                    <Label htmlFor="text-large" className="text-lg">{t('accessibility.textSizeLarge')}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="larger" id="text-larger" />
                    <Label htmlFor="text-larger" className="text-xl">{t('accessibility.textSizeLarger')}</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label>{t('accessibility.fontFamily')}</Label>
                <p className="text-sm text-muted-foreground mb-2">{t('accessibility.fontFamilyDescription')}</p>
                <RadioGroup
                  value={fontFamily}
                  onValueChange={(value) => {
                    setFontFamily(value as 'default' | 'dyslexic');
                    showPreview(t(`accessibility.fontFamily${value.charAt(0).toUpperCase() + value.slice(1)}`));
                  }}
                  className="grid grid-cols-2 gap-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="default" id="font-default" />
                    <Label htmlFor="font-default">{t('accessibility.fontFamilyDefault')}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="dyslexic" id="font-dyslexic" />
                    <Label htmlFor="font-dyslexic" className="font-dyslexic">{t('accessibility.fontFamilyDyslexic')}</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </TabsContent>

          {/* Motion Settings */}
          <TabsContent value="motion" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="reduce-motion">{t('accessibility.reduceMotion')}</Label>
                  <p className="text-sm text-muted-foreground">{t('accessibility.reduceMotionDescription')}</p>
                </div>
                <Switch
                  id="reduce-motion"
                  checked={reduceMotion}
                  onCheckedChange={(checked) => {
                    toggleReduceMotion();
                    showPreview(checked ? t('accessibility.reduceMotionEnabled') : t('accessibility.reduceMotionDisabled'));
                  }}
                />
              </div>

              <div className="p-4 border rounded-md bg-muted/50">
                <h3 className="font-medium mb-2">{t('accessibility.motionExample')}</h3>
                <div className={`w-12 h-12 bg-primary rounded-full ${reduceMotion ? 'opacity-50' : 'animate-bounce'}`} />
                <p className="text-sm text-muted-foreground mt-2">{t('accessibility.motionExampleDescription')}</p>
              </div>
            </div>
          </TabsContent>

          {/* Keyboard Settings */}
          <TabsContent value="keyboard" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="keyboard-mode">{t('accessibility.keyboardMode')}</Label>
                  <p className="text-sm text-muted-foreground">{t('accessibility.keyboardModeDescription')}</p>
                </div>
                <Switch
                  id="keyboard-mode"
                  checked={keyboardMode}
                  onCheckedChange={(checked) => {
                    setKeyboardMode(checked);
                    showPreview(checked ? t('accessibility.keyboardModeEnabled') : t('accessibility.keyboardModeDisabled'));
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label>{t('accessibility.focusIndicator')}</Label>
                <p className="text-sm text-muted-foreground mb-2">{t('accessibility.focusIndicatorDescription')}</p>
                <RadioGroup
                  value={focusIndicator}
                  onValueChange={(value) => {
                    setFocusIndicator(value as 'default' | 'high');
                    showPreview(t(`accessibility.focusIndicator${value.charAt(0).toUpperCase() + value.slice(1)}`));
                  }}
                  className="grid grid-cols-2 gap-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="default" id="focus-default" />
                    <Label htmlFor="focus-default">{t('accessibility.focusIndicatorDefault')}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="high" id="focus-high" />
                    <Label htmlFor="focus-high">{t('accessibility.focusIndicatorHigh')}</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="p-4 border rounded-md bg-muted/50">
                <h3 className="font-medium mb-2">{t('accessibility.keyboardShortcuts')}</h3>
                <ul className="space-y-2 text-sm">
                  <li><kbd className="px-2 py-1 bg-muted rounded">Tab</kbd> - {t('accessibility.keyboardShortcutTab')}</li>
                  <li><kbd className="px-2 py-1 bg-muted rounded">Shift + Tab</kbd> - {t('accessibility.keyboardShortcutShiftTab')}</li>
                  <li><kbd className="px-2 py-1 bg-muted rounded">Alt + 1</kbd> - {t('accessibility.keyboardShortcutSkipToContent')}</li>
                  <li><kbd className="px-2 py-1 bg-muted rounded">Alt + A</kbd> - {t('accessibility.keyboardShortcutAccessibilityMenu')}</li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <CardFooter className="flex justify-between mt-4">
          <Button 
            variant="outline" 
            onClick={handleReset}
            className="flex items-center"
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            {t('accessibility.resetDefaults')}
          </Button>
          <div className="space-x-2">
            <Button 
              variant="secondary" 
              onClick={onClose}
            >
              {t('accessibility.cancel')}
            </Button>
            <Button 
              onClick={handleSave}
              className="flex items-center"
            >
              <Save className="mr-2 h-4 w-4" />
              {t('accessibility.savePreferences')}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
