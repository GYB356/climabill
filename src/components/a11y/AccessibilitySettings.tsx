"use client";

import React, { useState } from 'react';
import { Settings, Moon, Sun, Type, ZoomIn, ZoomOut } from 'lucide-react';
import { useAccessibility } from '../../lib/a11y/accessibility-context';
import { useFocusTrap } from '../../lib/a11y/use-focus-trap';

interface AccessibilitySettingsProps {
  className?: string;
}

export default function AccessibilitySettings({ className = '' }: AccessibilitySettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { 
    highContrast, 
    toggleHighContrast, 
    textSize, 
    setTextSize,
    reduceMotion,
    toggleReduceMotion,
    announce
  } = useAccessibility();
  
  // Use focus trap when panel is open
  const panelRef = useFocusTrap(isOpen);
  
  const togglePanel = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    
    if (newState) {
      announce('Accessibility settings panel opened');
    } else {
      announce('Accessibility settings panel closed');
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      announce('Accessibility settings panel closed');
    }
  };
  
  // Handlers for changing settings
  const handleTextSizeChange = (size: 'normal' | 'large' | 'larger') => {
    setTextSize(size);
    announce(`Text size set to ${size}`);
  };
  
  const handleHighContrastToggle = () => {
    toggleHighContrast();
    announce(`High contrast mode ${!highContrast ? 'enabled' : 'disabled'}`);
  };
  
  const handleReduceMotionToggle = () => {
    toggleReduceMotion();
    announce(`Reduced motion ${!reduceMotion ? 'enabled' : 'disabled'}`);
  };
  
  return (
    <div className={`relative ${className}`}>
      {/* Accessibility settings toggle button */}
      <button 
        onClick={togglePanel}
        className="flex items-center justify-center p-2 rounded-full bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Accessibility settings"
        aria-expanded={isOpen}
        aria-controls="accessibility-panel"
      >
        <Settings className="w-5 h-5" />
      </button>
      
      {/* Accessibility settings panel */}
      {isOpen && (
        <>
          {/* Backdrop for clicking outside to close */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-20 z-40" 
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          
          {/* Settings panel */}
          <div 
            ref={panelRef}
            id="accessibility-panel"
            role="dialog"
            aria-label="Accessibility settings"
            className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-50 p-4"
            onKeyDown={handleKeyDown}
          >
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Accessibility Settings
            </h2>
            
            <div className="space-y-4">
              {/* Text size settings */}
              <div>
                <h3 className="text-sm font-medium mb-2 flex items-center">
                  <Type className="w-4 h-4 mr-2" />
                  Text Size
                </h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleTextSizeChange('normal')}
                    className={`px-3 py-1 rounded-md ${
                      textSize === 'normal' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                    aria-pressed={textSize === 'normal'}
                  >
                    Normal
                  </button>
                  <button
                    onClick={() => handleTextSizeChange('large')}
                    className={`px-3 py-1 rounded-md ${
                      textSize === 'large' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                    aria-pressed={textSize === 'large'}
                  >
                    <span className="text-lg">Large</span>
                  </button>
                  <button
                    onClick={() => handleTextSizeChange('larger')}
                    className={`px-3 py-1 rounded-md ${
                      textSize === 'larger' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                    aria-pressed={textSize === 'larger'}
                  >
                    <span className="text-xl">Larger</span>
                  </button>
                </div>
              </div>
              
              {/* High contrast toggle */}
              <div>
                <h3 className="text-sm font-medium mb-2 flex items-center">
                  {highContrast ? (
                    <Moon className="w-4 h-4 mr-2" />
                  ) : (
                    <Sun className="w-4 h-4 mr-2" />
                  )}
                  High Contrast
                </h3>
                <button
                  onClick={handleHighContrastToggle}
                  className={`w-full px-3 py-2 rounded-md text-left flex justify-between items-center ${
                    highContrast 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                  aria-pressed={highContrast}
                >
                  <span>{highContrast ? 'Enabled' : 'Disabled'}</span>
                  <div className={`w-10 h-5 rounded-full flex items-center p-0.5 ${highContrast ? 'bg-white' : 'bg-gray-300'}`}>
                    <div className={`w-4 h-4 rounded-full bg-blue-500 transform transition-transform ${highContrast ? 'translate-x-5' : ''}`}></div>
                  </div>
                </button>
              </div>
              
              {/* Reduce motion toggle */}
              <div>
                <h3 className="text-sm font-medium mb-2 flex items-center">
                  <ZoomIn className="w-4 h-4 mr-2" />
                  Reduce Motion
                </h3>
                <button
                  onClick={handleReduceMotionToggle}
                  className={`w-full px-3 py-2 rounded-md text-left flex justify-between items-center ${
                    reduceMotion 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                  aria-pressed={reduceMotion}
                >
                  <span>{reduceMotion ? 'Enabled' : 'Disabled'}</span>
                  <div className={`w-10 h-5 rounded-full flex items-center p-0.5 ${reduceMotion ? 'bg-white' : 'bg-gray-300'}`}>
                    <div className={`w-4 h-4 rounded-full bg-blue-500 transform transition-transform ${reduceMotion ? 'translate-x-5' : ''}`}></div>
                  </div>
                </button>
              </div>
            </div>
            
            {/* Close button */}
            <button 
              onClick={() => setIsOpen(false)}
              className="mt-4 w-full px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md"
              aria-label="Close accessibility settings"
            >
              Close
            </button>
          </div>
        </>
      )}
    </div>
  );
}
