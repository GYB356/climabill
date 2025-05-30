// Mock implementation of the DepartmentProjectService
import { Department, Project } from '../../../lib/carbon/models/department-project';

export class DepartmentProjectService {
  // Simple mock methods that can be overridden in tests
  createDepartment = jest.fn().mockResolvedValue({
    id: 'mock-dept-id',
    name: 'Mock Department',
    createdAt: new Date(),
    updatedAt: new Date()
  });

  getDepartments = jest.fn().mockResolvedValue([
    {
      id: 'dept-1',
      name: 'Engineering',
      description: 'Software engineering department',
      organizationId: 'mock-org-id',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);

  getDepartment = jest.fn().mockResolvedValue({
    id: 'mock-dept-id',
    name: 'Mock Department',
    description: 'Mock description',
    organizationId: 'mock-org-id',
    createdAt: new Date(),
    updatedAt: new Date()
  });

  updateDepartment = jest.fn().mockResolvedValue({
    id: 'mock-dept-id',
    name: 'Updated Department',
    description: 'Updated description',
    organizationId: 'mock-org-id',
    createdAt: new Date(),
    updatedAt: new Date()
  });

  deleteDepartment = jest.fn().mockResolvedValue(undefined);

  createProject = jest.fn().mockResolvedValue({
    id: 'mock-proj-id',
    name: 'Mock Project',
    description: 'Mock description',
    departmentId: 'mock-dept-id',
    organizationId: 'mock-org-id',
    createdAt: new Date(),
    updatedAt: new Date()
  });

  getProjects = jest.fn().mockResolvedValue([
    {
      id: 'proj-1',
      name: 'Project One',
      description: 'First project',
      departmentId: 'dept-1',
      organizationId: 'mock-org-id',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);

  getProject = jest.fn().mockResolvedValue({
    id: 'mock-proj-id',
    name: 'Mock Project',
    description: 'Mock description',
    departmentId: 'mock-dept-id',
    organizationId: 'mock-org-id',
    createdAt: new Date(),
    updatedAt: new Date()
  });

  updateProject = jest.fn().mockResolvedValue({
    id: 'mock-proj-id',
    name: 'Updated Project',
    description: 'Updated description',
    departmentId: 'mock-dept-id',
    organizationId: 'mock-org-id',
    createdAt: new Date(),
    updatedAt: new Date()
  });

  deleteProject = jest.fn().mockResolvedValue(undefined);
}

// Add prototype methods for component tests that use prototype mocking
DepartmentProjectService.prototype.createDepartment = jest.fn();
DepartmentProjectService.prototype.getDepartments = jest.fn();
DepartmentProjectService.prototype.getDepartment = jest.fn();
DepartmentProjectService.prototype.updateDepartment = jest.fn();
DepartmentProjectService.prototype.deleteDepartment = jest.fn();
DepartmentProjectService.prototype.createProject = jest.fn();
DepartmentProjectService.prototype.getProjects = jest.fn();
DepartmentProjectService.prototype.getProject = jest.fn();
DepartmentProjectService.prototype.updateProject = jest.fn();
DepartmentProjectService.prototype.deleteProject = jest.fn();
