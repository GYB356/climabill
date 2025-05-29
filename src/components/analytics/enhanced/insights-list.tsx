'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Insight, AnalyticsMetric } from '@/lib/analytics/enhanced/types';
import { AlertTriangle, ArrowRight, ChevronRight, Info, LineChart, TrendingDown, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

interface InsightsListProps {
  insights: Insight[];
  compact?: boolean;
}

export function InsightsList({ insights, compact = false }: InsightsListProps) {
  // Get icon for insight category
  const getInsightIcon = (category: string) => {
    switch (category) {
      case 'trend':
        return <LineChart className="h-5 w-5" />;
      case 'anomaly':
        return <AlertTriangle className="h-5 w-5" />;
      case 'correlation':
        return <TrendingUp className="h-5 w-5" />;
      case 'forecast':
        return <TrendingDown className="h-5 w-5" />;
      case 'recommendation':
        return <Info className="h-5 w-5" />;
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  // Get color for insight severity
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'info':
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Format metric name for display
  const formatMetricName = (metric: AnalyticsMetric) => {
    return metric
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return format(new Date(date), 'MMM d, yyyy');
  };

  if (insights.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            <p className="text-muted-foreground">No insights available.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <div className="space-y-3">
        {insights.map((insight, index) => (
          <div key={index} className="flex items-start gap-3">
            <div className={`p-2 rounded-full ${getSeverityColor(insight.type.severity)}`}>
              {getInsightIcon(insight.type.category)}
            </div>
            <div>
              <h4 className="text-sm font-medium">{insight.title}</h4>
              <p className="text-xs text-muted-foreground">{formatDate(insight.timestamp)}</p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {insights.map((insight, index) => (
        <Card key={index}>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-full ${getSeverityColor(insight.type.severity)}`}>
                  {getInsightIcon(insight.type.category)}
                </div>
                <div>
                  <CardTitle>{insight.title}</CardTitle>
                  <CardDescription>
                    {formatDate(insight.timestamp)} • 
                    {insight.metrics.map(metric => (
                      <Badge key={metric} variant="outline" className="ml-2">
                        {formatMetricName(metric)}
                      </Badge>
                    ))}
                  </CardDescription>
                </div>
              </div>
              <Badge className={getSeverityColor(insight.type.severity)}>
                {insight.type.severity.charAt(0).toUpperCase() + insight.type.severity.slice(1)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p>{insight.description}</p>
            
            {insight.data && (
              <div className="mt-4 p-4 bg-gray-50 rounded-md">
                {/* This would render different visualizations based on the insight type */}
                <p className="text-sm text-muted-foreground">Data visualization would appear here</p>
              </div>
            )}
          </CardContent>
          {insight.actions && insight.actions.length > 0 && (
            <CardFooter className="flex justify-end pt-0">
              {insight.actions.map((action, actionIndex) => (
                <Button key={actionIndex} variant="ghost" size="sm" asChild>
                  <a href={action.url}>
                    {action.label}
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </a>
                </Button>
              ))}
            </CardFooter>
          )}
        </Card>
      ))}
    </div>
  );
}
