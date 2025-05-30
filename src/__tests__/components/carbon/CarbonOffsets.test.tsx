import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CarbonOffsets from '../../../components/carbon/CarbonOffsets';
import { CarbonTrackingService } from '../../../lib/carbon/carbon-tracking-service';

// Mock the CarbonTrackingService
jest.mock('../../../lib/carbon/carbon-tracking-service');

// Mock the useAuth hook
jest.mock('../../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { uid: 'test-user-id' }
  })
}));

describe('CarbonOffsets', () => {
  const mockTrackingService = CarbonTrackingService as jest.MockedClass<typeof CarbonTrackingService>;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock the getCarbonOffsets method
    mockTrackingService.prototype.getCarbonOffsets.mockResolvedValue([
      {
        id: 'offset1',
        organizationId: 'org123',
        amount: 10,
        cost: 150,
        date: new Date('2025-05-01'),
        provider: 'Cloverly',
        projectType: 'Renewable Energy',
        projectName: 'Wind Farm Project',
        certificateUrl: 'https://example.com/certificate1',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'offset2',
        organizationId: 'org123',
        amount: 20,
        cost: 300,
        date: new Date('2025-04-15'),
        provider: 'Cloverly',
        projectType: 'Forestry',
        projectName: 'Reforestation Project',
        certificateUrl: 'https://example.com/certificate2',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
    
    // Mock the purchaseCarbonOffset method
    mockTrackingService.prototype.purchaseCarbonOffset.mockResolvedValue({
      id: 'new-offset',
      organizationId: 'org123',
      amount: 15,
      cost: 225,
      date: new Date(),
      provider: 'Cloverly',
      projectType: 'Renewable Energy',
      projectName: 'Solar Farm Project',
      certificateUrl: 'https://example.com/new-certificate',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    // Mock the getCarbonUsageSummary method
    mockTrackingService.prototype.getCarbonUsageSummary.mockResolvedValue({
      totalCarbonInKg: 5000,
      offsetCarbonInKg: 30,
      offsetPercentage: 0.6,
      sources: []
    });
  });
  
  const renderComponent = () => {
    return render(
      <CarbonOffsets organizationId="org123" />
    );
  };
  
  it('renders the component with offset history', async () => {
    renderComponent();
    
    // Wait for offsets to load
    await waitFor(() => {
      expect(screen.getByText('Carbon Offsets')).toBeInTheDocument();
      expect(screen.getByText('Purchase Carbon Offsets')).toBeInTheDocument();
      expect(screen.getByText('Offset History')).toBeInTheDocument();
    });
    
    // Check if offset history is displayed
    expect(screen.getByText('Wind Farm Project')).toBeInTheDocument();
    expect(screen.getByText('Reforestation Project')).toBeInTheDocument();
    expect(screen.getByText('10 tonnes')).toBeInTheDocument();
    expect(screen.getByText('20 tonnes')).toBeInTheDocument();
    expect(screen.getByText('$150.00')).toBeInTheDocument();
    expect(screen.getByText('$300.00')).toBeInTheDocument();
    
    // Verify the service was called correctly
    expect(mockTrackingService.prototype.getCarbonOffsets).toHaveBeenCalledWith('org123');
    expect(mockTrackingService.prototype.getCarbonUsageSummary).toHaveBeenCalledWith('org123');
  });
  
  it('opens the purchase offset dialog when Purchase Offsets button is clicked', async () => {
    renderComponent();
    
    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText('Carbon Offsets')).toBeInTheDocument();
    });
    
    // Click the Purchase Offsets button
    fireEvent.click(screen.getByText('Purchase Offsets'));
    
    // Check if dialog is open
    await waitFor(() => {
      expect(screen.getByText('Purchase Carbon Offsets')).toBeInTheDocument();
      expect(screen.getByLabelText('Offset Amount (tonnes)')).toBeInTheDocument();
      expect(screen.getByLabelText('Project Type')).toBeInTheDocument();
    });
  });
  
  it('purchases carbon offsets when form is submitted', async () => {
    renderComponent();
    
    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText('Carbon Offsets')).toBeInTheDocument();
    });
    
    // Click the Purchase Offsets button
    fireEvent.click(screen.getByText('Purchase Offsets'));
    
    // Fill out the form
    await waitFor(() => {
      fireEvent.change(screen.getByLabelText('Offset Amount (tonnes)'), {
        target: { value: '15' }
      });
      
      // Select project type
      const projectTypeSelect = screen.getByLabelText('Project Type');
      fireEvent.mouseDown(projectTypeSelect);
    });
    
    // Select Renewable Energy from dropdown
    const renewableOption = await screen.findByText('Renewable Energy');
    fireEvent.click(renewableOption);
    
    // Submit the form
    fireEvent.click(screen.getByText('Purchase'));
    
    // Verify the service was called correctly
    await waitFor(() => {
      expect(mockTrackingService.prototype.purchaseCarbonOffset).toHaveBeenCalledWith(
        expect.objectContaining({
          organizationId: 'org123',
          amount: 15,
          projectType: 'Renewable Energy',
          provider: 'Cloverly'
        })
      );
    });
    
    // Check if success message is displayed
    await waitFor(() => {
      expect(screen.getByText('Carbon offset purchased successfully!')).toBeInTheDocument();
    });
  });
  
  it('shows an error message when offset purchase fails', async () => {
    // Mock the purchaseCarbonOffset method to throw an error
    mockTrackingService.prototype.purchaseCarbonOffset.mockRejectedValue(new Error('Failed to purchase offset'));
    
    renderComponent();
    
    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText('Carbon Offsets')).toBeInTheDocument();
    });
    
    // Click the Purchase Offsets button
    fireEvent.click(screen.getByText('Purchase Offsets'));
    
    // Fill out the form
    await waitFor(() => {
      fireEvent.change(screen.getByLabelText('Offset Amount (tonnes)'), {
        target: { value: '15' }
      });
      
      // Select project type
      const projectTypeSelect = screen.getByLabelText('Project Type');
      fireEvent.mouseDown(projectTypeSelect);
    });
    
    // Select Renewable Energy from dropdown
    const renewableOption = await screen.findByText('Renewable Energy');
    fireEvent.click(renewableOption);
    
    // Submit the form
    fireEvent.click(screen.getByText('Purchase'));
    
    // Verify error message is shown
    await waitFor(() => {
      expect(screen.getByText('Failed to purchase carbon offset. Please try again.')).toBeInTheDocument();
    });
  });
  
  it('calculates cost based on offset amount', async () => {
    renderComponent();
    
    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText('Carbon Offsets')).toBeInTheDocument();
    });
    
    // Click the Purchase Offsets button
    fireEvent.click(screen.getByText('Purchase Offsets'));
    
    // Fill out the form with 10 tonnes
    await waitFor(() => {
      fireEvent.change(screen.getByLabelText('Offset Amount (tonnes)'), {
        target: { value: '10' }
      });
    });
    
    // Check if estimated cost is displayed correctly (assuming $15 per tonne)
    await waitFor(() => {
      expect(screen.getByText('Estimated Cost: $150.00')).toBeInTheDocument();
    });
    
    // Change to 20 tonnes
    fireEvent.change(screen.getByLabelText('Offset Amount (tonnes)'), {
      target: { value: '20' }
    });
    
    // Check if estimated cost is updated
    await waitFor(() => {
      expect(screen.getByText('Estimated Cost: $300.00')).toBeInTheDocument();
    });
  });
  
  it('displays offset recommendations based on current carbon usage', async () => {
    renderComponent();
    
    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText('Carbon Offsets')).toBeInTheDocument();
    });
    
    // Check if recommendations are displayed
    await waitFor(() => {
      expect(screen.getByText('Carbon Footprint: 5,000 kg')).toBeInTheDocument();
      expect(screen.getByText('Currently Offset: 0.6%')).toBeInTheDocument();
      expect(screen.getByText('Recommended Offset: 5.0 tonnes')).toBeInTheDocument();
    });
  });
});
