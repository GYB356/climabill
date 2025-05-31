// Mock implementation of the CarbonGoalsService
import { CarbonReductionGoal } from './types';

// Create instance methods
const createGoalImpl = jest.fn().mockImplementation((goal: Omit<CarbonReductionGoal, 'id' | 'createdAt' | 'updatedAt'>) => {
  const id = `goal-${Math.random().toString(36).substring(2, 9)}`;
  const now = new Date();
  return Promise.resolve({
    id,
    ...goal,
    createdAt: now,
    updatedAt: now,
    status: goal.status || 'active' as 'active' | 'achieved' | 'missed' | 'archived',
  });
});

const updateGoalImpl = jest.fn().mockImplementation((id: string, goal: Partial<CarbonReductionGoal>) => {
  return Promise.resolve({
    id,
    ...goal,
    updatedAt: new Date(),
    status: goal.status || 'active' as 'active' | 'achieved' | 'missed' | 'archived',
  });
});

const getGoalImpl = jest.fn().mockImplementation((id: string) => {
  return Promise.resolve({
    id,
    name: 'Carbon Reduction Goal',
    description: 'Reduce carbon emissions by 30% by 2025',
    baselineCarbonInKg: 1000,
    targetCarbonInKg: 700,
    targetReductionPercentage: 30,
    startDate: new Date('2023-01-01'),
    targetDate: new Date('2025-12-31'),
    organizationId: 'org-123',
    status: 'active' as 'active' | 'achieved' | 'missed' | 'archived',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  });
});

const deleteGoalImpl = jest.fn().mockImplementation((id: string) => {
  return Promise.resolve(undefined);
});

const getGoalsImpl = jest.fn().mockImplementation((organizationId: string, departmentId?: string, projectId?: string, status?: string) => {
  const goals = [
    {
      id: 'goal-1',
      name: 'Reduce Office Emissions',
      description: 'Reduce emissions from office operations',
      baselineCarbonInKg: 1000,
      targetCarbonInKg: 800,
      targetReductionPercentage: 20,
      startDate: new Date('2025-01-01'),
      targetDate: new Date('2025-12-31'),
      organizationId: 'org123',
      departmentId: 'dept-1',
      status: 'active' as 'active' | 'achieved' | 'missed' | 'archived',
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
    },
    {
      id: 'goal-2',
      name: 'Reduce Travel Emissions',
      description: 'Reduce emissions from business travel',
      baselineCarbonInKg: 2000,
      targetCarbonInKg: 1400,
      targetReductionPercentage: 30,
      startDate: new Date('2025-01-01'),
      targetDate: new Date('2025-12-31'),
      organizationId: 'org123',
      departmentId: 'dept-2',
      projectId: 'proj-1',
      status: 'active' as 'active' | 'achieved' | 'missed' | 'archived',
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
    },
  ];

  if (departmentId) {
    return Promise.resolve(goals.filter(goal => goal.departmentId === departmentId));
  }

  if (projectId) {
    return Promise.resolve(goals.filter(goal => goal.projectId === projectId));
  }

  if (status && status !== 'all') {
    return Promise.resolve(goals.filter(goal => goal.status === status));
  }

  return Promise.resolve(goals);
});



const updateGoalProgressImpl = jest.fn().mockImplementation((goalId: string) => {
  // Return the expected structure: { goal, currentCarbonInKg, progressPercentage }
  const goal = {
    id: goalId,
    name: goalId === 'goal-1' ? 'Carbon Reduction Goal 1' : 'Carbon Reduction Goal 2',
    description: 'Reduce carbon emissions by 30% by 2025',
    baselineCarbonInKg: 1000,
    targetCarbonInKg: 700,
    targetReductionPercentage: 30,
    startDate: new Date('2023-01-01'),
    targetDate: new Date('2025-12-31'),
    organizationId: 'org-123',
    status: 'active' as 'active' | 'achieved' | 'missed' | 'archived',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date(),
  };

  return Promise.resolve({
    goal: goal,
    currentCarbonInKg: 850,
    progressPercentage: 50,
    isAchieved: false
  });
});

// Mock for the getAverageCarbonUsage method that's called in updateGoalProgress
const getAverageCarbonUsageImpl = jest.fn().mockImplementation((organizationId, startDate, endDate) => {
  return Promise.resolve({
    averageUsage: 850,
    totalUsage: 8500,
    numberOfDays: 10,
  });
});

// Create class with instance methods
export class CarbonGoalsService {
  createGoal = createGoalImpl;
  updateGoal = updateGoalImpl;
  getGoal = getGoalImpl;
  getGoals = getGoalsImpl;
  deleteGoal = deleteGoalImpl;
  updateGoalProgress = updateGoalProgressImpl;
  getAverageCarbonUsage = getAverageCarbonUsageImpl;
}

// Add prototype methods for component tests that use prototype mocking
CarbonGoalsService.prototype.createGoal = createGoalImpl;
CarbonGoalsService.prototype.updateGoal = updateGoalImpl;
CarbonGoalsService.prototype.getGoal = getGoalImpl;
CarbonGoalsService.prototype.getGoals = getGoalsImpl;
CarbonGoalsService.prototype.deleteGoal = deleteGoalImpl;
CarbonGoalsService.prototype.updateGoalProgress = updateGoalProgressImpl;
CarbonGoalsService.prototype.getAverageCarbonUsage = getAverageCarbonUsageImpl;
