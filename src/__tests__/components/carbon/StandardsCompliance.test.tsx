import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import StandardsCompliance from '../../../components/carbon/StandardsCompliance';
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

describe('StandardsCompliance', () => {
  const mockReportingService = SustainabilityReportingService as jest.MockedClass<typeof SustainabilityReportingService>;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock the getStandardsCompliance method
    mockReportingService.prototype.getStandardsCompliance.mockResolvedValue([
      {
        id: 'standard1',
        organizationId: 'org123',
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
        organizationId: 'org123',
        standard: CarbonAccountingStandard.ISO_14064,
        compliant: false,
        notes: 'In progress',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  });
  
  const renderComponent = () => {
    return render(
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <StandardsCompliance organizationId="org123" />
      </LocalizationProvider>
    );
  };
  
  it('renders the component with standards', async () => {
    renderComponent();
    
    // Wait for standards to load
    await waitFor(() => {
      expect(screen.getByText('Carbon Accounting Standards')).toBeInTheDocument();
      expect(screen.getByText('Ghg Protocol')).toBeInTheDocument();
      expect(screen.getByText('Iso 14064')).toBeInTheDocument();
      expect(screen.getByText('Compliant')).toBeInTheDocument();
      expect(screen.getByText('Non-Compliant')).toBeInTheDocument();
    });
    
    // Verify the service was called correctly
    expect(mockReportingService.prototype.getStandardsCompliance).toHaveBeenCalledWith('org123');
  });
  
  it('opens the add standard dialog when Add Standard button is clicked', async () => {
    renderComponent();
    
    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText('Carbon Accounting Standards')).toBeInTheDocument();
    });
    
    // Click the Add Standard button
    fireEvent.click(screen.getByText('Add Standard'));
    
    // Check if dialog is open
    await waitFor(() => {
      expect(screen.getByText('Add Standard Compliance')).toBeInTheDocument();
      expect(screen.getByLabelText('Standard')).toBeInTheDocument();
      expect(screen.getByLabelText('Compliance Status')).toBeInTheDocument();
    });
  });
  
  it('sets standard compliance when form is submitted', async () => {
    // Mock the setStandardCompliance method
    mockReportingService.prototype.setStandardCompliance.mockResolvedValue({
      id: 'new-standard',
      organizationId: 'org123',
      standard: CarbonAccountingStandard.CDP,
      compliant: true,
      verificationBody: 'New Verifier',
      lastVerificationDate: new Date('2025-03-15'),
      nextVerificationDate: new Date('2026-03-15'),
      certificateUrl: 'https://example.com/new-certificate',
      notes: 'New standard compliance',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    renderComponent();
    
    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText('Carbon Accounting Standards')).toBeInTheDocument();
    });
    
    // Click the Add Standard button
    fireEvent.click(screen.getByText('Add Standard'));
    
    // Fill out the form
    await waitFor(() => {
      // Select standard
      const standardSelect = screen.getByLabelText('Standard');
      fireEvent.mouseDown(standardSelect);
    });
    
    // Select CDP from dropdown
    const cdpOption = await screen.findByText('Cdp');
    fireEvent.click(cdpOption);
    
    // Select compliance status
    await waitFor(() => {
      const complianceSelect = screen.getByLabelText('Compliance Status');
      fireEvent.mouseDown(complianceSelect);
    });
    
    // Select Compliant from dropdown
    const compliantOption = await screen.findByText('Compliant');
    fireEvent.click(compliantOption);
    
    // Fill verification body
    await waitFor(() => {
      fireEvent.change(screen.getByLabelText('Verification Body'), {
        target: { value: 'New Verifier' }
      });
    });
    
    // Fill certificate URL
    await waitFor(() => {
      fireEvent.change(screen.getByLabelText('Certificate URL'), {
        target: { value: 'https://example.com/new-certificate' }
      });
    });
    
    // Fill notes
    await waitFor(() => {
      fireEvent.change(screen.getByLabelText('Notes'), {
        target: { value: 'New standard compliance' }
      });
    });
    
    // Submit the form
    fireEvent.click(screen.getByText('Save'));
    
    // Verify the service was called correctly
    await waitFor(() => {
      expect(mockReportingService.prototype.setStandardCompliance).toHaveBeenCalledWith(
        'org123',
        CarbonAccountingStandard.CDP,
        true,
        expect.objectContaining({
          verificationBody: 'New Verifier',
          certificateUrl: 'https://example.com/new-certificate',
          notes: 'New standard compliance',
          verificationDate: expect.any(Object),
          nextVerificationDate: expect.any(Object)
        })
      );
    });
  });
  
  it('shows an error message when standard compliance setting fails', async () => {
    // Mock the setStandardCompliance method to throw an error
    mockReportingService.prototype.setStandardCompliance.mockRejectedValue(new Error('Failed to set standard compliance'));
    
    renderComponent();
    
    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText('Carbon Accounting Standards')).toBeInTheDocument();
    });
    
    // Click the Add Standard button
    fireEvent.click(screen.getByText('Add Standard'));
    
    // Fill out the form
    await waitFor(() => {
      // Select standard
      const standardSelect = screen.getByLabelText('Standard');
      fireEvent.mouseDown(standardSelect);
    });
    
    // Select GHG Protocol from dropdown
    const ghgOption = await screen.findByText('Ghg Protocol');
    fireEvent.click(ghgOption);
    
    // Submit the form
    fireEvent.click(screen.getByText('Save'));
    
    // Verify error message is shown
    await waitFor(() => {
      expect(screen.getByText('Failed to save standard compliance. Please try again.')).toBeInTheDocument();
    });
  });
  
  it('opens the edit dialog when edit button is clicked', async () => {
    renderComponent();
    
    // Wait for standards to load
    await waitFor(() => {
      expect(screen.getByText('Ghg Protocol')).toBeInTheDocument();
    });
    
    // Find and click the edit button for GHG Protocol
    const editButtons = screen.getAllByRole('button', { name: '' });
    fireEvent.click(editButtons[0]); // First edit button should be for GHG Protocol
    
    // Check if dialog is open with pre-filled data
    await waitFor(() => {
      expect(screen.getByText('Edit Standard Compliance')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Verification Corp')).toBeInTheDocument();
      expect(screen.getByDisplayValue('https://example.com/certificate1')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Annual verification completed')).toBeInTheDocument();
    });
  });
});
