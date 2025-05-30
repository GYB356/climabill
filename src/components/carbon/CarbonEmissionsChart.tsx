"use client";

import { useState, useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Area,
  ComposedChart
} from 'recharts';
import { Loader2 } from 'lucide-react';

interface CarbonEmissionsChartProps {
  data: Array<{
    month: string;
    totalCarbonInKg: number;
    offsetCarbonInKg: number;
  }>;
}

export function CarbonEmissionsChart({ data }: CarbonEmissionsChartProps) {
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (data && data.length > 0) {
      // Format the data for the chart
      const formattedData = data.map(item => {
        // Extract year and month from the month string (format: YYYY-MM)
        const [year, month] = item.month.split('-');
        
        // Convert month number to month name
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthName = monthNames[parseInt(month) - 1];
        
        // Calculate net carbon (total - offset)
        const netCarbonInKg = Math.max(0, item.totalCarbonInKg - item.offsetCarbonInKg);
        
        return {
          ...item,
          month: `${monthName} ${year}`,
          netCarbonInKg,
        };
      });
      
      setChartData(formattedData);
      setLoading(false);
    } else {
      // If no data, create empty placeholder
      setChartData([]);
      setLoading(false);
    }
  }, [data]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">No emissions data available</p>
      </div>
    );
  }
  
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart
        data={chartData}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
        <XAxis 
          dataKey="month" 
          tick={{ fontSize: 12 }}
          tickMargin={10}
        />
        <YAxis 
          tick={{ fontSize: 12 }}
          tickFormatter={(value) => `${value} kg`}
          width={80}
        />
        <Tooltip 
          formatter={(value: number) => [`${value.toFixed(2)} kg`, undefined]}
          labelFormatter={(label) => `Month: ${label}`}
          contentStyle={{
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '6px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          }}
        />
        <Legend verticalAlign="top" height={36} />
        <Area 
          type="monotone" 
          dataKey="totalCarbonInKg" 
          name="Total Carbon"
          fill="rgba(239, 68, 68, 0.2)" 
          stroke="rgb(239, 68, 68)" 
          strokeWidth={2}
          activeDot={{ r: 6 }}
        />
        <Line 
          type="monotone" 
          dataKey="offsetCarbonInKg" 
          name="Offset Carbon"
          stroke="rgb(34, 197, 94)" 
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
        />
        <Line 
          type="monotone" 
          dataKey="netCarbonInKg" 
          name="Net Carbon"
          stroke="rgb(59, 130, 246)" 
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
