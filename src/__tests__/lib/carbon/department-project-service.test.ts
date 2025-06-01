import { expect, jest, describe, beforeEach, it } from '@jest/globals';
import { DepartmentProjectService } from '../../../lib/carbon/department-project-service';
import { Department, Project } from '../../../lib/carbon/models/department-project';

// Mock Firebase
const mockCollection = jest.fn();
const mockDoc = jest.fn();
const mockAdd = jest.fn();
const mockGet = jest.fn();
const mockUpdate = jest.fn();
const mockDelete = jest.fn();
const mockWhere = jest.fn();
const mockOrderBy = jest.fn();
const mockQuery = jest.fn();

jest.mock('../../../lib/firebase/config', () => ({
  firestore: {
    collection: mockCollection,
    doc: mockDoc,
  },
}));

jest.mock('firebase/firestore', () => ({
  collection: mockCollection,
  doc: mockDoc,
  addDoc: mockAdd,
  updateDoc: mockUpdate,
  deleteDoc: mockDelete,
  getDocs: mockGet,
  query: mockQuery,
  where: mockWhere,
  orderBy: mockOrderBy,
  Timestamp: {
    now: jest.fn().mockReturnValue({
      toDate: () => new Date(),
      seconds: Math.floor(Date.now() / 1000),
      nanoseconds: 0,
    }),
  },
}));

describe('DepartmentProjectService', () => {
  let departmentProjectService: DepartmentProjectService;
  
  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Setup service
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
        
        const mockDepartmentId = 'dept123';
        mockAdd.mockResolvedValue({ id: mockDepartmentId });
        
        // Act
        const result = await departmentProjectService.createDepartment(departmentData);
        
        // Assert
        expect(mockCollection).toHaveBeenCalledWith(expect.anything(), 'departments');
        expect(mockAdd).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
          ...departmentData,
          createdAt: expect.any(Object),
          updatedAt: expect.any(Object),
        }));
        expect(result).toEqual({
          id: mockDepartmentId,
          ...departmentData,
          createdAt: expect.any(Object),
          updatedAt: expect.any(Object),
        });
      });
    });
    
    describe('getDepartments', () => {
      it('should retrieve departments for an organization', async () => {
        // Arrange
        const organizationId = 'org123';
        const mockDepartments = [
          {
            id: 'dept1',
            name: 'Department 1',
            description: 'Description 1',
            organizationId,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: 'dept2',
            name: 'Department 2',
            description: 'Description 2',
            organizationId,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ];
        
        const mockDocs = mockDepartments.map(dept => ({
          id: dept.id,
          data: () => dept,
        }));
        
        const mockGet = jest.fn().mockResolvedValue({ docs: mockDocs });
        const mockWhere = jest.fn().mockReturnThis();
        const mockOrderBy = jest.fn().mockReturnThis();
        const mockCollection = jest.fn().mockReturnValue({
          where: mockWhere,
          orderBy: mockOrderBy,
          get: mockGet,
        });
        
        (departmentProjectService as any).db = {
          collection: mockCollection,
        };
        
        // Act
        const result = await departmentProjectService.getDepartments(organizationId);
        
        // Assert
        expect(mockCollection).toHaveBeenCalledWith('departments');
        expect(mockWhere).toHaveBeenCalledWith('organizationId', '==', organizationId);
        expect(mockOrderBy).toHaveBeenCalledWith('name', 'asc');
        expect(result).toEqual(mockDepartments);
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
        
        const mockUpdate = jest.fn().mockResolvedValue({});
        const mockDoc = jest.fn().mockReturnValue({ update: mockUpdate });
        const mockCollection = jest.fn().mockReturnValue({ doc: mockDoc });
        
        (departmentProjectService as any).db = {
          collection: mockCollection,
        };
        
        // Mock the getDepartment method
        const existingDepartment = {
          id: departmentId,
          name: 'Test Department',
          description: 'Test Description',
          organizationId: 'org123',
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        departmentProjectService.getDepartment = jest.fn().mockResolvedValue(existingDepartment);
        
        // Act
        const result = await departmentProjectService.updateDepartment(departmentId, updateData);
        
        // Assert
        expect(mockCollection).toHaveBeenCalledWith('departments');
        expect(mockDoc).toHaveBeenCalledWith(departmentId);
        expect(mockUpdate).toHaveBeenCalledWith({
          ...updateData,
          updatedAt: expect.any(Date),
        });
        expect(result).toEqual({
          ...existingDepartment,
          ...updateData,
          updatedAt: expect.any(Date),
        });
      });
    });
    
    describe('deleteDepartment', () => {
      it('should delete a department and its associated projects', async () => {
        // Arrange
        const departmentId = 'dept123';
        
        // Mock department deletion
        const mockDelete = jest.fn().mockResolvedValue({});
        const mockDoc = jest.fn().mockReturnValue({ delete: mockDelete });
        
        // Mock projects query
        const mockProjects = [
          { id: 'proj1', departmentId },
          { id: 'proj2', departmentId },
        ];
        
        const mockProjectDocs = mockProjects.map(proj => ({
          id: proj.id,
          data: () => proj,
        }));
        
        const mockProjectsGet = jest.fn().mockResolvedValue({ docs: mockProjectDocs });
        const mockProjectsWhere = jest.fn().mockReturnThis();
        
        // Mock project deletion
        const mockProjectDelete = jest.fn().mockResolvedValue({});
        const mockProjectDoc = jest.fn().mockReturnValue({ delete: mockProjectDelete });
        
        const mockCollection = jest.fn().mockImplementation((collectionName) => {
          if (collectionName === 'departments') {
            return { doc: mockDoc };
          } else if (collectionName === 'projects') {
            return {
              where: mockProjectsWhere,
              get: mockProjectsGet,
              doc: mockProjectDoc,
            };
          }
        });
        
        (departmentProjectService as any).db = {
          collection: mockCollection,
        };
        
        // Act
        await departmentProjectService.deleteDepartment(departmentId);
        
        // Assert
        expect(mockCollection).toHaveBeenCalledWith('departments');
        expect(mockDoc).toHaveBeenCalledWith(departmentId);
        expect(mockDelete).toHaveBeenCalled();
        
        expect(mockCollection).toHaveBeenCalledWith('projects');
        expect(mockProjectsWhere).toHaveBeenCalledWith('departmentId', '==', departmentId);
        expect(mockProjectsGet).toHaveBeenCalled();
        
        expect(mockProjectDoc).toHaveBeenCalledWith('proj1');
        expect(mockProjectDoc).toHaveBeenCalledWith('proj2');
        expect(mockProjectDelete).toHaveBeenCalledTimes(2);
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
          status: 'active' as const,
          startDate: new Date('2025-01-01'),
        };
        
        const mockProjectId = 'proj123';
        const mockAdd = jest.fn().mockResolvedValue({ id: mockProjectId });
        const mockCollection = jest.fn().mockReturnValue({ add: mockAdd });
        
        (departmentProjectService as any).db = {
          collection: mockCollection,
        };
        
        // Act
        const result = await departmentProjectService.createProject(projectData);
        
        // Assert
        expect(mockCollection).toHaveBeenCalledWith('projects');
        expect(mockAdd).toHaveBeenCalledWith({
          ...projectData,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        });
        expect(result).toEqual({
          id: mockProjectId,
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
        const mockProjects = [
          {
            id: 'proj1',
            name: 'Project 1',
            description: 'Description 1',
            organizationId,
            departmentId: 'dept1',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: 'proj2',
            name: 'Project 2',
            description: 'Description 2',
            organizationId,
            departmentId: 'dept2',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ];
        
        const mockDocs = mockProjects.map(proj => ({
          id: proj.id,
          data: () => proj,
        }));
        
        const mockGet = jest.fn().mockResolvedValue({ docs: mockDocs });
        const mockWhere = jest.fn().mockReturnThis();
        const mockOrderBy = jest.fn().mockReturnThis();
        const mockCollection = jest.fn().mockReturnValue({
          where: mockWhere,
          orderBy: mockOrderBy,
          get: mockGet,
        });
        
        (departmentProjectService as any).db = {
          collection: mockCollection,
        };
        
        // Act
        const result = await departmentProjectService.getProjects(organizationId);
        
        // Assert
        expect(mockCollection).toHaveBeenCalledWith('projects');
        expect(mockWhere).toHaveBeenCalledWith('organizationId', '==', organizationId);
        expect(mockOrderBy).toHaveBeenCalledWith('name', 'asc');
        expect(result).toEqual(mockProjects);
      });
      
      it('should filter projects by department', async () => {
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
        
        (departmentProjectService as any).db = {
          collection: mockCollection,
        };
        
        // Act
        await departmentProjectService.getProjects(organizationId, departmentId);
        
        // Assert
        expect(mockWhere).toHaveBeenCalledWith('organizationId', '==', organizationId);
        expect(mockWhere).toHaveBeenCalledWith('departmentId', '==', departmentId);
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
        
        const mockUpdate = jest.fn().mockResolvedValue({});
        const mockDoc = jest.fn().mockReturnValue({ update: mockUpdate });
        const mockCollection = jest.fn().mockReturnValue({ doc: mockDoc });
        
        (departmentProjectService as any).db = {
          collection: mockCollection,
        };
        
        // Mock the getProject method
        const existingProject = {
          id: projectId,
          name: 'Test Project',
          description: 'Test Description',
          organizationId: 'org123',
          departmentId: 'dept123',
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        departmentProjectService.getProject = jest.fn().mockResolvedValue(existingProject);
        
        // Act
        const result = await departmentProjectService.updateProject(projectId, updateData);
        
        // Assert
        expect(mockCollection).toHaveBeenCalledWith('projects');
        expect(mockDoc).toHaveBeenCalledWith(projectId);
        expect(mockUpdate).toHaveBeenCalledWith({
          ...updateData,
          updatedAt: expect.any(Date),
        });
        expect(result).toEqual({
          ...existingProject,
          ...updateData,
          updatedAt: expect.any(Date),
        });
      });
    });
    
    describe('deleteProject', () => {
      it('should delete a project', async () => {
        // Arrange
        const projectId = 'proj123';
        
        const mockDelete = jest.fn().mockResolvedValue({});
        const mockDoc = jest.fn().mockReturnValue({ delete: mockDelete });
        const mockCollection = jest.fn().mockReturnValue({ doc: mockDoc });
        
        (departmentProjectService as any).db = {
          collection: mockCollection,
        };
        
        // Act
        await departmentProjectService.deleteProject(projectId);
        
        // Assert
        expect(mockCollection).toHaveBeenCalledWith('projects');
        expect(mockDoc).toHaveBeenCalledWith(projectId);
        expect(mockDelete).toHaveBeenCalled();
      });
    });
  });
});
