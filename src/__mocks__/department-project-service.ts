// Mock implementation of the DepartmentProjectService
import { Department, Project } from '../lib/carbon/types';
import { db } from '../lib/firebase/firestore';

// Mock Firestore response data
const mockDepartments = [
  {
    id: 'dept-1',
    name: 'Operations',
    description: 'Operations department',
    organizationId: 'org123',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: 'dept-2',
    name: 'Marketing',
    description: 'Marketing department',
    organizationId: 'org123',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20'),
  },
];

const mockProjects = [
  {
    id: 'proj-1',
    name: 'Website Redesign',
    description: 'Redesign company website',
    departmentId: 'dept-2',
    organizationId: 'org123',
    startDate: new Date('2024-02-01'),
    endDate: new Date('2024-05-01'),
    status: 'in-progress',
    createdAt: new Date('2024-01-25'),
    updatedAt: new Date('2024-01-25'),
  },
  {
    id: 'proj-2',
    name: 'Supply Chain Optimization',
    description: 'Optimize supply chain operations',
    departmentId: 'dept-1',
    organizationId: 'org123',
    startDate: new Date('2024-03-01'),
    endDate: new Date('2024-08-01'),
    status: 'planning',
    createdAt: new Date('2024-02-15'),
    updatedAt: new Date('2024-02-15'),
  },
];

// Create instance methods that use Firestore interface
const createDepartmentImpl = jest.fn().mockImplementation((departmentData) => {
  const id = `dept-${Math.random().toString(36).substring(2, 9)}`;
  const now = new Date();
  const newDept = {
    id,
    ...departmentData,
    createdAt: now,
    updatedAt: now,
  };
  
  // Mock the Firestore interaction
  const collection = db.collection('departments');
  const add = collection.add(newDept);
  
  return Promise.resolve(newDept);
});

const getDepartmentsImpl = jest.fn().mockImplementation((organizationId) => {
  // Mock the Firestore interaction
  const collection = db.collection('departments');
  const where = collection.where('organizationId', '==', organizationId);
  const orderBy = where.orderBy('name', 'asc');
  
  return Promise.resolve(mockDepartments);
});

const getDepartmentImpl = jest.fn().mockImplementation((departmentId) => {
  // Mock the Firestore interaction
  const collection = db.collection('departments');
  const doc = collection.doc(departmentId);
  
  const department = mockDepartments.find(dept => dept.id === departmentId);
  return Promise.resolve(department || null);
});

const updateDepartmentImpl = jest.fn().mockImplementation((departmentId, updateData) => {
  const now = new Date();
  const updatedDept = {
    id: departmentId,
    ...updateData,
    updatedAt: now,
  };
  
  // Mock the Firestore interaction
  const collection = db.collection('departments');
  const doc = collection.doc(departmentId);
  const update = doc.update({
    ...updateData,
    updatedAt: now,
  });
  
  return Promise.resolve(updatedDept);
});

const deleteDepartmentImpl = jest.fn().mockImplementation((departmentId) => {
  // Mock the Firestore interaction
  const collection = db.collection('departments');
  const doc = collection.doc(departmentId);
  const deleteOp = doc.delete();
  
  return Promise.resolve(undefined);
});

const createProjectImpl = jest.fn().mockImplementation((projectData) => {
  const id = `proj-${Math.random().toString(36).substring(2, 9)}`;
  const now = new Date();
  const newProject = {
    id,
    ...projectData,
    createdAt: now,
    updatedAt: now,
  };
  
  // Mock the Firestore interaction
  const collection = db.collection('projects');
  const add = collection.add(newProject);
  
  return Promise.resolve(newProject);
});

const getProjectsImpl = jest.fn().mockImplementation((organizationId, departmentId) => {
  // Mock the Firestore interaction
  const collection = db.collection('projects');
  const where = collection.where('organizationId', '==', organizationId);
  
  // If department ID is provided, filter by it
  if (departmentId) {
    const whereDeprt = where.where('departmentId', '==', departmentId);
    const orderBy = whereDeprt.orderBy('name', 'asc');
    return Promise.resolve(mockProjects.filter(project => project.departmentId === departmentId));
  }
  
  const orderBy = where.orderBy('name', 'asc');
  return Promise.resolve(mockProjects);
});

const updateProjectImpl = jest.fn().mockImplementation((projectId, updateData) => {
  const now = new Date();
  const updatedProject = {
    id: projectId,
    ...updateData,
    updatedAt: now,
  };
  
  // Mock the Firestore interaction
  const collection = db.collection('projects');
  const doc = collection.doc(projectId);
  const update = doc.update({
    ...updateData,
    updatedAt: now,
  });
  
  return Promise.resolve(updatedProject);
});

const deleteProjectImpl = jest.fn().mockImplementation((projectId) => {
  // Mock the Firestore interaction
  const collection = db.collection('projects');
  const doc = collection.doc(projectId);
  const deleteOp = doc.delete();
  
  return Promise.resolve(undefined);
});

// Create class with instance methods
export class DepartmentProjectService {
  // Department management methods
  createDepartment = createDepartmentImpl;
  getDepartment = getDepartmentImpl;
  getDepartments = getDepartmentsImpl;
  updateDepartment = updateDepartmentImpl;
  deleteDepartment = deleteDepartmentImpl;

  // Project management methods
  createProject = createProjectImpl;
  getProjects = getProjectsImpl;
  updateProject = updateProjectImpl;
  deleteProject = deleteProjectImpl;
}

// Add prototype methods for component tests that use prototype mocking
DepartmentProjectService.prototype.createDepartment = createDepartmentImpl;
DepartmentProjectService.prototype.getDepartment = getDepartmentImpl;
DepartmentProjectService.prototype.getDepartments = getDepartmentsImpl;
DepartmentProjectService.prototype.updateDepartment = updateDepartmentImpl;
DepartmentProjectService.prototype.deleteDepartment = deleteDepartmentImpl;
DepartmentProjectService.prototype.createProject = createProjectImpl;
DepartmentProjectService.prototype.getProjects = getProjectsImpl;
DepartmentProjectService.prototype.updateProject = updateProjectImpl;
DepartmentProjectService.prototype.deleteProject = deleteProjectImpl;
