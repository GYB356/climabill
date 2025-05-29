'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Dashboard, 
  DashboardWidget, 
  AnalyticsTimeFrame, 
  AnalyticsQuery 
} from '@/lib/analytics/enhanced/types';
import { Loader2, Maximize2, MoreHorizontal } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { toast } from '@/components/ui/use-toast';
import { AnalyticsChart } from './analytics-chart';

interface DashboardGridProps {
  dashboard: Dashboard;
  timeFrame: AnalyticsTimeFrame;
  period?: { startDate: Date; endDate: Date };
  organizationId: string;
}

export function DashboardGrid({ dashboard, timeFrame, period, organizationId }: DashboardGridProps) {
  const [widgetData, setWidgetData] = useState<{ [key: string]: any }>({});
  const [loadingWidgets, setLoadingWidgets] = useState<{ [key: string]: boolean }>({});
  const [widgetErrors, setWidgetErrors] = useState<{ [key: string]: string }>({});
  const [expandedWidget, setExpandedWidget] = useState<string | null>(null);

  // Fetch data for all widgets when dashboard, timeFrame, or period changes
  useEffect(() => {
    const fetchWidgetData = async () => {
      // Initialize loading states
      const initialLoadingState: { [key: string]: boolean } = {};
      dashboard.widgets.forEach(widget => {
        initialLoadingState[widget.id] = true;
      });
      setLoadingWidgets(initialLoadingState);

      // Clear previous errors
      setWidgetErrors({});

      // Fetch data for each widget
      const promises = dashboard.widgets.map(async (widget) => {
        try {
          // Update query with current time frame and period
          const updatedQuery: AnalyticsQuery = {
            ...widget.query,
            timeFrame,
            period,
            organizationId
          };

          // Call API to execute the query
          const response = await fetch('/api/analytics/enhanced/query', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query: updatedQuery }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to fetch widget data');
          }

          const data = await response.json();
          return { widgetId: widget.id, data };
        } catch (error) {
          console.error(`Error fetching data for widget ${widget.id}:`, error);
          setWidgetErrors(prev => ({
            ...prev,
            [widget.id]: error instanceof Error ? error.message : 'Failed to fetch widget data'
          }));
          return { widgetId: widget.id, data: null };
        } finally {
          setLoadingWidgets(prev => ({
            ...prev,
            [widget.id]: false
          }));
        }
      });

      // Wait for all promises to resolve
      const results = await Promise.all(promises);

      // Update widget data
      const newWidgetData: { [key: string]: any } = {};
      results.forEach(result => {
        if (result.data) {
          newWidgetData[result.widgetId] = result.data;
        }
      });

      setWidgetData(newWidgetData);
    };

    fetchWidgetData();
  }, [dashboard, timeFrame, period, organizationId]);

  // Handle widget expansion
  const handleExpandWidget = (widgetId: string) => {
    setExpandedWidget(widgetId);
  };

  // Handle widget collapse
  const handleCollapseWidget = () => {
    setExpandedWidget(null);
  };

  // Handle widget refresh
  const handleRefreshWidget = async (widget: DashboardWidget) => {
    try {
      setLoadingWidgets(prev => ({
        ...prev,
        [widget.id]: true
      }));

      // Clear previous error
      setWidgetErrors(prev => ({
        ...prev,
        [widget.id]: ''
      }));

      // Update query with current time frame and period
      const updatedQuery: AnalyticsQuery = {
        ...widget.query,
        timeFrame,
        period,
        organizationId
      };

      // Call API to execute the query
      const response = await fetch('/api/analytics/enhanced/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: updatedQuery }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to refresh widget data');
      }

      const data = await response.json();
      
      // Update widget data
      setWidgetData(prev => ({
        ...prev,
        [widget.id]: data
      }));

      toast({
        title: 'Widget refreshed',
        description: `${widget.title} data has been updated.`,
      });
    } catch (error) {
      console.error(`Error refreshing widget ${widget.id}:`, error);
      setWidgetErrors(prev => ({
        ...prev,
        [widget.id]: error instanceof Error ? error.message : 'Failed to refresh widget data'
      }));
      
      toast({
        title: 'Error',
        description: `Failed to refresh ${widget.title}. Please try again.`,
        variant: 'destructive',
      });
    } finally {
      setLoadingWidgets(prev => ({
        ...prev,
        [widget.id]: false
      }));
    }
  };

  // Determine grid layout based on widget size
  const getWidgetGridClass = (widget: DashboardWidget) => {
    if (expandedWidget === widget.id) {
      return 'col-span-12';
    }

    switch (widget.size) {
      case 'small':
        return 'col-span-12 md:col-span-4';
      case 'medium':
        return 'col-span-12 md:col-span-6';
      case 'large':
        return 'col-span-12 md:col-span-8';
      default:
        return 'col-span-12 md:col-span-6';
    }
  };

  if (dashboard.widgets.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            <p className="text-muted-foreground">This dashboard has no widgets.</p>
            <Button className="mt-4">
              Add Widget
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-12 gap-6">
      {dashboard.widgets.map(widget => (
        <div key={widget.id} className={getWidgetGridClass(widget)}>
          <Card className="h-full">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{widget.title}</CardTitle>
                  {widget.description && (
                    <CardDescription>{widget.description}</CardDescription>
                  )}
                </div>
                <div className="flex items-center">
                  {loadingWidgets[widget.id] && (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleRefreshWidget(widget)}>
                        Refresh
                      </DropdownMenuItem>
                      {expandedWidget === widget.id ? (
                        <DropdownMenuItem onClick={handleCollapseWidget}>
                          Collapse
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem onClick={() => handleExpandWidget(widget.id)}>
                          Expand
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuItem>Export</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {widgetErrors[widget.id] ? (
                <div className="text-center text-red-500 py-4">
                  <p>{widgetErrors[widget.id]}</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => handleRefreshWidget(widget)}
                  >
                    Try Again
                  </Button>
                </div>
              ) : loadingWidgets[widget.id] ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className={expandedWidget === widget.id ? 'h-[500px]' : 'h-[300px]'}>
                  <AnalyticsChart 
                    type={widget.type}
                    data={widgetData[widget.id]?.data || []}
                    metrics={widget.query.metrics}
                    dimensions={widget.query.dimensions}
                    settings={widget.settings}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
}
