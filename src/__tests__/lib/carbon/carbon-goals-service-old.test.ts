import { expect, jest, describe, beforeEach, it } from '@jest/globals';
import { CarbonGoalsService } from '../../../lib/carbon/carbon-goals-service';
import { CarbonTrackingService } from '../../../lib/carbon/carbon-tracking-service';
import { CarbonReductionGoal } from '../../../lib/carbon/models/department-project';

// Mock Firebase imports
jest.mock('firebase/firestore');
jest.mock('../../../lib/firebase/config');

// Get mocked firebase functions
const { 
  collection, doc, addDoc, updateDoc, getDoc, getDocs, query, where, orderBy, Timestamp 
} = require('firebase/firestore');

// Mock CarbonTrackingService
jest.mock('../../../lib/carbon/carbon-tracking-service');

describe('CarbonGoalsService', () => {
  let goalsService: CarbonGoalsService;
  let mockCarbonTrackingService: jest.Mocked<CarbonTrackingService>;
  
  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Setup mock implementations
    mockCarbonTrackingService = new CarbonTrackingService() as jest.Mocked<CarbonTrackingService>;
    goalsService = new CarbonGoalsService();
    
    // Mock the required methods
    (goalsService as any).carbonTrackingService = mockCarbonTrackingService;
    
    // Setup default mock return values
    (collection as jest.Mock).mockReturnValue({});
    (doc as jest.Mock).mockReturnValue({});
    (addDoc as jest.Mock).mockResolvedValue({ id: 'mock-goal-id' });
    (updateDoc as jest.Mock).mockResolvedValue(undefined);
    (query as jest.Mock).mockReturnValue({});
    (where as jest.Mock).mockReturnValue({});
    (orderBy as jest.Mock).mockReturnValue({});
    (getDocs as jest.Mock).mockResolvedValue({
      docs: [],
      empty: true,
      size: 0
    });
  });
  
  describe('createGoal', () => {
    it('should create a new carbon reduction goal', async () => {
      // Arrange
      const goalData = {
        name: 'Test Goal',
        description: 'Test Description',
        organizationId: 'org123',
        baselineCarbonInKg: 1000,
        targetCarbonInKg: 800,
        targetReductionPercentage: 20,
        startDate: new Date('2025-01-01'),
        targetDate: new Date('2025-12-31'),
        status: 'active' as const,
      };
      
      const mockGoalId = 'goal123';
      const mockAdd = jest.fn().mockResolvedValue({ id: mockGoalId });
      const mockCollection = jest.fn().mockReturnValue({ add: mockAdd });
      
      (goalsService as any).db = {
        collection: mockCollection,
      };
      
      // Act
      const result = await goalsService.createGoal(goalData);
      
      // Assert
      expect(mockCollection).toHaveBeenCalledWith('carbonReductionGoals');
      expect(mockAdd).toHaveBeenCalledWith({
        ...goalData,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
      expect(result).toEqual({
        id: mockGoalId,
        ...goalData,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });
  });
  
  describe('updateGoal', () => {
    it('should update an existing carbon reduction goal', async () => {
      // Arrange
      const goalId = 'goal123';
      const updateData = {
        name: 'Updated Goal',
        targetReductionPercentage: 25,
      };
      
      const mockUpdate = jest.fn().mockResolvedValue({});
      const mockDoc = jest.fn().mockReturnValue({ update: mockUpdate });
      const mockCollection = jest.fn().mockReturnValue({ doc: mockDoc });
      
      (goalsService as any).db = {
        collection: mockCollection,
      };
      
      // Mock the getGoal method
      const existingGoal = {
        id: goalId,
        name: 'Test Goal',
        description: 'Test Description',
        organizationId: 'org123',
        baselineCarbonInKg: 1000,
        targetCarbonInKg: 800,
        targetReductionPercentage: 20,
        startDate: new Date('2025-01-01'),
        targetDate: new Date('2025-12-31'),
        status: 'active' as const,
      };
      
      goalsService.getGoal = jest.fn().mockResolvedValue(existingGoal);
      
      // Act
      const result = await goalsService.updateGoal(goalId, updateData);
      
      // Assert
      expect(mockCollection).toHaveBeenCalledWith('carbonReductionGoals');
      expect(mockDoc).toHaveBeenCalledWith(goalId);
      expect(mockUpdate).toHaveBeenCalledWith({
        ...updateData,
        targetCarbonInKg: 750, // 1000 * (1 - 25/100)
        updatedAt: expect.any(Date),
      });
      expect(result).toEqual({
        ...existingGoal,
        ...updateData,
        targetCarbonInKg: 750,
        updatedAt: expect.any(Date),
      });
    });
  });
  
  describe('getGoals', () => {
    it('should retrieve goals for an organization', async () => {
      // Arrange
      const organizationId = 'org123';
      const mockGoals = [
        {
          id: 'goal1',
          name: 'Goal 1',
          organizationId,
          baselineCarbonInKg: 1000,
          targetCarbonInKg: 800,
          targetReductionPercentage: 20,
          startDate: new Date('2025-01-01'),
          targetDate: new Date('2025-12-31'),
          status: 'active' as const,
        },
        {
          id: 'goal2',
          name: 'Goal 2',
          organizationId,
          baselineCarbonInKg: 2000,
          targetCarbonInKg: 1600,
          targetReductionPercentage: 20,
          startDate: new Date('2025-01-01'),
          targetDate: new Date('2025-12-31'),
          status: 'active' as const,
        },
      ];
      
      const mockDocs = mockGoals.map(goal => ({
        id: goal.id,
        data: () => goal,
      }));
      
      const mockGet = jest.fn().mockResolvedValue({ docs: mockDocs });
      const mockWhere = jest.fn().mockReturnThis();
      const mockOrderBy = jest.fn().mockReturnThis();
      const mockCollection = jest.fn().mockReturnValue({
        where: mockWhere,
        orderBy: mockOrderBy,
        get: mockGet,
      });
      
      (goalsService as any).db = {
        collection: mockCollection,
      };
      
      // Act
      const result = await goalsService.getGoals(organizationId);
      
      // Assert
      expect(mockCollection).toHaveBeenCalledWith('carbonReductionGoals');
      expect(mockWhere).toHaveBeenCalledWith('organizationId', '==', organizationId);
      expect(mockOrderBy).toHaveBeenCalledWith('createdAt', 'desc');
      expect(result).toEqual(mockGoals);
    });
    
    it('should filter goals by department', async () => {
      // Arrange
      const organizationId = 'org123';
      const departmentId = 'dept123';
      
      const mockWhere = jest.fn().mockReturnThis();
      const mockOrderBy = jest.fn().mockReturnThis();
      const mockGet = jest.fn().mockResolvedValue({ docs: [] });
      const mockCollection = jest.fn().mockReturnValue({
        where: mockWhere,
        orderBy: mockOrderBy,
        get: mockGet,
      });
      
      (goalsService as any).db = {
        collection: mockCollection,
      };
      
      // Act
      await goalsService.getGoals(organizationId, departmentId);
      
      // Assert
      expect(mockWhere).toHaveBeenCalledWith('organizationId', '==', organizationId);
      expect(mockWhere).toHaveBeenCalledWith('departmentId', '==', departmentId);
    });
  });
  
  describe('updateGoalProgress', () => {
    it('should calculate goal progress correctly', async () => {
      // Arrange
      const goalId = 'goal123';
      const goal: CarbonReductionGoal = {
        id: goalId,
        name: 'Test Goal',
        organizationId: 'org123',
        baselineCarbonInKg: 1000,
        targetCarbonInKg: 800,
        targetReductionPercentage: 20,
        startDate: new Date('2025-01-01'),
        targetDate: new Date('2025-12-31'),
        status: 'active' as const,
      };
      
      goalsService.getGoal = jest.fn().mockResolvedValue(goal);
      
      // Mock the carbon tracking service to return current carbon usage
      mockCarbonTrackingService.getAverageCarbonUsage.mockResolvedValue(900);
      
      // Act
      const result = await goalsService.updateGoalProgress(goalId);
      
      // Assert
      expect(mockCarbonTrackingService.getAverageCarbonUsage).toHaveBeenCalledWith(
        goal.organizationId,
        goal.startDate,
        expect.any(Date),
        goal.departmentId,
        goal.projectId
      );
      
      expect(result).toEqual({
        goal,
        currentCarbonInKg: 900,
        progressPercentage: 50, // (1000 - 900) / (1000 - 800) * 100
      });
    });
    
    it('should handle completed goals', async () => {
      // Arrange
      const goalId = 'goal123';
      const goal: CarbonReductionGoal = {
        id: goalId,
        name: 'Test Goal',
        organizationId: 'org123',
        baselineCarbonInKg: 1000,
        targetCarbonInKg: 800,
        targetReductionPercentage: 20,
        startDate: new Date('2025-01-01'),
        targetDate: new Date('2025-12-31'),
        status: 'active' as const,
      };
      
      goalsService.getGoal = jest.fn().mockResolvedValue(goal);
      
      // Mock the carbon tracking service to return current carbon usage below target
      mockCarbonTrackingService.getAverageCarbonUsage.mockResolvedValue(750);
      
      // Mock the updateGoal method
      goalsService.updateGoal = jest.fn().mockResolvedValue({
        ...goal,
        status: 'completed',
      });
      
      // Act
      const result = await goalsService.updateGoalProgress(goalId);
      
      // Assert
      expect(goalsService.updateGoal).toHaveBeenCalledWith(goalId, {
        status: 'completed',
      });
      
      expect(result).toEqual({
        goal: {
          ...goal,
          status: 'completed',
        },
        currentCarbonInKg: 750,
        progressPercentage: 100, // Goal reached
      });
    });
  });
});
