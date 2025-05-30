// Mock implementation of SustainabilityReportingService for testing
import { SustainabilityReport, StandardsCompliance } from '../lib/carbon/models/department-project';

// Create a properly mocked class with Jest functions
const mockGenerateReport = jest.fn();
const mockGetReports = jest.fn();
const mockGetReport = jest.fn();
const mockDeleteReport = jest.fn();
const mockGetStandardsCompliance = jest.fn();
const mockGetStandardCompliance = jest.fn();
const mockSetStandardCompliance = jest.fn();
const mockDeleteStandardCompliance = jest.fn();

export class SustainabilityReportingService {
  generateReport = mockGenerateReport;
  getReports = mockGetReports;
  getReport = mockGetReport;
  deleteReport = mockDeleteReport;
  getStandardsCompliance = mockGetStandardsCompliance;
  getStandardCompliance = mockGetStandardCompliance;
  setStandardCompliance = mockSetStandardCompliance;
  deleteStandardCompliance = mockDeleteStandardCompliance;
}

// Export the mock functions so they can be accessed in tests
SustainabilityReportingService.prototype.generateReport = mockGenerateReport;
SustainabilityReportingService.prototype.getReports = mockGetReports;
SustainabilityReportingService.prototype.getReport = mockGetReport;
SustainabilityReportingService.prototype.deleteReport = mockDeleteReport;
SustainabilityReportingService.prototype.getStandardsCompliance = mockGetStandardsCompliance;
SustainabilityReportingService.prototype.getStandardCompliance = mockGetStandardCompliance;
SustainabilityReportingService.prototype.setStandardCompliance = mockSetStandardCompliance;
SustainabilityReportingService.prototype.deleteStandardCompliance = mockDeleteStandardCompliance;

export default SustainabilityReportingService;
