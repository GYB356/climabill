import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { GET, POST, DELETE } from '../../../../app/api/carbon/standards/route';
import { SustainabilityReportingService } from '../../../../lib/carbon/sustainability-reporting-service';
import { CarbonAccountingStandard } from '../../../../lib/carbon/models/department-project';

// Mock next-auth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));

// Mock the SustainabilityReportingService
jest.mock('../../../../lib/carbon/sustainability-reporting-service');

// Mock the auth options
jest.mock('../../../../lib/auth', () => ({
  authOptions: {},
}));

describe('Carbon Standards API', () => {
  const mockReportingService = SustainabilityReportingService as jest.MockedClass<typeof SustainabilityReportingService>;
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
  
  describe('GET /api/carbon/standards', () => {
    it('returns standards compliance for the authenticated user', async () => {
      // Arrange
      const mockStandards = [
        {
          id: 'standard1',
          organizationId: 'user123',
          standard: CarbonAccountingStandard.GHG_PROTOCOL,
          compliant: true,
          verificationBody: 'Verification Corp',
          lastVerificationDate: new Date('2025-01-15'),
          nextVerificationDate: new Date('2026-01-15'),
          certificateUrl: 'https://example.com/certificate1',
          notes: 'Annual verification completed',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'standard2',
          organizationId: 'user123',
          standard: CarbonAccountingStandard.ISO_14064,
          compliant: false,
          notes: 'In progress',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      
      mockReportingService.prototype.getStandardsCompliance.mockResolvedValue(mockStandards);
      
      const req = new NextRequest('http://localhost:3000/api/carbon/standards');
      
      // Act
      const response = await GET(req);
      const data = await response.json();
      
      // Assert
      expect(response.status).toBe(200);
      expect(data).toEqual({ standards: mockStandards });
      expect(mockReportingService.prototype.getStandardsCompliance).toHaveBeenCalledWith('user123');
    });
    
    it('returns standards compliance with organization filter', async () => {
      // Arrange
      const organizationId = 'org123';
      
      const mockStandards = [
        {
          id: 'standard1',
          organizationId,
          standard: CarbonAccountingStandard.GHG_PROTOCOL,
          compliant: true,
          verificationBody: 'Verification Corp',
          lastVerificationDate: new Date('2025-01-15'),
          nextVerificationDate: new Date('2026-01-15'),
          certificateUrl: 'https://example.com/certificate1',
          notes: 'Annual verification completed',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      
      mockReportingService.prototype.getStandardsCompliance.mockResolvedValue(mockStandards);
      
      const req = new NextRequest(
        `http://localhost:3000/api/carbon/standards?organizationId=${organizationId}`
      );
      
      // Act
      const response = await GET(req);
      const data = await response.json();
      
      // Assert
      expect(response.status).toBe(200);
      expect(data).toEqual({ standards: mockStandards });
      expect(mockReportingService.prototype.getStandardsCompliance).toHaveBeenCalledWith(organizationId);
    });
    
    it('returns 401 when user is not authenticated', async () => {
      // Arrange
      mockGetServerSession.mockResolvedValue(null);
      
      const req = new NextRequest('http://localhost:3000/api/carbon/standards');
      
      // Act
      const response = await GET(req);
      const data = await response.json();
      
      // Assert
      expect(response.status).toBe(401);
      expect(data).toEqual({ error: 'Unauthorized' });
    });
  });
  
  describe('POST /api/carbon/standards', () => {
    it('creates or updates a standard compliance', async () => {
      // Arrange
      const standardData = {
        organizationId: 'user123',
        standard: CarbonAccountingStandard.GHG_PROTOCOL,
        compliant: true,
        verificationBody: 'Verification Corp',
        verificationDate: '2025-01-15T00:00:00.000Z',
        nextVerificationDate: '2026-01-15T00:00:00.000Z',
        certificateUrl: 'https://example.com/certificate1',
        notes: 'Annual verification completed'
      };
      
      const createdStandard = {
        id: 'standard1',
        ...standardData,
        lastVerificationDate: new Date(standardData.verificationDate),
        nextVerificationDate: new Date(standardData.nextVerificationDate),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      mockReportingService.prototype.setStandardCompliance.mockResolvedValue(createdStandard);
      
      const req = new NextRequest('http://localhost:3000/api/carbon/standards', {
        method: 'POST',
        body: JSON.stringify(standardData),
      });
      
      // Act
      const response = await POST(req);
      const data = await response.json();
      
      // Assert
      expect(response.status).toBe(201);
      expect(data).toEqual({ standardCompliance: createdStandard });
      expect(mockReportingService.prototype.setStandardCompliance).toHaveBeenCalledWith(
        standardData.organizationId,
        standardData.standard,
        standardData.compliant,
        {
          verificationBody: standardData.verificationBody,
          verificationDate: expect.any(Date),
          nextVerificationDate: expect.any(Date),
          certificateUrl: standardData.certificateUrl,
          notes: standardData.notes
        }
      );
    });
    
    it('returns 400 when required fields are missing', async () => {
      // Arrange
      const standardData = {
        organizationId: 'user123',
        // Missing required fields
      };
      
      const req = new NextRequest('http://localhost:3000/api/carbon/standards', {
        method: 'POST',
        body: JSON.stringify(standardData),
      });
      
      // Act
      const response = await POST(req);
      const data = await response.json();
      
      // Assert
      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'Standard and compliance status are required' });
    });
    
    it('returns 401 when user is not authenticated', async () => {
      // Arrange
      mockGetServerSession.mockResolvedValue(null);
      
      const req = new NextRequest('http://localhost:3000/api/carbon/standards', {
        method: 'POST',
        body: JSON.stringify({
          organizationId: 'user123',
          standard: CarbonAccountingStandard.GHG_PROTOCOL,
          compliant: true
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
  
  describe('DELETE /api/carbon/standards/[id]', () => {
    it('deletes a standard compliance', async () => {
      // Arrange
      const standardId = 'standard123';
      
      const existingStandard = {
        id: standardId,
        organizationId: 'user123',
        standard: CarbonAccountingStandard.GHG_PROTOCOL,
        compliant: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      mockReportingService.prototype.getStandardsCompliance.mockResolvedValue([existingStandard]);
      mockReportingService.prototype.deleteStandardCompliance.mockResolvedValue(undefined);
      
      const req = new NextRequest('http://localhost:3000/api/carbon/standards', {
        method: 'DELETE',
      });
      
      // Mock params
      const params = { id: standardId };
      
      // Act
      const response = await DELETE(req, { params });
      const data = await response.json();
      
      // Assert
      expect(response.status).toBe(200);
      expect(data).toEqual({ success: true });
      expect(mockReportingService.prototype.deleteStandardCompliance).toHaveBeenCalledWith(standardId);
    });
    
    it('returns 404 when standard is not found', async () => {
      // Arrange
      const standardId = 'nonexistent';
      
      mockReportingService.prototype.getStandardsCompliance.mockResolvedValue([]);
      
      const req = new NextRequest('http://localhost:3000/api/carbon/standards', {
        method: 'DELETE',
      });
      
      // Mock params
      const params = { id: standardId };
      
      // Act
      const response = await DELETE(req, { params });
      const data = await response.json();
      
      // Assert
      expect(response.status).toBe(404);
      expect(data).toEqual({ error: 'Standard compliance not found' });
    });
    
    it('returns 403 when user is not authorized to delete the standard', async () => {
      // Arrange
      const standardId = 'standard123';
      
      const existingStandard = {
        id: standardId,
        organizationId: 'other-user',
        standard: CarbonAccountingStandard.GHG_PROTOCOL,
        compliant: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      mockReportingService.prototype.getStandardsCompliance.mockResolvedValue([existingStandard]);
      
      const req = new NextRequest('http://localhost:3000/api/carbon/standards', {
        method: 'DELETE',
      });
      
      // Mock params
      const params = { id: standardId };
      
      // Act
      const response = await DELETE(req, { params });
      const data = await response.json();
      
      // Assert
      expect(response.status).toBe(403);
      expect(data).toEqual({ error: 'Unauthorized to delete this standard compliance' });
    });
  });
});
