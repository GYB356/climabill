"use client";

import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Loader2 } from 'lucide-react';
import { CarbonTrackingService } from '@/lib/carbon/carbon-tracking-service';
import { CARBON_DEFAULTS } from '@/lib/carbon/config';

interface CarbonUsageBreakdownProps {
  userId: string;
  organizationId?: string;
}

export function CarbonUsageBreakdown({ userId, organizationId }: CarbonUsageBreakdownProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usageData, setUsageData] = useState<any[]>([]);
  
  const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7'];
  
  useEffect(() => {
    const loadUsageData = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        // Get the current date
        const now = new Date();
        
        // Calculate the start date (3 months ago)
        const startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 3);
        startDate.setDate(1); // First day of the month
        
        // Create a carbon tracking service instance
        const carbonService = new CarbonTrackingService();
        
        // Get carbon usage for the period
        const usage = await carbonService.getCarbonUsageForPeriod(
          userId,
          startDate,
          now,
          organizationId
        );
        
        if (!usage) {
          setUsageData([]);
          setLoading(false);
          return;
        }
        
        // Calculate the breakdown
        const breakdownData = [
          {
            name: 'Invoices',
            value: usage.invoiceCount * CARBON_DEFAULTS.carbonPerInvoice,
            count: usage.invoiceCount,
            color: COLORS[0],
          },
          {
            name: 'Emails',
            value: usage.emailCount * CARBON_DEFAULTS.carbonPerEmail,
            count: usage.emailCount,
            color: COLORS[1],
          },
          {
            name: 'Storage',
            value: usage.storageGb * CARBON_DEFAULTS.carbonPerGbStorage,
            count: `${usage.storageGb.toFixed(1)} GB`,
            color: COLORS[2],
          },
          {
            name: 'API Calls',
            value: usage.apiCallCount * CARBON_DEFAULTS.carbonPerApiCall,
            count: usage.apiCallCount,
            color: COLORS[3],
          },
        ];
        
        // Add custom usage if available
        if (usage.customUsage && usage.customUsage.length > 0) {
          usage.customUsage.forEach((item: any, index: number) => {
            breakdownData.push({
              name: item.name,
              value: item.carbonInKg,
              count: `${item.amount} ${item.unit}`,
              color: COLORS[(4 + index) % COLORS.length],
            });
          });
        }
        
        // Filter out items with zero value
        const filteredData = breakdownData.filter(item => item.value > 0);
        
        setUsageData(filteredData);
      } catch (err) {
        console.error('Error loading carbon usage breakdown:', err);
        setError('Failed to load carbon usage breakdown');
      } finally {
        setLoading(false);
      }
    };
    
    loadUsageData();
  }, [userId, organizationId]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }
  
  if (usageData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">No carbon usage data available</p>
      </div>
    );
  }
  
  // Custom tooltip for the pie chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded-md shadow-sm">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            {data.value.toFixed(2)} kg CO₂e ({((data.value / usageData.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1)}%)
          </p>
          <p className="text-sm text-muted-foreground">Count: {data.count}</p>
        </div>
      );
    }
    
    return null;
  };
  
  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={usageData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            innerRadius={40}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
          >
            {usageData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
