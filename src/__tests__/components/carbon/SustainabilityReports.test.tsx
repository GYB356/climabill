import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import SustainabilityReports from '../../../components/carbon/SustainabilityReports';
import { SustainabilityReportingService } from '../../../lib/carbon/sustainability-reporting-service';
import { CarbonAccountingStandard } from '../../../lib/carbon/models/department-project';

// Mock the SustainabilityReportingService
jest.mock('../../../lib/carbon/sustainability-reporting-service');

// Mock the useAuth hook
jest.mock('../../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { uid: 'test-user-id' }
  })
}));

describe('SustainabilityReports', () => {
  const mockReportingService = SustainabilityReportingService as jest.MockedClass<typeof SustainabilityReportingService>;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock the getReports method
    mockReportingService.prototype.getReports.mockResolvedValue([
      {
        id: 'report1',
        name: 'May 2025 Report',
        organizationId: 'org123',
        reportType: 'monthly',
        period: {
          startDate: new Date('2025-05-01'),
          endDate: new Date('2025-05-31')
        },
        totalCarbonInKg: 1000,
        offsetCarbonInKg: 300,
        offsetPercentage: 30,
        reductionFromPreviousPeriod: 200,
        reductionPercentage: 16.67,
        standards: [
          { name: 'GHG Protocol', compliant: true },
          { name: 'ISO 14064', compliant: false }
        ],
        reportUrl: 'https://example.com/report1.pdf',
        createdAt: new Date('2025-06-01')
      },
      {
        id: 'report2',
        name: 'April 2025 Report',
        organizationId: 'org123',
        reportType: 'monthly',
        period: {
          startDate: new Date('2025-04-01'),
          endDate: new Date('2025-04-30')
        },
        totalCarbonInKg: 1200,
        offsetCarbonInKg: 200,
        offsetPercentage: 16.67,
        standards: [
          { name: 'GHG Protocol', compliant: true }
        ],
        reportUrl: 'https://example.com/report2.pdf',
        createdAt: new Date('2025-05-01')
      }
    ]);
  });
  
  const renderComponent = () => {
    return render(
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <SustainabilityReports organizationId="org123" />
      </LocalizationProvider>
    );
  };
  
  it('renders the component with reports', async () => {
    renderComponent();
    
    // Wait for reports to load
    await waitFor(() => {
      expect(screen.getByText('Sustainability Reports')).toBeInTheDocument();
      expect(screen.getByText('May 2025 Report')).toBeInTheDocument();
      expect(screen.getByText('April 2025 Report')).toBeInTheDocument();
      expect(screen.getAllByText('monthly').length).toBe(2);
    });
    
    // Verify the service was called correctly
    expect(mockReportingService.prototype.getReports).toHaveBeenCalledWith(
      'org123',
      undefined,
      undefined,
      undefined,
      20
    );
  });
  
  it('opens the generate report dialog when Generate Report button is clicked', async () => {
    renderComponent();
    
    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText('Sustainability Reports')).toBeInTheDocument();
    });
    
    // Click the Generate Report button
    fireEvent.click(screen.getByText('Generate Report'));
    
    // Check if dialog is open
    await waitFor(() => {
      expect(screen.getByText('Generate Sustainability Report')).toBeInTheDocument();
      expect(screen.getByLabelText('Report Type')).toBeInTheDocument();
    });
  });
  
  it('generates a report when form is submitted', async () => {
    // Mock the generateReport method
    mockReportingService.prototype.generateReport.mockResolvedValue({
      id: 'new-report',
      name: 'June 2025 Report',
      organizationId: 'org123',
      reportType: 'monthly',
      period: {
        startDate: new Date('2025-06-01'),
        endDate: new Date('2025-06-30')
      },
      totalCarbonInKg: 900,
      offsetCarbonInKg: 300,
      offsetPercentage: 33.33,
      standards: [
        { name: 'GHG Protocol', compliant: true }
      ],
      reportUrl: 'https://example.com/new-report.pdf',
      createdAt: new Date()
    });
    
    renderComponent();
    
    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText('Sustainability Reports')).toBeInTheDocument();
    });
    
    // Click the Generate Report button
    fireEvent.click(screen.getByText('Generate Report'));
    
    // Select report type
    await waitFor(() => {
      const reportTypeSelect = screen.getByLabelText('Report Type');
      fireEvent.mouseDown(reportTypeSelect);
    });
    
    // Select Monthly from dropdown
    const monthlyOption = await screen.findByText('Monthly');
    fireEvent.click(monthlyOption);
    
    // Submit the form
    fireEvent.click(screen.getByText('Generate Report'));
    
    // Verify the service was called correctly
    await waitFor(() => {
      expect(mockReportingService.prototype.generateReport).toHaveBeenCalledWith(
        'org123',
        'monthly',
        expect.any(Date), // Start date
        expect.any(Date), // End date
        undefined,
        undefined
      );
    });
  });
  
  it('shows an error message when report generation fails', async () => {
    // Mock the generateReport method to throw an error
    mockReportingService.prototype.generateReport.mockRejectedValue(new Error('Failed to generate report'));
    
    renderComponent();
    
    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText('Sustainability Reports')).toBeInTheDocument();
    });
    
    // Click the Generate Report button
    fireEvent.click(screen.getByText('Generate Report'));
    
    // Submit the form
    fireEvent.click(screen.getByText('Generate Report'));
    
    // Verify error message is shown
    await waitFor(() => {
      expect(screen.getByText('Failed to generate report. Please try again.')).toBeInTheDocument();
    });
  });
  
  it('changes date fields when report type is changed', async () => {
    renderComponent();
    
    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText('Sustainability Reports')).toBeInTheDocument();
    });
    
    // Click the Generate Report button
    fireEvent.click(screen.getByText('Generate Report'));
    
    // Select report type
    await waitFor(() => {
      const reportTypeSelect = screen.getByLabelText('Report Type');
      fireEvent.mouseDown(reportTypeSelect);
    });
    
    // Select Quarterly from dropdown
    const quarterlyOption = await screen.findByText('Quarterly');
    fireEvent.click(quarterlyOption);
    
    // Verify date fields are updated but disabled
    await waitFor(() => {
      const startDateField = screen.getByLabelText('Start Date');
      const endDateField = screen.getByLabelText('End Date');
      
      expect(startDateField).toBeDisabled();
      expect(endDateField).toBeDisabled();
    });
    
    // Now select Custom Period
    await waitFor(() => {
      const reportTypeSelect = screen.getByLabelText('Report Type');
      fireEvent.mouseDown(reportTypeSelect);
    });
    
    const customOption = await screen.findByText('Custom Period');
    fireEvent.click(customOption);
    
    // Verify date fields are enabled
    await waitFor(() => {
      const startDateField = screen.getByLabelText('Start Date');
      const endDateField = screen.getByLabelText('End Date');
      
      expect(startDateField).not.toBeDisabled();
      expect(endDateField).not.toBeDisabled();
    });
  });
  
  it('filters reports by department and project', async () => {
    // Render with department and project props
    render(
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <SustainabilityReports 
          organizationId="org123" 
          departmentId="dept123" 
          projectId="proj123"
        />
      </LocalizationProvider>
    );
    
    // Verify the service was called with the correct filters
    await waitFor(() => {
      expect(mockReportingService.prototype.getReports).toHaveBeenCalledWith(
        'org123',
        undefined,
        'dept123',
        'proj123',
        20
      );
    });
  });
});
