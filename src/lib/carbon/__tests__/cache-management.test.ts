import { CacheKeys, InvalidationGroups } from '../cache-management';
import { cachedApiCall } from '../../caching/carbonMetricsCache';

// Mock the carbonMetricsCache module
jest.mock('../../caching/carbonMetricsCache', () => ({
  cachedApiCall: {
    invalidate: jest.fn().mockResolvedValue(undefined)
  }
}));

describe('Cache Management', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('CacheKeys', () => {
    it('should generate correct cache keys for various entities', () => {
      // Test user-specific keys
      expect(CacheKeys.notifications.user('user123')).toBe('notifications:user123');
      expect(CacheKeys.profile.user('user123')).toBe('user-profile:user123');
      expect(CacheKeys.achievements.user('user123')).toBe('user-achievements:user123');
      expect(CacheKeys.challenges.active('user123')).toBe('active-challenges:user123');
      expect(CacheKeys.recommendations.user('user123')).toBe('user-recommendations:user123');
      expect(CacheKeys.scenarios.user('user123')).toBe('user-scenarios:user123');
      
      // Test leaderboard keys
      expect(CacheKeys.leaderboard.global('week')).toBe('global-leaderboard:week');
      expect(CacheKeys.leaderboard.user('user123', 'month')).toBe('user-leaderboard:user123:month');
      expect(CacheKeys.leaderboard.rank('user123')).toBe('user-rank:user123');
      
      // Test global keys
      expect(CacheKeys.achievements.all()).toBe('all-achievements');
    });
  });

  describe('InvalidationGroups', () => {
    it('should invalidate notifications and related caches', async () => {
      await InvalidationGroups.notifications('user123');
      
      // Should invalidate notifications and profile
      expect(cachedApiCall.invalidate).toHaveBeenCalledTimes(2);
      expect(cachedApiCall.invalidate).toHaveBeenCalledWith('notifications:user123');
      expect(cachedApiCall.invalidate).toHaveBeenCalledWith('user-profile:user123');
    });

    it('should invalidate challenge related caches', async () => {
      await InvalidationGroups.challenges('user123');
      
      // Should invalidate challenges, achievements, and profile
      expect(cachedApiCall.invalidate).toHaveBeenCalledTimes(3);
      expect(cachedApiCall.invalidate).toHaveBeenCalledWith('active-challenges:user123');
      expect(cachedApiCall.invalidate).toHaveBeenCalledWith('user-achievements:user123');
      expect(cachedApiCall.invalidate).toHaveBeenCalledWith('user-profile:user123');
    });

    it('should invalidate leaderboard caches with specific period', async () => {
      await InvalidationGroups.leaderboard('user123', 'week');
      
      // Should invalidate user rank and specific period leaderboards
      expect(cachedApiCall.invalidate).toHaveBeenCalledTimes(3);
      expect(cachedApiCall.invalidate).toHaveBeenCalledWith('user-rank:user123');
      expect(cachedApiCall.invalidate).toHaveBeenCalledWith('global-leaderboard:week');
      expect(cachedApiCall.invalidate).toHaveBeenCalledWith('user-leaderboard:user123:week');
    });

    it('should invalidate all leaderboard periods when no period specified', async () => {
      await InvalidationGroups.leaderboard('user123');
      
      // Should invalidate user rank and all period leaderboards
      expect(cachedApiCall.invalidate).toHaveBeenCalledTimes(11); // 1 rank + (5 periods * 2 types)
      expect(cachedApiCall.invalidate).toHaveBeenCalledWith('user-rank:user123');
      
      // Check that all periods are invalidated
      ['day', 'week', 'month', 'year', 'all'].forEach(period => {
        expect(cachedApiCall.invalidate).toHaveBeenCalledWith(`global-leaderboard:${period}`);
        expect(cachedApiCall.invalidate).toHaveBeenCalledWith(`user-leaderboard:user123:${period}`);
      });
    });
  });
});
