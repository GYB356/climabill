export type AchievementLevel = 'bronze' | 'silver' | 'gold' | 'platinum';

export type AchievementCategory = 
  | 'reduction' 
  | 'offset' 
  | 'tracking' 
  | 'consistency' 
  | 'social';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  level: AchievementLevel;
  icon: string;
  unlockedAt?: Date;
  progress?: number; // 0-100
  threshold: number;
  points: number;
}

export interface UserAchievement {
  userId: string;
  achievementId: string;
  unlockedAt: Date;
  progress: number; // 0-100
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  startDate: Date;
  endDate: Date;
  carbonReductionGoal: number; // in kg
  participants: string[]; // user IDs
  progress: number; // 0-100
  rewards: {
    points: number;
    achievements?: string[]; // achievement IDs
  };
}

export interface UserProfile {
  userId: string;
  level: number;
  points: number;
  totalCarbonReduced: number;
  totalCarbonOffset: number;
  achievements: UserAchievement[];
  activeChallenges: string[]; // challenge IDs
  completedChallenges: string[]; // challenge IDs
  streakDays: number;
  lastActive: Date;
}

export interface PersonalizedRecommendation {
  id: string;
  title: string;
  description: string;
  category: string;
  potentialImpact: number; // in kg CO2
  difficulty: 'easy' | 'medium' | 'hard';
  timeToImplement: string; // e.g., "2 weeks"
  relevanceScore: number; // 0-100, how relevant this is to the user
}

export interface ScenarioModel {
  id: string;
  name: string;
  description: string;
  baselineCarbonInKg: number;
  modifiedCarbonInKg: number;
  reductionPercentage: number;
  parameters: {
    [key: string]: {
      name: string;
      value: number;
      unit: string;
      defaultValue: number;
      minValue: number;
      maxValue: number;
      step: number;
      impact: number; // carbon impact per unit
    };
  };
  createdAt: Date;
  updatedAt: Date;
}
