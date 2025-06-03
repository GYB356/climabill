/**
 * Cache management utilities for consistent cache handling across services
 */

import { cachedApiCall } from '../caching/carbonMetricsCache';

/**
 * Cache key generators for different service entities
 */
export const CacheKeys = {
  // Achievement service
  achievements: {
    all: () => 'all-achievements',
    user: (userId: string) => `user-achievements:${userId}`,
  },
  
  // Profile service
  profile: {
    user: (userId: string) => `user-profile:${userId}`,
  },
  
  // Challenge service
  challenges: {
    active: (userId: string) => `active-challenges:${userId}`,
  },
  
  // Notification service
  notifications: {
    user: (userId: string) => `notifications:${userId}`,
  },
  
  // Leaderboard service
  leaderboard: {
    global: (period: string) => `global-leaderboard:${period}`,
    user: (userId: string, period: string) => `user-leaderboard:${userId}:${period}`,
    rank: (userId: string) => `user-rank:${userId}`,
  },
  
  // Scenario models
  scenarios: {
    user: (userId: string) => `user-scenarios:${userId}`,
  },
  
  // Recommendations
  recommendations: {
    user: (userId: string) => `user-recommendations:${userId}`,
  }
};

/**
 * Invalidate multiple related caches at once
 * @param cacheKeys Array of cache keys to invalidate
 */
export async function invalidateMultipleCaches(cacheKeys: string[]): Promise<void> {
  if (!cacheKeys || cacheKeys.length === 0) return;
  
  // Create array of promises for parallel invalidation
  const invalidationPromises = cacheKeys.map(key => cachedApiCall.invalidate(key));
  
  // Wait for all invalidations to complete
  await Promise.all(invalidationPromises);
}

/**
 * Cache invalidation groups for related data
 */
export const InvalidationGroups = {
  /**
   * Invalidate all user profile related caches
   * @param userId User ID
   */
  userProfile: async (userId: string): Promise<void> => {
    await invalidateMultipleCaches([
      CacheKeys.profile.user(userId),
      CacheKeys.achievements.user(userId),
    ]);
  },
  
  /**
   * Invalidate all notifications related caches
   * @param userId User ID
   */
  notifications: async (userId: string): Promise<void> => {
    await invalidateMultipleCaches([
      CacheKeys.notifications.user(userId),
      // Profile is affected by notification count
      CacheKeys.profile.user(userId),
    ]);
  },
  
  /**
   * Invalidate all challenge related caches
   * @param userId User ID
   */
  challenges: async (userId: string): Promise<void> => {
    await invalidateMultipleCaches([
      CacheKeys.challenges.active(userId),
      // Challenges may affect achievements
      CacheKeys.achievements.user(userId),
      // And may affect profile stats
      CacheKeys.profile.user(userId),
    ]);
  },
  
  /**
   * Invalidate all leaderboard related caches
   * @param userId User ID
   * @param period Optional period
   */
  leaderboard: async (userId: string, period?: string): Promise<void> => {
    const keysToInvalidate = [
      CacheKeys.leaderboard.rank(userId),
    ];
    
    if (period) {
      keysToInvalidate.push(
        CacheKeys.leaderboard.global(period),
        CacheKeys.leaderboard.user(userId, period)
      );
    } else {
      // If no period specified, invalidate all periods
      ['day', 'week', 'month', 'year', 'all'].forEach(p => {
        keysToInvalidate.push(
          CacheKeys.leaderboard.global(p),
          CacheKeys.leaderboard.user(userId, p)
        );
      });
    }
    
    await invalidateMultipleCaches(keysToInvalidate);
  },
  
  /**
   * Invalidate all recommendation related caches
   * @param userId User ID
   */
  recommendations: async (userId: string): Promise<void> => {
    await invalidateMultipleCaches([
      CacheKeys.recommendations.user(userId),
    ]);
  },
  
  /**
   * Invalidate all scenario model related caches
   * @param userId User ID
   */
  scenarios: async (userId: string): Promise<void> => {
    await invalidateMultipleCaches([
      CacheKeys.scenarios.user(userId),
    ]);
  }
};
