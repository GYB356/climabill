import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorDisplay } from '../ErrorDisplay';
import { AccessibilityProvider } from '../../../lib/a11y/accessibility-context';
import { createAppError, ErrorType } from '../../../lib/carbon/error-handling';

// Mock the announce function
const mockAnnounce = jest.fn();

// Mock the accessibility context
jest.mock('../../../lib/a11y/accessibility-context', () => ({
  ...jest.requireActual('../../../lib/a11y/accessibility-context'),
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

describe('ErrorDisplay', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with error message', () => {
    const error = createAppError({
      type: ErrorType.API,
      message: 'Failed to fetch data',
      severity: 'error'
    });

    render(
      <AccessibilityProvider>
        <ErrorDisplay error={error} onRetry={jest.fn()} onDismiss={jest.fn()} />
      </AccessibilityProvider>
    );

    expect(screen.getByText('Failed to fetch data')).toBeInTheDocument();
    expect(mockAnnounce).toHaveBeenCalledWith(
      expect.stringContaining('Failed to fetch data'),
      true
    );
  });

  it('does not render when error is null', () => {
    const { container } = render(
      <AccessibilityProvider>
        <ErrorDisplay error={null} onRetry={jest.fn()} onDismiss={jest.fn()} />
      </AccessibilityProvider>
    );

    expect(container.firstChild).toBeNull();
    expect(mockAnnounce).not.toHaveBeenCalled();
  });

  it('applies the correct styling based on error severity', () => {
    const warningError = createAppError({
      type: ErrorType.VALIDATION,
      message: 'Warning message',
      severity: 'warning'
    });

    const { rerender } = render(
      <AccessibilityProvider>
        <ErrorDisplay error={warningError} onRetry={jest.fn()} onDismiss={jest.fn()} />
      </AccessibilityProvider>
    );

    // Check warning styles
    const warningElement = screen.getByRole('alert');
    expect(warningElement).toHaveClass('bg-amber-50');
    
    // Rerender with error severity
    const criticalError = createAppError({
      type: ErrorType.API,
      message: 'Critical error',
      severity: 'error'
    });
    
    rerender(
      <AccessibilityProvider>
        <ErrorDisplay error={criticalError} onRetry={jest.fn()} onDismiss={jest.fn()} />
      </AccessibilityProvider>
    );
    
    // Check error styles
    const errorElement = screen.getByRole('alert');
    expect(errorElement).toHaveClass('bg-red-50');
    
    // Rerender with info severity
    const infoError = createAppError({
      type: ErrorType.OTHER,
      message: 'Information message',
      severity: 'info'
    });
    
    rerender(
      <AccessibilityProvider>
        <ErrorDisplay error={infoError} onRetry={jest.fn()} onDismiss={jest.fn()} />
      </AccessibilityProvider>
    );
    
    // Check info styles
    const infoElement = screen.getByRole('alert');
    expect(infoElement).toHaveClass('bg-blue-50');
  });

  it('calls onRetry when retry button is clicked', () => {
    const error = createAppError({
      type: ErrorType.API,
      message: 'Failed to fetch data',
      severity: 'error'
    });
    
    const onRetryMock = jest.fn();
    
    render(
      <AccessibilityProvider>
        <ErrorDisplay 
          error={error} 
          onRetry={onRetryMock} 
          onDismiss={jest.fn()} 
          showRetry={true}
        />
      </AccessibilityProvider>
    );
    
    const retryButton = screen.getByRole('button', { name: /try again/i });
    fireEvent.click(retryButton);
    
    expect(onRetryMock).toHaveBeenCalledTimes(1);
  });

  it('calls onDismiss when dismiss button is clicked', () => {
    const error = createAppError({
      type: ErrorType.API,
      message: 'Failed to fetch data',
      severity: 'error'
    });
    
    const onDismissMock = jest.fn();
    
    render(
      <AccessibilityProvider>
        <ErrorDisplay 
          error={error} 
          onRetry={jest.fn()} 
          onDismiss={onDismissMock} 
          showDismiss={true}
        />
      </AccessibilityProvider>
    );
    
    const dismissButton = screen.getByRole('button', { name: /dismiss/i });
    fireEvent.click(dismissButton);
    
    expect(onDismissMock).toHaveBeenCalledTimes(1);
  });

  it('does not show retry button when showRetry is false', () => {
    const error = createAppError({
      type: ErrorType.API,
      message: 'Failed to fetch data',
      severity: 'error'
    });
    
    render(
      <AccessibilityProvider>
        <ErrorDisplay 
          error={error} 
          onRetry={jest.fn()} 
          onDismiss={jest.fn()} 
          showRetry={false}
        />
      </AccessibilityProvider>
    );
    
    expect(screen.queryByRole('button', { name: /try again/i })).not.toBeInTheDocument();
  });

  it('does not show dismiss button when showDismiss is false', () => {
    const error = createAppError({
      type: ErrorType.API,
      message: 'Failed to fetch data',
      severity: 'error'
    });
    
    render(
      <AccessibilityProvider>
        <ErrorDisplay 
          error={error} 
          onRetry={jest.fn()} 
          onDismiss={jest.fn()} 
          showDismiss={false}
        />
      </AccessibilityProvider>
    );
    
    expect(screen.queryByRole('button', { name: /dismiss/i })).not.toBeInTheDocument();
  });
});
