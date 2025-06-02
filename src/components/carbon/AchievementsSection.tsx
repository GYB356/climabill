"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  Award, 
  Leaf, 
  Plus,
  ChevronRight
} from 'lucide-react';
import { useTranslation } from 'next-i18next';
import AchievementCard from './AchievementCard';
import ChallengeCard from './ChallengeCard';
import { Achievement, Challenge } from '@/lib/carbon/gamification-types';

interface AchievementsSectionProps {
  achievements: Achievement[];
  challenges: Challenge[];
  onJoinChallenge?: (id: string) => void;
  onLeaveChallenge?: (id: string) => void;
  onShareChallenge?: (id: string) => void;
  onViewAllAchievements?: () => void;
  onViewAllChallenges?: () => void;
  className?: string;
}

const AchievementsSection: React.FC<AchievementsSectionProps> = ({
  achievements,
  challenges,
  onJoinChallenge,
  onLeaveChallenge,
  onShareChallenge,
  onViewAllAchievements,
  onViewAllChallenges,
  className = ''
}) => {
  const { t } = useTranslation('common');
  
  // Sort achievements by progress (unlocked first, then by progress)
  const sortedAchievements = [...achievements].sort((a, b) => {
    // Unlocked achievements first
    if (a.unlockedAt && !b.unlockedAt) return -1;
    if (!a.unlockedAt && b.unlockedAt) return 1;
    
    // Then by progress
    return (b.progress || 0) - (a.progress || 0);
  });
  
  // Sort challenges by end date (soonest first)
  const sortedChallenges = [...challenges].sort((a, b) => {
    return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
  });
  
  return (
    <div className={`space-y-6 ${className}`}>
      <Tabs defaultValue="achievements" className="space-y-4">
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="achievements" className="flex items-center gap-1">
            <Award className="h-4 w-4" />
            {t('achievements.title')}
          </TabsTrigger>
          <TabsTrigger value="challenges" className="flex items-center gap-1">
            <Leaf className="h-4 w-4" />
            {t('challenges.title')}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="achievements" className="space-y-4">
          {sortedAchievements.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {sortedAchievements.slice(0, 6).map((achievement) => (
                  <AchievementCard
                    key={achievement.id}
                    achievement={achievement}
                  />
                ))}
              </div>
              
              {achievements.length > 6 && onViewAllAchievements && (
                <div className="flex justify-center">
                  <Button 
                    variant="outline" 
                    onClick={onViewAllAchievements}
                    className="flex items-center gap-1"
                  >
                    {t('achievements.viewAll')}
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                <Award className="h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium mb-2">{t('achievements.noAchievements')}</h3>
                <p className="text-sm text-gray-500 mb-4 max-w-md">
                  {t('achievements.startTracking')}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="challenges" className="space-y-4">
          {sortedChallenges.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sortedChallenges.slice(0, 4).map((challenge) => (
                  <ChallengeCard
                    key={challenge.id}
                    challenge={challenge}
                    onJoin={() => onJoinChallenge && onJoinChallenge(challenge.id)}
                    onLeave={() => onLeaveChallenge && onLeaveChallenge(challenge.id)}
                    onShare={() => onShareChallenge && onShareChallenge(challenge.id)}
                  />
                ))}
              </div>
              
              {challenges.length > 4 && onViewAllChallenges && (
                <div className="flex justify-center">
                  <Button 
                    variant="outline" 
                    onClick={onViewAllChallenges}
                    className="flex items-center gap-1"
                  >
                    {t('challenges.viewAll')}
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                <Leaf className="h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium mb-2">{t('challenges.noChallenges')}</h3>
                <p className="text-sm text-gray-500 mb-4 max-w-md">
                  {t('challenges.joinChallenge')}
                </p>
                <Button className="flex items-center gap-1">
                  <Plus className="h-4 w-4" />
                  {t('challenges.findChallenges')}
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AchievementsSection;
