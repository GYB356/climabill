// Mock implementation of the CarbonTrackingService
import { CarbonUsageData, EmissionsTimeSeriesData, EmissionsSourceData } from '../lib/carbon/types';

// Create instance methods
const getCarbonUsageForPeriodImpl = jest.fn().mockResolvedValue({
  id: 'usage-123',
  userId: 'user123',
  organizationId: 'org123',
  invoiceCount: 50,
  emailCount: 100,
  storageGb: 10,
  apiCallCount: 500,
  totalCarbonInKg: 900,
  offsetCarbonInKg: 50,
  remainingCarbonInKg: 850,
  period: {
    startDate: new Date('2025-01-01'),
    endDate: new Date('2025-01-31'),
  },
  createdAt: new Date(),
  updatedAt: new Date(),
});

const getEmissionsTimeSeriesImpl = jest.fn().mockImplementation((organizationId, startDate, endDate) => {
  // Return mock time series data
  return Promise.resolve([
    {
      date: new Date('2025-01-01'),
      totalEmissions: 1000,
      breakdown: {
        electricity: 500,
        transportation: 300,
        heating: 200,
      },
    },
    {
      date: new Date('2025-02-01'),
      totalEmissions: 950,
      breakdown: {
        electricity: 450,
        transportation: 300,
        heating: 200,
      },
    },
    {
      date: new Date('2025-03-01'),
      totalEmissions: 900,
      breakdown: {
        electricity: 400,
        transportation: 300,
        heating: 200,
      },
    },
    {
      date: new Date('2025-04-01'),
      totalEmissions: 850,
      breakdown: {
        electricity: 350,
        transportation: 300,
        heating: 200,
      },
    },
    {
      date: new Date('2025-05-01'),
      totalEmissions: 800,
      breakdown: {
        electricity: 300,
        transportation: 300,
        heating: 200,
      },
    },
  ]);
});

const getAverageCarbonUsageImpl = jest.fn().mockImplementation((organizationId, startDate, endDate) => {
  // Return mock average carbon usage
  return Promise.resolve(900);
});

const getEmissionsBySourceImpl = jest.fn().mockImplementation((organizationId, startDate, endDate) => {
  // Return mock emissions by source
  return Promise.resolve({
    electricity: 2000,
    transportation: 1500,
    heating: 1000,
  });
});

const getEmissionsByDepartmentImpl = jest.fn().mockImplementation((organizationId, startDate, endDate) => {
  // Return mock emissions by department
  return Promise.resolve([
    { departmentId: 'dept1', departmentName: 'Engineering', totalEmissions: 2000 },
    { departmentId: 'dept2', departmentName: 'Marketing', totalEmissions: 1500 },
    { departmentId: 'dept3', departmentName: 'Sales', totalEmissions: 1000 },
  ]);
});

const getEmissionsByProjectImpl = jest.fn().mockImplementation((organizationId, startDate, endDate) => {
  // Return mock emissions by project
  return Promise.resolve([
    { projectId: 'proj1', projectName: 'Website Redesign', totalEmissions: 1000 },
    { projectId: 'proj2', projectName: 'Mobile App', totalEmissions: 800 },
    { projectId: 'proj3', projectName: 'Backend API', totalEmissions: 1200 },
  ]);
});

const recordEmissionsImpl = jest.fn().mockImplementation((emissionsData) => {
  // Return success
  return Promise.resolve({ success: true, id: 'emission-123' });
});

const getEmissionsSourcesImpl = jest.fn().mockResolvedValue([
  { source: 'Electricity', emissions: 500, percentage: 50 },
  { source: 'Transportation', emissions: 300, percentage: 30 },
  { source: 'Heating', emissions: 200, percentage: 20 },
]);

const getEmissionsBreakdownImpl = jest.fn().mockResolvedValue([
  { source: 'Electricity', emissions: 50, percentage: 50 },
  { source: 'Transportation', emissions: 30, percentage: 30 },
  { source: 'Heating', emissions: 20, percentage: 20 },
]);

const getEmissionsTrendsImpl = jest.fn().mockResolvedValue([
  {
    period: 'Week over Week',
    change: -5,
    previousValue: 1050,
    currentValue: 1000,
  },
  {
    period: 'Month over Month',
    change: -10,
    previousValue: 1100,
    currentValue: 1000,
  },
  {
    period: 'Year over Year',
    change: -15,
    previousValue: 1150,
    currentValue: 1000,
  },
]);

const purchaseCarbonOffsetImpl = jest.fn().mockResolvedValue({
  id: 'new-offset',
  organizationId: 'org123',
  amount: 15,
  cost: 75,
  date: new Date(),
  projectType: 'Renewable Energy',
  status: 'completed',
});

const calculateCarbonOffsetsImpl = jest.fn().mockResolvedValue({
  offsetAmount: 500,
  cost: 250,
  projectTypes: ['Renewable Energy', 'Reforestation'],
});

const purchaseOffsetsImpl = jest.fn().mockResolvedValue({
  id: 'offset-123',
  amount: 500,
  cost: 250,
  date: new Date(),
  projectType: 'Renewable Energy',
  status: 'completed',
});

const getOffsetHistoryImpl = jest.fn().mockResolvedValue([
  {
    id: 'offset-123',
    amount: 500,
    cost: 250,
    date: new Date('2025-04-01'),
    projectType: 'Renewable Energy',
    status: 'completed',
  },
  {
    id: 'offset-124',
    amount: 300,
    cost: 150,
    date: new Date('2025-03-01'),
    projectType: 'Reforestation',
    status: 'completed',
  },
]);

const getCarbonOffsetsImpl = jest.fn().mockResolvedValue([
  {
    id: 'offset1',
    organizationId: 'org123',
    amount: 500,
    cost: 250,
    date: new Date('2025-04-01'),
    projectType: 'Renewable Energy',
    status: 'completed',
  },
  {
    id: 'offset2',
    organizationId: 'org123',
    amount: 300,
    cost: 150,
    date: new Date('2025-03-01'),
    projectType: 'Reforestation',
    status: 'completed',
  },
]);

const getEmissionsForDepartmentImpl = jest.fn().mockResolvedValue({
  totalEmissions: 500,
  breakdown: [
    { source: 'Electricity', emissions: 250, percentage: 50 },
    { source: 'Transportation', emissions: 150, percentage: 30 },
    { source: 'Heating', emissions: 100, percentage: 20 },
  ],
});

const getEmissionsForProjectImpl = jest.fn().mockResolvedValue({
  totalEmissions: 200,
  breakdown: [
    { source: 'Electricity', emissions: 100, percentage: 50 },
    { source: 'Transportation', emissions: 60, percentage: 30 },
    { source: 'Heating', emissions: 40, percentage: 20 },
  ],
});

// Add missing methods needed by tests
const getCarbonUsageSummaryImpl = jest.fn().mockResolvedValue({
  totalCarbonInKg: 5000,
  offsetCarbonInKg: 30,
  offsetPercentage: 0.6,
  sources: [
    { source: 'Electricity', emissions: 2500, percentage: 50 },
    { source: 'Transportation', emissions: 1500, percentage: 30 },
    { source: 'Heating', emissions: 1000, percentage: 20 },
  ],
});

const getCarbonFootprintSummaryImpl = jest.fn().mockResolvedValue({
  totalCarbonInKg: 900,
  offsetCarbonInKg: 30,
  offsetPercentage: 3.3,
  sources: [
    { source: 'Electricity', emissions: 450, percentage: 50 },
    { source: 'Transportation', emissions: 270, percentage: 30 },
    { source: 'Heating', emissions: 180, percentage: 20 },
  ],
});

// Create class with instance methods
export class CarbonTrackingService {
  getCarbonUsageForPeriod = getCarbonUsageForPeriodImpl;
  getEmissionsTimeSeries = getEmissionsTimeSeriesImpl;
  getAverageCarbonUsage = getAverageCarbonUsageImpl;
  getEmissionsBySource = getEmissionsBySourceImpl;
  getEmissionsByDepartment = getEmissionsByDepartmentImpl;
  getEmissionsByProject = getEmissionsByProjectImpl;
  recordEmissions = recordEmissionsImpl;
  getEmissionsSources = getEmissionsSourcesImpl;
  calculateCarbonOffsets = calculateCarbonOffsetsImpl;
  purchaseOffsets = purchaseOffsetsImpl;
  getOffsetHistory = getOffsetHistoryImpl;
  getCarbonOffsets = getCarbonOffsetsImpl;
  getEmissionsForDepartment = getEmissionsForDepartmentImpl;
  getEmissionsForProject = getEmissionsForProjectImpl;
  getEmissionsBreakdown = getEmissionsBreakdownImpl;
  getEmissionsTrends = getEmissionsTrendsImpl;
  purchaseCarbonOffset = purchaseCarbonOffsetImpl;
  getCarbonUsageSummary = getCarbonUsageSummaryImpl;
  getCarbonFootprintSummary = getCarbonFootprintSummaryImpl;
}

// Add prototype methods for component tests that use prototype mocking
CarbonTrackingService.prototype.getCarbonUsageForPeriod = getCarbonUsageForPeriodImpl;
CarbonTrackingService.prototype.getEmissionsTimeSeries = getEmissionsTimeSeriesImpl;
CarbonTrackingService.prototype.getAverageCarbonUsage = getAverageCarbonUsageImpl;
CarbonTrackingService.prototype.getEmissionsBySource = getEmissionsBySourceImpl;
CarbonTrackingService.prototype.getEmissionsByDepartment = getEmissionsByDepartmentImpl;
CarbonTrackingService.prototype.getEmissionsByProject = getEmissionsByProjectImpl;
CarbonTrackingService.prototype.recordEmissions = recordEmissionsImpl;
CarbonTrackingService.prototype.getEmissionsSources = getEmissionsSourcesImpl;
CarbonTrackingService.prototype.calculateCarbonOffsets = calculateCarbonOffsetsImpl;
CarbonTrackingService.prototype.purchaseOffsets = purchaseOffsetsImpl;
CarbonTrackingService.prototype.getOffsetHistory = getOffsetHistoryImpl;
CarbonTrackingService.prototype.getCarbonOffsets = getCarbonOffsetsImpl;
CarbonTrackingService.prototype.getEmissionsForDepartment = getEmissionsForDepartmentImpl;
CarbonTrackingService.prototype.getEmissionsForProject = getEmissionsForProjectImpl;
CarbonTrackingService.prototype.getEmissionsBreakdown = getEmissionsBreakdownImpl;
CarbonTrackingService.prototype.getEmissionsTrends = getEmissionsTrendsImpl;
CarbonTrackingService.prototype.purchaseCarbonOffset = purchaseCarbonOffsetImpl;
