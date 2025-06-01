import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { expect, jest, describe, beforeEach, it } from '@jest/globals';
import { GET, POST, PUT, DELETE } from '../../../../app/api/carbon/departments/route';
import { DepartmentProjectService } from '../../../../lib/carbon/department-project-service';

// Mock next-auth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));

// Mock the DepartmentProjectService
jest.mock('../../../../lib/carbon/department-project-service');

// Mock the auth options
jest.mock('../../../../lib/auth', () => ({
  authOptions: {},
}));

describe('Departments API', () => {
  const mockDepartmentService = DepartmentProjectService as jest.MockedClass<typeof DepartmentProjectService>;
  const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
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
  
  describe('GET /api/carbon/departments', () => {
    it('returns departments for the authenticated user', async () => {
      // Arrange
      const mockDepartments = [
        {
          id: 'dept1',
          name: 'Department 1',
          description: 'Description 1',
          organizationId: 'user123',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'dept2',
          name: 'Department 2',
          description: 'Description 2',
          organizationId: 'user123',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      
      mockDepartmentService.prototype.getDepartments.mockResolvedValue(mockDepartments);
      
      const req = new NextRequest('http://localhost:3000/api/carbon/departments');
      
      // Act
      const response = await GET(req);
      const data = await response.json();
      
      // Assert
      expect(response.status).toBe(200);
      expect(data).toEqual({ departments: mockDepartments });
      expect(mockDepartmentService.prototype.getDepartments).toHaveBeenCalledWith('user123');
    });
    
    it('returns departments for a specific organization', async () => {
      // Arrange
      const organizationId = 'org123';        const mockDepartments = [
        {
          id: 'dept1',
          name: 'Department 1',
          description: 'Description 1',
          organizationId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      
      mockDepartmentService.prototype.getDepartments.mockResolvedValue(mockDepartments);
      
      const req = new NextRequest(`http://localhost:3000/api/carbon/departments?organizationId=${organizationId}`);
      
      // Act
      const response = await GET(req);
      const data = await response.json();
      
      // Assert
      expect(response.status).toBe(200);
      expect(data).toEqual({ departments: mockDepartments });
      expect(mockDepartmentService.prototype.getDepartments).toHaveBeenCalledWith(organizationId);
    });
    
    it('returns 401 when user is not authenticated', async () => {
      // Arrange
      mockGetServerSession.mockResolvedValue(null);
      
      const req = new NextRequest('http://localhost:3000/api/carbon/departments');
      
      // Act
      const response = await GET(req);
      const data = await response.json();
      
      // Assert
      expect(response.status).toBe(401);
      expect(data).toEqual({ error: 'Unauthorized' });
    });
  });
  
  describe('POST /api/carbon/departments', () => {
    it('creates a new department', async () => {
      // Arrange
      const departmentData = {
        name: 'New Department',
        description: 'New Description',
        organizationId: 'user123',
      };
      
      const createdDepartment = {
        id: 'new-dept',
        ...departmentData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      mockDepartmentService.prototype.createDepartment.mockResolvedValue(createdDepartment);
      
      const req = new NextRequest('http://localhost:3000/api/carbon/departments', {
        method: 'POST',
        body: JSON.stringify(departmentData),
      });
      
      // Act
      const response = await POST(req);
      const data = await response.json();
      
      // Assert
      expect(response.status).toBe(201);
      expect(data).toEqual({ department: createdDepartment });
      expect(mockDepartmentService.prototype.createDepartment).toHaveBeenCalledWith(departmentData);
    });
    
    it('returns 400 when department name is missing', async () => {
      // Arrange
      const departmentData = {
        description: 'New Description',
        organizationId: 'user123',
      };
      
      const req = new NextRequest('http://localhost:3000/api/carbon/departments', {
        method: 'POST',
        body: JSON.stringify(departmentData),
      });
      
      // Act
      const response = await POST(req);
      const data = await response.json();
      
      // Assert
      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'Department name is required' });
    });
    
    it('returns 401 when user is not authenticated', async () => {
      // Arrange
      mockGetServerSession.mockResolvedValue(null);
      
      const req = new NextRequest('http://localhost:3000/api/carbon/departments', {
        method: 'POST',
        body: JSON.stringify({ name: 'New Department' }),
      });
      
      // Act
      const response = await POST(req);
      const data = await response.json();
      
      // Assert
      expect(response.status).toBe(401);
      expect(data).toEqual({ error: 'Unauthorized' });
    });
  });
  
  describe('PUT /api/carbon/departments', () => {
    it('updates an existing department', async () => {
      // Arrange
      const departmentId = 'dept123';
      const updateData = {
        id: departmentId,
        name: 'Updated Department',
        description: 'Updated Description',
      };
      
      const existingDepartment = {
        id: departmentId,
        name: 'Original Department',
        description: 'Original Description',
        organizationId: 'user123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      const updatedDepartment = {
        ...existingDepartment,
        name: updateData.name,
        description: updateData.description,
        updatedAt: new Date(),
      };
      
      mockDepartmentService.prototype.getDepartment.mockResolvedValue(existingDepartment);
      mockDepartmentService.prototype.updateDepartment.mockResolvedValue(updatedDepartment);
      
      const req = new NextRequest('http://localhost:3000/api/carbon/departments', {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });
      
      // Act
      const response = await PUT(req);
      const data = await response.json();
      
      // Assert
      expect(response.status).toBe(200);
      expect(data).toEqual({ department: updatedDepartment });
      expect(mockDepartmentService.prototype.updateDepartment).toHaveBeenCalledWith(
        departmentId,
        {
          name: updateData.name,
          description: updateData.description,
        }
      );
    });
    
    it('returns 400 when department ID or name is missing', async () => {
      // Arrange
      const updateData = {
        description: 'Updated Description',
      };
      
      const req = new NextRequest('http://localhost:3000/api/carbon/departments', {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });
      
      // Act
      const response = await PUT(req);
      const data = await response.json();
      
      // Assert
      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'Department ID and name are required' });
    });
    
    it('returns 404 when department is not found', async () => {
      // Arrange
      const departmentId = 'nonexistent';
      const updateData = {
        id: departmentId,
        name: 'Updated Department',
        description: 'Updated Description',
      };
      
      mockDepartmentService.prototype.getDepartment.mockResolvedValue(null);
      
      const req = new NextRequest('http://localhost:3000/api/carbon/departments', {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });
      
      // Act
      const response = await PUT(req);
      const data = await response.json();
      
      // Assert
      expect(response.status).toBe(404);
      expect(data).toEqual({ error: 'Department not found' });
    });
    
    it('returns 403 when user is not authorized to update the department', async () => {
      // Arrange
      const departmentId = 'dept123';
      const updateData = {
        id: departmentId,
        name: 'Updated Department',
        description: 'Updated Description',
      };
      
      const existingDepartment = {
        id: departmentId,
        name: 'Original Department',
        description: 'Original Description',
        organizationId: 'different-org',  // Different organization ID
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      mockDepartmentService.prototype.getDepartment.mockResolvedValue(existingDepartment);
      
      const req = new NextRequest('http://localhost:3000/api/carbon/departments', {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });
      
      // Act
      const response = await PUT(req);
      const data = await response.json();
      
      // Assert
      expect(response.status).toBe(403);
      expect(data).toEqual({ error: 'Unauthorized to update this department' });
    });
  });
  
  describe('DELETE /api/carbon/departments', () => {
    it('deletes an existing department', async () => {
      // Arrange
      const departmentId = 'dept123';
      
      const existingDepartment = {
        id: departmentId,
        name: 'Department to Delete',
        organizationId: 'user123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      mockDepartmentService.prototype.getDepartment.mockResolvedValue(existingDepartment);
      mockDepartmentService.prototype.deleteDepartment.mockResolvedValue(true);
      
      const req = new NextRequest(`http://localhost:3000/api/carbon/departments?id=${departmentId}`, {
        method: 'DELETE',
      });
      
      // Act
      const response = await DELETE(req);
      const data = await response.json();
      
      // Assert
      expect(response.status).toBe(200);
      expect(data).toEqual({ success: true });
      expect(mockDepartmentService.prototype.deleteDepartment).toHaveBeenCalledWith(departmentId);
    });
    
    it('returns 400 when department ID is missing', async () => {
      // Arrange
      const req = new NextRequest('http://localhost:3000/api/carbon/departments', {
        method: 'DELETE',
      });
      
      // Act
      const response = await DELETE(req);
      const data = await response.json();
      
      // Assert
      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'Department ID is required' });
    });
    
    it('returns 404 when department is not found', async () => {
      // Arrange
      const departmentId = 'nonexistent';
      
      mockDepartmentService.prototype.getDepartment.mockResolvedValue(null);
      
      const req = new NextRequest(`http://localhost:3000/api/carbon/departments?id=${departmentId}`, {
        method: 'DELETE',
      });
      
      // Act
      const response = await DELETE(req);
      const data = await response.json();
      
      // Assert
      expect(response.status).toBe(404);
      expect(data).toEqual({ error: 'Department not found' });
    });
    
    it('returns 403 when user is not authorized to delete the department', async () => {
      // Arrange
      const departmentId = 'dept123';
      
      const existingDepartment = {
        id: departmentId,
        name: 'Department to Delete',
        organizationId: 'other-user',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      mockDepartmentService.prototype.getDepartment.mockResolvedValue(existingDepartment);
      
      const req = new NextRequest(`http://localhost:3000/api/carbon/departments?id=${departmentId}`, {
        method: 'DELETE',
      });
      
      // Act
      const response = await DELETE(req);
      const data = await response.json();
      
      // Assert
      expect(response.status).toBe(403);
      expect(data).toEqual({ error: 'Unauthorized to delete this department' });
    });
  });
});
