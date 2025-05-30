import { SustainabilityReportingService } from '../../../lib/carbon/sustainability-reporting-service';
import { CarbonTrackingService } from '../../../lib/carbon/carbon-tracking-service';
import { 
  CarbonAccountingStandard, 
  StandardCompliance, 
  SustainabilityReport 
} from '../../../lib/carbon/models/department-project';

// Mock Firebase
jest.mock('../../../lib/firebase/firestore', () => ({
  db: {
    collection: jest.fn().mockReturnThis(),
    doc: jest.fn().mockReturnThis(),
    add: jest.fn(),
    set: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    get: jest.fn(),
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
  },
}));

// Mock CarbonTrackingService
jest.mock('../../../lib/carbon/carbon-tracking-service');

describe('SustainabilityReportingService', () => {
  let reportingService: SustainabilityReportingService;
  let mockCarbonTrackingService: jest.Mocked<CarbonTrackingService>;
  
  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Setup mock implementations
    mockCarbonTrackingService = new CarbonTrackingService() as jest.Mocked<CarbonTrackingService>;
    reportingService = new SustainabilityReportingService();
    
    // Mock the required methods
    (reportingService as any).carbonTrackingService = mockCarbonTrackingService;
  });
  
  describe('generateReport', () => {
    it('should generate a monthly sustainability report', async () => {
      // Arrange
      const organizationId = 'org123';
      const reportType = 'monthly';
      const startDate = new Date('2025-05-01');
      const endDate = new Date('2025-05-31');
      
      // Mock carbon tracking service methods
      mockCarbonTrackingService.getCarbonUsageForPeriod.mockResolvedValue({
        totalCarbonInKg: 1000,
        offsetCarbonInKg: 300,
        sources: [
          { name: 'Electricity', carbonInKg: 500 },
          { name: 'Transportation', carbonInKg: 300 },
          { name: 'Other', carbonInKg: 200 }
        ]
      });
      
      mockCarbonTrackingService.getCarbonUsageForPeriod.mockResolvedValueOnce({
        totalCarbonInKg: 1200,
        offsetCarbonInKg: 200,
        sources: []
      });
      
      // Mock standards compliance
      reportingService.getStandardsCompliance = jest.fn().mockResolvedValue([
        {
          id: 'standard1',
          organizationId,
          standard: CarbonAccountingStandard.GHG_PROTOCOL,
          compliant: true,
          verificationBody: 'Test Verifier',
          lastVerificationDate: new Date('2025-01-15'),
        },
        {
          id: 'standard2',
          organizationId,
          standard: CarbonAccountingStandard.ISO_14064,
          compliant: false,
        }
      ]);
      
      // Mock the add method for the report
      const mockReportId = 'report123';
      const mockAdd = jest.fn().mockResolvedValue({ id: mockReportId });
      const mockCollection = jest.fn().mockReturnValue({ add: mockAdd });
      
      (reportingService as any).db = {
        collection: mockCollection,
      };
      
      // Act
      const result = await reportingService.generateReport(
        organizationId,
        reportType,
        startDate,
        endDate
      );
      
      // Assert
      expect(mockCarbonTrackingService.getCarbonUsageForPeriod).toHaveBeenCalledWith(
        organizationId,
        startDate,
        endDate,
        undefined,
        undefined
      );
      
      expect(mockCollection).toHaveBeenCalledWith('sustainabilityReports');
      expect(mockAdd).toHaveBeenCalledWith(expect.objectContaining({
        organizationId,
        reportType,
        name: expect.stringContaining('May 2025'),
        period: {
          startDate,
          endDate
        },
        totalCarbonInKg: 1000,
        offsetCarbonInKg: 300,
        offsetPercentage: 30,
        reductionFromPreviousPeriod: 200,
        reductionPercentage: 16.67,
        standards: [
          {
            name: 'GHG Protocol',
            compliant: true
          },
          {
            name: 'ISO 14064',
            compliant: false
          }
        ],
        createdAt: expect.any(Date)
      }));
      
      expect(result).toEqual(expect.objectContaining({
        id: mockReportId,
        organizationId,
        reportType,
        totalCarbonInKg: 1000,
        offsetCarbonInKg: 300,
        offsetPercentage: 30,
        reductionFromPreviousPeriod: 200,
        reductionPercentage: 16.67,
      }));
    });
  });
  
  describe('getReports', () => {
    it('should retrieve reports for an organization', async () => {
      // Arrange
      const organizationId = 'org123';
      const limit = 10;
      
      const mockReports = [
        {
          id: 'report1',
          name: 'May 2025 Report',
          organizationId,
          reportType: 'monthly',
          period: {
            startDate: new Date('2025-05-01'),
            endDate: new Date('2025-05-31')
          },
          totalCarbonInKg: 1000,
          offsetCarbonInKg: 300,
          offsetPercentage: 30,
          standards: [],
          createdAt: new Date('2025-06-01')
        },
        {
          id: 'report2',
          name: 'April 2025 Report',
          organizationId,
          reportType: 'monthly',
          period: {
            startDate: new Date('2025-04-01'),
            endDate: new Date('2025-04-30')
          },
          totalCarbonInKg: 1200,
          offsetCarbonInKg: 200,
          offsetPercentage: 16.67,
          standards: [],
          createdAt: new Date('2025-05-01')
        }
      ];
      
      const mockDocs = mockReports.map(report => ({
        id: report.id,
        data: () => report,
      }));
      
      const mockGet = jest.fn().mockResolvedValue({ docs: mockDocs });
      const mockWhere = jest.fn().mockReturnThis();
      const mockOrderBy = jest.fn().mockReturnThis();
      const mockLimit = jest.fn().mockReturnThis();
      const mockCollection = jest.fn().mockReturnValue({
        where: mockWhere,
        orderBy: mockOrderBy,
        limit: mockLimit,
        get: mockGet,
      });
      
      (reportingService as any).db = {
        collection: mockCollection,
      };
      
      // Act
      const result = await reportingService.getReports(organizationId, undefined, undefined, undefined, limit);
      
      // Assert
      expect(mockCollection).toHaveBeenCalledWith('sustainabilityReports');
      expect(mockWhere).toHaveBeenCalledWith('organizationId', '==', organizationId);
      expect(mockOrderBy).toHaveBeenCalledWith('createdAt', 'desc');
      expect(mockLimit).toHaveBeenCalledWith(limit);
      expect(result).toEqual(mockReports);
    });
  });
  
  describe('setStandardCompliance', () => {
    it('should set compliance for a standard', async () => {
      // Arrange
      const organizationId = 'org123';
      const standard = CarbonAccountingStandard.GHG_PROTOCOL;
      const compliant = true;
      const details = {
        verificationBody: 'Test Verifier',
        verificationDate: new Date('2025-01-15'),
        nextVerificationDate: new Date('2026-01-15'),
        certificateUrl: 'https://example.com/certificate',
        notes: 'Test notes'
      };
      
      // Mock existing standards query
      const mockExistingStandard = {
        id: 'standard1',
        organizationId,
        standard,
        compliant: false,
      };
      
      const mockDocs = [{
        id: mockExistingStandard.id,
        data: () => mockExistingStandard,
      }];
      
      const mockGet = jest.fn().mockResolvedValue({ docs: mockDocs });
      const mockWhere = jest.fn().mockReturnThis();
      const mockUpdate = jest.fn().mockResolvedValue({});
      const mockDoc = jest.fn().mockReturnValue({ update: mockUpdate });
      const mockCollection = jest.fn().mockReturnValue({
        where: mockWhere,
        get: mockGet,
        doc: mockDoc,
      });
      
      (reportingService as any).db = {
        collection: mockCollection,
      };
      
      // Act
      const result = await reportingService.setStandardCompliance(
        organizationId,
        standard,
        compliant,
        details
      );
      
      // Assert
      expect(mockCollection).toHaveBeenCalledWith('standardsCompliance');
      expect(mockWhere).toHaveBeenCalledWith('organizationId', '==', organizationId);
      expect(mockWhere).toHaveBeenCalledWith('standard', '==', standard);
      expect(mockDoc).toHaveBeenCalledWith(mockExistingStandard.id);
      expect(mockUpdate).toHaveBeenCalledWith({
        compliant,
        lastVerificationDate: details.verificationDate,
        nextVerificationDate: details.nextVerificationDate,
        verificationBody: details.verificationBody,
        certificateUrl: details.certificateUrl,
        notes: details.notes,
        updatedAt: expect.any(Date),
      });
      
      expect(result).toEqual({
        id: mockExistingStandard.id,
        organizationId,
        standard,
        compliant,
        lastVerificationDate: details.verificationDate,
        nextVerificationDate: details.nextVerificationDate,
        verificationBody: details.verificationBody,
        certificateUrl: details.certificateUrl,
        notes: details.notes,
        updatedAt: expect.any(Date),
      });
    });
    
    it('should create a new standard compliance if it does not exist', async () => {
      // Arrange
      const organizationId = 'org123';
      const standard = CarbonAccountingStandard.GHG_PROTOCOL;
      const compliant = true;
      const details = {
        verificationBody: 'Test Verifier',
        verificationDate: new Date('2025-01-15'),
      };
      
      // Mock empty query result
      const mockGet = jest.fn().mockResolvedValue({ docs: [] });
      const mockWhere = jest.fn().mockReturnThis();
      
      // Mock add for new standard
      const mockStandardId = 'newStandard123';
      const mockAdd = jest.fn().mockResolvedValue({ id: mockStandardId });
      const mockCollection = jest.fn().mockReturnValue({
        where: mockWhere,
        get: mockGet,
        add: mockAdd,
      });
      
      (reportingService as any).db = {
        collection: mockCollection,
      };
      
      // Act
      const result = await reportingService.setStandardCompliance(
        organizationId,
        standard,
        compliant,
        details
      );
      
      // Assert
      expect(mockCollection).toHaveBeenCalledWith('standardsCompliance');
      expect(mockAdd).toHaveBeenCalledWith({
        organizationId,
        standard,
        compliant,
        lastVerificationDate: details.verificationDate,
        verificationBody: details.verificationBody,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
      
      expect(result).toEqual({
        id: mockStandardId,
        organizationId,
        standard,
        compliant,
        lastVerificationDate: details.verificationDate,
        verificationBody: details.verificationBody,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });
  });
});
