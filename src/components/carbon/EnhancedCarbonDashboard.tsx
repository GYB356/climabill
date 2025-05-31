"use client";

import { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { CachedCarbonTrackingService } from '@/lib/carbon/cached-carbon-tracking-service';
import EnhancedChart, { ChartType } from '@/components/data-visualization/EnhancedChart';
import { useAuth } from '@/components/providers/auth-provider';
import LanguageSelector from '@/components/layout/LanguageSelector';

// Time range options for the dashboard
const TIME_RANGES = ['thisMonth', 'lastMonth', 'thisQuarter', 'lastQuarter', 'thisYear', 'lastYear'];

// Sample color palette for the charts
const COLOR_PALETTE = [
  '#10b981', // emerald-500
  '#ef4444', // red-500
  '#3b82f6', // blue-500
  '#f97316', // orange-500
  '#8b5cf6', // violet-500
  '#14b8a6', // teal-500
  '#f59e0b', // amber-500
  '#6366f1', // indigo-500
];

/**
 * Enhanced Carbon Dashboard component with caching, internationalization, and interactive charts
 */
export default function EnhancedCarbonDashboard() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('thisMonth');
  
  // Carbon data states
  const [emissionsData, setEmissionsData] = useState<{
    labels: string[];
    usage: number[];
    offset: number[];
    net: number[];
  }>({
    labels: [],
    usage: [],
    offset: [],
    net: []
  });
  
  const [breakdownData, setBreakdownData] = useState<{
    labels: string[];
    values: number[];
  }>({
    labels: [],
    values: []
  });
  
  // Create cached carbon tracking service
  const carbonTrackingService = new CachedCarbonTrackingService();
  
  // Function to get date range based on selected time range
  const getDateRange = (range: string): { startDate: Date; endDate: Date } => {
    const now = new Date();
    let startDate = new Date();
    let endDate = new Date();
    
    switch(range) {
      case 'thisMonth':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case 'lastMonth':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case 'thisQuarter':
        const currentQuarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), currentQuarter * 3, 1);
        endDate = new Date(now.getFullYear(), (currentQuarter + 1) * 3, 0);
        break;
      case 'lastQuarter':
        const lastQuarter = Math.floor(now.getMonth() / 3) - 1;
        const lastQuarterYear = lastQuarter < 0 ? now.getFullYear() - 1 : now.getFullYear();
        const adjustedLastQuarter = lastQuarter < 0 ? 3 : lastQuarter;
        startDate = new Date(lastQuarterYear, adjustedLastQuarter * 3, 1);
        endDate = new Date(lastQuarterYear, (adjustedLastQuarter + 1) * 3, 0);
        break;
      case 'thisYear':
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31);
        break;
      case 'lastYear':
        startDate = new Date(now.getFullYear() - 1, 0, 1);
        endDate = new Date(now.getFullYear() - 1, 11, 31);
        break;
      default:
        // Default to this month
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    }
    
    return { startDate, endDate };
  };
  
  // Function to format carbon values
  const formatCarbonValue = (value: number): string => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(2)} ${t('carbon.units.tonnes')}`;
    }
    return `${value.toFixed(2)} ${t('carbon.units.kg')}`;
  };
  
  // Load dashboard data
  const loadDashboardData = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { startDate, endDate } = getDateRange(selectedTimeRange);
      
      // Get carbon usage data - this will use the cache if available
      const usageData = await carbonTrackingService.getCarbonUsageForPeriod(
        user.uid,
        startDate,
        endDate
      );
      
      // Get offset data - this will use the cache if available
      const offsetAmount = await carbonTrackingService.getOffsetCarbonForPeriod(
        user.uid,
        startDate,
        endDate
      );
      
      // Generate sample data for the chart (in a real application, this would come from actual usage data)
      // This is simulated data based on the time range for demonstration purposes
      const months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ];
      
      let labels: string[] = [];
      let usageValues: number[] = [];
      let offsetValues: number[] = [];
      let netValues: number[] = [];
      
      // Generate sample time series data based on selected range
      if (selectedTimeRange.includes('Month')) {
        // Daily data for month view
        const daysInMonth = new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0).getDate();
        labels = Array.from({ length: daysInMonth }, (_, i) => `${i + 1}`);
        
        // Generate some random data that looks plausible
        for (let i = 0; i < daysInMonth; i++) {
          const usage = Math.random() * 10 + 5; // 5-15 kg per day
          const offset = Math.random() * 5 + 2; // 2-7 kg per day
          usageValues.push(usage);
          offsetValues.push(offset);
          netValues.push(usage - offset);
        }
      } else if (selectedTimeRange.includes('Quarter')) {
        // Monthly data for quarter view
        const startMonth = startDate.getMonth();
        labels = [months[startMonth], months[startMonth + 1], months[startMonth + 2]];
        
        // Generate some random data that looks plausible
        for (let i = 0; i < 3; i++) {
          const usage = Math.random() * 200 + 100; // 100-300 kg per month
          const offset = Math.random() * 100 + 50; // 50-150 kg per month
          usageValues.push(usage);
          offsetValues.push(offset);
          netValues.push(usage - offset);
        }
      } else {
        // Monthly data for year view
        labels = months;
        
        // Generate some random data that looks plausible
        for (let i = 0; i < 12; i++) {
          const usage = Math.random() * 200 + 100; // 100-300 kg per month
          const offset = Math.random() * 100 + 50; // 50-150 kg per month
          usageValues.push(usage);
          offsetValues.push(offset);
          netValues.push(usage - offset);
        }
      }
      
      setEmissionsData({
        labels,
        usage: usageValues,
        offset: offsetValues,
        net: netValues
      });
      
      // Set breakdown data
      setBreakdownData({
        labels: [
          t('carbon.metrics.invoices'),
          t('carbon.metrics.emails'),
          t('carbon.metrics.storage'),
          t('carbon.metrics.api'),
          t('carbon.metrics.custom')
        ],
        values: [
          // Sample values - in a real app, this would come from actual usage data
          Math.random() * 100 + 50, // Invoices
          Math.random() * 50 + 20,  // Emails
          Math.random() * 80 + 30,  // Storage
          Math.random() * 40 + 10,  // API Calls
          Math.random() * 30 + 5    // Custom Usage
        ]
      });
      
      setLoading(false);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError(t('errors.generic'));
      setLoading(false);
    }
  };
  
  // Handle time range change
  const handleTimeRangeChange = (range: string) => {
    setSelectedTimeRange(range);
  };
  
  // Load data when component mounts or time range changes
  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user, selectedTimeRange, router.locale]);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">
          {t('carbon.dashboard')}
        </h1>
        <LanguageSelector />
      </div>
      
      {/* Loading and error states */}
      {loading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}
      
      {!loading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Carbon Emissions Chart */}
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
            <h2 className="text-lg font-semibold mb-4">{t('carbon.footprint')}</h2>
            <EnhancedChart
              type="line"
              labels={emissionsData.labels}
              datasets={[
                {
                  label: t('carbon.usage'),
                  data: emissionsData.usage,
                  borderColor: COLOR_PALETTE[0],
                  backgroundColor: `${COLOR_PALETTE[0]}20`,
                },
                {
                  label: t('carbon.offset'),
                  data: emissionsData.offset,
                  borderColor: COLOR_PALETTE[1],
                  backgroundColor: `${COLOR_PALETTE[1]}20`,
                },
                {
                  label: t('carbon.net'),
                  data: emissionsData.net,
                  borderColor: COLOR_PALETTE[2],
                  backgroundColor: `${COLOR_PALETTE[2]}20`,
                }
              ]}
              timeRanges={TIME_RANGES}
              onTimeRangeChange={handleTimeRangeChange}
              dataFormatter={formatCarbonValue}
              options={{
                plugins: {
                  tooltip: {
                    mode: 'index',
                    intersect: false,
                  },
                },
                scales: {
                  y: {
                    title: {
                      display: true,
                      text: t('carbon.units.kg'),
                    },
                  },
                },
              }}
              colorPalette={COLOR_PALETTE}
            />
          </div>
          
          {/* Carbon Breakdown Chart */}
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
            <h2 className="text-lg font-semibold mb-4">{t('carbon.details')}</h2>
            <EnhancedChart
              type="doughnut"
              labels={breakdownData.labels}
              datasets={[
                {
                  label: t('carbon.usage'),
                  data: breakdownData.values,
                  backgroundColor: COLOR_PALETTE,
                }
              ]}
              allowTypeChange={true}
              showControls={true}
              dataFormatter={formatCarbonValue}
              options={{
                plugins: {
                  legend: {
                    display: false,
                  },
                },
              }}
              colorPalette={COLOR_PALETTE}
            />
          </div>
          
          {/* Total Carbon Stats */}
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100 lg:col-span-2">
            <h2 className="text-lg font-semibold mb-4">{t('carbon.total')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-100">
                <h3 className="text-sm font-medium text-emerald-800">{t('carbon.usage')}</h3>
                <p className="text-2xl font-bold text-emerald-600">
                  {formatCarbonValue(emissionsData.usage.reduce((sum, val) => sum + val, 0))}
                </p>
              </div>
              
              <div className="bg-red-50 rounded-lg p-4 border border-red-100">
                <h3 className="text-sm font-medium text-red-800">{t('carbon.offset')}</h3>
                <p className="text-2xl font-bold text-red-600">
                  {formatCarbonValue(emissionsData.offset.reduce((sum, val) => sum + val, 0))}
                </p>
              </div>
              
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                <h3 className="text-sm font-medium text-blue-800">{t('carbon.net')}</h3>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCarbonValue(emissionsData.net.reduce((sum, val) => sum + val, 0))}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
