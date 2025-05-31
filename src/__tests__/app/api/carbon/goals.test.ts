import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { GET as GetGoals, POST } from '../../../../app/api/carbon/goals/route';
import { GET as GetGoal, PUT, DELETE } from '../../../../app/api/carbon/goals/[id]/route';
import { GET as GetGoalProgress } from '../../../../app/api/carbon/goals/[id]/progress/route';
import { CarbonGoalsService } from '../../../../lib/carbon/carbon-goals-service';

// Mock next-auth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));

// Mock the CarbonGoalsService - use the mock from __mocks__
jest.mock('../../../../lib/carbon/carbon-goals-service');

// Mock the auth options
jest.mock('../../../../lib/auth', () => ({
  authOptions: {},
}));

describe('Carbon Goals API', () => {
  const mockGoalsService = CarbonGoalsService as jest.MockedClass<typeof CarbonGoalsService>;
  const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup complete mock implementation for CarbonGoalsService
    mockGoalsService.prototype.getGoals = jest.fn().mockImplementation(async () => []);
    mockGoalsService.prototype.getGoal = jest.fn().mockImplementation(async () => null);
    mockGoalsService.prototype.createGoal = jest.fn().mockImplementation(async (data) => ({ id: 'newId', ...data }));
    mockGoalsService.prototype.updateGoal = jest.fn().mockImplementation(async (id, data) => ({ id, ...data }));
    mockGoalsService.prototype.deleteGoal = jest.fn().mockImplementation(async () => undefined);
    mockGoalsService.prototype.getGoalProgress = jest.fn().mockImplementation(async () => ({}));
    
    // Mock authenticated user session
    mockGetServerSession.mockResolvedValue({
      user: {
        id: 'user123',
        name: 'Test User',
        email: 'test@example.com',
        isAdmin: false,
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    });
  });
  
  describe('GET /api/carbon/goals', () => {
    it('returns goals for the authenticated user', async () => {
      // Arrange
      const mockGoals = [
        {
          id: 'goal1',
          name: 'Goal 1',
          organizationId: 'user123',
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
          organizationId: 'user123',
          baselineCarbonInKg: 2000,
          targetCarbonInKg: 1600,
          targetReductionPercentage: 20,
          startDate: new Date('2025-01-01'),
          targetDate: new Date('2025-12-31'),
          status: 'active' as const,
        },
      ];
      
      mockGoalsService.prototype.getGoals.mockResolvedValue(mockGoals);
      
      const req = new NextRequest('http://localhost:3000/api/carbon/goals');
      
      // Act
      const response = await GetGoals(req);
      const data = await response.json();
      
      // Assert
      expect(response.status).toBe(200);
      expect(data).toEqual({ goals: mockGoals });
      expect(mockGoalsService.prototype.getGoals).toHaveBeenCalledWith('user123', undefined, undefined, 'all');
    });
    
    it('returns goals with filters applied', async () => {
      // Arrange
      const organizationId = 'org123';
      const departmentId = 'dept123';
      const projectId = 'proj123';
      const status = 'active';
      
      const mockGoals = [
        {
          id: 'goal1',
          name: 'Goal 1',
          organizationId,
          departmentId,
          projectId,
          baselineCarbonInKg: 1000,
          targetCarbonInKg: 800,
          targetReductionPercentage: 20,
          startDate: new Date('2025-01-01'),
          targetDate: new Date('2025-12-31'),
          status,
        },
      ];
      
      mockGoalsService.prototype.getGoals.mockResolvedValue(mockGoals);
      
      const req = new NextRequest(
        `http://localhost:3000/api/carbon/goals?organizationId=${organizationId}&departmentId=${departmentId}&projectId=${projectId}&status=${status}`
      );
      
      // Act
      const response = await GetGoals(req);
      const data = await response.json();
      
      // Assert
      expect(response.status).toBe(200);
      expect(data).toEqual({ goals: mockGoals });
      expect(mockGoalsService.prototype.getGoals).toHaveBeenCalledWith(organizationId, departmentId, projectId, status);
    });
    
    it('returns 401 when user is not authenticated', async () => {
      // Arrange
      mockGetServerSession.mockResolvedValue(null);
      
      const req = new NextRequest('http://localhost:3000/api/carbon/goals');
      
      // Act
      const response = await GetGoals(req);
      const data = await response.json();
      
      // Assert
      expect(response.status).toBe(401);
      expect(data).toEqual({ error: 'Unauthorized' });
    });
  });
  
  describe('POST /api/carbon/goals', () => {
    it('creates a new carbon reduction goal', async () => {
      // Arrange
      const goalData = {
        name: 'New Goal',
        description: 'New Goal Description',
        organizationId: 'user123',
        baselineCarbonInKg: 1000,
        targetCarbonInKg: 800,
        targetReductionPercentage: 20,
        startDate: '2025-01-01T00:00:00.000Z',
        targetDate: '2025-12-31T00:00:00.000Z',
        status: 'active' as const,
      };
      
      const createdGoal = {
        id: 'new-goal',
        ...goalData,
        startDate: new Date(goalData.startDate),
        targetDate: new Date(goalData.targetDate),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      mockGoalsService.prototype.createGoal.mockResolvedValue(createdGoal);
      
      // Debug: Log the request data being sent
      console.log('Request body:', JSON.stringify(goalData));
      
      const req = new NextRequest('http://localhost:3000/api/carbon/goals', {
        method: 'POST',
        body: JSON.stringify(goalData),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      // Act
      const response = await POST(req);
      const data = await response.json();
      
      // Debug: Log the response data to see the error
      if (response.status !== 201) {
        console.log('Response status:', response.status);
        console.log('Response data:', data);
      }
      
      // Assert
      expect(response.status).toBe(201);
      expect(data).toEqual({ goal: createdGoal });
      expect(mockGoalsService.prototype.createGoal).toHaveBeenCalledWith(expect.objectContaining({
        name: goalData.name,
        description: goalData.description,
        organizationId: goalData.organizationId,
        baselineCarbonInKg: goalData.baselineCarbonInKg,
        targetCarbonInKg: goalData.targetCarbonInKg,
        targetReductionPercentage: goalData.targetReductionPercentage,
        startDate: expect.any(Date),
        targetDate: expect.any(Date),
        status: goalData.status,
      }));
    });
    
    it('returns 400 when required fields are missing', async () => {
      // Arrange
      const goalData = {
        name: 'New Goal',
        organizationId: 'user123',
        // Missing required fields
      };
      
      const req = new NextRequest('http://localhost:3000/api/carbon/goals', {
        method: 'POST',
        body: JSON.stringify(goalData),
      });
      
      // Act
      const response = await POST(req);
      const data = await response.json();
      
      // Assert
      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'Required fields are missing' });
    });
    
    it('returns 401 when user is not authenticated', async () => {
      // Arrange
      mockGetServerSession.mockResolvedValue(null);
      
      const req = new NextRequest('http://localhost:3000/api/carbon/goals', {
        method: 'POST',
        body: JSON.stringify({
          name: 'New Goal',
          baselineCarbonInKg: 1000,
          targetReductionPercentage: 20,
          startDate: '2025-01-01',
          targetDate: '2025-12-31',
        }),
      });
      
      // Act
      const response = await POST(req);
      const data = await response.json();
      
      // Assert
      expect(response.status).toBe(401);
      expect(data).toEqual({ error: 'Unauthorized' });
    });
  });
  
  describe('PUT /api/carbon/goals/[id]', () => {
    it('updates an existing goal', async () => {
      // Arrange
      const goalId = 'goal123';
      const updateData = {
        name: 'Updated Goal',
        description: 'Updated Description',
        baselineCarbonInKg: 1200,
        targetReductionPercentage: 25,
        startDate: '2025-02-01T00:00:00.000Z',
        targetDate: '2025-12-31T00:00:00.000Z',
      };
      
      const existingGoal = {
        id: goalId,
        name: 'Old Goal',
        description: 'Old Description',
        organizationId: 'user123',
        baselineCarbonInKg: 1000,
        targetCarbonInKg: 800,
        targetReductionPercentage: 20,
        startDate: new Date('2025-01-01'),
        targetDate: new Date('2025-12-31'),
        status: 'active' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      const updatedGoal = {
        ...existingGoal,
        name: updateData.name,
        description: updateData.description,
        baselineCarbonInKg: updateData.baselineCarbonInKg,
        targetCarbonInKg: 900, // 1200 * (1 - 25/100)
        targetReductionPercentage: updateData.targetReductionPercentage,
        startDate: new Date(updateData.startDate),
        targetDate: new Date(updateData.targetDate),
        updatedAt: new Date(),
      };
      
      mockGoalsService.prototype.getGoal.mockResolvedValue(existingGoal);
      mockGoalsService.prototype.updateGoal.mockResolvedValue(updatedGoal);
      
      const req = new NextRequest('http://localhost:3000/api/carbon/goals', {
        method: 'PUT',
        body: JSON.stringify(updateData),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      // Mock params
      const params = { id: goalId };
      
      // Act
      const response = await PUT(req, { params });
      const data = await response.json();
      
      // Assert
      expect(response.status).toBe(200);
      expect(data).toEqual({ goal: updatedGoal });
      expect(mockGoalsService.prototype.updateGoal).toHaveBeenCalledWith(
        goalId,
        expect.objectContaining({
          name: updateData.name,
          description: updateData.description,
          baselineCarbonInKg: updateData.baselineCarbonInKg,
          targetReductionPercentage: updateData.targetReductionPercentage,
          startDate: expect.any(Date),
          targetDate: expect.any(Date),
        })
      );
    });
    
    it('returns 400 when goal name is missing', async () => {
      // Arrange
      const goalId = 'goal123';
      const updateData = {
        description: 'Updated Description',
      };
      
      const req = new NextRequest('http://localhost:3000/api/carbon/goals', {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });
      
      // Mock params
      const params = { id: goalId };
      
      // Act
      const response = await PUT(req, { params });
      const data = await response.json();
      
      // Assert
      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'Goal name is required' });
    });
    
    it('returns 404 when goal is not found', async () => {
      // Arrange
      const goalId = 'nonexistent';
      const updateData = {
        name: 'Updated Goal',
      };
      
      mockGoalsService.prototype.getGoal.mockResolvedValue(null);
      
      const req = new NextRequest('http://localhost:3000/api/carbon/goals', {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });
      
      // Mock params
      const params = { id: goalId };
      
      // Act
      const response = await PUT(req, { params });
      const data = await response.json();
      
      // Assert
      expect(response.status).toBe(404);
      expect(data).toEqual({ error: 'Goal not found' });
    });
    
    it('returns 403 when user is not authorized to update the goal', async () => {
      // Arrange
      const goalId = 'goal123';
      const updateData = {
        name: 'Updated Goal',
      };
      
      const existingGoal = {
        id: goalId,
        name: 'Old Goal',
        organizationId: 'other-user',
        baselineCarbonInKg: 1000,
        targetCarbonInKg: 800,
        targetReductionPercentage: 20,
        startDate: new Date('2025-01-01'),
        targetDate: new Date('2025-12-31'),
        status: 'active' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      mockGoalsService.prototype.getGoal.mockResolvedValue(existingGoal);
      
      const req = new NextRequest('http://localhost:3000/api/carbon/goals', {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });
      
      // Mock params
      const params = { id: goalId };
      
      // Act
      const response = await PUT(req, { params });
      const data = await response.json();
      
      // Assert
      expect(response.status).toBe(403);
      expect(data).toEqual({ error: 'Unauthorized to update this goal' });
    });
  });
  
  describe('DELETE /api/carbon/goals/[id]', () => {
    it('deletes an existing goal', async () => {
      // Arrange
      const goalId = 'goal123';
      
      const existingGoal = {
        id: goalId,
        name: 'Goal to Delete',
        organizationId: 'user123',
        baselineCarbonInKg: 1000,
        targetCarbonInKg: 800,
        targetReductionPercentage: 20,
        startDate: new Date('2025-01-01'),
        targetDate: new Date('2025-12-31'),
        status: 'active' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      mockGoalsService.prototype.getGoal.mockResolvedValue(existingGoal);
      mockGoalsService.prototype.deleteGoal.mockResolvedValue(undefined);
      
      const req = new NextRequest('http://localhost:3000/api/carbon/goals', {
        method: 'DELETE',
      });
      
      // Mock params
      const params = { id: goalId };
      
      // Act
      const response = await DELETE(req, { params });
      const data = await response.json();
      
      // Assert
      expect(response.status).toBe(200);
      expect(data).toEqual({ success: true });
      expect(mockGoalsService.prototype.deleteGoal).toHaveBeenCalledWith(goalId);
    });
    
    it('returns 404 when goal is not found', async () => {
      // Arrange
      const goalId = 'nonexistent';
      
      mockGoalsService.prototype.getGoal.mockResolvedValue(null);
      
      const req = new NextRequest('http://localhost:3000/api/carbon/goals', {
        method: 'DELETE',
      });
      
      // Mock params
      const params = { id: goalId };
      
      // Act
      const response = await DELETE(req, { params });
      const data = await response.json();
      
      // Assert
      expect(response.status).toBe(404);
      expect(data).toEqual({ error: 'Goal not found' });
    });
    
    it('returns 403 when user is not authorized to delete the goal', async () => {
      // Arrange
      const goalId = 'goal123';
      
      const existingGoal = {
        id: goalId,
        name: 'Goal to Delete',
        organizationId: 'other-user',
        baselineCarbonInKg: 1000,
        targetCarbonInKg: 800,
        targetReductionPercentage: 20,
        startDate: new Date('2025-01-01'),
        targetDate: new Date('2025-12-31'),
        status: 'active' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      mockGoalsService.prototype.getGoal.mockResolvedValue(existingGoal);
      
      const req = new NextRequest('http://localhost:3000/api/carbon/goals', {
        method: 'DELETE',
      });
      
      // Mock params
      const params = { id: goalId };
      
      // Act
      const response = await DELETE(req, { params });
      const data = await response.json();
      
      // Assert
      expect(response.status).toBe(403);
      expect(data).toEqual({ error: 'Unauthorized to delete this goal' });
    });
  });
});
