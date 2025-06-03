import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { AccessibilityProvider, useAccessibility } from '../accessibility-context';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    key: jest.fn((index: number) => Object.keys(store)[index] || null),
    length: jest.fn(() => Object.keys(store).length)
  };
})();

// Mock document methods
Object.defineProperty(window, 'localStorage', { value: localStorageMock });
document.documentElement.classList.add = jest.fn();
document.documentElement.classList.remove = jest.fn();

// Test component that uses the accessibility context
function AccessibilityConsumer() {
  const {
    highContrast,
    textSize,
    reducedMotion,
    announce,
    toggleHighContrast,
    setTextSize,
    toggleReducedMotion
  } = useAccessibility();

  return (
    <div>
      <div data-testid="highContrast">{highContrast ? 'true' : 'false'}</div>
      <div data-testid="textSize">{textSize}</div>
      <div data-testid="reducedMotion">{reducedMotion ? 'true' : 'false'}</div>
      
      <button onClick={toggleHighContrast} data-testid="toggleHighContrast">
        Toggle High Contrast
      </button>
      
      <button onClick={() => setTextSize('large')} data-testid="setLargeText">
        Set Large Text
      </button>
      
      <button onClick={toggleReducedMotion} data-testid="toggleReducedMotion">
        Toggle Reduced Motion
      </button>
      
      <button onClick={() => announce('Test announcement', false)} data-testid="announce">
        Announce
      </button>
      
      <button onClick={() => announce('Test error', true)} data-testid="announceError">
        Announce Error
      </button>
    </div>
  );
}

describe('AccessibilityContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('should provide default accessibility values', () => {
    render(
      <AccessibilityProvider>
        <AccessibilityConsumer />
      </AccessibilityProvider>
    );

    expect(screen.getByTestId('highContrast')).toHaveTextContent('false');
    expect(screen.getByTestId('textSize')).toHaveTextContent('medium');
    expect(screen.getByTestId('reducedMotion')).toHaveTextContent('false');
  });

  it('should load preferences from localStorage', () => {
    // Setup stored preferences
    localStorage.setItem('a11y-highContrast', 'true');
    localStorage.setItem('a11y-textSize', 'large');
    localStorage.setItem('a11y-reducedMotion', 'true');

    render(
      <AccessibilityProvider>
        <AccessibilityConsumer />
      </AccessibilityProvider>
    );

    expect(screen.getByTestId('highContrast')).toHaveTextContent('true');
    expect(screen.getByTestId('textSize')).toHaveTextContent('large');
    expect(screen.getByTestId('reducedMotion')).toHaveTextContent('true');
  });

  it('should toggle high contrast mode', () => {
    render(
      <AccessibilityProvider>
        <AccessibilityConsumer />
      </AccessibilityProvider>
    );

    expect(screen.getByTestId('highContrast')).toHaveTextContent('false');
    
    fireEvent.click(screen.getByTestId('toggleHighContrast'));
    
    expect(screen.getByTestId('highContrast')).toHaveTextContent('true');
    expect(localStorage.setItem).toHaveBeenCalledWith('a11y-highContrast', 'true');
    expect(document.documentElement.classList.add).toHaveBeenCalledWith('high-contrast');
    
    fireEvent.click(screen.getByTestId('toggleHighContrast'));
    
    expect(screen.getByTestId('highContrast')).toHaveTextContent('false');
    expect(localStorage.setItem).toHaveBeenCalledWith('a11y-highContrast', 'false');
    expect(document.documentElement.classList.remove).toHaveBeenCalledWith('high-contrast');
  });

  it('should set text size', () => {
    render(
      <AccessibilityProvider>
        <AccessibilityConsumer />
      </AccessibilityProvider>
    );

    expect(screen.getByTestId('textSize')).toHaveTextContent('medium');
    
    fireEvent.click(screen.getByTestId('setLargeText'));
    
    expect(screen.getByTestId('textSize')).toHaveTextContent('large');
    expect(localStorage.setItem).toHaveBeenCalledWith('a11y-textSize', 'large');
    expect(document.documentElement.classList.add).toHaveBeenCalledWith('text-large');
  });

  it('should toggle reduced motion', () => {
    render(
      <AccessibilityProvider>
        <AccessibilityConsumer />
      </AccessibilityProvider>
    );

    expect(screen.getByTestId('reducedMotion')).toHaveTextContent('false');
    
    fireEvent.click(screen.getByTestId('toggleReducedMotion'));
    
    expect(screen.getByTestId('reducedMotion')).toHaveTextContent('true');
    expect(localStorage.setItem).toHaveBeenCalledWith('a11y-reducedMotion', 'true');
    expect(document.documentElement.classList.add).toHaveBeenCalledWith('reduced-motion');
    
    fireEvent.click(screen.getByTestId('toggleReducedMotion'));
    
    expect(screen.getByTestId('reducedMotion')).toHaveTextContent('false');
    expect(localStorage.setItem).toHaveBeenCalledWith('a11y-reducedMotion', 'false');
    expect(document.documentElement.classList.remove).toHaveBeenCalledWith('reduced-motion');
  });

  it('should create screen reader announcements', () => {
    // Mock the live region element
    const mockLiveRegion = document.createElement('div');
    jest.spyOn(document, 'getElementById').mockImplementation((id) => {
      if (id === 'a11y-announcer') {
        return mockLiveRegion;
      }
      return null;
    });

    render(
      <AccessibilityProvider>
        <AccessibilityConsumer />
      </AccessibilityProvider>
    );
    
    // Test regular announcement
    fireEvent.click(screen.getByTestId('announce'));
    expect(mockLiveRegion.textContent).toBe('Test announcement');
    expect(mockLiveRegion.getAttribute('aria-live')).toBe('polite');
    
    // Test error announcement
    fireEvent.click(screen.getByTestId('announceError'));
    expect(mockLiveRegion.textContent).toBe('Test error');
    expect(mockLiveRegion.getAttribute('aria-live')).toBe('assertive');
  });
});
