import { 
  Achievement, 
  UserAchievement, 
  Challenge, 
  UserProfile,
  PersonalizedRecommendation,
  ScenarioModel
} from './gamification-types';
import { cachedApiCall } from '../caching/carbonMetricsCache';
import { CarbonUsage } from './carbon-tracking-service';
import { gamificationApi } from '../api/gamification-api';
import { CacheKeys, InvalidationGroups } from './cache-management';
import { createServiceError, ErrorType, safeServiceOperation, logServiceError, ServiceError } from './error-handling';
import { generateAchievementCacheKey, generateChallengeCacheKey, generateRecommendationCacheKey, generateScenarioCacheKey, invalidateAchievementCaches } from './cache-management';

// Feature flag to toggle between mock data and API calls
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';

/**
 * Service for managing user achievements, challenges, and gamification elements
 */
export class AchievementService {
  // Singleton instance
  private static instance: AchievementService;
  
  // Cache expiry times (in milliseconds)
  private static readonly ACHIEVEMENTS_CACHE_EXPIRY = 10 * 60 * 1000; // 10 minutes
  private static readonly PROFILE_CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes
  private static readonly RECOMMENDATIONS_CACHE_EXPIRY = 15 * 60 * 1000; // 15 minutes
  
  /**
   * Private constructor to prevent direct instantiation
   */
  private constructor() {}
  
  /**
   * Get the singleton instance
   */
  public static getInstance(): AchievementService {
    if (!AchievementService.instance) {
      AchievementService.instance = new AchievementService();
    }
    return AchievementService.instance;
  }
  
  /**
   * Get all available achievements
   */
  async getAllAchievements(): Promise<Achievement[]> {
    const cacheKey = 'all-achievements';
    
    return cachedApiCall<Achievement[]>(
      cacheKey,
      () => this.fetchAllAchievements(),
      AchievementService.ACHIEVEMENTS_CACHE_EXPIRY
    );
  }
  
  /**
   * Get user achievements
   * @param userId User ID
   * @returns List of user achievements
   */
  async getUserAchievements(userId: string): Promise<Achievement[]> {
    const cacheKey = generateAchievementCacheKey(userId);
    
    // Try to get from cache first
    const cachedData = this.cache.get<Achievement[]>(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    
    return await safeServiceOperation(
      async () => {
        let achievements: Achievement[];
        
        if (USE_MOCK_DATA) {
          // Use mock data for development
          achievements = this.getMockAchievements(userId);
        } else {
          // Call the API
          achievements = await gamificationApi.getUserAchievements(userId);
        }
        
        // Cache the results
        this.cache.set(cacheKey, achievements);
        return achievements;
      },
      (error) => {
        // Log the error with context
        logServiceError(
          createServiceError(error, ErrorType.API_ERROR),
          'AchievementService.getUserAchievements'
        );
      },
      [] // Return empty array as fallback on error
    );
  }
  
  /**
   * Get user's profile with gamification data
   */
  async getUserProfile(userId: string): Promise<UserProfile> {
    const cacheKey = `user-profile:${userId}`;
    
    return cachedApiCall<UserProfile>(
      cacheKey,
      () => this.fetchUserProfile(userId),
      AchievementService.PROFILE_CACHE_EXPIRY
    );
  }
  
  /**
   * Get active challenges for a user
   */
  async getActiveChallenges(userId: string): Promise<Challenge[]> {
    const cacheKey = `active-challenges:${userId}`;
    
    return cachedApiCall<Challenge[]>(
      cacheKey,
      () => this.fetchActiveChallenges(userId),
      AchievementService.ACHIEVEMENTS_CACHE_EXPIRY
    );
  }
  
  /**
   * Join a challenge
   */
  async joinChallenge(userId: string, challengeId: string): Promise<Challenge> {
    // This is a write operation, so we don't cache it
    if (!USE_MOCK_DATA) {
      try {
        return await gamificationApi.joinChallenge(userId, challengeId);
      } catch (error) {
        console.error('Error joining challenge:', error);
        throw error;
      }
    }
    
    // Mock implementation
    const challenges = await this.getActiveChallenges(userId);
    const challenge = challenges.find(c => c.id === challengeId);
    
    if (!challenge) {
      throw new Error(`Challenge with ID ${challengeId} not found`);
    }
    
    // Update the challenge to mark the user as a participant
    const updatedChallenge: Challenge = {
      ...challenge,
      participants: challenge.participants + 1,
      userIsParticipant: true
    };
    
    // Invalidate cache
    const cacheKey = `active-challenges:${userId}`;
    await cachedApiCall.invalidate(cacheKey);
    
    return updatedChallenge;
  }
  
  /**
   * Leave a challenge
   */
  async leaveChallenge(userId: string, challengeId: string): Promise<void> {
    // This is a write operation, so we don't cache it
    if (!USE_MOCK_DATA) {
      try {
        await gamificationApi.leaveChallenge(userId, challengeId);
        return;
      } catch (error) {
        console.error('Error leaving challenge:', error);
        throw error;
      }
    }
    
    // Mock implementation
    const challenges = await this.getActiveChallenges(userId);
    const challenge = challenges.find(c => c.id === challengeId);
    
    if (!challenge) {
      throw new Error(`Challenge with ID ${challengeId} not found`);
    }
    
    if (!challenge.userIsParticipant) {
      throw new Error(`User is not a participant in challenge ${challengeId}`);
    }
    
    // Invalidate cache
    const cacheKey = `active-challenges:${userId}`;
    await cachedApiCall.invalidate(cacheKey);
  }
  
  /**
   * Implement a recommendation
   */
  async implementRecommendation(userId: string, recommendationId: string): Promise<void> {
    if (!USE_MOCK_DATA) {
      try {
        await gamificationApi.implementRecommendation(userId, recommendationId);
        return;
      } catch (error) {
        console.error('Error implementing recommendation:', error);
        throw error;
      }
    }
    
    // Mock implementation - in a real app, this would update the recommendation status
    console.log(`Implementing recommendation ${recommendationId} for user ${userId}`);
    
    // Invalidate recommendations cache
    const cacheKeyPattern = `recommendations:${userId}`;
    await cachedApiCall.invalidatePattern(cacheKeyPattern);
    
    // Invalidate user profile cache as points may have changed
    const profileCacheKey = `user-profile:${userId}`;
    await cachedApiCall.invalidate(profileCacheKey);
  }
  
  /**
   * Save a recommendation for later
   */
  async saveRecommendation(userId: string, recommendationId: string): Promise<void> {
    if (!USE_MOCK_DATA) {
      try {
        await gamificationApi.saveRecommendation(userId, recommendationId);
        return;
      } catch (error) {
        console.error('Error saving recommendation:', error);
        throw error;
      }
    }
    
    // Mock implementation - in a real app, this would update the recommendation status
    console.log(`Saving recommendation ${recommendationId} for user ${userId}`);
  }
  
  /**
   * Dismiss a recommendation
   */
  async dismissRecommendation(userId: string, recommendationId: string): Promise<void> {
    if (!USE_MOCK_DATA) {
      try {
        await gamificationApi.dismissRecommendation(userId, recommendationId);
        return;
      } catch (error) {
        console.error('Error dismissing recommendation:', error);
        throw error;
      }
    }
    
    // Mock implementation - in a real app, this would update the recommendation status
    console.log(`Dismissing recommendation ${recommendationId} for user ${userId}`);
    
    // Invalidate recommendations cache
    const cacheKeyPattern = `recommendations:${userId}`;
    await cachedApiCall.invalidatePattern(cacheKeyPattern);
  }
  
  /**
   * Get personalized recommendations for a user based on their usage patterns
   */
  async getPersonalizedRecommendations(
    userId: string, 
    usageData: CarbonUsage[]
  ): Promise<PersonalizedRecommendation[]> {
    const cacheKey = `recommendations:${userId}:${usageData.map(u => u.id).join(',')}`;
    
    return cachedApiCall<PersonalizedRecommendation[]>(
      cacheKey,
      () => this.generateRecommendations(userId, usageData),
      AchievementService.RECOMMENDATIONS_CACHE_EXPIRY
    );
  }
  
  /**
   * Create a new scenario model for "what-if" analysis
   */
  async createScenarioModel(
    userId: string,
    baselineCarbonInKg: number,
    parameters: Record<string, number>
  ): Promise<ScenarioModel> {
    // This is a write operation, so we don't cache it
    return this.saveScenarioModel(userId, baselineCarbonInKg, parameters);
  }
  
  /**
   * Update an existing scenario model
   */
  async updateScenarioModel(
    scenarioId: string,
    parameters: Record<string, number>
  ): Promise<ScenarioModel> {
    // This is a write operation, so we don't cache it
    return this.saveUpdatedScenarioModel(scenarioId, parameters);
  }
  
  /**
   * Get user's scenario models
   */
  async getUserScenarioModels(userId: string): Promise<ScenarioModel[]> {
    const cacheKey = `scenario-models:${userId}`;
    
    return cachedApiCall<ScenarioModel[]>(
      cacheKey,
      () => this.fetchUserScenarioModels(userId),
      AchievementService.PROFILE_CACHE_EXPIRY
    );
  }
  
  // Implementation of private methods that call the API or fallback to mock data
  
  private async fetchAllAchievements(): Promise<Achievement[]> {
    // Use the API client if mock data is disabled
    if (!USE_MOCK_DATA) {
      try {
        return await gamificationApi.getAllAchievements();
      } catch (error) {
        console.error('Error fetching achievements from API:', error);
        // Fall back to mock data if API fails
      }
    }
    
    // Mock data implementation
    return [
      {
        id: 'carbon-saver-bronze',
        title: 'Carbon Saver: Bronze',
        description: 'Reduce your carbon footprint by 10%',
        category: 'reduction',
        level: 'bronze',
        icon: 'leaf',
        threshold: 10,
        points: 100
      },
      {
        id: 'carbon-saver-silver',
        title: 'Carbon Saver: Silver',
        description: 'Reduce your carbon footprint by 25%',
        category: 'reduction',
        level: 'silver',
        icon: 'leaf',
        threshold: 25,
        points: 250
      },
      {
        id: 'carbon-saver-gold',
        title: 'Carbon Saver: Gold',
        description: 'Reduce your carbon footprint by 50%',
        category: 'reduction',
        level: 'gold',
        icon: 'leaf',
        threshold: 50,
        points: 500
      },
      {
        id: 'offset-champion-bronze',
        title: 'Offset Champion: Bronze',
        description: 'Offset 100kg of carbon emissions',
        category: 'offset',
        level: 'bronze',
        icon: 'award',
        threshold: 100,
        points: 100
      },
      {
        id: 'offset-champion-silver',
        title: 'Offset Champion: Silver',
        description: 'Offset 500kg of carbon emissions',
        category: 'offset',
        level: 'silver',
        icon: 'award',
        threshold: 500,
        points: 250
      },
      {
        id: 'consistency-streak',
        title: 'Consistency Streak',
        description: 'Track your carbon footprint for 30 consecutive days',
        category: 'consistency',
        level: 'silver',
        icon: 'calendar',
        threshold: 30,
        points: 300
      },
      {
        id: 'social-influencer',
        title: 'Sustainability Influencer',
        description: 'Share your carbon reduction achievements 5 times',
        category: 'social',
        level: 'bronze',
        icon: 'share',
        threshold: 5,
        points: 150
      }
    ];
  }
  
  private async fetchUserAchievements(userId: string): Promise<Achievement[]> {
    // Use the API client if mock data is disabled
    if (!USE_MOCK_DATA) {
      try {
        return await gamificationApi.getUserAchievements(userId);
      } catch (error) {
        console.error('Error fetching user achievements from API:', error);
        // Fall back to mock data if API fails
      }
    }
    
    // Mock data implementation
    const allAchievements = await this.fetchAllAchievements();
    
    // Simulate some unlocked achievements
    return allAchievements.map((achievement, index) => {
      if (index < 3) {
        return {
          ...achievement,
          unlockedAt: new Date(Date.now() - (index * 7 * 24 * 60 * 60 * 1000)), // Unlocked in the past
          progress: 100
        };
      }
      
      // Some in progress
      if (index < 5) {
        return {
          ...achievement,
          progress: Math.floor(Math.random() * 80) + 10 // 10-90% progress
        };
      }
      
      // Others not started
      return {
        ...achievement,
        progress: 0
      };
    });
  }
  
  private async fetchUserProfile(userId: string): Promise<UserProfile> {
    // Use the API client if mock data is disabled
    if (!USE_MOCK_DATA) {
      try {
        return await gamificationApi.getUserProfile(userId);
      } catch (error) {
        console.error('Error fetching user profile from API:', error);
        // Fall back to mock data if API fails
      }
    }
    
    // Mock data implementation
    const userAchievements = await this.fetchUserAchievements(userId);
    
    return {
      userId,
      level: 3,
      points: 450,
      totalCarbonReduced: 1250,
      totalCarbonOffset: 750,
      achievements: userAchievements.filter(a => a.unlockedAt).map(a => ({
        userId,
        achievementId: a.id,
        unlockedAt: a.unlockedAt!,
        progress: a.progress || 0
      })),
      activeChallenges: ['weekly-commute-challenge', 'monthly-energy-challenge'],
      completedChallenges: ['paper-free-challenge'],
      streakDays: 15,
      lastActive: new Date()
    };
  }
  
  private async fetchActiveChallenges(userId: string): Promise<Challenge[]> {
    // Use the API client if mock data is disabled
    if (!USE_MOCK_DATA) {
      try {
        return await gamificationApi.getActiveChallenges(userId);
      } catch (error) {
        console.error('Error fetching active challenges from API:', error);
        // Fall back to mock data if API fails
      }
    }
    
    // Mock data implementation
    return [
      {
        id: 'weekly-commute-challenge',
        title: 'Car-Free Week',
        description: 'Use public transportation or bike to work for a full week',
        category: 'reduction',
        startDate: new Date(Date.now() - (3 * 24 * 60 * 60 * 1000)), // 3 days ago
        endDate: new Date(Date.now() + (4 * 24 * 60 * 60 * 1000)), // 4 days from now
        carbonReductionGoal: 50,
        participants: [userId, 'user2', 'user3'],
        progress: 60,
        rewards: {
          points: 200,
          achievements: ['commute-master']
        }
      },
      {
        id: 'monthly-energy-challenge',
        title: 'Energy Saver Month',
        description: 'Reduce your energy consumption by 20% this month',
        category: 'reduction',
        startDate: new Date(Date.now() - (15 * 24 * 60 * 60 * 1000)), // 15 days ago
        endDate: new Date(Date.now() + (15 * 24 * 60 * 60 * 1000)), // 15 days from now
        carbonReductionGoal: 100,
        participants: [userId, 'user2', 'user4', 'user5'],
        progress: 40,
        rewards: {
          points: 300,
          achievements: ['energy-saver']
        }
      }
    ];
  }
  
  private async generateRecommendations(
    userId: string, 
    usageData: CarbonUsage[]
  ): Promise<PersonalizedRecommendation[]> {
    // Use the API client if mock data is disabled
    if (!USE_MOCK_DATA) {
      try {
        return await gamificationApi.getPersonalizedRecommendations(userId, usageData);
      } catch (error) {
        console.error('Error generating recommendations from API:', error);
        // Fall back to mock data if API fails
      }
    }
    
    // Mock data implementation
    // For now, return some sample recommendations
    return [
      {
        id: 'rec-1',
        title: 'Switch to renewable energy provider',
        description: 'Based on your energy usage, switching to a renewable energy provider could significantly reduce your carbon footprint.',
        category: 'energy',
        potentialImpact: 1200,
        difficulty: 'medium',
        timeToImplement: '1 month',
        relevanceScore: 95
      },
      {
        id: 'rec-2',
        title: 'Optimize your commute route',
        description: 'We noticed regular transportation emissions. Optimizing your commute route could save up to 15% in emissions.',
        category: 'transportation',
        potentialImpact: 350,
        difficulty: 'easy',
        timeToImplement: '1 week',
        relevanceScore: 85
      },
      {
        id: 'rec-3',
        title: 'Reduce paper invoices',
        description: 'Your invoice-related emissions are higher than average. Consider switching to digital invoices.',
        category: 'office',
        potentialImpact: 120,
        difficulty: 'easy',
        timeToImplement: '1 day',
        relevanceScore: 90
      },
      {
        id: 'rec-4',
        title: 'Invest in carbon offset projects',
        description: 'Based on your current emissions, investing in verified carbon offset projects could help neutralize your unavoidable emissions.',
        category: 'offset',
        potentialImpact: 2000,
        difficulty: 'medium',
        timeToImplement: 'immediate',
        relevanceScore: 80
      }
    ];
  }
  
  private async saveScenarioModel(
    userId: string,
    baselineCarbonInKg: number,
    parameters: Record<string, number>
  ): Promise<ScenarioModel> {
    // Use the API client if mock data is disabled
    if (!USE_MOCK_DATA) {
      try {
        // Convert simple parameters to the format expected by the API
        const parameterDefinitions: Record<string, any> = {};
        
        // Create parameter definitions with default values
        Object.entries(parameters).forEach(([key, value]) => {
          parameterDefinitions[key] = {
            name: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
            value: value,
            defaultValue: value,
            minValue: 0,
            maxValue: value * 5,
            step: Math.max(1, Math.floor(value / 10)),
            unit: this.getUnitForParameter(key),
            impact: this.getImpactForParameter(key)
          };
        });
        
        return await gamificationApi.createScenarioModel(userId, {
          name: 'New Scenario',
          description: 'Carbon reduction scenario',
          baselineCarbonInKg,
          parameters: parameterDefinitions
        });
      } catch (error) {
        console.error('Error saving scenario model to API:', error);
        // Fall back to mock data if API fails
      }
    }
    
    // Mock data implementation
    const now = new Date();
    const parameterDefinitions = {
      energyUsage: {
        name: 'Energy Usage',
        value: parameters.energyUsage || 100,
        unit: 'kWh',
        defaultValue: 100,
        minValue: 0,
        maxValue: 1000,
        step: 10,
        impact: 0.5 // 0.5 kg CO2 per kWh
      },
      transportation: {
        name: 'Transportation',
        value: parameters.transportation || 200,
        unit: 'km',
        defaultValue: 200,
        minValue: 0,
        maxValue: 2000,
        step: 10,
        impact: 0.2 // 0.2 kg CO2 per km
      },
      paperUsage: {
        name: 'Paper Usage',
        value: parameters.paperUsage || 500,
        unit: 'sheets',
        defaultValue: 500,
        minValue: 0,
        maxValue: 5000,
        step: 100,
        impact: 0.01 // 0.01 kg CO2 per sheet
      }
    };
    
    // Calculate modified carbon based on parameters
    const modifiedCarbonInKg = Object.values(parameterDefinitions).reduce(
      (total, param) => total + (param.value * param.impact),
      0
    );
    
    return {
      id: `scenario-${Date.now()}`,
      name: 'My Scenario',
      description: 'Custom scenario for carbon reduction analysis',
      baselineCarbonInKg,
      modifiedCarbonInKg,
      reductionPercentage: ((baselineCarbonInKg - modifiedCarbonInKg) / baselineCarbonInKg) * 100,
      parameters: parameterDefinitions,
      createdAt: now,
      updatedAt: now
    };
  }
  
  /**
   * Helper method to get appropriate unit for a parameter
   */
  private getUnitForParameter(paramName: string): string {
    const unitMap: Record<string, string> = {
      energyUsage: 'kWh',
      transportation: 'km',
      paperUsage: 'sheets',
      waterUsage: 'liters',
      wasteProduction: 'kg',
      meatConsumption: 'kg',
      flights: 'trips'
    };
    
    return unitMap[paramName] || 'units';
  }
  
  /**
   * Helper method to get impact factor for a parameter
   */
  private getImpactForParameter(paramName: string): number {
    const impactMap: Record<string, number> = {
      energyUsage: 0.5,
      transportation: 0.2,
      paperUsage: 0.01,
      waterUsage: 0.05,
      wasteProduction: 0.3,
      meatConsumption: 0.15,
      flights: 0.8
    };
    
    return impactMap[paramName] || 0.1;
  }
  
  private async saveUpdatedScenarioModel(
    scenarioId: string,
    parameters: Record<string, number>
  ): Promise<ScenarioModel> {
    // Use the API client if mock data is disabled
    if (!USE_MOCK_DATA) {
      try {
        // Convert simple parameters to the format expected by the API
        const parameterUpdates: Record<string, any> = {};
        
        // Create parameter updates
        Object.entries(parameters).forEach(([key, value]) => {
          parameterUpdates[key] = { value };
        });
        
        // Get the user ID from the scenario ID (in a real implementation, this would be handled better)
        const userId = 'current-user';
        
        return await gamificationApi.updateScenarioModel(userId, scenarioId, {
          parameters: parameterUpdates
        });
      } catch (error) {
        console.error('Error updating scenario model in API:', error);
        // Fall back to mock data if API fails
      }
    }
    
    // Mock data implementation
    // For now, create a new one with updated parameters
    const existingScenarios = await this.fetchUserScenarioModels('dummy-user');
    const existingScenario = existingScenarios.find(s => s.id === scenarioId);
    
    if (!existingScenario) {
      throw new Error(`Scenario with ID ${scenarioId} not found`);
    }
    
    const updatedParameters = { ...existingScenario.parameters };
    
    // Update parameter values
    Object.entries(parameters).forEach(([key, value]) => {
      if (updatedParameters[key]) {
        updatedParameters[key] = {
          ...updatedParameters[key],
          value
        };
      }
    });
    
    // Calculate modified carbon based on updated parameters
    const modifiedCarbonInKg = Object.values(updatedParameters).reduce(
      (total, param) => total + (param.value * param.impact),
      0
    );
    
    return {
      ...existingScenario,
      modifiedCarbonInKg,
      reductionPercentage: ((existingScenario.baselineCarbonInKg - modifiedCarbonInKg) / existingScenario.baselineCarbonInKg) * 100,
      parameters: updatedParameters,
      updatedAt: new Date()
    };
  }
  
  private async fetchUserScenarioModels(userId: string): Promise<ScenarioModel[]> {
    // Use the API client if mock data is disabled
    if (!USE_MOCK_DATA) {
      try {
        return await gamificationApi.getUserScenarioModels(userId);
      } catch (error) {
        console.error('Error fetching user scenario models from API:', error);
        // Fall back to mock data if API fails
      }
    }
    
    // Mock data implementation
    return [
      {
        id: 'scenario-1',
        name: 'Baseline Scenario',
        description: 'Current carbon footprint baseline',
        baselineCarbonInKg: 5000,
        modifiedCarbonInKg: 5000,
        reductionPercentage: 0,
        parameters: {
          energyUsage: {
            name: 'Energy Usage',
            value: 1000,
            unit: 'kWh',
            defaultValue: 1000,
            minValue: 0,
            maxValue: 5000,
            step: 100,
            impact: 0.5
          },
          transportation: {
            name: 'Transportation',
            value: 2000,
            unit: 'km',
            defaultValue: 2000,
            minValue: 0,
            maxValue: 10000,
            step: 100,
            impact: 0.2
          },
          paperUsage: {
            name: 'Paper Usage',
            value: 5000,
            unit: 'sheets',
            defaultValue: 5000,
            minValue: 0,
            maxValue: 10000,
            step: 500,
            impact: 0.01
          }
        },
        createdAt: new Date(Date.now() - (30 * 24 * 60 * 60 * 1000)),
        updatedAt: new Date(Date.now() - (30 * 24 * 60 * 60 * 1000))
      },
      {
        id: 'scenario-2',
        name: 'Optimized Scenario',
        description: 'Optimized carbon footprint with reduced energy and transportation',
        baselineCarbonInKg: 5000,
        modifiedCarbonInKg: 3500,
        reductionPercentage: 30,
        parameters: {
          energyUsage: {
            name: 'Energy Usage',
            value: 700,
            unit: 'kWh',
            defaultValue: 1000,
            minValue: 0,
            maxValue: 5000,
            step: 100,
            impact: 0.5
          },
          transportation: {
            name: 'Transportation',
            value: 1500,
            unit: 'km',
            defaultValue: 2000,
            minValue: 0,
            maxValue: 10000,
            step: 100,
            impact: 0.2
          },
          paperUsage: {
            name: 'Paper Usage',
            value: 2500,
            unit: 'sheets',
            defaultValue: 5000,
            minValue: 0,
            maxValue: 10000,
            step: 500,
            impact: 0.01
          }
        },
        createdAt: new Date(Date.now() - (15 * 24 * 60 * 60 * 1000)),
        updatedAt: new Date(Date.now() - (10 * 24 * 60 * 60 * 1000))
      }
    ];
  }
}

// Export a singleton instance
export const achievementService = AchievementService.getInstance();
