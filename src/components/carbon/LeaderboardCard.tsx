"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Trophy, 
  Medal, 
  Users, 
  ArrowUp, 
  ArrowDown,
  Share2
} from 'lucide-react';
import { useTranslation } from 'next-i18next';

export interface LeaderboardEntry {
  userId: string;
  name: string;
  avatar?: string;
  rank: number;
  previousRank: number;
  points: number;
  carbonReduced: number;
  isCurrentUser: boolean;
}

interface LeaderboardCardProps {
  entries: LeaderboardEntry[];
  title?: string;
  period?: string;
  className?: string;
  onShare?: () => void;
  onViewAll?: () => void;
}

const LeaderboardCard: React.FC<LeaderboardCardProps> = ({ 
  entries, 
  title = 'Carbon Reduction Leaders',
  period = 'This Month',
  className = '',
  onShare,
  onViewAll
}) => {
  const { t } = useTranslation('common');
  
  // Get medal for top ranks
  const getRankMedal = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-slate-400" />;
      case 3:
        return <Medal className="h-5 w-5 text-amber-600" />;
      default:
        return null;
    }
  };
  
  // Get rank change indicator
  const getRankChange = (entry: LeaderboardEntry) => {
    const change = entry.previousRank - entry.rank;
    
    if (change > 0) {
      return (
        <span className="flex items-center text-green-600">
          <ArrowUp className="h-3 w-3 mr-1" />
          {change}
        </span>
      );
    } else if (change < 0) {
      return (
        <span className="flex items-center text-red-600">
          <ArrowDown className="h-3 w-3 mr-1" />
          {Math.abs(change)}
        </span>
      );
    } else {
      return (
        <span className="text-gray-500">-</span>
      );
    }
  };
  
  return (
    <Card className={`${className}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              {title}
            </CardTitle>
            <p className="text-sm text-gray-500">{period}</p>
          </div>
          <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1">
            <Users className="h-3 w-3" />
            {entries.length} {t('leaderboard.participants')}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {entries.map((entry) => (
            <div 
              key={entry.userId} 
              className={`flex items-center p-2 rounded-md ${
                entry.isCurrentUser ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
              }`}
            >
              <div className="w-8 text-center font-bold">
                {getRankMedal(entry.rank) || entry.rank}
              </div>
              
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mr-3">
                {entry.avatar ? (
                  <img src={entry.avatar} alt={entry.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-lg font-medium text-gray-600">
                    {entry.name.substring(0, 1)}
                  </span>
                )}
              </div>
              
              <div className="flex-grow">
                <div className="flex items-center">
                  <span className="font-medium">{entry.name}</span>
                  {entry.isCurrentUser && (
                    <Badge className="ml-2 bg-blue-100 text-blue-800 text-xs">
                      {t('leaderboard.you')}
                    </Badge>
                  )}
                </div>
                <div className="text-sm text-gray-600">
                  {entry.carbonReduced.toLocaleString()} kg CO₂ {t('leaderboard.reduced')}
                </div>
              </div>
              
              <div className="text-right">
                <div className="font-semibold">{entry.points.toLocaleString()} {t('leaderboard.pts')}</div>
                <div className="text-xs">{getRankChange(entry)}</div>
              </div>
            </div>
          ))}
          
          <div className="flex justify-between pt-2">
            {onViewAll && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onViewAll}
              >
                {t('leaderboard.viewAll')}
              </Button>
            )}
            {onShare && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onShare}
              >
                <Share2 className="h-4 w-4 mr-1" />
                {t('leaderboard.share')}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LeaderboardCard;
