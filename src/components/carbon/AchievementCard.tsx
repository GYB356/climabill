"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Award, Calendar, Leaf, Share2 } from 'lucide-react';
import { Achievement, AchievementLevel } from '@/lib/carbon/gamification-types';
import { useTranslation } from 'next-i18next';

interface AchievementCardProps {
  achievement: Achievement;
  className?: string;
}

const AchievementCard: React.FC<AchievementCardProps> = ({ achievement, className = '' }) => {
  const { t } = useTranslation('common');
  const isUnlocked = achievement.progress === 100 || !!achievement.unlockedAt;
  
  // Map achievement level to color
  const getLevelColor = (level: AchievementLevel) => {
    switch (level) {
      case 'bronze':
        return 'bg-amber-600';
      case 'silver':
        return 'bg-slate-400';
      case 'gold':
        return 'bg-yellow-500';
      case 'platinum':
        return 'bg-cyan-300';
      default:
        return 'bg-gray-500';
    }
  };
  
  // Map achievement category to icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'reduction':
        return <Leaf className="h-5 w-5" />;
      case 'offset':
        return <Award className="h-5 w-5" />;
      case 'consistency':
        return <Calendar className="h-5 w-5" />;
      case 'social':
        return <Share2 className="h-5 w-5" />;
      default:
        return <Award className="h-5 w-5" />;
    }
  };
  
  return (
    <Card className={`${className} ${isUnlocked ? 'border-emerald-500 shadow-md' : 'border-gray-200'} transition-all hover:shadow-lg`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <Badge className={`${getLevelColor(achievement.level)} text-white capitalize`}>
            {t(`achievements.levels.${achievement.level}`)}
          </Badge>
          {isUnlocked && (
            <Badge className="bg-emerald-500 text-white">
              {t('achievements.unlocked')}
            </Badge>
          )}
        </div>
        <CardTitle className="text-lg flex items-center gap-2 mt-2">
          {getCategoryIcon(achievement.category)}
          {achievement.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-4">{achievement.description}</p>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{t('achievements.progress')}</span>
            <span className="font-medium">{achievement.progress || 0}%</span>
          </div>
          <Progress value={achievement.progress || 0} className="h-2" />
          {achievement.unlockedAt && (
            <p className="text-xs text-gray-500 mt-2">
              {t('achievements.unlockedOn')}: {new Date(achievement.unlockedAt).toLocaleDateString()}
            </p>
          )}
          <p className="text-xs text-emerald-600 font-medium mt-1">
            {t('achievements.pointsValue', { points: achievement.points })}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AchievementCard;
