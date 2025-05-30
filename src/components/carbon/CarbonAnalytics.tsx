import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Stack,
  Tooltip,
  IconButton
} from '@mui/material';
import {
  Info as InfoIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { CarbonTrackingService } from '../../lib/carbon/carbon-tracking-service';
import { useAuth } from '../../hooks/useAuth';

interface CarbonAnalyticsProps {
  organizationId: string;
  departmentId?: string;
  projectId?: string;
}

interface EmissionsData {
  date: string;
  totalEmissions: number;
  offsetEmissions: number;
  netEmissions: number;
}

interface EmissionsBreakdown {
  source: string;
  emissions: number;
  percentage: number;
}

interface EmissionsTrend {
  period: string;
  change: number;
  percentageChange: number;
}

const CHART_COLORS = ['#2196f3', '#4caf50', '#f44336', '#ff9800', '#9c27b0', '#795548'];

const CarbonAnalytics: React.FC<CarbonAnalyticsProps> = ({
  organizationId,
  departmentId,
  projectId
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y' | 'custom'>('30d');
  const [customStartDate, setCustomStartDate] = useState<Date | null>(null);
  const [customEndDate, setCustomEndDate] = useState<Date | null>(null);
  const [emissionsData, setEmissionsData] = useState<EmissionsData[]>([]);
  const [emissionsBreakdown, setEmissionsBreakdown] = useState<EmissionsBreakdown[]>([]);
  const [emissionsTrends, setEmissionsTrends] = useState<EmissionsTrend[]>([]);

  const trackingService = new CarbonTrackingService();

  useEffect(() => {
    if (organizationId) {
      loadAnalytics();
    }
  }, [organizationId, departmentId, projectId, timeRange, customStartDate, customEndDate]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      // Calculate date range
      const endDate = new Date();
      let startDate = new Date();

      switch (timeRange) {
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(endDate.getDate() - 90);
          break;
        case '1y':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
        case 'custom':
          if (!customStartDate || !customEndDate) {
            setError('Please select both start and end dates');
            return;
          }
          startDate = customStartDate;
          break;
      }

      // Load emissions data
      const emissions = await trackingService.getEmissionsTimeSeries(
        organizationId,
        startDate,
        endDate,
        departmentId,
        projectId
      );

      // Transform emissions data
      const transformedEmissions = emissions.map(e => ({
        date: new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        totalEmissions: e.totalEmissions,
        offsetEmissions: e.offsetEmissions,
        netEmissions: e.totalEmissions - e.offsetEmissions
      }));

      // Load emissions breakdown
      const breakdown = await trackingService.getEmissionsBreakdown(
        organizationId,
        startDate,
        endDate,
        departmentId,
        projectId
      );

      // Load emissions trends
      const trends = await trackingService.getEmissionsTrends(
        organizationId,
        startDate,
        endDate,
        departmentId,
        projectId
      );

      setEmissionsData(transformedEmissions);
      setEmissionsBreakdown(breakdown);
      setEmissionsTrends(trends);
    } catch (err) {
      console.error('Error loading analytics:', err);
      setError('Failed to load carbon analytics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatCarbon = (kg: number): string => {
    if (kg >= 1000) {
      return `${(kg / 1000).toFixed(1)} tonnes CO₂e`;
    }
    return `${kg.toFixed(1)} kg CO₂e`;
  };

  const renderTrendCard = (trend: EmissionsTrend) => {
    const isPositive = trend.change > 0;
    return (
      <Card>
        <CardContent>
          <Typography variant="subtitle2" color="textSecondary" gutterBottom>
            {trend.period}
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            {isPositive ? (
              <TrendingUpIcon color="error" />
            ) : (
              <TrendingDownIcon color="success" />
            )}
            <Typography variant="h6" color={isPositive ? 'error' : 'success'}>
              {isPositive ? '+' : ''}{trend.percentageChange.toFixed(1)}%
            </Typography>
          </Stack>
          <Typography variant="body2" color="textSecondary">
            {formatCarbon(Math.abs(trend.change))}
          </Typography>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Carbon Analytics</Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              label="Time Range"
              onChange={(e) => setTimeRange(e.target.value as typeof timeRange)}
            >
              <MenuItem value="7d">Last 7 Days</MenuItem>
              <MenuItem value="30d">Last 30 Days</MenuItem>
              <MenuItem value="90d">Last 90 Days</MenuItem>
              <MenuItem value="1y">Last Year</MenuItem>
              <MenuItem value="custom">Custom Range</MenuItem>
            </Select>
          </FormControl>

          {timeRange === 'custom' && (
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Start Date"
                value={customStartDate}
                onChange={setCustomStartDate}
                slotProps={{ textField: { size: 'small' } }}
              />
              <DatePicker
                label="End Date"
                value={customEndDate}
                onChange={setCustomEndDate}
                slotProps={{ textField: { size: 'small' } }}
              />
            </LocalizationProvider>
          )}
        </Stack>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <Grid container spacing={3}>
          {/* Emissions Trends */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Emissions Trends
            </Typography>
            <Grid container spacing={2}>
              {emissionsTrends.map((trend, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  {renderTrendCard(trend)}
                </Grid>
              ))}
            </Grid>
          </Grid>

          {/* Emissions Over Time Chart */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Emissions Over Time
                </Typography>
                <Box height={400}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={emissionsData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <ChartTooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="totalEmissions"
                        name="Total Emissions"
                        stroke="#2196f3"
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="offsetEmissions"
                        name="Offset Emissions"
                        stroke="#4caf50"
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="netEmissions"
                        name="Net Emissions"
                        stroke="#f44336"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Emissions Breakdown */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Emissions Breakdown
                </Typography>
                <Box height={400}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={emissionsBreakdown}
                        dataKey="emissions"
                        nameKey="source"
                        cx="50%"
                        cy="50%"
                        outerRadius={150}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
                      >
                        {emissionsBreakdown.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={CHART_COLORS[index % CHART_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <ChartTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Emissions by Source */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Emissions by Source
                </Typography>
                <Box height={400}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={emissionsBreakdown} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="source" />
                      <YAxis />
                      <ChartTooltip />
                      <Bar dataKey="emissions" name="Emissions (kg CO₂e)">
                        {emissionsBreakdown.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={CHART_COLORS[index % CHART_COLORS.length]}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default CarbonAnalytics;
