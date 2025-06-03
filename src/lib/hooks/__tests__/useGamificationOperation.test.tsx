import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { useGamificationOperation } from '../useGamificationOperation';
import { LoadingProvider } from '../../ui/loading-context';
import { AccessibilityProvider } from '../../a11y/accessibility-context';
import { ErrorType } from '../../carbon/error-handling';

// Mock the announce function
const mockAnnounce = jest.fn();

// Mock the accessibility context
jest.mock('../../a11y/accessibility-context', () => ({
  ...jest.requireActual('../../a11y/accessibility-context'),
  useAccessibility: () => ({
    announce: mockAnnounce,
    highContrast: false,
    textSize: 'medium',
    reducedMotion: false,
    toggleHighContrast: jest.fn(),
    setTextSize: jest.fn(),
    toggleReducedMotion: jest.fn()
  })
}));

// Test component that uses the useGamificationOperation hook
function GamificationOperationConsumer() {
  const {
    isLoading,
    error,
    withOperation,
    clearError
  } = useGamificationOperation('test-operation');

  const runSuccessOperation = async () => {
    await withOperation(
      async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
        return { data: 'success' };
      },
      'Operation succeeded',
      'Operation failed'
    );
  };

  const runErrorOperation = async () => {
    await withOperation(
      async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
        throw new Error('Test error');
      },
      'Operation succeeded',
      'Operation failed'
    );
  };

  return (
    <div>
      <div data-testid="loading">{isLoading ? 'true' : 'false'}</div>
      <div data-testid="error">{error ? error.message : 'no error'}</div>
      
      <button onClick={runSuccessOperation} data-testid="runSuccess">
        Run Success Operation
      </button>
      
      <button onClick={runErrorOperation} data-testid="runError">
        Run Error Operation
      </button>
      
      <button onClick={clearError} data-testid="clearError">
        Clear Error
      </button>
    </div>
  );
}

describe('useGamificationOperation', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should provide initial state with loading false and no error', () => {
    render(
      <AccessibilityProvider>
        <LoadingProvider>
          <GamificationOperationConsumer />
        </LoadingProvider>
      </AccessibilityProvider>
    );

    expect(screen.getByTestId('loading')).toHaveTextContent('false');
    expect(screen.getByTestId('error')).toHaveTextContent('no error');
  });

  it('should handle successful operations and announce success', async () => {
    render(
      <AccessibilityProvider>
        <LoadingProvider>
          <GamificationOperationConsumer />
        </LoadingProvider>
      </AccessibilityProvider>
    );

    // Start operation
    act(() => {
      screen.getByTestId('runSuccess').click();
    });
    
    // Loading should be true immediately
    expect(screen.getByTestId('loading')).toHaveTextContent('true');
    
    // Fast-forward timers
    act(() => {
      jest.advanceTimersByTime(100);
    });
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });
    
    // Error should still be null
    expect(screen.getByTestId('error')).toHaveTextContent('no error');
    
    // Success should be announced
    expect(mockAnnounce).toHaveBeenCalledWith('Operation succeeded', false);
  });

  it('should handle error operations and announce error', async () => {
    render(
      <AccessibilityProvider>
        <LoadingProvider>
          <GamificationOperationConsumer />
        </LoadingProvider>
      </AccessibilityProvider>
    );

    // Start operation that will fail
    act(() => {
      screen.getByTestId('runError').click();
    });
    
    // Loading should be true initially
    expect(screen.getByTestId('loading')).toHaveTextContent('true');
    
    // Fast-forward timers
    act(() => {
      jest.advanceTimersByTime(100);
    });
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });
    
    // Error should be set
    expect(screen.getByTestId('error')).not.toHaveTextContent('no error');
    expect(screen.getByTestId('error')).toHaveTextContent('Test error');
    
    // Error should be announced
    expect(mockAnnounce).toHaveBeenCalledWith(
      expect.stringContaining('Operation failed'),
      true
    );
  });

  it('should clear error when clearError is called', async () => {
    render(
      <AccessibilityProvider>
        <LoadingProvider>
          <GamificationOperationConsumer />
        </LoadingProvider>
      </AccessibilityProvider>
    );

    // Run error operation
    act(() => {
      screen.getByTestId('runError').click();
    });
    
    // Fast-forward timers
    act(() => {
      jest.advanceTimersByTime(100);
    });
    
    // Wait for error to be set
    await waitFor(() => {
      expect(screen.getByTestId('error')).not.toHaveTextContent('no error');
    });
    
    // Clear error
    act(() => {
      screen.getByTestId('clearError').click();
    });
    
    // Error should be cleared
    expect(screen.getByTestId('error')).toHaveTextContent('no error');
  });
});
