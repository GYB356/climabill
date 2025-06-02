"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Award, 
  Calendar, 
  Flame, 
  Globe, 
  TrendingUp,
  Medal
} from 'lucide-react';
import { UserProfile } from '@/lib/carbon/gamification-types';
import { useTranslation } from 'next-i18next';

interface UserProfileCardProps {
  profile: UserProfile;
  className?: string;
}

const UserProfileCard: React.FC<UserProfileCardProps> = ({ profile, className = '' }) => {
  const { t } = useTranslation('common');
  
  // Calculate progress to next level (0-100)
  const calculateLevelProgress = () => {
    const pointsForCurrentLevel = profile.level * 500;
    const pointsForNextLevel = (profile.level + 1) * 500;
    const pointsNeeded = pointsForNextLevel - pointsForCurrentLevel;
    const pointsProgress = profile.points - pointsForCurrentLevel;
    
    return Math.min(Math.max(Math.floor((pointsProgress / pointsNeeded) * 100), 0), 100);
  };
  
  // Get level title
  const getLevelTitle = (level: number) => {
    const titles = [
      t('profile.levels.beginner'),
      t('profile.levels.novice'),
      t('profile.levels.intermediate'),
      t('profile.levels.advanced'),
      t('profile.levels.expert'),
      t('profile.levels.master'),
      t('profile.levels.champion'),
      t('profile.levels.hero'),
      t('profile.levels.legend'),
      t('profile.levels.sustainability_guru')
    ];
    
    return titles[Math.min(level - 1, titles.length - 1)];
  };
  
  return (
    <Card className={`${className} transition-all hover:shadow-lg`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <Badge className="bg-purple-500 text-white">
            {t('profile.level')} {profile.level}
          </Badge>
          <Badge className="bg-amber-500 text-white flex items-center gap-1">
            <Award className="h-3 w-3" />
            {profile.achievements.filter(a => a.progress === 100).length} {t('profile.achievements')}
          </Badge>
        </div>
        <CardTitle className="text-lg flex items-center gap-2 mt-2">
          <User className="h-5 w-5 text-purple-500" />
          {getLevelTitle(profile.level)}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Level progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{t('profile.nextLevel')}</span>
            <span className="font-medium">
              {profile.points} / {(profile.level + 1) * 500} {t('profile.points')}
            </span>
          </div>
          <Progress value={calculateLevelProgress()} className="h-2" />
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-3 rounded-md">
            <div className="flex items-center gap-2 mb-1">
              <Flame className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium">{t('profile.carbonReduced')}</span>
            </div>
            <p className="text-lg font-semibold">
              {profile.totalCarbonReduced.toLocaleString()} kg
            </p>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-md">
            <div className="flex items-center gap-2 mb-1">
              <Globe className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">{t('profile.carbonOffset')}</span>
            </div>
            <p className="text-lg font-semibold">
              {profile.totalCarbonOffset.toLocaleString()} kg
            </p>
          </div>
        </div>
        
        {/* Streak and challenges */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-full">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">{t('profile.streak')}</p>
              <p className="font-semibold">{profile.streakDays} {t('profile.days')}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-full">
              <Medal className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">{t('profile.challenges')}</p>
              <p className="font-semibold">{profile.activeChallenges.length} {t('profile.active')}</p>
            </div>
          </div>
        </div>
        
        {/* Last active */}
        <div className="text-xs text-gray-500 pt-2">
          {t('profile.lastActive')}: {new Date(profile.lastActive).toLocaleDateString()}
        </div>
      </CardContent>
    </Card>
  );
};

export default UserProfileCard;
