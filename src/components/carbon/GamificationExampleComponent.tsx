"use client";

import React, { useEffect, useState } from 'react';
import { useGamificationOperation } from '../../lib/hooks/useGamificationOperation';
import { useAuth } from '../../lib/firebase/auth-context';
import { achievementService } from '../../lib/carbon/achievement-service';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import LoadingSpinner from '../ui/LoadingSpinner';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: Date;
  progress?: number;
}

/**
 * Example component showing how to use the useGamificationOperation hook
 * to handle loading states, error handling, and accessibility announcements
 */
export default function GamificationExampleComponent() {
  const { user } = useAuth();
  const userId = user?.uid || 'guest-user';
  
  // State
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  // Use our custom hook for each operation type
  const achievementsOperation = useGamificationOperation('achievements');
  const achievementActionOperation = useGamificationOperation('achievementAction');
  
  // Load achievements on component mount
  useEffect(() => {
    loadAchievements();
  }, [userId]);

  // Load achievements with loading state, error handling, and accessibility
  const loadAchievements = async () => {
    await achievementsOperation.withOperation(
      async () => {
        const data = await achievementService.getUserAchievements(userId);
        setAchievements(data);
        return data;
      },
      'Achievements loaded successfully',
      'Failed to load achievements'
    );
  };

  // Example action with loading state, error handling, and accessibility
  const markAchievementAsSeen = async (achievementId: string) => {
    await achievementActionOperation.withOperation(
      async () => {
        const result = await achievementService.markAchievementAsSeen(userId, achievementId);
        
        // Update local state on success
        setAchievements(prev => 
          prev.map(achievement => 
            achievement.id === achievementId 
              ? { ...achievement, seen: true }
              : achievement
          )
        );
        
        return result;
      },
      'Achievement marked as seen',
      'Failed to mark achievement as seen'
    );
  };

  // Handle sharing an achievement
  const shareAchievement = async (achievementId: string) => {
    await achievementActionOperation.withOperation(
      async () => {
        // Call sharing API
        const result = await achievementService.shareAchievement(userId, achievementId);
        return result;
      },
      'Achievement shared successfully',
      'Failed to share achievement'
    );
  };

  // Example error display component
  const ErrorDisplay = ({ error, onRetry, onDismiss }) => {
    if (!error) return null;
    
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {error.message}
          <div className="mt-2 flex space-x-2">
            {onRetry && (
              <Button size="sm" variant="outline" onClick={onRetry}>
                Retry
              </Button>
            )}
            {onDismiss && (
              <Button size="sm" variant="outline" onClick={onDismiss}>
                Dismiss
              </Button>
            )}
          </div>
        </AlertDescription>
      </Alert>
    );
  };

  return (
    <div className="space-y-6 p-4">
      <h2 className="text-2xl font-bold">Your Achievements</h2>
      
      {/* Error display for achievement loading */}
      {achievementsOperation.error && (
        <ErrorDisplay 
          error={achievementsOperation.error} 
          onRetry={loadAchievements}
          onDismiss={achievementsOperation.clearError}
        />
      )}
      
      {/* Error display for achievement actions */}
      {achievementActionOperation.error && (
        <ErrorDisplay 
          error={achievementActionOperation.error} 
          onDismiss={achievementActionOperation.clearError}
        />
      )}
      
      {/* Loading state */}
      {achievementsOperation.isLoading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner size="large" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((achievement) => (
            <div 
              key={achievement.id} 
              className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              aria-busy={achievementActionOperation.isLoading}
            >
              <div className="flex items-center mb-2">
                <div className="w-10 h-10 flex items-center justify-center bg-primary/10 rounded-full mr-3">
                  <span className="text-xl">{achievement.icon}</span>
                </div>
                <div>
                  <h3 className="font-medium">{achievement.title}</h3>
                  <p className="text-sm text-gray-500">{achievement.description}</p>
                </div>
              </div>
              
              {achievement.unlocked && (
                <div className="text-sm text-green-600 mb-2">
                  ✓ Unlocked {achievement.unlockedAt?.toLocaleDateString()}
                </div>
              )}
              
              {achievement.progress !== undefined && (
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div 
                    className="bg-primary h-2 rounded-full" 
                    style={{ width: `${achievement.progress}%` }}
                    aria-valuenow={achievement.progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  />
                </div>
              )}
              
              <div className="flex space-x-2 mt-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => markAchievementAsSeen(achievement.id)}
                  disabled={achievementActionOperation.isLoading}
                >
                  {achievementActionOperation.isLoading && (
                    <LoadingSpinner size="small" className="mr-2" />
                  )}
                  Mark as Seen
                </Button>
                
                {achievement.unlocked && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => shareAchievement(achievement.id)}
                    disabled={achievementActionOperation.isLoading}
                  >
                    {achievementActionOperation.isLoading && (
                      <LoadingSpinner size="small" className="mr-2" />
                    )}
                    Share
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Refresh button */}
      <div className="flex justify-center mt-4">
        <Button 
          onClick={loadAchievements}
          disabled={achievementsOperation.isLoading}
        >
          {achievementsOperation.isLoading ? (
            <>
              <LoadingSpinner size="small" className="mr-2" />
              Loading...
            </>
          ) : (
            'Refresh Achievements'
          )}
        </Button>
      </div>
    </div>
  );
}
