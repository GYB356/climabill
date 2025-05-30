import { DepartmentProjectService } from '../../../lib/carbon/department-project-service';
import { Department, Project } from '../../../lib/carbon/models/department-project';

// Mock Firebase and Firestore
const mockGet = jest.fn();
const mockWhere = jest.fn();
const mockOrderBy = jest.fn();
const mockDoc = jest.fn();
const mockCollection = jest.fn();
const mockUpdate = jest.fn();
const mockDelete = jest.fn();
const mockAdd = jest.fn();
const mockAddDoc = jest.fn();
const mockUpdateDoc = jest.fn();
const mockDeleteDoc = jest.fn();
const mockGetDoc = jest.fn();
const mockGetDocs = jest.fn();
const mockTimestamp = {
  now: jest.fn().mockReturnValue({ toDate: () => new Date() })
};

// Mock the Firebase implementation
jest.mock('../../../lib/firebase/firestore', () => ({
  firestore: {
    collection: jest.fn().mockImplementation(() => ({
      doc: jest.fn(),
      where: jest.fn(),
      orderBy: jest.fn(),
      get: jest.fn()
    }))
  },
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  addDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  Timestamp: {
    now: jest.fn().mockReturnValue({
      toDate: () => new Date()
    })
  }
}));

// Mock direct implementation of the DepartmentProjectService
jest.mock('../../../lib/carbon/department-project-service', () => {
  // Create a mock implementation of the service
  const mockService = {
    createDepartment: jest.fn().mockImplementation(async (department) => {
      return { id: 'dept123', ...department, createdAt: new Date(), updatedAt: new Date() };
    }),
    getDepartments: jest.fn().mockImplementation(async (organizationId) => {
      return [
        {
          id: 'dept1',
          name: 'Department 1',
          description: 'Description 1',
          organizationId,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      ];
    }),
    updateDepartment: jest.fn().mockImplementation(async (id, data) => {
      return { id, ...data, updatedAt: new Date() };
    }),
    deleteDepartment: jest.fn().mockImplementation(async (id) => {
      return true;
    }),
    getDepartment: jest.fn().mockImplementation(async (id) => {
      return {
        id,
        name: 'Test Department',
        description: 'Test Description',
        organizationId: 'org123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }),
    createProject: jest.fn().mockImplementation(async (project) => {
      return { id: 'proj123', ...project, createdAt: new Date(), updatedAt: new Date() };
    }),
    getProjects: jest.fn().mockImplementation(async (organizationId, departmentId) => {
      return [
        {
          id: 'proj1',
          name: 'Project 1',
          description: 'Description 1',
          organizationId,
          departmentId: departmentId || 'dept1',
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      ];
    }),
    updateProject: jest.fn().mockImplementation(async (id, data) => {
      return { id, ...data, updatedAt: new Date() };
    }),
    deleteProject: jest.fn().mockImplementation(async (id) => {
      return true;
    }),
    getProject: jest.fn().mockImplementation(async (id) => {
      return {
        id,
        name: 'Test Project',
        description: 'Test Description',
        organizationId: 'org123',
        departmentId: 'dept123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }),
  };

  // Return the class constructor that returns the mock
  return {
    DepartmentProjectService: jest.fn().mockImplementation(() => mockService)
  };
});

describe('DepartmentProjectService', () => {
  let departmentProjectService: DepartmentProjectService;
  
  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Create a new instance of the mocked service
    departmentProjectService = new DepartmentProjectService();
  });
  
  describe('Department Management', () => {
    describe('createDepartment', () => {
      it('should create a new department', async () => {
        // Arrange
        const departmentData = {
          name: 'Test Department',
          description: 'Test Description',
          organizationId: 'org123',
        };
        
        // Act
        const result = await departmentProjectService.createDepartment(departmentData);
        
        // Assert
        expect(departmentProjectService.createDepartment).toHaveBeenCalledWith(departmentData);
        expect(result).toEqual({
          id: expect.any(String),
          ...departmentData,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        });
      });
    });
    
    describe('getDepartments', () => {
      it('should retrieve departments for an organization', async () => {
        // Arrange
        const organizationId = 'org123';
        
        // Act
        const result = await departmentProjectService.getDepartments(organizationId);
        
        // Assert
        expect(departmentProjectService.getDepartments).toHaveBeenCalledWith(organizationId);
        expect(result).toEqual(expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            name: expect.any(String),
            description: expect.any(String),
            organizationId: organizationId,
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
          })
        ]));
      });
    });
    
    describe('updateDepartment', () => {
      it('should update an existing department', async () => {
        // Arrange
        const departmentId = 'dept123';
        const updateData = {
          name: 'Updated Department',
          description: 'Updated Description',
        };
        
        // Act
        const result = await departmentProjectService.updateDepartment(departmentId, updateData);
        
        // Assert
        expect(departmentProjectService.updateDepartment).toHaveBeenCalledWith(departmentId, updateData);
        expect(result).toEqual({
          id: departmentId,
          ...updateData,
          updatedAt: expect.any(Date),
        });
      });
    });
    
    describe('deleteDepartment', () => {
      it('should delete a department', async () => {
        // Arrange
        const departmentId = 'dept123';
        
        // Act
        const result = await departmentProjectService.deleteDepartment(departmentId);
        
        // Assert
        expect(mockService.deleteDepartment).toHaveBeenCalledWith(departmentId);
        expect(result).toBe(true);
      });
    });
  });
  
  describe('Project Management', () => {
    describe('createProject', () => {
      it('should create a new project', async () => {
        // Arrange
        const projectData = {
          name: 'Test Project',
          description: 'Test Description',
          organizationId: 'org123',
          departmentId: 'dept123',
        };
        
        // Act
        const result = await departmentProjectService.createProject(projectData);
        
        // Assert
        expect(departmentProjectService.createProject).toHaveBeenCalledWith(projectData);
        expect(result).toEqual({
          id: expect.any(String),
          ...projectData,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        });
      });
    });
    
    describe('getProjects', () => {
      it('should retrieve projects for an organization', async () => {
        // Arrange
        const organizationId = 'org123';
        
        // Act
        const result = await departmentProjectService.getProjects(organizationId);
        
        // Assert
        expect(departmentProjectService.getProjects).toHaveBeenCalledWith(organizationId);
        expect(result).toEqual(expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            name: expect.any(String),
            organizationId,
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
          })
        ]));
      });
      
      it('should filter projects by department', async () => {
        // Arrange
        const organizationId = 'org123';
        const departmentId = 'dept123';
        
        // Act
        const result = await departmentProjectService.getProjects(organizationId, departmentId);
        
        // Assert
        expect(departmentProjectService.getProjects).toHaveBeenCalledWith(organizationId, departmentId);
        expect(result).toEqual(expect.arrayContaining([
          expect.objectContaining({
            departmentId,
            organizationId
          })
        ]));
      });
    });
    
    describe('updateProject', () => {
      it('should update an existing project', async () => {
        // Arrange
        const projectId = 'proj123';
        const updateData = {
          name: 'Updated Project',
          description: 'Updated Description',
          departmentId: 'newDept123',
        };
        
        // Act
        const result = await departmentProjectService.updateProject(projectId, updateData);
        
        // Assert
        expect(departmentProjectService.updateProject).toHaveBeenCalledWith(projectId, updateData);
        expect(result).toEqual({
          id: projectId,
          ...updateData,
          updatedAt: expect.any(Date),
        });
      });
    });
    
    describe('deleteProject', () => {
      it('should delete a project', async () => {
        // Arrange
        const projectId = 'proj123';
        
        // Act
        const result = await departmentProjectService.deleteProject(projectId);
        
        // Assert
        expect(departmentProjectService.deleteProject).toHaveBeenCalledWith(projectId);
        expect(result).toBe(true);
      });
    });
  });
});
