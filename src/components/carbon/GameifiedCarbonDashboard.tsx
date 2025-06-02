"use client";

import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, ChevronRight } from 'lucide-react';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useAuth } from '@/lib/auth/auth-context';

// Import services
import { CachedCarbonTrackingService } from '@/lib/carbon/cached-carbon-tracking-service';
import { AchievementService } from '@/lib/carbon/achievement-service';
import { NotificationService, Notification } from '@/lib/carbon/notification-service';
import { LeaderboardService, LeaderboardEntry, LeaderboardPeriod } from '@/lib/carbon/leaderboard-service';

// Import components
import DashboardHeader from './DashboardHeader';
import UserProfileCard from './UserProfileCard';
import LeaderboardCard from './LeaderboardCard';
import NotificationCenter, { Notification } from './NotificationCenter';
import ScenarioModeler from './ScenarioModeler';
import InsightsSection from './InsightsSection';
import AchievementsSection from './AchievementsSection';

// Import types
import { 
  Achievement, 
  Challenge, 
  UserProfile, 
  PersonalizedRecommendation,
  ScenarioModel
} from '@/lib/carbon/gamification-types';
import { CarbonUsage } from '@/lib/carbon/carbon-tracking-service';

/**
 * GameifiedCarbonDashboard - An enhanced carbon dashboard with gamification elements
 * 
 * Features:
 * - User profile with achievements, points, and level
 * - Personalized insights and recommendations
 * - Interactive scenario modeling ("what-if" analysis)
 * - Achievements and challenges
 * - Social leaderboard
 * - Real-time notifications
 */
export default function GameifiedCarbonDashboard() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { user } = useAuth();
  
  // Initialize services
  const carbonService = new CachedCarbonTrackingService();
  const achievementService = new AchievementService();
  const notificationService = new NotificationService();
  const leaderboardService = new LeaderboardService();
  
  // State - Loading and errors
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('thisMonth');
  
  // State - Carbon data
  const [carbonSummary, setCarbonSummary] = useState({
    totalCarbonInKg: 0,
    offsetCarbonInKg: 0,
    netCarbonInKg: 0,
    trend: null as { value: number; isIncrease: boolean } | null
  });
  
  // State - Emissions data for charts
  const [emissionsData, setEmissionsData] = useState<{
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
    }>;
  }>({
    labels: [],
    datasets: []
  });
  
  // State - Breakdown data for charts
  const [breakdownData, setBreakdownData] = useState<{
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
    }>;
  }>({
    labels: [],
    datasets: []
  });
  
  // State - Gamification data
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [recommendations, setRecommendations] = useState<PersonalizedRecommendation[]>([]);
  const [scenarios, setScenarios] = useState<ScenarioModel[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState<number>(0);
  
  // State for leaderboard
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [leaderboardPeriod, setLeaderboardPeriod] = useState<LeaderboardPeriod>('month');
  
  // Load leaderboard
  const loadLeaderboard = useCallback(async (period: LeaderboardPeriod = 'month') => {
    try {
      const leaderboardData = await leaderboardService.getLeaderboard(period);
      setLeaderboard(leaderboardData);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    }
  }, []);
  
  useEffect(() => {
    loadLeaderboard(leaderboardPeriod);
  }, [loadLeaderboard, leaderboardPeriod]);
  
  // Handle leaderboard period change
  const handleLeaderboardPeriodChange = (period: LeaderboardPeriod) => {
    setLeaderboardPeriod(period);
  };
  
  // Load notifications
  const loadNotifications = useCallback(async () => {
    try {
      const userId = 'current-user'; // In a real app, get this from auth context
      const userNotifications = await notificationService.getUserNotifications(userId);
      setNotifications(userNotifications);
      
      // Count unread notifications
      const unreadCount = userNotifications.filter(n => !n.read).length;
      setUnreadNotificationsCount(unreadCount);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  }, []);
  
  useEffect(() => {
    loadNotifications();
    
    // Set up polling for notifications every 30 seconds
    const pollInterval = setInterval(loadNotifications, 30000);
    return () => clearInterval(pollInterval);
  }, [loadNotifications]);
  
  // Function to get date range based on selected time range
  const getDateRange = (range: string): { startDate: Date; endDate: Date } => {
    const now = new Date();
    const endDate = new Date(now);
    let startDate = new Date(now);
    
    switch (range) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'thisWeek':
        startDate.setDate(now.getDate() - now.getDay());
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'thisMonth':
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'thisQuarter':
        const quarter = Math.floor(now.getMonth() / 3);
        startDate.setMonth(quarter * 3);
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'thisYear':
        startDate.setMonth(0);
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'last30Days':
        startDate.setDate(now.getDate() - 30);
        break;
      case 'last90Days':
        startDate.setDate(now.getDate() - 90);
        break;
      case 'last12Months':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);
    }
    
    return { startDate, endDate };
  };
  
  // Format carbon values
  const formatCarbonValue = (value: number): string => {
    return `${value.toLocaleString(undefined, { maximumFractionDigits: 1 })} kg CO₂`;
  };
  
  // Load dashboard data
  const loadDashboardData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const { startDate, endDate } = getDateRange(selectedTimeRange);
      
      // Load carbon usage data
      const carbonUsage = await carbonService.getCarbonUsageForPeriod(
        user.id,
        startDate,
        endDate
      );
      
      // Load offset data
      const offsetCarbon = await carbonService.getOffsetCarbonForPeriod(
        user.id,
        startDate,
        endDate
      );
      
      // Calculate trend
      let trend = null;
      if (selectedTimeRange === 'thisMonth' || selectedTimeRange === 'thisQuarter' || selectedTimeRange === 'thisYear') {
        // Get previous period data for trend calculation
        const previousEndDate = new Date(startDate);
        previousEndDate.setDate(previousEndDate.getDate() - 1);
        
        let previousStartDate = new Date(previousEndDate);
        if (selectedTimeRange === 'thisMonth') {
          previousStartDate.setDate(1);
        } else if (selectedTimeRange === 'thisQuarter') {
          const quarter = Math.floor(previousEndDate.getMonth() / 3);
          previousStartDate.setMonth(quarter * 3);
          previousStartDate.setDate(1);
        } else if (selectedTimeRange === 'thisYear') {
          previousStartDate.setMonth(0);
          previousStartDate.setDate(1);
        }
        
        const previousUsage = await carbonService.getCarbonUsageForPeriod(
          user.id,
          previousStartDate,
          previousEndDate
        );
        
        if (previousUsage && carbonUsage) {
          const currentValue = carbonUsage.totalCarbonInKg || 0;
          const previousValue = previousUsage.totalCarbonInKg || 0;
          
          if (previousValue > 0) {
            const percentChange = ((currentValue - previousValue) / previousValue) * 100;
            trend = {
              value: Math.abs(percentChange),
              isIncrease: percentChange > 0
            };
          }
        }
      }
      
      // Update carbon summary
      const totalCarbonInKg = carbonUsage?.totalCarbonInKg || 0;
      const offsetCarbonInKg = offsetCarbon || 0;
      
      setCarbonSummary({
        totalCarbonInKg,
        offsetCarbonInKg,
        netCarbonInKg: Math.max(0, totalCarbonInKg - offsetCarbonInKg),
        trend
      });
      
      // Load emissions data for charts
      // In a real implementation, this would fetch detailed time series data
      // For now, we'll generate some sample data
      const emissionsLabels = generateTimeLabels(startDate, endDate, selectedTimeRange);
      const emissionsValues = generateSampleEmissionsData(emissionsLabels.length);
      const offsetValues = generateSampleOffsetData(emissionsLabels.length);
      
      setEmissionsData({
        labels: emissionsLabels,
        datasets: [
          {
            label: t('dashboard.emissions'),
            data: emissionsValues
          },
          {
            label: t('dashboard.offsets'),
            data: offsetValues
          }
        ]
      });
      
      // Load breakdown data for charts
      setBreakdownData({
        labels: [
          t('dashboard.categories.energy'),
          t('dashboard.categories.transportation'),
          t('dashboard.categories.waste'),
          t('dashboard.categories.water'),
          t('dashboard.categories.procurement')
        ],
        datasets: [
          {
            label: t('dashboard.carbonFootprint'),
            data: [35, 25, 15, 10, 15]
          }
        ]
      });
      
      // Load gamification data
      await loadGamificationData();
      
      setLoading(false);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError(t('dashboard.errors.loadingData'));
      setLoading(false);
    }
  };
  
  // Load gamification data
  const loadGamificationData = async () => {
    if (!user) return;
    
    try {
      // Load user profile
      const profile = await achievementService.getUserProfile(user.id);
      setUserProfile(profile);
      
      // Load achievements
      const userAchievements = await achievementService.getUserAchievements(user.id);
      setAchievements(userAchievements);
      
      // Load challenges
      const activeChallenges = await achievementService.getActiveChallenges(user.id);
      setChallenges(activeChallenges);
      
      // Load scenarios
      const userScenarios = await achievementService.getUserScenarioModels(user.id);
      setScenarios(userScenarios);
      
      // Generate sample leaderboard data
      generateSampleLeaderboardData();
      
      // Generate sample notifications
      generateSampleNotifications();
      
      // Load recommendations
      // In a real implementation, this would use actual carbon usage data
      const mockUsageData: CarbonUsage[] = [
        {
          id: 'usage-1',
          userId: user.id,
          totalCarbonInKg: 1200,
          period: {
            startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            endDate: new Date()
          },
          breakdown: {
            energy: 400,
            transportation: 300,
            waste: 200,
            water: 100,
            procurement: 200
          }
        }
      ];
      
      const personalizedRecommendations = await achievementService.getPersonalizedRecommendations(
        user.id,
        mockUsageData
      );
      
      setRecommendations(personalizedRecommendations);
    } catch (err) {
      console.error('Error loading gamification data:', err);
      // Don't set error state here to avoid blocking the entire dashboard
    }
  };
  
  // Generate sample time labels for charts
  const generateTimeLabels = (startDate: Date, endDate: Date, timeRange: string): string[] => {
    const labels: string[] = [];
    const currentDate = new Date(startDate);
    
    let format: 'day' | 'week' | 'month' = 'day';
    
    if (timeRange === 'thisYear' || timeRange === 'last12Months') {
      format = 'month';
    } else if (timeRange === 'thisQuarter' || timeRange === 'last90Days') {
      format = 'week';
    }
    
    while (currentDate <= endDate) {
      if (format === 'day') {
        labels.push(currentDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }));
        currentDate.setDate(currentDate.getDate() + 1);
      } else if (format === 'week') {
        labels.push(
          `${currentDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`
        );
        currentDate.setDate(currentDate.getDate() + 7);
      } else if (format === 'month') {
        labels.push(currentDate.toLocaleDateString(undefined, { month: 'short', year: 'numeric' }));
        currentDate.setMonth(currentDate.getMonth() + 1);
      }
      
      // Safety check to prevent infinite loops
      if (labels.length > 100) break;
    }
    
    return labels;
  };
  
  // Generate sample emissions data
  const generateSampleEmissionsData = (count: number): number[] => {
    const data: number[] = [];
    let base = Math.random() * 500 + 500;
    
    for (let i = 0; i < count; i++) {
      // Add some randomness but with a slight downward trend
      base = Math.max(100, base + (Math.random() * 100 - 60));
      data.push(Math.round(base));
    }
    
    return data;
  };
  
  // Generate sample offset data
  const generateSampleOffsetData = (count: number): number[] => {
    const data: number[] = [];
    let base = Math.random() * 200 + 100;
    
    for (let i = 0; i < count; i++) {
      // Add some randomness but with a slight upward trend
      base = base + (Math.random() * 50 - 20);
      data.push(Math.round(base));
    }
    
    return data;
  };
  
  // Generate sample leaderboard data
  const generateSampleLeaderboardData = () => {
    if (!user || !userProfile) return;
    
    const sampleLeaderboard = [
      {
        userId: 'user-1',
        name: 'Emma Johnson',
        rank: 1,
        previousRank: 1,
        points: 1250,
        carbonReduced: 2800,
        isCurrentUser: false
      },
      {
        userId: 'user-2',
        name: 'Michael Chen',
        rank: 2,
        previousRank: 3,
        points: 980,
        carbonReduced: 2200,
        isCurrentUser: false
      },
      {
        userId: user.id,
        name: user.name || 'You',
        rank: 3,
        previousRank: 5,
        points: userProfile.points,
        carbonReduced: userProfile.totalCarbonReduced,
        isCurrentUser: true
      },
      {
        userId: 'user-3',
        name: 'Sarah Williams',
        rank: 4,
        previousRank: 2,
        points: 820,
        carbonReduced: 1900,
        isCurrentUser: false
      },
      {
        userId: 'user-4',
        name: 'David Rodriguez',
        rank: 5,
        previousRank: 4,
        points: 750,
        carbonReduced: 1700,
        isCurrentUser: false
      }
    ];
    
    setLeaderboard(sampleLeaderboard);
  };
  
  // Generate sample notifications
  const generateSampleNotifications = () => {
    if (!user) return;
    
    const now = new Date();
    
    const sampleNotifications: Notification[] = [
      {
        id: 'notif-1',
        title: t('notifications.samples.achievementUnlocked'),
        message: t('notifications.samples.achievementMessage'),
        type: 'achievement',
        date: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
        read: false,
        actionUrl: '/carbon/achievements',
        actionLabel: t('notifications.samples.viewAchievements')
      },
      {
        id: 'notif-2',
        title: t('notifications.samples.challengeReminder'),
        message: t('notifications.samples.challengeMessage'),
        type: 'challenge',
        date: new Date(now.getTime() - 8 * 60 * 60 * 1000), // 8 hours ago
        read: true,
        actionUrl: '/carbon/challenges',
        actionLabel: t('notifications.samples.viewChallenge')
      },
      {
        id: 'notif-3',
        title: t('notifications.samples.emissionsAlert'),
        message: t('notifications.samples.emissionsMessage'),
        type: 'alert',
        date: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        read: false
      },
      {
        id: 'notif-4',
        title: t('notifications.samples.goalProgress'),
        message: t('notifications.samples.goalMessage'),
        type: 'goal',
        date: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        read: true,
        actionUrl: '/carbon/goals',
        actionLabel: t('notifications.samples.viewGoals')
      }
    ];
    
    setNotifications(sampleNotifications);
  };
  
  // Handle time range change
  const handleTimeRangeChange = (range: string) => {
    setSelectedTimeRange(range);
  };
  
  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };
  
  // Handle notification actions
  const handleMarkNotificationAsRead = (id: string) => {
    setNotifications(prevNotifications =>
      prevNotifications.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };
  
  const handleMarkAllNotificationsAsRead = () => {
    setNotifications(prevNotifications =>
      prevNotifications.map(notification => ({ ...notification, read: true }))
    );
  };
  
  const handleDismissNotification = (id: string) => {
    setNotifications(prevNotifications =>
      prevNotifications.filter(notification => notification.id !== id)
    );
  };
  
  // Handler for implementing a recommendation
  const handleImplementRecommendation = async (recommendationId: string) => {
    try {
      const userId = 'current-user'; // In a real app, get this from auth context
      await achievementService.implementRecommendation(userId, recommendationId);
      
      // Refresh recommendations data
      if (carbonSummary) {
        const updatedRecommendations = await achievementService.getPersonalizedRecommendations(
          userId,
          carbonSummary
        );
        
        setRecommendations(updatedRecommendations);
      }
      
      // Refresh user profile as points may have changed
      const updatedProfile = await achievementService.getUserProfile(userId);
      setUserProfile(updatedProfile);
      
      // Refresh notifications
      loadNotifications();
    } catch (error) {
      console.error(`Error implementing recommendation ${recommendationId}:`, error);
      setError('Failed to implement recommendation. Please try again.');
    }
  };
  
  // Handler for saving a recommendation for later
  const handleSaveRecommendation = async (recommendationId: string) => {
    try {
      const userId = 'current-user'; // In a real app, get this from auth context
      await achievementService.saveRecommendation(userId, recommendationId);
    } catch (error) {
      console.error(`Error saving recommendation ${recommendationId}:`, error);
      setError('Failed to save recommendation. Please try again.');
    }
  };
  
  // Handler for dismissing a recommendation
  const handleDismissRecommendation = async (recommendationId: string) => {
    try {
      const userId = 'current-user'; // In a real app, get this from auth context
      await achievementService.dismissRecommendation(userId, recommendationId);
      
      // Refresh recommendations data
      if (carbonSummary) {
        const updatedRecommendations = await achievementService.getPersonalizedRecommendations(
          userId,
          carbonSummary
        );
        
        setRecommendations(updatedRecommendations);
      }
    } catch (error) {
      console.error(`Error dismissing recommendation ${recommendationId}:`, error);
      setError('Failed to dismiss recommendation. Please try again.');
    }
  };
  
  // Handler for joining a challenge
  const handleJoinChallenge = async (challengeId: string) => {
    try {
      const userId = 'current-user'; // In a real app, get this from auth context
      await achievementService.joinChallenge(userId, challengeId);
      
      // Refresh challenges data
      const updatedChallenges = await achievementService.getActiveChallenges(userId);
      setChallenges(updatedChallenges);
      
      // Refresh notifications as there might be a new notification
      loadNotifications();
    } catch (error) {
      console.error(`Error joining challenge ${challengeId}:`, error);
      setError('Failed to join challenge. Please try again.');
    }
  };
  
  // Handler for leaving a challenge
  const handleLeaveChallenge = async (challengeId: string) => {
    try {
      const userId = 'current-user'; // In a real app, get this from auth context
      await achievementService.leaveChallenge(userId, challengeId);
      
      // Refresh challenges data
      const updatedChallenges = await achievementService.getActiveChallenges(userId);
      setChallenges(updatedChallenges);
    } catch (error) {
      console.error(`Error leaving challenge ${challengeId}:`, error);
      setError('Failed to leave challenge. Please try again.');
    }
  };
  
  const handleShareChallenge = (challengeId: string) => {
    // Get the challenge to share
    const challenge = challenges.find(c => c.id === challengeId);
    if (!challenge) return;
    
    // Create share text
    const shareText = `I'm participating in the "${challenge.title}" challenge on ClimaBill! Join me in reducing carbon emissions.`;
    
    // Use Web Share API if available
    if (navigator.share) {
      navigator.share({
        title: 'ClimaBill Carbon Challenge',
        text: shareText,
        url: window.location.href
      }).catch(error => {
        console.error('Error sharing challenge:', error);
      });
    } else {
      // Fallback to copying to clipboard
      navigator.clipboard.writeText(shareText).then(() => {
        alert('Challenge details copied to clipboard!');
      }).catch(error => {
        console.error('Error copying to clipboard:', error);
      });
    }
  };
  
  // Handle scenario actions
  const handleSaveScenario = async (scenarioData: {
    baselineCarbonInKg: number;
    parameters: Record<string, number>;
  }) => {
    try {
      const userId = 'current-user'; // In a real app, get this from auth context
      
      // Create a new scenario or update existing one
      if (scenarioData.scenarioId) {
        await achievementService.updateScenarioModel(
          scenarioData.scenarioId as string,
          scenarioData.parameters
        );
      } else {
        await achievementService.createScenarioModel(
          userId,
          scenarioData.baselineCarbonInKg,
          scenarioData.parameters
        );
      }
      
      // Refresh scenarios data
      const updatedScenarios = await achievementService.getUserScenarioModels(userId);
      setScenarios(updatedScenarios);
    } catch (error) {
      console.error('Error saving scenario:', error);
      setError('Failed to save scenario. Please try again.');
    }
  };
  
  // Handler for sharing a scenario
  const handleShareScenario = (scenarioId: string) => {
    // Get the scenario to share
    const scenario = scenarios.find(s => s.id === scenarioId);
    if (!scenario) return;
    
    // Create share text
    const shareText = `Check out my carbon reduction scenario "${scenario.name}" on ClimaBill! I could reduce my carbon footprint by ${scenario.reductionPercentage.toFixed(1)}% (${scenario.modifiedCarbonInKg.toLocaleString()} kg CO2e).`;
    
    // Use Web Share API if available
    if (navigator.share) {
      navigator.share({
        title: 'ClimaBill Carbon Scenario',
        text: shareText,
        url: window.location.href
      }).catch(error => {
        console.error('Error sharing scenario:', error);
      });
    } else {
      // Fallback to copying to clipboard
      navigator.clipboard.writeText(shareText).then(() => {
        alert('Scenario details copied to clipboard!');
      }).catch(error => {
        console.error('Error copying to clipboard:', error);
      });
    }
  };
  
  // Handler for exporting a scenario
  const handleExportScenario = (scenarioId: string) => {
    // Get the scenario to export
    const scenario = scenarios.find(s => s.id === scenarioId);
    if (!scenario) return;
    
    // Create export data
    const exportData = {
      name: scenario.name,
      description: scenario.description,
      baselineCarbonInKg: scenario.baselineCarbonInKg,
      modifiedCarbonInKg: scenario.modifiedCarbonInKg,
      reductionPercentage: scenario.reductionPercentage,
      parameters: scenario.parameters,
      exportDate: new Date().toISOString(),
      source: 'ClimaBill Carbon Dashboard'
    };
    
    // Convert to JSON and create download link
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `climabill-scenario-${scenarioId}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };
  
  // Handler for marking a notification as read
  const handleMarkNotificationAsRead = async (notificationId: string) => {
    try {
      const userId = 'current-user'; // In a real app, get this from auth context
      await notificationService.markAsRead(userId, notificationId);
      
      // Update local state
      setNotifications(prevNotifications =>
        prevNotifications.map(notification =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
      
      // Update unread count
      setUnreadNotificationsCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error(`Error marking notification ${notificationId} as read:`, error);
    }
  };
  
  // Handler for dismissing a notification
  const handleDismissNotification = async (notificationId: string) => {
    try {
      const userId = 'current-user'; // In a real app, get this from auth context
      await notificationService.dismissNotification(userId, notificationId);
      
      // Update local state
      const notification = notifications.find(n => n.id === notificationId);
      setNotifications(prevNotifications =>
        prevNotifications.filter(n => n.id !== notificationId)
      );
      
      // Update unread count if the notification was unread
      if (notification && !notification.read) {
        setUnreadNotificationsCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error(`Error dismissing notification ${notificationId}:`, error);
    }
  };
  
  // Handler for marking all notifications as read
  const handleMarkAllNotificationsAsRead = async () => {
    try {
      const userId = 'current-user'; // In a real app, get this from auth context
      await notificationService.markAllAsRead(userId);
      
      // Update local state
      setNotifications(prevNotifications =>
        prevNotifications.map(notification => ({ ...notification, read: true }))
      );
      
      // Reset unread count
      setUnreadNotificationsCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };
  
  // Load data when component mounts or time range changes
  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user, selectedTimeRange, router.locale]);
  
  // Time ranges for selection
  const timeRanges = [
    'thisWeek',
    'thisMonth',
    'thisQuarter',
    'thisYear',
    'last30Days',
    'last90Days',
    'last12Months'
  ];
  
  // Show loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">{t('dashboard.loading')}</p>
      </div>
    );
  }
  
  // Show error state
  if (error) {
    return (
      <Alert variant="destructive" className="my-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>{t('dashboard.errors.title')}</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }
  
  // Main dashboard render
  return (
    <div className="space-y-8">
      {/* Dashboard Header */}
      <DashboardHeader 
        carbonSummary={carbonSummary}
        onShare={() => console.log('Sharing dashboard')}
        onExport={() => console.log('Exporting dashboard data')}
      />
      
      {/* Main Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - User Profile, Leaderboard, Notifications */}
        <div className="lg:col-span-1 space-y-6">
          {/* User Profile */}
          {userProfile && (
            <UserProfileCard 
              profile={userProfile}
              onClick={() => router.push('/carbon/profile')}
            />
          )}
          
          {/* Leaderboard */}
          <LeaderboardCard 
            leaderboard={leaderboard}
            period={leaderboardPeriod}
            onPeriodChange={handleLeaderboardPeriodChange}
            onViewAll={() => setActiveTab('leaderboard')}
          />
          
          {/* Notifications */}
          <NotificationCenter 
            notifications={notifications}
            unreadCount={unreadNotificationsCount}
            onMarkAsRead={handleMarkNotificationAsRead}
            onDismiss={handleDismissNotification}
            onMarkAllAsRead={handleMarkAllNotificationsAsRead}
          />
        </div>
        
        {/* Main Content Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Tabs Navigation */}
          <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
            <TabsList className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6">
              <TabsTrigger value="overview">{t('dashboard.tabs.overview')}</TabsTrigger>
              <TabsTrigger value="insights">{t('dashboard.tabs.insights')}</TabsTrigger>
              <TabsTrigger value="achievements">{t('dashboard.tabs.achievements')}</TabsTrigger>
              <TabsTrigger value="scenarios">{t('dashboard.tabs.scenarios')}</TabsTrigger>
              <TabsTrigger value="goals">{t('dashboard.tabs.goals')}</TabsTrigger>
              <TabsTrigger value="reports">{t('dashboard.tabs.reports')}</TabsTrigger>
            </TabsList>
            
            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Overview content combining elements from other tabs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Quick stats from insights */}
                <div>
                  <h3 className="text-lg font-medium mb-4">{t('dashboard.quickInsights')}</h3>
                  <InsightsSection 
                    recommendations={recommendations.slice(0, 2)}
                    emissionsData={emissionsData}
                    breakdownData={breakdownData}
                    timeRanges={timeRanges}
                    selectedTimeRange={selectedTimeRange}
                    onTimeRangeChange={handleTimeRangeChange}
                    onImplementRecommendation={handleImplementRecommendation}
                    onSaveRecommendation={handleSaveRecommendation}
                    onDismissRecommendation={handleDismissRecommendation}
                  />
                </div>
                
                {/* Recent achievements */}
                <div>
                  <h3 className="text-lg font-medium mb-4">{t('dashboard.recentAchievements')}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {achievements.slice(0, 2).map((achievement) => (
                      <AchievementCard
                        key={achievement.id}
                        achievement={achievement}
                      />
                    ))}
                  </div>
                  
                  <Button 
                    variant="outline" 
                    className="mt-4 w-full"
                    onClick={() => setActiveTab('achievements')}
                  >
                    {t('dashboard.viewAllAchievements')}
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
              
              {/* Active challenges */}
              <div>
                <h3 className="text-lg font-medium mb-4">{t('dashboard.activeChallenges')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {challenges.slice(0, 2).map((challenge) => (
                    <ChallengeCard
                      key={challenge.id}
                      challenge={challenge}
                      onJoin={() => handleJoinChallenge(challenge.id)}
                      onLeave={() => handleLeaveChallenge(challenge.id)}
                      onShare={() => handleShareChallenge(challenge.id)}
                    />
                  ))}
                </div>
                
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setActiveTab('achievements')}
                >
                  {t('dashboard.viewAllChallenges')}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </TabsContent>
            
            {/* Insights Tab */}
            <TabsContent value="insights">
              <InsightsSection 
                recommendations={recommendations}
                emissionsData={emissionsData}
                breakdownData={breakdownData}
                timeRanges={timeRanges}
                selectedTimeRange={selectedTimeRange}
                onTimeRangeChange={handleTimeRangeChange}
                onImplementRecommendation={handleImplementRecommendation}
                onSaveRecommendation={handleSaveRecommendation}
                onDismissRecommendation={handleDismissRecommendation}
              />
            </TabsContent>
            
            {/* Achievements Tab */}
            <TabsContent value="achievements">
              <AchievementsSection 
                achievements={achievements}
                challenges={challenges}
                onJoinChallenge={handleJoinChallenge}
                onLeaveChallenge={handleLeaveChallenge}
                onShareChallenge={handleShareChallenge}
                onViewAllAchievements={() => router.push('/carbon/achievements')}
                onViewAllChallenges={() => router.push('/carbon/challenges')}
              />
            </TabsContent>
            
            {/* Scenarios Tab */}
            <TabsContent value="scenarios">
              <div className="space-y-6">
                <h3 className="text-lg font-medium">{t('scenarios.title')}</h3>
                <p className="text-gray-500">{t('scenarios.description')}</p>
                
                <ScenarioModeler 
                  scenarios={scenarios}
                  onSave={handleSaveScenario}
                  onShare={handleShareScenario}
                  onExport={handleExportScenario}
                />
              </div>
            </TabsContent>
            
            {/* Goals Tab */}
            <TabsContent value="goals">
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <h3 className="text-lg font-medium mb-2">{t('dashboard.comingSoon')}</h3>
                <p className="text-gray-500 mb-6 max-w-md">
                  {t('dashboard.goalsComingSoon')}
                </p>
                <Button onClick={() => setActiveTab('overview')}>
                  {t('dashboard.backToOverview')}
                </Button>
              </div>
            </TabsContent>
            
            {/* Reports Tab */}
            <TabsContent value="reports">
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <h3 className="text-lg font-medium mb-2">{t('dashboard.comingSoon')}</h3>
                <p className="text-gray-500 mb-6 max-w-md">
                  {t('dashboard.reportsComingSoon')}
                </p>
                <Button onClick={() => setActiveTab('overview')}>
                  {t('dashboard.backToOverview')}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
