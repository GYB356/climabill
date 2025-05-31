import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CarbonOffsets from '../../../components/carbon/CarbonOffsets';

// Mock the services
const mockOffsetService = {
  carbonTrackingService: {
    getCarbonOffsets: jest.fn().mockResolvedValue([
      {
        id: 'offset-123',
        amount: 500,
        cost: 250,
        currency: 'USD',
        date: new Date('2025-04-01'),
        projectId: 'project-1',
        projectName: 'Renewable Energy Project',
        status: 'completed',
        paymentMethod: 'credit_card',
        carbonInKg: 500,
        projectType: 'renewable_energy'
      },
      {
        id: 'offset-124',
        amount: 300,
        cost: 150,
        currency: 'USD',
        date: new Date('2025-03-01'),
        projectId: 'project-2',
        projectName: 'Reforestation Project',
        status: 'completed',
        paymentMethod: 'paypal',
        carbonInKg: 300,
        projectType: 'reforestation'
      },
    ]),
    purchaseCarbonOffset: jest.fn().mockResolvedValue({ id: 'test' })
  }
};

const mockCloverlyClient = {
  estimateOffset: jest.fn().mockResolvedValue({
    cost: 25,
    currency: 'USD',
    carbonInKg: 1000,
    projectType: 'reforestation',
    projectName: 'Test Project',
    projectLocation: 'Test Location',
    projectDescription: 'Test Description'
  })
};

describe('CarbonOffsets', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  const renderComponent = () => {
    return render(
      <CarbonOffsets 
        organizationId="org123"
        offsetService={mockOffsetService}
        cloverlyClient={mockCloverlyClient}
      />
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
    
    // Check if offset data is displayed
    await waitFor(() => {
      expect(screen.getByText('Project: Renewable Energy Project')).toBeInTheDocument();
      expect(screen.getByText('Project: Reforestation Project')).toBeInTheDocument();
    });
  });
  
  it('opens the purchase offset dialog when Purchase Offsets button is clicked', async () => {
    renderComponent();
    
    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText('Carbon Offsets')).toBeInTheDocument();
    });
    
    // Click the Purchase Offsets button
    fireEvent.click(screen.getByText('Purchase Carbon Offsets'));
    
    // Check if dialog is open - use getAllByText to handle duplicate text
    await waitFor(() => {
      const dialogTitles = screen.getAllByText('Purchase Carbon Offsets');
      expect(dialogTitles.length).toBeGreaterThan(0);
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
    fireEvent.click(screen.getByText('Purchase Carbon Offsets'));
    
    // Fill out the form
    await waitFor(() => {
      fireEvent.change(screen.getByLabelText('Offset Amount (tonnes)'), {
        target: { value: '15' }
      });
      
      // Select project type using change event for HTML select
      const projectTypeSelect = screen.getByLabelText('Project Type');
      fireEvent.change(projectTypeSelect, {
        target: { value: 'renewable_energy' }
      });
    });
    
    // Get estimate first
    fireEvent.click(screen.getByText('Get Estimate'));
    
    // Wait for estimate and then click Purchase
    await waitFor(() => {
      expect(screen.getByText('Purchase')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Purchase'));
    
    // Verify the service was called correctly
    await waitFor(() => {
      expect(mockOffsetService.carbonTrackingService.purchaseCarbonOffset).toHaveBeenCalledWith(
        expect.objectContaining({
          organizationId: 'org123',
          amount: 15,
          projectType: 'renewable_energy',
          provider: 'Cloverly'
        })
      );
    });
  });
  
  it('shows an error message when offset purchase fails', async () => {
    // Mock the purchaseCarbonOffset method to throw an error
    mockOffsetService.carbonTrackingService.purchaseCarbonOffset.mockRejectedValue(new Error('Failed to purchase offset'));
    
    renderComponent();
    
    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText('Carbon Offsets')).toBeInTheDocument();
    });
    
    // Click the Purchase Offsets button
    fireEvent.click(screen.getByText('Purchase Carbon Offsets'));
    
    // Fill out the form
    await waitFor(() => {
      fireEvent.change(screen.getByLabelText('Offset Amount (tonnes)'), {
        target: { value: '15' }
      });
      
      // Select project type using change event for HTML select
      const projectTypeSelect = screen.getByLabelText('Project Type');
      fireEvent.change(projectTypeSelect, {
        target: { value: 'renewable_energy' }
      });
    });
    
    // Get estimate first
    fireEvent.click(screen.getByText('Get Estimate'));
    
    // Wait for estimate and then click Purchase
    await waitFor(() => {
      expect(screen.getByText('Purchase')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Purchase'));
    
    // Verify error message is shown
    await waitFor(() => {
      expect(screen.getAllByText('Failed to purchase offset. Please try again.')[0]).toBeInTheDocument();
    });
  });
  
  it('calculates cost based on offset amount', async () => {
    renderComponent();
    
    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText('Carbon Offsets')).toBeInTheDocument();
    });
    
    // Click the Purchase Offsets button
    fireEvent.click(screen.getByText('Purchase Carbon Offsets'));
    
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
