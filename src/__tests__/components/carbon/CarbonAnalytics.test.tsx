import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import CarbonAnalytics from '../../../components/carbon/CarbonAnalytics';
import { CarbonTrackingService } from '../../../lib/carbon/carbon-tracking-service';

// Mock the CarbonTrackingService
jest.mock('../../../lib/carbon/carbon-tracking-service');

// Mock the useAuth hook
jest.mock('../../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { uid: 'test-user-id' }
  })
}));

// Mock recharts components
jest.mock('recharts', () => {
  const OriginalModule = jest.requireActual('recharts');
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children }) => <div data-testid="responsive-container">{children}</div>,
    LineChart: ({ children }) => <div data-testid="line-chart">{children}</div>,
    BarChart: ({ children }) => <div data-testid="bar-chart">{children}</div>,
    PieChart: ({ children }) => <div data-testid="pie-chart">{children}</div>,
    Line: () => <div data-testid="line" />,
    Bar: () => <div data-testid="bar" />,
    Pie: () => <div data-testid="pie" />,
    XAxis: () => <div data-testid="x-axis" />,
    YAxis: () => <div data-testid="y-axis" />,
    CartesianGrid: () => <div data-testid="cartesian-grid" />,
    Tooltip: () => <div data-testid="tooltip" />,
    Legend: () => <div data-testid="legend" />,
    Cell: () => <div data-testid="cell" />,
  };
});

describe('CarbonAnalytics', () => {
  const mockTrackingService = CarbonTrackingService as jest.MockedClass<typeof CarbonTrackingService>;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock the getEmissionsTimeSeries method
    mockTrackingService.prototype.getEmissionsTimeSeries.mockResolvedValue([
      {
        date: new Date('2025-05-01'),
        totalEmissions: 100,
        offsetEmissions: 30,
      },
      {
        date: new Date('2025-05-02'),
        totalEmissions: 110,
        offsetEmissions: 35,
      },
      {
        date: new Date('2025-05-03'),
        totalEmissions: 95,
        offsetEmissions: 25,
      }
    ]);
    
    // Mock the getEmissionsBreakdown method
    mockTrackingService.prototype.getEmissionsBreakdown.mockResolvedValue([
      {
        source: 'Electricity',
        emissions: 50,
        percentage: 50,
      },
      {
        source: 'Transportation',
        emissions: 30,
        percentage: 30,
      },
      {
        source: 'Other',
        emissions: 20,
        percentage: 20,
      }
    ]);
    
    // Mock the getEmissionsTrends method
    mockTrackingService.prototype.getEmissionsTrends.mockResolvedValue([
      {
        period: 'Week over Week',
        change: -5,
        percentageChange: -5,
      },
      {
        period: 'Month over Month',
        change: -20,
        percentageChange: -15,
      },
      {
        period: 'Quarter over Quarter',
        change: -50,
        percentageChange: -25,
      },
      {
        period: 'Year over Year',
        change: -100,
        percentageChange: -40,
      }
    ]);
  });
  
  const renderComponent = () => {
    return render(
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <CarbonAnalytics organizationId="org123" />
      </LocalizationProvider>
    );
  };
  
  it('renders the component with analytics data', async () => {
    renderComponent();
    
    // Wait for analytics to load
    await waitFor(() => {
      expect(screen.getByText('Carbon Analytics')).toBeInTheDocument();
      expect(screen.getByText('Emissions Trends')).toBeInTheDocument();
      expect(screen.getByText('Emissions Over Time')).toBeInTheDocument();
      expect(screen.getByText('Emissions Breakdown')).toBeInTheDocument();
      expect(screen.getByText('Emissions by Source')).toBeInTheDocument();
    });
    
    // Verify the service was called correctly
    expect(mockTrackingService.prototype.getEmissionsTimeSeries).toHaveBeenCalledWith(
      'org123',
      expect.any(Date),
      expect.any(Date),
      undefined,
      undefined
    );
    
    expect(mockTrackingService.prototype.getEmissionsBreakdown).toHaveBeenCalledWith(
      'org123',
      expect.any(Date),
      expect.any(Date),
      undefined,
      undefined
    );
    
    expect(mockTrackingService.prototype.getEmissionsTrends).toHaveBeenCalledWith(
      'org123',
      expect.any(Date),
      expect.any(Date),
      undefined,
      undefined
    );
  });
  
  it('changes time range when dropdown is changed', async () => {
    renderComponent();
    
    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText('Carbon Analytics')).toBeInTheDocument();
    });
    
    // Clear mocks to track new calls
    mockTrackingService.prototype.getEmissionsTimeSeries.mockClear();
    mockTrackingService.prototype.getEmissionsBreakdown.mockClear();
    mockTrackingService.prototype.getEmissionsTrends.mockClear();
    
    // Change time range
    await waitFor(() => {
      const timeRangeSelect = screen.getByLabelText('Time Range');
      fireEvent.mouseDown(timeRangeSelect);
    });
    
    // Select 7 days from dropdown
    const sevenDaysOption = await screen.findByText('Last 7 Days');
    fireEvent.click(sevenDaysOption);
    
    // Verify the service was called with updated date range
    await waitFor(() => {
      expect(mockTrackingService.prototype.getEmissionsTimeSeries).toHaveBeenCalledWith(
        'org123',
        expect.any(Date), // Should be 7 days ago
        expect.any(Date),
        undefined,
        undefined
      );
    });
  });
  
  it('shows custom date pickers when custom range is selected', async () => {
    renderComponent();
    
    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText('Carbon Analytics')).toBeInTheDocument();
    });
    
    // Change time range to custom
    await waitFor(() => {
      const timeRangeSelect = screen.getByLabelText('Time Range');
      fireEvent.mouseDown(timeRangeSelect);
    });
    
    // Select Custom Range from dropdown
    const customOption = await screen.findByText('Custom Range');
    fireEvent.click(customOption);
    
    // Verify date pickers are shown
    await waitFor(() => {
      expect(screen.getByLabelText('Start Date')).toBeInTheDocument();
      expect(screen.getByLabelText('End Date')).toBeInTheDocument();
    });
  });
  
  it('displays error when custom dates are not selected', async () => {
    renderComponent();
    
    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText('Carbon Analytics')).toBeInTheDocument();
    });
    
    // Change time range to custom
    await waitFor(() => {
      const timeRangeSelect = screen.getByLabelText('Time Range');
      fireEvent.mouseDown(timeRangeSelect);
    });
    
    // Select Custom Range from dropdown
    const customOption = await screen.findByText('Custom Range');
    fireEvent.click(customOption);
    
    // Verify error message is shown
    await waitFor(() => {
      expect(screen.getByText('Please select both start and end dates')).toBeInTheDocument();
    });
  });
  
  it('formats carbon values correctly', async () => {
    // Mock large carbon values
    mockTrackingService.prototype.getEmissionsTrends.mockResolvedValue([
      {
        period: 'Year over Year',
        change: -1500,
        percentageChange: -40,
      }
    ]);
    
    renderComponent();
    
    // Wait for analytics to load
    await waitFor(() => {
      expect(screen.getByText('Carbon Analytics')).toBeInTheDocument();
    });
    
    // Verify large carbon values are formatted correctly
    await waitFor(() => {
      expect(screen.getByText('1.5 tonnes CO₂e')).toBeInTheDocument();
    });
  });
  
  it('filters analytics by department and project', async () => {
    // Render with department and project props
    render(
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <CarbonAnalytics 
          organizationId="org123" 
          departmentId="dept123" 
          projectId="proj123"
        />
      </LocalizationProvider>
    );
    
    // Verify the service was called with the correct filters
    await waitFor(() => {
      expect(mockTrackingService.prototype.getEmissionsTimeSeries).toHaveBeenCalledWith(
        'org123',
        expect.any(Date),
        expect.any(Date),
        'dept123',
        'proj123'
      );
      
      expect(mockTrackingService.prototype.getEmissionsBreakdown).toHaveBeenCalledWith(
        'org123',
        expect.any(Date),
        expect.any(Date),
        'dept123',
        'proj123'
      );
      
      expect(mockTrackingService.prototype.getEmissionsTrends).toHaveBeenCalledWith(
        'org123',
        expect.any(Date),
        expect.any(Date),
        'dept123',
        'proj123'
      );
    });
  });
});
