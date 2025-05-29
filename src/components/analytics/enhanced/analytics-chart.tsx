'use client';

import { useEffect, useState } from 'react';
import { 
  AnalyticsVisualizationType, 
  AnalyticsMetric, 
  AnalyticsDimension 
} from '@/lib/analytics/enhanced/types';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface AnalyticsChartProps {
  type: AnalyticsVisualizationType;
  data: any[];
  metrics: AnalyticsMetric[];
  dimensions?: AnalyticsDimension[];
  settings?: any;
}

export function AnalyticsChart({ type, data, metrics, dimensions, settings }: AnalyticsChartProps) {
  const [processedData, setProcessedData] = useState<any[]>([]);
  
  // Process data when it changes
  useEffect(() => {
    if (!data || data.length === 0) {
      setProcessedData([]);
      return;
    }

    // Process data based on chart type
    let processed = [...data];

    // For pie charts, limit to top 10 items
    if (type === AnalyticsVisualizationType.PIE_CHART) {
      processed = processed.slice(0, 10);
    }

    // For time series data, ensure proper date formatting
    if (
      type === AnalyticsVisualizationType.LINE_CHART ||
      type === AnalyticsVisualizationType.AREA_CHART
    ) {
      processed = processed.map(item => {
        if (item.timestamp) {
          return {
            ...item,
            timestamp: new Date(item.timestamp).toLocaleDateString(),
          };
        }
        return item;
      });
    }

    setProcessedData(processed);
  }, [data, type]);

  // Get chart colors
  const getChartColors = () => {
    return [
      '#0ea5e9', // sky-500
      '#10b981', // emerald-500
      '#6366f1', // indigo-500
      '#f59e0b', // amber-500
      '#ef4444', // red-500
      '#8b5cf6', // violet-500
      '#ec4899', // pink-500
      '#14b8a6', // teal-500
      '#f97316', // orange-500
      '#84cc16', // lime-500
    ];
  };

  // Format metric name for display
  const formatMetricName = (metric: AnalyticsMetric) => {
    return metric
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Format dimension name for display
  const formatDimensionName = (dimension: AnalyticsDimension) => {
    return dimension
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Get dimension key for the chart
  const getDimensionKey = () => {
    if (!dimensions || dimensions.length === 0) {
      return 'category';
    }
    return dimensions[0];
  };

  // Get metric key for the chart
  const getMetricKey = () => {
    if (!metrics || metrics.length === 0) {
      return 'value';
    }
    return metrics[0];
  };

  // Render no data message
  if (!processedData || processedData.length === 0) {
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-muted-foreground">No data available</p>
      </div>
    );
  }

  // Render bar chart
  if (type === AnalyticsVisualizationType.BAR_CHART) {
    const dimensionKey = getDimensionKey();
    const colors = getChartColors();

    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={processedData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey={dimensionKey} 
            angle={-45} 
            textAnchor="end" 
            height={50} 
            tick={{ fontSize: 12 }} 
          />
          <YAxis />
          <Tooltip />
          <Legend />
          {metrics.map((metric, index) => (
            <Bar 
              key={metric} 
              dataKey={metric} 
              name={formatMetricName(metric)} 
              fill={colors[index % colors.length]} 
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    );
  }

  // Render line chart
  if (type === AnalyticsVisualizationType.LINE_CHART) {
    const colors = getChartColors();
    const xAxisKey = 'timestamp' in processedData[0] ? 'timestamp' : getDimensionKey();

    return (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={processedData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey={xAxisKey} 
            angle={-45} 
            textAnchor="end" 
            height={50} 
            tick={{ fontSize: 12 }} 
          />
          <YAxis />
          <Tooltip />
          <Legend />
          {metrics.map((metric, index) => (
            <Line 
              key={metric} 
              type="monotone" 
              dataKey={metric} 
              name={formatMetricName(metric)} 
              stroke={colors[index % colors.length]} 
              activeDot={{ r: 8 }} 
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    );
  }

  // Render area chart
  if (type === AnalyticsVisualizationType.AREA_CHART) {
    const colors = getChartColors();
    const xAxisKey = 'timestamp' in processedData[0] ? 'timestamp' : getDimensionKey();

    return (
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={processedData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey={xAxisKey} 
            angle={-45} 
            textAnchor="end" 
            height={50} 
            tick={{ fontSize: 12 }} 
          />
          <YAxis />
          <Tooltip />
          <Legend />
          {metrics.map((metric, index) => (
            <Area 
              key={metric} 
              type="monotone" 
              dataKey={metric} 
              name={formatMetricName(metric)} 
              stroke={colors[index % colors.length]} 
              fill={colors[index % colors.length]} 
              fillOpacity={0.3} 
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    );
  }

  // Render pie chart
  if (type === AnalyticsVisualizationType.PIE_CHART) {
    const colors = getChartColors();
    const dimensionKey = getDimensionKey();
    const metricKey = getMetricKey();

    return (
      <ResponsiveContainer width="100%" height="100%">
        <PieChart margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <Pie
            data={processedData}
            cx="50%"
            cy="50%"
            labelLine={true}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey={metricKey}
            nameKey={dimensionKey}
          >
            {processedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  // Render scatter plot
  if (type === AnalyticsVisualizationType.SCATTER_PLOT) {
    const colors = getChartColors();
    
    // For scatter plots, we need at least two metrics
    const xMetric = metrics[0];
    const yMetric = metrics.length > 1 ? metrics[1] : metrics[0];

    return (
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            type="number" 
            dataKey={xMetric} 
            name={formatMetricName(xMetric)} 
            tick={{ fontSize: 12 }} 
          />
          <YAxis 
            type="number" 
            dataKey={yMetric} 
            name={formatMetricName(yMetric)} 
            tick={{ fontSize: 12 }} 
          />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} />
          <Legend />
          <Scatter 
            name={`${formatMetricName(xMetric)} vs ${formatMetricName(yMetric)}`} 
            data={processedData} 
            fill={colors[0]} 
          />
        </ScatterChart>
      </ResponsiveContainer>
    );
  }

  // Render table
  if (type === AnalyticsVisualizationType.TABLE) {
    // Determine columns based on data
    const columns = Object.keys(processedData[0]);

    return (
      <div className="overflow-auto h-full">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map(column => (
                <TableHead key={column}>
                  {metrics.includes(column as AnalyticsMetric)
                    ? formatMetricName(column as AnalyticsMetric)
                    : dimensions?.includes(column as AnalyticsDimension)
                    ? formatDimensionName(column as AnalyticsDimension)
                    : column}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {processedData.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {columns.map(column => (
                  <TableCell key={`${rowIndex}-${column}`}>
                    {typeof row[column] === 'number'
                      ? row[column].toLocaleString(undefined, {
                          maximumFractionDigits: 2,
                        })
                      : row[column]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  // Default fallback
  return (
    <div className="flex justify-center items-center h-full">
      <p className="text-muted-foreground">
        Visualization type {type} not supported yet
      </p>
    </div>
  );
}
