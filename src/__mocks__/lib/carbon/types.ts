// Mock types to match what's used in tests
export type CarbonReductionGoal = {
  id: string;
  name: string;
  description?: string;
  organizationId: string;
  departmentId?: string;
  projectId?: string;
  baselineCarbonInKg: number;
  targetCarbonInKg: number;
  targetReductionPercentage: number;
  startDate: Date;
  targetDate: Date;
  status: 'active' | 'achieved' | 'missed' | 'archived';
  currentValue?: number;
  progressPercentage?: number;
  createdAt: Date;
  updatedAt: Date;
};
