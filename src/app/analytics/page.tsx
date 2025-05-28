"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/lib/firebase/auth-context';
import { ProtectedRoute } from '@/components/protected-route';
import { TimePeriod } from '@/lib/analytics/analytics-service';
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
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

// Dashboard metrics interface
interface DashboardMetrics {
  revenue: {
    totalRevenue: number;
    recurringRevenue: number;
    oneTimeRevenue: number;
    averageRevenuePerCustomer: number;
    revenueByPlan: Record<string, number>;
    growthRate: number;
  };
  customers: {
    totalCustomers: number;
    activeCustomers: number;
    newCustomers: number;
    churnRate: number;
    customersByPlan: Record<string, number>;
    customersByStatus: Record<string, number>;
  };
  invoices: {
    totalInvoices: number;
    paidInvoices: number;
    overdueInvoices: number;
    averageInvoiceValue: number;
    invoicesByStatus: Record<string, number>;
  };
  lastUpdated: string;
}

// Time series data interface
interface TimeSeriesData {
  revenue?: Array<{ date: string; revenue: number }>;
  customers?: Array<{ 
    date: string; 
    newCustomers: number; 
    churnedCustomers: number; 
    netGrowth: number 
  }>;
}

// Colors for charts
const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8',
  '#82CA9D', '#FFC658', '#8DD1E1', '#A4DE6C', '#D0ED57'
];

export default function AnalyticsDashboard() {
  const { user, loading } = useAuthContext();
  const router = useRouter();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<string>(TimePeriod.MONTH);
  const [refreshInterval, setRefreshInterval] = useState<number>(300000); // 5 minutes

  // Fetch dashboard metrics when component mounts or period changes
  useEffect(() => {
    if (!loading && user) {
      fetchDashboardData();
    }
  }, [user, loading, selectedPeriod]);

  // Set up auto-refresh
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (user) {
        fetchDashboardData();
      }
    }, refreshInterval);

    return () => clearInterval(intervalId);
  }, [user, refreshInterval, selectedPeriod]);

  // Fetch dashboard metrics and time series data
  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch dashboard metrics
      const metricsResponse = await fetch(`/api/analytics/dashboard?period=${selectedPeriod}`);
      
      if (!metricsResponse.ok) {
        throw new Error('Failed to fetch dashboard metrics');
      }
      
      const metricsData = await metricsResponse.json();
      setMetrics(metricsData.metrics);

      // Fetch revenue time series data
      const revenueResponse = await fetch(`/api/analytics/time-series?type=revenue&period=${selectedPeriod}`);
      
      if (!revenueResponse.ok) {
        throw new Error('Failed to fetch revenue time series data');
      }
      
      const revenueData = await revenueResponse.json();

      // Fetch customer time series data
      const customersResponse = await fetch(`/api/analytics/time-series?type=customers&period=${selectedPeriod}`);
      
      if (!customersResponse.ok) {
        throw new Error('Failed to fetch customer time series data');
      }
      
      const customersData = await customersResponse.json();

      setTimeSeriesData({
        revenue: revenueData.data,
        customers: customersData.data,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle period change
  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
  };

  // Handle refresh interval change
  const handleRefreshIntervalChange = (interval: number) => {
    setRefreshInterval(interval);
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Format percentage
  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  // Prepare data for revenue by plan pie chart
  const prepareRevenueByPlanData = () => {
    if (!metrics) return [];
    
    return Object.entries(metrics.revenue.revenueByPlan).map(([name, value]) => ({
      name,
      value,
    }));
  };

  // Prepare data for customers by plan pie chart
  const prepareCustomersByPlanData = () => {
    if (!metrics) return [];
    
    return Object.entries(metrics.customers.customersByPlan).map(([name, value]) => ({
      name,
      value,
    }));
  };

  // Prepare data for invoices by status pie chart
  const prepareInvoicesByStatusData = () => {
    if (!metrics) return [];
    
    return Object.entries(metrics.invoices.invoicesByStatus).map(([name, value]) => ({
      name,
      value,
    }));
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <div className="flex flex-wrap justify-between items-center mb-6">
          <div className="flex space-x-2 mb-4">
            <select
              value={selectedPeriod}
              onChange={(e) => handlePeriodChange(e.target.value)}
              className="border rounded-md px-3 py-2"
            >
              <option value={TimePeriod.DAY}>Today</option>
              <option value={TimePeriod.WEEK}>This Week</option>
              <option value={TimePeriod.MONTH}>This Month</option>
              <option value={TimePeriod.QUARTER}>This Quarter</option>
              <option value={TimePeriod.YEAR}>This Year</option>
            </select>
            
            <select
              value={refreshInterval}
              onChange={(e) => handleRefreshIntervalChange(parseInt(e.target.value, 10))}
              className="border rounded-md px-3 py-2"
            >
              <option value={60000}>Refresh: 1 minute</option>
              <option value={300000}>Refresh: 5 minutes</option>
              <option value={600000}>Refresh: 10 minutes</option>
              <option value={1800000}>Refresh: 30 minutes</option>
              <option value={3600000}>Refresh: 1 hour</option>
            </select>
          </div>
          
          <button
            onClick={fetchDashboardData}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
          >
            Refresh Now
          </button>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : metrics ? (
          <div>
            {/* Key Metrics Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white shadow-md rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-700 mb-4">Revenue</h2>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Total Revenue</span>
                  <span className="text-2xl font-bold">{formatCurrency(metrics.revenue.totalRevenue)}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Recurring Revenue</span>
                  <span className="text-lg">{formatCurrency(metrics.revenue.recurringRevenue)}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">One-Time Revenue</span>
                  <span className="text-lg">{formatCurrency(metrics.revenue.oneTimeRevenue)}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Avg. Revenue Per Customer</span>
                  <span className="text-lg">{formatCurrency(metrics.revenue.averageRevenuePerCustomer)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Growth Rate</span>
                  <span className={`text-lg ${metrics.revenue.growthRate >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {formatPercentage(metrics.revenue.growthRate)}
                  </span>
                </div>
              </div>
              
              <div className="bg-white shadow-md rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-700 mb-4">Customers</h2>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Total Customers</span>
                  <span className="text-2xl font-bold">{metrics.customers.totalCustomers}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Active Customers</span>
                  <span className="text-lg">{metrics.customers.activeCustomers}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">New Customers</span>
                  <span className="text-lg">{metrics.customers.newCustomers}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Churn Rate</span>
                  <span className="text-lg text-red-500">{formatPercentage(metrics.customers.churnRate)}</span>
                </div>
              </div>
              
              <div className="bg-white shadow-md rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-700 mb-4">Invoices</h2>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Total Invoices</span>
                  <span className="text-2xl font-bold">{metrics.invoices.totalInvoices}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Paid Invoices</span>
                  <span className="text-lg">{metrics.invoices.paidInvoices}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Overdue Invoices</span>
                  <span className="text-lg text-red-500">{metrics.invoices.overdueInvoices}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Avg. Invoice Value</span>
                  <span className="text-lg">{formatCurrency(metrics.invoices.averageInvoiceValue)}</span>
                </div>
              </div>
            </div>
            
            {/* Revenue Chart */}
            <div className="bg-white shadow-md rounded-lg p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Revenue Trend</h2>
              <div className="h-80">
                {timeSeriesData.revenue && timeSeriesData.revenue.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={timeSeriesData.revenue}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis 
                        tickFormatter={(value) => `$${value.toLocaleString()}`} 
                      />
                      <Tooltip 
                        formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} 
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#0088FE" 
                        activeDot={{ r: 8 }} 
                        name="Revenue" 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex justify-center items-center h-full">
                    <p className="text-gray-500">No revenue data available</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Customer Growth Chart */}
            <div className="bg-white shadow-md rounded-lg p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Customer Growth</h2>
              <div className="h-80">
                {timeSeriesData.customers && timeSeriesData.customers.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={timeSeriesData.customers}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="newCustomers" fill="#00C49F" name="New Customers" />
                      <Bar dataKey="churnedCustomers" fill="#FF8042" name="Churned Customers" />
                      <Bar dataKey="netGrowth" fill="#0088FE" name="Net Growth" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex justify-center items-center h-full">
                    <p className="text-gray-500">No customer growth data available</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Distribution Charts */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Revenue by Plan */}
              <div className="bg-white shadow-md rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-700 mb-4">Revenue by Plan</h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={prepareRevenueByPlanData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {prepareRevenueByPlanData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              {/* Customers by Plan */}
              <div className="bg-white shadow-md rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-700 mb-4">Customers by Plan</h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={prepareCustomersByPlanData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {prepareCustomersByPlanData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              {/* Invoices by Status */}
              <div className="bg-white shadow-md rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-700 mb-4">Invoices by Status</h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={prepareInvoicesByStatusData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {prepareInvoicesByStatusData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            
            <div className="text-right text-sm text-gray-500">
              Last updated: {new Date(metrics.lastUpdated).toLocaleString()}
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-500">No data available</p>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
