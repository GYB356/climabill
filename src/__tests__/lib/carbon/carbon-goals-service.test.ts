import { CarbonGoalsService } from '../../../lib/carbon/carbon-goals-service';

// Mock Firebase functions directly
const mockCollection = jest.fn();
const mockDoc = jest.fn(); 
const mockAddDoc = jest.fn();
const mockUpdateDoc = jest.fn();
const mockGetDoc = jest.fn();
const mockGetDocs = jest.fn();
const mockQuery = jest.fn();
const mockWhere = jest.fn();
const mockOrderBy = jest.fn();
const mockTimestamp = {
  now: jest.fn(() => new Date()),
  fromDate: jest.fn((date) => date),
};

jest.mock('firebase/firestore', () => ({
  collection: mockCollection,
  doc: mockDoc,
  addDoc: mockAddDoc,
  updateDoc: mockUpdateDoc,
  getDoc: mockGetDoc,
  getDocs: mockGetDocs,
  query: mockQuery,
  where: mockWhere,
  orderBy: mockOrderBy,
  Timestamp: mockTimestamp,
}));

// Mock CarbonTrackingService
jest.mock('../../../lib/carbon/carbon-tracking-service');

// Mock Firebase config
jest.mock('../../../lib/firebase/config', () => ({
  db: {},
}));

describe('CarbonGoalsService', () => {
  let goalsService: CarbonGoalsService;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mock implementations
    mockCollection.mockReturnValue({});
    mockDoc.mockReturnValue({});
    mockAddDoc.mockResolvedValue({ id: 'mock-goal-id' });
    mockUpdateDoc.mockResolvedValue(undefined);
    
    goalsService = new CarbonGoalsService();
  });
  
  it('should be defined', () => {
    expect(goalsService).toBeDefined();
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
      
      // Act
      const result = await goalsService.createGoal(goalData);
      
      // Assert
      expect(mockCollection).toHaveBeenCalledWith(expect.anything(), 'carbonReductionGoals');
      expect(mockAddDoc).toHaveBeenCalledWith(expect.anything(), {
        ...goalData,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
      expect(result.id).toBe('mock-goal-id');
    });
  });
  
  describe('updateGoal', () => {
    it('should update an existing carbon reduction goal', async () => {
      // Arrange
      const goalId = 'goal123';
      const updateData = {
        name: 'Updated Goal',
        targetCarbonInKg: 700,
      };
      
      // Act
      await goalsService.updateGoal(goalId, updateData);
      
      // Assert
      expect(mockDoc).toHaveBeenCalledWith(expect.anything(), 'carbonReductionGoals', goalId);
      expect(mockUpdateDoc).toHaveBeenCalledWith(expect.anything(), {
        ...updateData,
        updatedAt: expect.any(Date),
      });
    });
  });
});
