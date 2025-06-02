import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { GameifiedCarbonDashboard } from '../GameifiedCarbonDashboard';
import { AchievementService } from '../../../lib/carbon/achievement-service';
import { NotificationService } from '../../../lib/carbon/notification-service';
import { LeaderboardService } from '../../../lib/carbon/leaderboard-service';

// Mock the services
jest.mock('../../../lib/carbon/achievement-service');
jest.mock('../../../lib/carbon/notification-service');
jest.mock('../../../lib/carbon/leaderboard-service');

// Mock the next/router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: '/carbon/gamified-dashboard',
    query: {},
  }),
}));

// Mock next-i18next
jest.mock('next-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      language: 'en',
    },
  }),
}));

describe('GameifiedCarbonDashboard', () => {
  // Setup mock implementations for the services
  const mockGetUserAchievements = jest.fn();
  const mockGetUserProfile = jest.fn();
  const mockGetUserChallenges = jest.fn();
  const mockJoinChallenge = jest.fn();
  const mockLeaveChallenge = jest.fn();
  const mockGetPersonalizedRecommendations = jest.fn();
  const mockImplementRecommendation = jest.fn();
  const mockSaveRecommendationForLater = jest.fn();
  const mockDismissRecommendation = jest.fn();
  const mockGetUserScenarios = jest.fn();
  const mockSaveScenario = jest.fn();
  const mockDeleteScenario = jest.fn();
  
  const mockGetNotifications = jest.fn();
  const mockGetUnreadCount = jest.fn();
  const mockMarkAsRead = jest.fn();
  const mockDismissNotification = jest.fn();
  const mockMarkAllAsRead = jest.fn();
  
  const mockGetLeaderboard = jest.fn();
  const mockGetUserRank = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock AchievementService
    (AchievementService.getInstance as jest.Mock).mockReturnValue({
      getUserAchievements: mockGetUserAchievements,
      getUserProfile: mockGetUserProfile,
      getUserChallenges: mockGetUserChallenges,
      joinChallenge: mockJoinChallenge,
      leaveChallenge: mockLeaveChallenge,
      getPersonalizedRecommendations: mockGetPersonalizedRecommendations,
      implementRecommendation: mockImplementRecommendation,
      saveRecommendationForLater: mockSaveRecommendationForLater,
      dismissRecommendation: mockDismissRecommendation,
      getUserScenarios: mockGetUserScenarios,
      saveScenario: mockSaveScenario,
      deleteScenario: mockDeleteScenario,
    });
    
    // Mock NotificationService
    (NotificationService.getInstance as jest.Mock).mockReturnValue({
      getNotifications: mockGetNotifications,
      getUnreadCount: mockGetUnreadCount,
      markAsRead: mockMarkAsRead,
      dismissNotification: mockDismissNotification,
      markAllAsRead: mockMarkAllAsRead,
    });
    
    // Mock LeaderboardService
    (LeaderboardService.getInstance as jest.Mock).mockReturnValue({
      getLeaderboard: mockGetLeaderboard,
      getUserRank: mockGetUserRank,
    });
    
    // Set up default mock responses
    mockGetUserAchievements.mockResolvedValue([
      { id: '1', title: 'Achievement 1', description: 'Description 1', points: 10, unlocked: true },
      { id: '2', title: 'Achievement 2', description: 'Description 2', points: 20, unlocked: false }
    ]);
    
    mockGetUserProfile.mockResolvedValue({
      id: 'user-1',
      username: 'Test User',
      level: 5,
      points: 500,
      totalCarbonReduced: 1000,
      avatarUrl: 'https://example.com/avatar.png'
    });
    
    mockGetUserChallenges.mockResolvedValue([
      {
        id: '1',
        title: 'Challenge 1',
        description: 'Description 1',
        startDate: '2023-01-01',
        endDate: '2023-12-31',
        participants: 10,
        joined: true
      }
    ]);
    
    mockGetPersonalizedRecommendations.mockResolvedValue([
      {
        id: '1',
        title: 'Recommendation 1',
        description: 'Description 1',
        difficulty: 'easy',
        impact: 'high',
        potentialSavings: 100
      }
    ]);
    
    mockGetUserScenarios.mockResolvedValue([
      {
        id: '1',
        name: 'Scenario 1',
        description: 'Description 1',
        createdAt: '2023-01-01',
        parameters: {},
        baseline: 1000,
        modified: 800,
        reduction: 200
      }
    ]);
    
    mockGetNotifications.mockResolvedValue([
      {
        id: '1',
        title: 'New Achievement',
        message: 'You earned a new achievement!',
        type: 'achievement',
        read: false,
        createdAt: '2023-01-01T12:00:00Z'
      }
    ]);
    
    mockGetUnreadCount.mockResolvedValue(1);
    
    mockGetLeaderboard.mockResolvedValue([
      {
        rank: 1,
        userId: 'user-1',
        username: 'Test User',
        points: 500,
        carbonReduced: 1000,
        rankChange: 0,
        avatarUrl: 'https://example.com/avatar.png'
      },
      {
        rank: 2,
        userId: 'user-2',
        username: 'Another User',
        points: 400,
        carbonReduced: 800,
        rankChange: 1,
        avatarUrl: 'https://example.com/avatar2.png'
      }
    ]);
    
    mockGetUserRank.mockResolvedValue({
      rank: 1,
      userId: 'user-1',
      username: 'Test User',
      points: 500,
      carbonReduced: 1000,
      rankChange: 0,
      avatarUrl: 'https://example.com/avatar.png'
    });
  });

  it('renders the component with initial data', async () => {
    render(<GameifiedCarbonDashboard />);
    
    // Wait for the initial data to load
    await waitFor(() => {
      expect(mockGetUserProfile).toHaveBeenCalled();
      expect(mockGetUserAchievements).toHaveBeenCalled();
      expect(mockGetUserChallenges).toHaveBeenCalled();
      expect(mockGetPersonalizedRecommendations).toHaveBeenCalled();
      expect(mockGetNotifications).toHaveBeenCalled();
      expect(mockGetUnreadCount).toHaveBeenCalled();
      expect(mockGetLeaderboard).toHaveBeenCalled();
    });
    
    // Check that the component renders with the mock data
    expect(screen.getByText(/Test User/i)).toBeInTheDocument();
    expect(screen.getByText(/Level 5/i)).toBeInTheDocument();
    expect(screen.getByText(/500 Points/i)).toBeInTheDocument();
    
    // Check that achievements are rendered
    expect(screen.getByText(/Achievement 1/i)).toBeInTheDocument();
    
    // Check that challenges are rendered
    expect(screen.getByText(/Challenge 1/i)).toBeInTheDocument();
    
    // Check that recommendations are rendered
    expect(screen.getByText(/Recommendation 1/i)).toBeInTheDocument();
    
    // Check that notifications are rendered
    expect(screen.getByText(/New Achievement/i)).toBeInTheDocument();
    
    // Check that leaderboard is rendered
    expect(screen.getByText(/Test User/i)).toBeInTheDocument();
    expect(screen.getByText(/Another User/i)).toBeInTheDocument();
  });

  it('allows joining a challenge', async () => {
    mockJoinChallenge.mockResolvedValue({ success: true });
    
    render(<GameifiedCarbonDashboard />);
    
    // Wait for the initial data to load
    await waitFor(() => {
      expect(mockGetUserChallenges).toHaveBeenCalled();
    });
    
    // Find and click the join challenge button
    const joinButton = screen.getByText(/Join Challenge/i);
    fireEvent.click(joinButton);
    
    // Verify the join challenge method was called
    await waitFor(() => {
      expect(mockJoinChallenge).toHaveBeenCalledWith('current-user', '1');
    });
    
    // Verify the challenges are refreshed
    expect(mockGetUserChallenges).toHaveBeenCalledTimes(2);
  });

  it('allows implementing a recommendation', async () => {
    mockImplementRecommendation.mockResolvedValue({ success: true });
    
    render(<GameifiedCarbonDashboard />);
    
    // Wait for the initial data to load
    await waitFor(() => {
      expect(mockGetPersonalizedRecommendations).toHaveBeenCalled();
    });
    
    // Find and click the implement recommendation button
    const implementButton = screen.getByText(/Implement/i);
    fireEvent.click(implementButton);
    
    // Verify the implement recommendation method was called
    await waitFor(() => {
      expect(mockImplementRecommendation).toHaveBeenCalledWith('current-user', '1');
    });
    
    // Verify the recommendations are refreshed
    expect(mockGetPersonalizedRecommendations).toHaveBeenCalledTimes(2);
  });

  it('allows marking a notification as read', async () => {
    mockMarkAsRead.mockResolvedValue({ success: true });
    
    render(<GameifiedCarbonDashboard />);
    
    // Wait for the initial data to load
    await waitFor(() => {
      expect(mockGetNotifications).toHaveBeenCalled();
    });
    
    // Find and click the mark as read button
    const markAsReadButton = screen.getByText(/Mark as Read/i);
    fireEvent.click(markAsReadButton);
    
    // Verify the mark as read method was called
    await waitFor(() => {
      expect(mockMarkAsRead).toHaveBeenCalledWith('current-user', '1');
    });
    
    // Verify the notifications and unread count are refreshed
    expect(mockGetNotifications).toHaveBeenCalledTimes(2);
    expect(mockGetUnreadCount).toHaveBeenCalledTimes(2);
  });

  it('allows changing the leaderboard period', async () => {
    render(<GameifiedCarbonDashboard />);
    
    // Wait for the initial data to load
    await waitFor(() => {
      expect(mockGetLeaderboard).toHaveBeenCalledWith('week');
    });
    
    // Find and click the month period button
    const monthButton = screen.getByText(/This Month/i);
    fireEvent.click(monthButton);
    
    // Verify the leaderboard is refreshed with the new period
    await waitFor(() => {
      expect(mockGetLeaderboard).toHaveBeenCalledWith('month');
    });
  });
});
