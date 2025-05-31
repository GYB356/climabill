// Mock implementation of the CarbonGoalsService
import { CarbonReductionGoal } from '../lib/carbon/models/carbon-goals';

// Mock instance methods
const createGoalImpl = jest.fn().mockResolvedValue({
  id: 'goal123',
  name: 'Test Goal',
  description: 'Test Description',
  organizationId: 'org123',
  baselineCarbonInKg: 1000,
  targetCarbonInKg: 800,
  targetReductionPercentage: 20,
  startDate: new Date('2025-01-01'),
  targetDate: new Date('2025-12-31'),
  status: 'active',
  createdAt: new Date(),
  updatedAt: new Date(),
});

const updateGoalImpl = jest.fn().mockResolvedValue({
  id: 'goal123',
  name: 'Updated Goal',
  description: 'Updated Description',
  organizationId: 'org123',
  baselineCarbonInKg: 1000,
  targetCarbonInKg: 700,
  targetReductionPercentage: 30,
  startDate: new Date('2025-01-01'),
  targetDate: new Date('2025-12-31'),
  status: 'active' as const,
  createdAt: new Date(),
  updatedAt: new Date(),
});

const getGoalsImpl = jest.fn().mockResolvedValue([
  {
    id: 'goal1',
    name: 'Goal 1',
    organizationId: 'org123',
    baselineCarbonInKg: 1000,
    targetCarbonInKg: 800,
    targetReductionPercentage: 20,
    startDate: new Date('2025-01-01'),
    targetDate: new Date('2025-12-31'),
    status: 'active' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]);

const getGoalImpl = jest.fn().mockResolvedValue({
  id: 'goal123',
  name: 'Test Goal',
  organizationId: 'org123',
  baselineCarbonInKg: 1000,
  targetCarbonInKg: 800,
  targetReductionPercentage: 20,
  startDate: new Date('2025-01-01'),
  targetDate: new Date('2025-12-31'),
  status: 'active' as const,
  createdAt: new Date(),
  updatedAt: new Date(),
});

const deleteGoalImpl = jest.fn().mockResolvedValue(undefined);

const updateGoalProgressImpl = jest.fn().mockResolvedValue({
  id: 'goal123',
  name: 'Test Goal',
  organizationId: 'org123',
  baselineCarbonInKg: 1000,
  targetCarbonInKg: 800,
  targetReductionPercentage: 20,
  currentCarbonInKg: 900,
  progressPercentage: 50,
  startDate: new Date('2025-01-01'),
  targetDate: new Date('2025-12-31'),
  status: 'active' as const,
  createdAt: new Date(),
  updatedAt: new Date(),
});

// Create class with instance methods
export class CarbonGoalsService {
  createGoal = createGoalImpl;
  updateGoal = updateGoalImpl;
  getGoals = getGoalsImpl;
  getGoal = getGoalImpl;
  deleteGoal = deleteGoalImpl;
  updateGoalProgress = updateGoalProgressImpl;
}

// Add prototype methods for component tests that use prototype mocking
CarbonGoalsService.prototype.createGoal = createGoalImpl;
CarbonGoalsService.prototype.updateGoal = updateGoalImpl;
CarbonGoalsService.prototype.getGoals = getGoalsImpl;
CarbonGoalsService.prototype.getGoal = getGoalImpl;
CarbonGoalsService.prototype.deleteGoal = deleteGoalImpl;
CarbonGoalsService.prototype.updateGoalProgress = updateGoalProgressImpl;
