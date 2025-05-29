'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, PlusCircle, Settings } from 'lucide-react';
import { AnalyticsTimeFrame, Dashboard, Insight } from '@/lib/analytics/enhanced/types';
import { AnalyticsTimeFrameSelector } from './analytics-time-frame-selector';
import { InsightsList } from './insights-list';
import { DashboardGrid } from './dashboard-grid';
import { toast } from '@/components/ui/use-toast';

interface AnalyticsDashboardProps {
  organizationId: string;
}

export function AnalyticsDashboard({ organizationId }: AnalyticsDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeFrame, setTimeFrame] = useState<AnalyticsTimeFrame>(AnalyticsTimeFrame.MONTH);
  const [period, setPeriod] = useState<{ startDate: Date; endDate: Date } | undefined>(undefined);
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [activeDashboard, setActiveDashboard] = useState<Dashboard | null>(null);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboards and insights on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch dashboards
        const dashboardsResponse = await fetch(`/api/analytics/enhanced/dashboards?organizationId=${organizationId}`);
        if (!dashboardsResponse.ok) {
          throw new Error('Failed to fetch dashboards');
        }
        const dashboardsData = await dashboardsResponse.json();
        setDashboards(dashboardsData);

        // Set active dashboard to the default one or the first one
        const defaultDashboard = dashboardsData.find((d: Dashboard) => d.isDefault) || dashboardsData[0];
        setActiveDashboard(defaultDashboard || null);

        // Fetch insights
        const insightsResponse = await fetch(`/api/analytics/enhanced/insights?organizationId=${organizationId}`);
        if (!insightsResponse.ok) {
          throw new Error('Failed to fetch insights');
        }
        const insightsData = await insightsResponse.json();
        setInsights(insightsData);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
        setError(error instanceof Error ? error.message : 'An unexpected error occurred');
        toast({
          title: 'Error',
          description: 'Failed to load analytics data. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [organizationId]);

  // Handle time frame change
  const handleTimeFrameChange = (newTimeFrame: AnalyticsTimeFrame, newPeriod?: { startDate: Date; endDate: Date }) => {
    setTimeFrame(newTimeFrame);
    setPeriod(newPeriod);
  };

  // Handle dashboard change
  const handleDashboardChange = (dashboardId: string) => {
    const selected = dashboards.find(d => d.id === dashboardId);
    if (selected) {
      setActiveDashboard(selected);
    }
  };

  // Create a new dashboard
  const handleCreateDashboard = () => {
    // This would open a modal or navigate to a dashboard creation page
    console.log('Create new dashboard');
  };

  // Edit the current dashboard
  const handleEditDashboard = () => {
    // This would open a modal or navigate to a dashboard edit page
    console.log('Edit dashboard', activeDashboard?.id);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <AnalyticsTimeFrameSelector 
          timeFrame={timeFrame} 
          period={period} 
          onChange={handleTimeFrameChange} 
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="dashboards">Dashboards</TabsTrigger>
          </TabsList>

          {activeTab === 'dashboards' && (
            <div className="flex items-center gap-2">
              {dashboards.length > 0 && (
                <Select value={activeDashboard?.id} onValueChange={handleDashboardChange}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select dashboard" />
                  </SelectTrigger>
                  <SelectContent>
                    {dashboards.map(dashboard => (
                      <SelectItem key={dashboard.id} value={dashboard.id}>
                        {dashboard.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <Button variant="outline" size="icon" onClick={handleEditDashboard} disabled={!activeDashboard}>
                <Settings className="h-4 w-4" />
              </Button>
              <Button onClick={handleCreateDashboard}>
                <PlusCircle className="h-4 w-4 mr-2" />
                New Dashboard
              </Button>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <Card>
            <CardContent className="py-8">
              <div className="text-center text-red-500">
                <p>{error}</p>
                <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Key Metrics</CardTitle>
                    <CardDescription>Summary of your most important metrics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Key metrics summary would go here */}
                    <p className="text-muted-foreground">Metrics visualization</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Recent Trends</CardTitle>
                    <CardDescription>How your metrics are changing over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Trends visualization would go here */}
                    <p className="text-muted-foreground">Trends visualization</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Top Insights</CardTitle>
                    <CardDescription>Important findings from your data</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Top insights would go here */}
                    <InsightsList insights={insights.slice(0, 3)} compact />
                  </CardContent>
                </Card>
              </div>
              
              {/* Additional overview content would go here */}
            </TabsContent>
            
            <TabsContent value="insights" className="space-y-6">
              <InsightsList insights={insights} />
            </TabsContent>
            
            <TabsContent value="dashboards" className="space-y-6">
              {activeDashboard ? (
                <DashboardGrid 
                  dashboard={activeDashboard} 
                  timeFrame={timeFrame}
                  period={period}
                  organizationId={organizationId}
                />
              ) : (
                <Card>
                  <CardContent className="py-8">
                    <div className="text-center">
                      <p className="text-muted-foreground">No dashboards found.</p>
                      <Button className="mt-4" onClick={handleCreateDashboard}>
                        Create Your First Dashboard
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}
