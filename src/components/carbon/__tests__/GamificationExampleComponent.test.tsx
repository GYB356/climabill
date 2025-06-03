import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { GamificationExampleComponent } from '../GamificationExampleComponent';
import { LoadingProvider } from '../../../lib/ui/loading-context';
import { AccessibilityProvider } from '../../../lib/a11y/accessibility-context';
import { useGamificationOperation } from '../../../lib/hooks/useGamificationOperation';
import { AchievementService } from '../../../lib/carbon/achievement-service';
import { createAppError, ErrorType } from '../../../lib/carbon/error-handling';

// Mock the useAuth hook
jest.mock('../../../lib/firebase/auth-context', () => ({
  useAuth: () => ({
    user: { uid: 'test-user-id', email: 'test@example.com' },
    isAuthenticated: true
  })
}));

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
  }),
  AccessibilityProvider: ({ children }) => <div>{children}</div>
}));

// Mock the useGamificationOperation hook
jest.mock('../../../lib/hooks/useGamificationOperation');

// Mock the AchievementService
jest.mock('../../../lib/carbon/achievement-service', () => ({
  AchievementService: {
    getInstance: jest.fn().mockReturnValue({
      getUserAchievements: jest.fn(),
      unlockAchievement: jest.fn()
    })
  }
}));

describe('GamificationExampleComponent', () => {
  let mockWithOperation;
  let mockAchievementService;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup mock for useGamificationOperation
    mockWithOperation = jest.fn();
    (useGamificationOperation as jest.Mock).mockReturnValue({
      isLoading: false,
      error: null,
      withOperation: mockWithOperation,
      clearError: jest.fn()
    });
    
    // Setup mock for AchievementService
    mockAchievementService = AchievementService.getInstance();
    mockAchievementService.getUserAchievements.mockResolvedValue([
      { id: '1', name: 'First Achievement', description: 'You did it!', unlocked: true },
      { id: '2', name: 'Second Achievement', description: 'You did it again!', unlocked: false }
    ]);
    mockAchievementService.unlockAchievement.mockResolvedValue(true);
  });

  it('renders the component with achievements', async () => {
    mockWithOperation.mockImplementation((fn) => fn());
    
    render(
      <LoadingProvider>
        <GamificationExampleComponent />
      </LoadingProvider>
    );
    
    // Should show loading first
    expect(mockWithOperation).toHaveBeenCalled();
    
    // Wait for achievements to load
    await waitFor(() => {
      expect(mockAchievementService.getUserAchievements).toHaveBeenCalled();
    });
    
    // Now should display achievements
    await waitFor(() => {
      expect(screen.getByText('First Achievement')).toBeInTheDocument();
      expect(screen.getByText('Second Achievement')).toBeInTheDocument();
    });
  });

  it('displays error when achievements fail to load', async () => {
    // Setup error state
    (useGamificationOperation as jest.Mock).mockReturnValue({
      isLoading: false,
      error: createAppError({
        type: ErrorType.API,
        message: 'Failed to load achievements',
        severity: 'error'
      }),
      withOperation: mockWithOperation,
      clearError: jest.fn()
    });
    
    mockWithOperation.mockImplementation((fn) => {
      throw new Error('Failed to load achievements');
    });
    
    render(
      <LoadingProvider>
        <GamificationExampleComponent />
      </LoadingProvider>
    );
    
    // Should display error message
    await waitFor(() => {
      expect(screen.getByText('Failed to load achievements')).toBeInTheDocument();
    });
  });

  it('calls unlockAchievement when unlock button is clicked', async () => {
    mockWithOperation.mockImplementation((fn) => fn());
    
    render(
      <LoadingProvider>
        <GamificationExampleComponent />
      </LoadingProvider>
    );
    
    // Wait for achievements to load
    await waitFor(() => {
      expect(screen.getByText('Second Achievement')).toBeInTheDocument();
    });
    
    // Click the unlock button for the second achievement (which is not unlocked)
    const unlockButtons = screen.getAllByRole('button', { name: /unlock/i });
    await act(async () => {
      fireEvent.click(unlockButtons[0]);
    });
    
    // Should call unlockAchievement
    expect(mockAchievementService.unlockAchievement).toHaveBeenCalledWith('2');
    
    // Should announce success
    expect(mockWithOperation).toHaveBeenCalledWith(
      expect.any(Function),
      expect.stringContaining('Achievement unlocked'),
      expect.stringContaining('Failed to unlock achievement')
    );
  });

  it('shows loading state while achievements are loading', async () => {
    // Set loading state to true
    (useGamificationOperation as jest.Mock).mockReturnValue({
      isLoading: true,
      error: null,
      withOperation: mockWithOperation,
      clearError: jest.fn()
    });
    
    render(
      <LoadingProvider>
        <GamificationExampleComponent />
      </LoadingProvider>
    );
    
    // Should show loading indicator
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    
    // Achievements should not be visible yet
    expect(screen.queryByText('First Achievement')).not.toBeInTheDocument();
  });

  it('retries loading achievements when retry button is clicked', async () => {
    // Setup error state first
    (useGamificationOperation as jest.Mock).mockReturnValue({
      isLoading: false,
      error: createAppError({
        type: ErrorType.API,
        message: 'Failed to load achievements',
        severity: 'error'
      }),
      withOperation: mockWithOperation,
      clearError: jest.fn()
    });
    
    render(
      <LoadingProvider>
        <GamificationExampleComponent />
      </LoadingProvider>
    );
    
    // Error should be displayed
    expect(screen.getByText('Failed to load achievements')).toBeInTheDocument();
    
    // Now change the mock to return loading state and then success
    (useGamificationOperation as jest.Mock).mockReturnValue({
      isLoading: false,
      error: null,
      withOperation: mockWithOperation,
      clearError: jest.fn()
    });
    mockWithOperation.mockImplementation((fn) => fn());
    
    // Click retry button
    const retryButton = screen.getByRole('button', { name: /try again/i });
    await act(async () => {
      fireEvent.click(retryButton);
    });
    
    // Should call withOperation again
    expect(mockWithOperation).toHaveBeenCalled();
  });
});
