'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Industry, MetricType, BenchmarkResult, BestPractice } from '@/lib/analytics/benchmarking/types';
import { BenchmarkChart } from '@/components/analytics/benchmarking/benchmark-chart';
import { BestPracticeCard } from '@/components/analytics/benchmarking/best-practice-card';
import { DataSharingModal } from '@/components/analytics/benchmarking/data-sharing-modal';

export default function BenchmarkingPage() {
  const [selectedIndustry, setSelectedIndustry] = useState<Industry>(Industry.TECHNOLOGY);
  const [selectedMetrics, setSelectedMetrics] = useState<MetricType[]>([
    MetricType.CARBON_EMISSIONS,
    MetricType.ENERGY_USAGE,
    MetricType.RENEWABLE_ENERGY_PERCENTAGE
  ]);
  const [organizationId, setOrganizationId] = useState<string>('org-001'); // This would come from user context in a real app
  const [isDataSharingModalOpen, setIsDataSharingModalOpen] = useState<boolean>(false);

  // Fetch benchmarks
  const { data: benchmarkData, isLoading: isLoadingBenchmarks, error: benchmarkError, refetch: refetchBenchmarks } = useQuery({
    queryKey: ['benchmarks', organizationId, selectedIndustry, selectedMetrics],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      queryParams.append('organizationId', organizationId);
      queryParams.append('industryId', selectedIndustry);
      queryParams.append('metrics', selectedMetrics.join(','));
      
      const response = await fetch(`/api/analytics/benchmarking?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch benchmarks');
      }
      
      return response.json();
    }
  });

  // Fetch best practices
  const { data: bestPracticesData, isLoading: isLoadingBestPractices, error: bestPracticesError } = useQuery({
    queryKey: ['bestPractices', organizationId, selectedIndustry],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      queryParams.append('organizationId', organizationId);
      queryParams.append('industryId', selectedIndustry);
      
      const response = await fetch(`/api/analytics/benchmarking/best-practices?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch best practices');
      }
      
      return response.json();
    }
  });

  // Handle industry change
  const handleIndustryChange = (industry: Industry) => {
    setSelectedIndustry(industry);
  };

  // Handle metric selection
  const handleMetricToggle = (metric: MetricType) => {
    if (selectedMetrics.includes(metric)) {
      setSelectedMetrics(selectedMetrics.filter(m => m !== metric));
    } else {
      setSelectedMetrics([...selectedMetrics, metric]);
    }
  };

  // Get performance rating
  const getPerformanceRating = (benchmarks: BenchmarkResult) => {
    if (!benchmarks || !benchmarks.metrics || benchmarks.metrics.length === 0) {
      return { label: 'Unknown', color: 'bg-gray-400' };
    }
    
    // Calculate average percentile
    const totalPercentile = benchmarks.metrics.reduce((sum, metric) => sum + metric.percentile, 0);
    const averagePercentile = totalPercentile / benchmarks.metrics.length;
    
    if (averagePercentile >= 80) {
      return { label: 'Excellent', color: 'bg-green-500' };
    } else if (averagePercentile >= 60) {
      return { label: 'Good', color: 'bg-green-400' };
    } else if (averagePercentile >= 40) {
      return { label: 'Average', color: 'bg-yellow-400' };
    } else if (averagePercentile >= 20) {
      return { label: 'Below Average', color: 'bg-orange-400' };
    } else {
      return { label: 'Poor', color: 'bg-red-500' };
    }
  };

  const performanceRating = getPerformanceRating(benchmarkData?.benchmarks);

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Industry Benchmarking</h1>
          <p className="text-muted-foreground mt-1">
            Compare your performance against industry standards and discover improvement opportunities
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div>
            <Select value={selectedIndustry} onValueChange={(value) => handleIndustryChange(value as Industry)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select Industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={Industry.TECHNOLOGY}>Technology</SelectItem>
                <SelectItem value={Industry.FINANCE}>Finance</SelectItem>
                <SelectItem value={Industry.HEALTHCARE}>Healthcare</SelectItem>
                <SelectItem value={Industry.MANUFACTURING}>Manufacturing</SelectItem>
                <SelectItem value={Industry.RETAIL}>Retail</SelectItem>
                <SelectItem value={Industry.ENERGY}>Energy</SelectItem>
                <SelectItem value={Industry.TRANSPORTATION}>Transportation</SelectItem>
                <SelectItem value={Industry.HOSPITALITY}>Hospitality</SelectItem>
                <SelectItem value={Industry.EDUCATION}>Education</SelectItem>
                <SelectItem value={Industry.PROFESSIONAL_SERVICES}>Professional Services</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button variant="outline" onClick={() => setIsDataSharingModalOpen(true)}>
            Data Sharing Settings
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Performance Overview</TabsTrigger>
          <TabsTrigger value="metrics">Detailed Metrics</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-6">
          {isLoadingBenchmarks ? (
            <div className="text-center py-12">Loading benchmarks...</div>
          ) : benchmarkError ? (
            <div className="text-center py-12 text-red-500">
              Error loading benchmarks. Please try again.
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Overall Performance</CardTitle>
                    <CardDescription>
                      Compared to {selectedIndustry.replace('_', ' ')} industry
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-center">
                      <div className={`w-24 h-24 rounded-full flex items-center justify-center ${performanceRating.color} text-white font-bold text-xl mb-2`}>
                        {performanceRating.label}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Based on {benchmarkData?.benchmarks.metrics.length} metrics
                      </p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Carbon Emissions</CardTitle>
                    <CardDescription>
                      Your performance vs. industry average
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {benchmarkData?.benchmarks.metrics.find(m => m.metricType === MetricType.CARBON_EMISSIONS) ? (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Your Emissions</span>
                          <span className="font-medium">
                            {benchmarkData.benchmarks.metrics.find(m => m.metricType === MetricType.CARBON_EMISSIONS)?.value} 
                            {' '}
                            {benchmarkData.benchmarks.metrics.find(m => m.metricType === MetricType.CARBON_EMISSIONS)?.unit}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Industry Average</span>
                          <span className="font-medium">
                            {benchmarkData.benchmarks.metrics.find(m => m.metricType === MetricType.CARBON_EMISSIONS)?.industryAverage} 
                            {' '}
                            {benchmarkData.benchmarks.metrics.find(m => m.metricType === MetricType.CARBON_EMISSIONS)?.unit}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Percentile</span>
                          <span className="font-medium">
                            {benchmarkData.benchmarks.metrics.find(m => m.metricType === MetricType.CARBON_EMISSIONS)?.percentile}%
                          </span>
                        </div>
                        <Progress 
                          value={benchmarkData.benchmarks.metrics.find(m => m.metricType === MetricType.CARBON_EMISSIONS)?.percentile} 
                          className="h-2"
                        />
                      </div>
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        No carbon emissions data available
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Renewable Energy</CardTitle>
                    <CardDescription>
                      Your performance vs. industry average
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {benchmarkData?.benchmarks.metrics.find(m => m.metricType === MetricType.RENEWABLE_ENERGY_PERCENTAGE) ? (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Your Percentage</span>
                          <span className="font-medium">
                            {benchmarkData.benchmarks.metrics.find(m => m.metricType === MetricType.RENEWABLE_ENERGY_PERCENTAGE)?.value}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Industry Average</span>
                          <span className="font-medium">
                            {benchmarkData.benchmarks.metrics.find(m => m.metricType === MetricType.RENEWABLE_ENERGY_PERCENTAGE)?.industryAverage}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Percentile</span>
                          <span className="font-medium">
                            {benchmarkData.benchmarks.metrics.find(m => m.metricType === MetricType.RENEWABLE_ENERGY_PERCENTAGE)?.percentile}%
                          </span>
                        </div>
                        <Progress 
                          value={benchmarkData.benchmarks.metrics.find(m => m.metricType === MetricType.RENEWABLE_ENERGY_PERCENTAGE)?.percentile} 
                          className="h-2"
                        />
                      </div>
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        No renewable energy data available
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Performance Across Metrics</CardTitle>
                  <CardDescription>
                    How you compare across different sustainability metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <BenchmarkChart benchmarks={benchmarkData?.benchmarks} />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="metrics" className="mt-6">
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge 
                variant={selectedMetrics.includes(MetricType.CARBON_EMISSIONS) ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => handleMetricToggle(MetricType.CARBON_EMISSIONS)}
              >
                Carbon Emissions
              </Badge>
              <Badge 
                variant={selectedMetrics.includes(MetricType.ENERGY_USAGE) ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => handleMetricToggle(MetricType.ENERGY_USAGE)}
              >
                Energy Usage
              </Badge>
              <Badge 
                variant={selectedMetrics.includes(MetricType.WATER_USAGE) ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => handleMetricToggle(MetricType.WATER_USAGE)}
              >
                Water Usage
              </Badge>
              <Badge 
                variant={selectedMetrics.includes(MetricType.WASTE_GENERATED) ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => handleMetricToggle(MetricType.WASTE_GENERATED)}
              >
                Waste Generated
              </Badge>
              <Badge 
                variant={selectedMetrics.includes(MetricType.RENEWABLE_ENERGY_PERCENTAGE) ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => handleMetricToggle(MetricType.RENEWABLE_ENERGY_PERCENTAGE)}
              >
                Renewable Energy
              </Badge>
            </div>
            
            {isLoadingBenchmarks ? (
              <div className="text-center py-12">Loading metrics...</div>
            ) : benchmarkError ? (
              <div className="text-center py-12 text-red-500">
                Error loading metrics. Please try again.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {benchmarkData?.benchmarks.metrics.map((metric) => (
                  <Card key={metric.metricType}>
                    <CardHeader>
                      <CardTitle>{metric.metricType.replace('_', ' ')}</CardTitle>
                      <CardDescription>
                        Your performance vs. industry
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Your Value</span>
                          <span className="font-medium">
                            {metric.value} {metric.unit}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Industry Average</span>
                          <span className="font-medium">
                            {metric.industryAverage} {metric.unit}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Industry Best</span>
                          <span className="font-medium text-green-600">
                            {metric.industryBest} {metric.unit}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Industry Worst</span>
                          <span className="font-medium text-red-600">
                            {metric.industryWorst} {metric.unit}
                          </span>
                        </div>
                        <div className="pt-2">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-muted-foreground">Your Percentile</span>
                            <span className="font-medium">
                              {metric.percentile}%
                            </span>
                          </div>
                          <Progress value={metric.percentile} className="h-2" />
                          <div className="flex justify-between text-xs text-muted-foreground mt-1">
                            <span>0%</span>
                            <span>50%</span>
                            <span>100%</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="recommendations" className="mt-6">
          {isLoadingBestPractices ? (
            <div className="text-center py-12">Loading recommendations...</div>
          ) : bestPracticesError ? (
            <div className="text-center py-12 text-red-500">
              Error loading recommendations. Please try again.
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bestPracticesData?.bestPractices.map((practice: BestPractice) => (
                  <BestPracticeCard key={practice.id} practice={practice} />
                ))}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      <DataSharingModal 
        isOpen={isDataSharingModalOpen} 
        onClose={() => setIsDataSharingModalOpen(false)}
        organizationId={organizationId}
        onSaved={refetchBenchmarks}
      />
    </div>
  );
}
