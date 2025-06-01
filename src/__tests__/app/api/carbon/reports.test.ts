import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { expect, jest, describe, beforeEach, it } from '@jest/globals';
import { GET, POST, DELETE } from '../../../../app/api/carbon/reports/route';
import { SustainabilityReportingService } from '../../../../lib/carbon/sustainability-reporting-service';

// Mock next-auth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));

// Mock the SustainabilityReportingService
const mockSustainabilityReportingService = {
  getReports: jest.fn() as jest.MockedFunction<any>,
  getReport: jest.fn() as jest.MockedFunction<any>,
  generateReport: jest.fn() as jest.MockedFunction<any>,
  deleteReport: jest.fn() as jest.MockedFunction<any>,
  setStandardCompliance: jest.fn() as jest.MockedFunction<any>,
};

jest.mock('../../../../lib/carbon/sustainability-reporting-service', () => ({
  SustainabilityReportingService: jest.fn().mockImplementation(() => mockSustainabilityReportingService),
}));

// Mock the auth options
jest.mock('../../../../lib/auth', () => ({
  authOptions: {},
}));

describe('Carbon Reports API', () => {
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
  
  describe('GET /api/carbon/reports', () => {
    it('returns reports for the authenticated user', async () => {
      // Arrange
      const mockReports = [
        {
          id: 'report1',
          name: 'May 2025 Report',
          organizationId: 'user123',
          reportType: 'monthly',
          period: {
            startDate: new Date('2025-05-01'),
            endDate: new Date('2025-05-31')
          },
          totalCarbonInKg: 1000,
          offsetCarbonInKg: 300,
          remainingCarbonInKg: 700,
          offsetPercentage: 30,
          reductionFromPreviousPeriod: 200,
          reductionPercentage: 16.67,
          standards: [
            { name: 'GHG Protocol', compliant: true },
            { name: 'ISO 14064', compliant: false }
          ],
          reportUrl: 'https://example.com/report1.pdf',
          generatedAt: new Date('2025-06-01'),
          createdAt: new Date('2025-06-01'),
          updatedAt: new Date('2025-06-01'),
        },
        {
          id: 'report2',
          name: 'April 2025 Report',
          organizationId: 'user123',
          reportType: 'monthly',
          period: {
            startDate: new Date('2025-04-01'),
            endDate: new Date('2025-04-30')
          },
          totalCarbonInKg: 1200,
          offsetCarbonInKg: 200,
          remainingCarbonInKg: 1000,
          offsetPercentage: 16.67,
          standards: [
            { name: 'GHG Protocol', compliant: true }
          ],
          reportUrl: 'https://example.com/report2.pdf',
          generatedAt: new Date('2025-05-01'),
          createdAt: new Date('2025-05-01'),
          updatedAt: new Date('2025-05-01'),
        }
      ];
      
      mockSustainabilityReportingService.getReports.mockResolvedValue(mockReports);
      
      const req = new NextRequest('http://localhost:3000/api/carbon/reports');
      
      // Act
      const response = await GET(req);
      const data = await response.json();
      
      // Assert
      expect(response.status).toBe(200);
      expect(data).toEqual({ reports: mockReports });
      expect(mockSustainabilityReportingService.getReports).toHaveBeenCalledWith('user123', undefined, undefined, undefined, 20);
    });
    
    it('returns reports with filters applied', async () => {
      // Arrange
      const organizationId = 'org123';
      const departmentId = 'dept123';
      const projectId = 'proj123';
      const limit = 5;
      
      const mockReports = [
        {
          id: 'report1',
          name: 'May 2025 Report',
          organizationId,
          departmentId,
          projectId,
          reportType: 'monthly',
          period: {
            startDate: new Date('2025-05-01'),
            endDate: new Date('2025-05-31')
          },
          totalCarbonInKg: 1000,
          offsetCarbonInKg: 300,
          remainingCarbonInKg: 700,
          offsetPercentage: 30,
          reductionFromPreviousPeriod: 200,
          reductionPercentage: 16.67,
          standards: [],
          generatedAt: new Date('2025-06-01'),
          createdAt: new Date('2025-06-01'),
          updatedAt: new Date('2025-06-01'),
        }
      ];
      
      mockSustainabilityReportingService.getReports.mockResolvedValue(mockReports);
      
      const req = new NextRequest(
        `http://localhost:3000/api/carbon/reports?organizationId=${organizationId}&departmentId=${departmentId}&projectId=${projectId}&limit=${limit}`
      );
      
      // Act
      const response = await GET(req);
      const data = await response.json();
      
      // Assert
      expect(response.status).toBe(200);
      expect(data).toEqual({ reports: mockReports });
      expect(mockSustainabilityReportingService.getReports).toHaveBeenCalledWith(organizationId, undefined, departmentId, projectId, limit);
    });
    
    it('returns 401 when user is not authenticated', async () => {
      // Arrange
      mockGetServerSession.mockResolvedValue(null);
      
      const req = new NextRequest('http://localhost:3000/api/carbon/reports');
      
      // Act
      const response = await GET(req);
      const data = await response.json();
      
      // Assert
      expect(response.status).toBe(401);
      expect(data).toEqual({ error: 'Unauthorized' });
    });
  });
  
  describe('POST /api/carbon/reports', () => {
    it('generates a new sustainability report', async () => {
      // Arrange
      const reportData = {
        organizationId: 'user123',
        reportType: 'monthly',
        startDate: '2025-05-01T00:00:00.000Z',
        endDate: '2025-05-31T00:00:00.000Z',
        departmentId: 'dept123',
        projectId: 'proj123'
      };
      
      const createdReport = {
        id: 'new-report',
        name: 'May 2025 Report',
        organizationId: 'user123',
        departmentId: 'dept123',
        projectId: 'proj123',
        reportType: 'monthly',
        period: {
          startDate: new Date(reportData.startDate),
          endDate: new Date(reportData.endDate)
        },
        totalCarbonInKg: 1000,
        offsetCarbonInKg: 300,
        remainingCarbonInKg: 700,
        offsetPercentage: 30,
        reductionFromPreviousPeriod: 200,
        reductionPercentage: 16.67,
        standards: [
          { name: 'GHG Protocol', compliant: true }
        ],
        reportUrl: 'https://example.com/new-report.pdf',
        generatedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      mockSustainabilityReportingService.generateReport.mockResolvedValue(createdReport);
      
      const req = new NextRequest('http://localhost:3000/api/carbon/reports', {
        method: 'POST',
        body: JSON.stringify(reportData),
      });
      
      // Act
      const response = await POST(req);
      const data = await response.json();
      
      // Assert
      expect(response.status).toBe(201);
      expect(data).toEqual({ report: createdReport });
      expect(mockSustainabilityReportingService.generateReport).toHaveBeenCalledWith(
        reportData.organizationId,
        reportData.reportType,
        expect.any(Date),
        expect.any(Date),
        reportData.departmentId,
        reportData.projectId
      );
    });
    
    it('returns 400 when required fields are missing', async () => {
      // Arrange
      const reportData = {
        organizationId: 'user123',
        // Missing required fields
      };
      
      const req = new NextRequest('http://localhost:3000/api/carbon/reports', {
        method: 'POST',
        body: JSON.stringify(reportData),
      });
      
      // Act
      const response = await POST(req);
      const data = await response.json();
      
      // Assert
      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'Report type, start date, and end date are required' });
    });
    
    it('returns 401 when user is not authenticated', async () => {
      // Arrange
      mockGetServerSession.mockResolvedValue(null);
      
      const req = new NextRequest('http://localhost:3000/api/carbon/reports', {
        method: 'POST',
        body: JSON.stringify({
          organizationId: 'user123',
          reportType: 'monthly',
          startDate: '2025-05-01',
          endDate: '2025-05-31'
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
  
  describe('DELETE /api/carbon/reports/[id]', () => {
    it('deletes an existing report', async () => {
      // Arrange
      const reportId = 'report123';
      
      const existingReport = {
        id: reportId,
        name: 'Report to Delete',
        organizationId: 'user123',
        reportType: 'monthly',
        period: {
          startDate: new Date('2025-05-01'),
          endDate: new Date('2025-05-31')
        },
        totalCarbonInKg: 1000,
        offsetCarbonInKg: 300,
        remainingCarbonInKg: 700,
        offsetPercentage: 30,
        standards: [],
        generatedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      mockSustainabilityReportingService.getReport.mockResolvedValue(existingReport);
      mockSustainabilityReportingService.deleteReport.mockResolvedValue(undefined);
      
      const req = new NextRequest('http://localhost:3000/api/carbon/reports', {
        method: 'DELETE',
      });
      
      // Mock params
      const params = { id: reportId };
      
      // Act
      const response = await DELETE(req, { params });
      const data = await response.json();
      
      // Assert
      expect(response.status).toBe(200);
      expect(data).toEqual({ success: true });
      expect(mockSustainabilityReportingService.deleteReport).toHaveBeenCalledWith(reportId);
    });
    
    it('returns 404 when report is not found', async () => {
      // Arrange
      const reportId = 'nonexistent';
      
      mockSustainabilityReportingService.getReport.mockResolvedValue(null);
      
      const req = new NextRequest('http://localhost:3000/api/carbon/reports', {
        method: 'DELETE',
      });
      
      // Mock params
      const params = { id: reportId };
      
      // Act
      const response = await DELETE(req, { params });
      const data = await response.json();
      
      // Assert
      expect(response.status).toBe(404);
      expect(data).toEqual({ error: 'Report not found' });
    });
    
    it('returns 403 when user is not authorized to delete the report', async () => {
      // Arrange
      const reportId = 'report123';
      
      const existingReport = {
        id: reportId,
        name: 'Report to Delete',
        organizationId: 'other-user',
        reportType: 'monthly',
        period: {
          startDate: new Date('2025-05-01'),
          endDate: new Date('2025-05-31')
        },
        totalCarbonInKg: 1000,
        offsetCarbonInKg: 300,
        remainingCarbonInKg: 700,
        offsetPercentage: 30,
        standards: [],
        generatedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      mockSustainabilityReportingService.getReport.mockResolvedValue(existingReport);
      
      const req = new NextRequest('http://localhost:3000/api/carbon/reports', {
        method: 'DELETE',
      });
      
      // Mock params
      const params = { id: reportId };
      
      // Act
      const response = await DELETE(req, { params });
      const data = await response.json();
      
      // Assert
      expect(response.status).toBe(403);
      expect(data).toEqual({ error: 'Unauthorized to delete this report' });
    });
  });
});
