'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { BenchmarkResult, BenchmarkMetric } from '@/lib/analytics/benchmarking/types';

interface BenchmarkChartProps {
  benchmarks?: BenchmarkResult;
}

export function BenchmarkChart({ benchmarks }: BenchmarkChartProps) {
  if (!benchmarks || !benchmarks.metrics || benchmarks.metrics.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">No benchmark data available</p>
      </div>
    );
  }

  // Prepare data for chart
  const chartData = benchmarks.metrics.map((metric) => {
    const metricName = metric.metricType.replace(/_/g, ' ');
    
    return {
      name: metricName,
      yourValue: metric.value,
      industryAverage: metric.industryAverage,
      industryBest: metric.industryBest,
      unit: metric.unit,
      percentile: metric.percentile
    };
  });

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={chartData}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 60,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="name" 
          angle={-45} 
          textAnchor="end" 
          height={60}
          interval={0}
        />
        <YAxis />
        <Tooltip 
          formatter={(value, name, props) => {
            const unit = props.payload.unit;
            if (name === 'percentile') {
              return [`${value}%`, 'Percentile'];
            }
            return [`${value} ${unit}`, name];
          }}
        />
        <Legend />
        <Bar dataKey="yourValue" name="Your Value" fill="#4f46e5" />
        <Bar dataKey="industryAverage" name="Industry Average" fill="#94a3b8" />
        <Bar dataKey="industryBest" name="Industry Best" fill="#22c55e" />
        <ReferenceLine y={0} stroke="#000" />
      </BarChart>
    </ResponsiveContainer>
  );
}
