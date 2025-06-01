import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { expect, jest, describe, beforeEach, it } from '@jest/globals';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import CarbonGoalTracker from '../../../components/carbon/CarbonGoalTracker';
import { CarbonGoalsService } from '../../../lib/carbon/carbon-goals-service';

// Mock the CarbonGoalsService - this will use the automatic mock from __mocks__
jest.mock('../../../lib/carbon/carbon-goals-service');

// Mock the useAuth hook
jest.mock('../../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { uid: 'test-user-id' }
  })
}));

// Get the mocked class
const MockedCarbonGoalsService = CarbonGoalsService as jest.MockedClass<typeof CarbonGoalsService>;

describe('CarbonGoalTracker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  const renderComponent = () => {
    return render(
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <CarbonGoalTracker organizationId="org123" />
      </LocalizationProvider>
    );
  };
  
  it('renders the component with goals', async () => {
    renderComponent();
    
    // Wait for goals to load
    await waitFor(() => {
      expect(screen.getByText('Carbon Reduction Goals')).toBeInTheDocument();
      expect(screen.getByText('Reduce Office Emissions')).toBeInTheDocument();
      expect(screen.getByText('Reduce Travel Emissions')).toBeInTheDocument();
    }, { timeout: 10000 });
  });
  
  it('opens the create goal dialog when Add Goal button is clicked', async () => {
    renderComponent();
    
    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText('Carbon Reduction Goals')).toBeInTheDocument();
    });
    
    // Click the Add Goal button
    fireEvent.click(screen.getByText('Add Goal'));
    
    // Check if dialog is open
    await waitFor(() => {
      expect(screen.getByText('Create Carbon Reduction Goal')).toBeInTheDocument();
      expect(screen.getByLabelText('Goal Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Baseline Carbon')).toBeInTheDocument();
      expect(screen.getByLabelText('Target Reduction')).toBeInTheDocument();
    });
  });
  
  it('creates a new goal when form is submitted', async () => {
    // Mock the createGoal method
    const mockCreateGoal = jest.fn().mockResolvedValue({
      id: 'new-goal',
      name: 'New Test Goal',
      description: 'Test Description',
      organizationId: 'org123',
      baselineCarbonInKg: 1500,
      targetCarbonInKg: 1200,
      targetReductionPercentage: 20,
      startDate: new Date('2025-01-01'),
      targetDate: new Date('2025-12-31'),
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    MockedCarbonGoalsService.prototype.createGoal = mockCreateGoal;
    
    renderComponent();
    
    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText('Carbon Reduction Goals')).toBeInTheDocument();
    });
    
    // Click the Add Goal button
    fireEvent.click(screen.getByText('Add Goal'));
    
    // Fill out the form
    await waitFor(() => {
      fireEvent.change(screen.getByLabelText('Goal Name'), {
        target: { value: 'New Test Goal' }
      });
      
      fireEvent.change(screen.getByLabelText('Description (optional)'), {
        target: { value: 'Test Description' }
      });
      
      fireEvent.change(screen.getByLabelText('Baseline Carbon'), {
        target: { value: '1500' }
      });
      
      fireEvent.change(screen.getByLabelText('Target Reduction'), {
        target: { value: '20' }
      });
    });
    
    // Submit the form
    fireEvent.click(screen.getByText('Create'));
    
    // Verify the service was called correctly
    await waitFor(() => {
      expect(mockCreateGoal).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'New Test Goal',
          description: 'Test Description',
          organizationId: 'org123',
          baselineCarbonInKg: 1500,
          targetReductionPercentage: 20,
          startDate: expect.any(Date),
          targetDate: expect.any(Date),
          status: 'active'
        })
      );
    });
  });
  
  it('shows an error message when goal creation fails', async () => {
    // Mock the createGoal method to throw an error
    const mockCreateGoal = jest.fn().mockRejectedValue(new Error('Failed to create goal'));
    MockedCarbonGoalsService.prototype.createGoal = mockCreateGoal;
    
    renderComponent();
    
    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText('Carbon Reduction Goals')).toBeInTheDocument();
    });
    
    // Click the Add Goal button
    fireEvent.click(screen.getByText('Add Goal'));
    
    // Fill out the form
    await waitFor(() => {
      fireEvent.change(screen.getByLabelText('Goal Name'), {
        target: { value: 'New Test Goal' }
      });
      
      fireEvent.change(screen.getByLabelText('Baseline Carbon'), {
        target: { value: '1500' }
      });
      
      fireEvent.change(screen.getByLabelText('Target Reduction'), {
        target: { value: '20' }
      });
    });
    
    // Submit the form
    fireEvent.click(screen.getByText('Create'));
    
    // Verify error message is shown
    await waitFor(() => {
      expect(screen.getByText('Failed to save carbon reduction goal. Please try again.')).toBeInTheDocument();
    });
  });
  
  it('filters goals by department and project', async () => {
    // Mock the getGoals method
    const mockGetGoals = jest.fn().mockResolvedValue([]);
    MockedCarbonGoalsService.prototype.getGoals = mockGetGoals;
    
    // Render with department and project props
    render(
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <CarbonGoalTracker 
          organizationId="org123" 
          departmentId="dept123" 
          projectId="proj123"
        />
      </LocalizationProvider>
    );
    
    // Verify the service was called with the correct filters
    await waitFor(() => {
      expect(mockGetGoals).toHaveBeenCalledWith(
        'org123',
        'dept123',
        'proj123',
        'active'
      );
    });
  });
});
