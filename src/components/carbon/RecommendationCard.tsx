"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Lightbulb, 
  Zap, 
  Clock, 
  ArrowRight, 
  ThumbsUp,
  Flame,
  Car,
  FileText,
  Globe
} from 'lucide-react';
import { PersonalizedRecommendation } from '@/lib/carbon/gamification-types';
import { useTranslation } from 'next-i18next';

interface RecommendationCardProps {
  recommendation: PersonalizedRecommendation;
  className?: string;
  onImplement?: (id: string) => void;
  onSaveForLater?: (id: string) => void;
  onDismiss?: (id: string) => void;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({ 
  recommendation, 
  className = '',
  onImplement,
  onSaveForLater,
  onDismiss
}) => {
  const { t } = useTranslation('common');
  
  // Map difficulty to color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Map category to icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'energy':
        return <Zap className="h-5 w-5 text-yellow-500" />;
      case 'transportation':
        return <Car className="h-5 w-5 text-blue-500" />;
      case 'office':
        return <FileText className="h-5 w-5 text-purple-500" />;
      case 'offset':
        return <Globe className="h-5 w-5 text-green-500" />;
      default:
        return <Lightbulb className="h-5 w-5 text-amber-500" />;
    }
  };
  
  return (
    <Card className={`${className} border-l-4 border-l-emerald-500 transition-all hover:shadow-lg`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <Badge className={getDifficultyColor(recommendation.difficulty)}>
            {t(`recommendations.difficulty.${recommendation.difficulty}`)}
          </Badge>
          <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1">
            <ThumbsUp className="h-3 w-3" />
            {recommendation.relevanceScore}% {t('recommendations.relevance')}
          </Badge>
        </div>
        <CardTitle className="text-lg flex items-center gap-2 mt-2">
          {getCategoryIcon(recommendation.category)}
          {recommendation.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">{recommendation.description}</p>
        
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-1 text-gray-600">
            <Flame className="h-4 w-4 text-orange-500" />
            <span>
              {t('recommendations.impact')}: 
              <span className="font-medium ml-1">
                {recommendation.potentialImpact.toLocaleString()} kg CO₂
              </span>
            </span>
          </div>
          <div className="flex items-center gap-1 text-gray-600">
            <Clock className="h-4 w-4 text-blue-500" />
            <span>
              {t('recommendations.timeToImplement')}: 
              <span className="font-medium ml-1">
                {recommendation.timeToImplement}
              </span>
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2 pt-0">
        {onImplement && (
          <Button 
            variant="default" 
            size="sm" 
            className="flex-1 bg-emerald-600 hover:bg-emerald-700" 
            onClick={() => onImplement(recommendation.id)}
          >
            {t('recommendations.implement')}
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        )}
        {onSaveForLater && (
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1" 
            onClick={() => onSaveForLater(recommendation.id)}
          >
            {t('recommendations.saveForLater')}
          </Button>
        )}
        {onDismiss && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex-none text-gray-500" 
            onClick={() => onDismiss(recommendation.id)}
          >
            {t('recommendations.dismiss')}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default RecommendationCard;
