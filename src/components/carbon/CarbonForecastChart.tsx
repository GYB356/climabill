import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, InfoIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { CarbonTrackingService } from '@/lib/carbon/carbon-tracking-service';
import { useAuth } from '@/lib/firebase/auth-context';

interface CarbonForecastChartProps {
  organizationId?: string;
  departmentId?: string;
  projectId?: string;
  className?: string;
}

export function CarbonForecastChart({ 
  organizationId, 
  departmentId, 
  projectId,
  className
}: CarbonForecastChartProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [forecastPeriod, setForecastPeriod] = useState<'3months' | '6months' | '12months'>('6months');
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [forecastData, setForecastData] = useState<any[]>([]);
  const [combinedData, setCombinedData] = useState<any[]>([]);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const carbonTrackingService = new CarbonTrackingService();
  
  // Function to generate forecast based on historical data using simple linear regression
  const generateForecast = (historical: any[], months: number) => {
    if (historical.length < 3) {
      // Not enough data for prediction
      return [];
    }
    
    // Simple linear regression for prediction
    const xs = historical.map((_, i) => i);
    const ys = historical.map(item => item.totalCarbonInKg);
    
    // Calculate slope and intercept
    const n = xs.length;
    const sum_x = xs.reduce((a, b) => a + b, 0);
    const sum_y = ys.reduce((a, b) => a + b, 0);
    const sum_xy = xs.reduce((total, x, i) => total + x * ys[i], 0);
    const sum_xx = xs.reduce((total, x) => total + x * x, 0);
    
    const slope = (n * sum_xy - sum_x * sum_y) / (n * sum_xx - sum_x * sum_x);
    const intercept = (sum_y - slope * sum_x) / n;
    
    // Generate forecast data
    const lastDate = new Date(historical[historical.length - 1].date);
    const forecast = [];
    
    for (let i = 1; i <= months; i++) {
      const forecastDate = new Date(lastDate);
      forecastDate.setMonth(forecastDate.getMonth() + i);
      
      const predictedValue = intercept + slope * (xs.length - 1 + i);
      // Ensure prediction is not negative
      const totalCarbonInKg = Math.max(0, predictedValue);
      
      forecast.push({
        date: forecastDate.toISOString().slice(0, 7),
        totalCarbonInKg,
        forecastCarbonInKg: totalCarbonInKg,
        isForecasted: true
      });
    }
    
    return forecast;
  };
  
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!user) return;
        
        // Load historical carbon data (last 12 months)
        const targetId = organizationId || user.uid;
        const historicalData = await carbonTrackingService.getMonthlyCarbonData(
          targetId, 
          departmentId, 
          projectId,
          12
        );
        
        setHistoricalData(historicalData);
        
        // Number of months to forecast
        const months = forecastPeriod === '3months' ? 3 : forecastPeriod === '6months' ? 6 : 12;
        
        // Generate forecast
        const forecast = generateForecast(historicalData, months);
        setForecastData(forecast);
        
        // Combine historical and forecast data
        const combined = [
          ...historicalData.map(item => ({
            ...item,
            isForecasted: false,
            forecastCarbonInKg: null
          })),
          ...forecast
        ];
        
        setCombinedData(combined);
        
      } catch (err) {
        console.error('Error loading carbon forecast data:', err);
        setError('Failed to load carbon forecast data');
        toast({
          title: 'Error',
          description: 'Failed to load carbon forecast data. Please try again later.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [user, organizationId, departmentId, projectId, forecastPeriod]);
  
  const handlePeriodChange = (value: '3months' | '6months' | '12months') => {
    setForecastPeriod(value);
  };
  
  // Calculate trend
  const calculateTrend = () => {
    if (!forecastData || forecastData.length < 2) return null;
    
    const firstValue = forecastData[0].totalCarbonInKg;
    const lastValue = forecastData[forecastData.length - 1].totalCarbonInKg;
    
    if (firstValue === 0) return null;
    
    const percentChange = ((lastValue - firstValue) / firstValue) * 100;
    
    return {
      value: Math.abs(percentChange).toFixed(1),
      isIncrease: percentChange > 0,
    };
  };
  
  const trend = calculateTrend();
  
  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Carbon Forecast</CardTitle>
        </CardHeader>
        <CardContent className="pt-2 flex justify-center items-center min-h-[300px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Carbon Forecast</CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="text-destructive flex items-center">
            <InfoIcon className="mr-2 h-4 w-4" />
            {error}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (historicalData.length < 3) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Carbon Forecast</CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="text-muted-foreground">
            Not enough historical data to generate forecast. At least 3 months of data is required.
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Carbon Usage Forecast</CardTitle>
        <div className="flex items-center gap-2">
          {trend && (
            <div className={`flex items-center text-sm ${trend.isIncrease ? 'text-destructive' : 'text-green-600'}`}>
              {trend.isIncrease ? (
                <TrendingUp className="mr-1 h-4 w-4" />
              ) : (
                <TrendingDown className="mr-1 h-4 w-4" />
              )}
              {trend.value}%
            </div>
          )}
          <Select 
            defaultValue={forecastPeriod} 
            onValueChange={(value) => handlePeriodChange(value as any)}
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3months">3 Months</SelectItem>
              <SelectItem value="6months">6 Months</SelectItem>
              <SelectItem value="12months">12 Months</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={combinedData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorHistorical" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#82ca9d" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis 
                label={{ value: 'Carbon (kg CO₂e)', angle: -90, position: 'insideLeft' }} 
                width={80}
              />
              <Tooltip 
                formatter={(value: any) => [`${Number(value).toFixed(2)} kg CO₂e`, '']}
                labelFormatter={(label) => `Month: ${label}`}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="totalCarbonInKg" 
                name="Historical" 
                stroke="#8884d8" 
                fillOpacity={1} 
                fill="url(#colorHistorical)" 
                strokeWidth={2}
                connectNulls
              />
              <Area 
                type="monotone" 
                dataKey="forecastCarbonInKg" 
                name="Forecast" 
                stroke="#82ca9d" 
                fillOpacity={1} 
                fill="url(#colorForecast)" 
                strokeWidth={2}
                strokeDasharray="5 5"
                connectNulls
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 text-sm text-muted-foreground">
          <p>Forecast based on historical carbon usage patterns using predictive modeling. Actual future emissions may vary based on business activities and sustainability efforts.</p>
        </div>
      </CardContent>
    </Card>
  );
}
