"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Trophy, Clock, ArrowUpRight } from 'lucide-react';
import { Challenge } from '@/lib/carbon/gamification-types';
import { useTranslation } from 'next-i18next';

interface ChallengeCardProps {
  challenge: Challenge;
  className?: string;
  onJoin?: () => void;
  onLeave?: () => void;
  onShare?: () => void;
}

const ChallengeCard: React.FC<ChallengeCardProps> = ({ 
  challenge, 
  className = '',
  onJoin,
  onLeave,
  onShare
}) => {
  const { t } = useTranslation('common');
  
  // Calculate days remaining
  const daysRemaining = Math.ceil((new Date(challenge.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const isActive = daysRemaining > 0;
  
  // Format date range
  const formatDateRange = () => {
    const startDate = new Date(challenge.startDate).toLocaleDateString();
    const endDate = new Date(challenge.endDate).toLocaleDateString();
    return `${startDate} - ${endDate}`;
  };
  
  return (
    <Card className={`${className} ${isActive ? 'border-blue-500' : 'border-gray-200'} transition-all hover:shadow-lg`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <Badge className="bg-blue-500 text-white">
            {t('challenges.active')}
          </Badge>
          <Badge className="bg-gray-100 text-gray-700 flex items-center gap-1">
            <Users className="h-3 w-3" />
            {challenge.participants.length}
          </Badge>
        </div>
        <CardTitle className="text-lg mt-2">{challenge.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">{challenge.description}</p>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{t('challenges.progress')}</span>
            <span className="font-medium">{challenge.progress}%</span>
          </div>
          <Progress value={challenge.progress} className="h-2" />
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-1 text-gray-600">
            <Clock className="h-4 w-4" />
            <span>{daysRemaining} {t('challenges.daysRemaining')}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-600">
            <Trophy className="h-4 w-4" />
            <span>{challenge.rewards.points} {t('challenges.points')}</span>
          </div>
        </div>
        
        <div className="text-xs text-gray-500">
          {t('challenges.dateRange')}: {formatDateRange()}
        </div>
        
        <div className="text-xs text-gray-500">
          {t('challenges.goal')}: {challenge.carbonReductionGoal} kg CO₂
        </div>
      </CardContent>
      <CardFooter className="flex gap-2 pt-0">
        {onJoin && (
          <Button variant="outline" size="sm" className="flex-1" onClick={onJoin}>
            {t('challenges.join')}
          </Button>
        )}
        {onLeave && (
          <Button variant="outline" size="sm" className="flex-1" onClick={onLeave}>
            {t('challenges.leave')}
          </Button>
        )}
        {onShare && (
          <Button variant="ghost" size="sm" className="flex-none" onClick={onShare}>
            <Share2 className="h-4 w-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ChallengeCard;
