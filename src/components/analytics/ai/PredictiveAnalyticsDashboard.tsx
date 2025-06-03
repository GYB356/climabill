"use client";

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import { useAccessibility } from '@/lib/a11y/accessibility-context';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  BarChart, 
  LineChart, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Users, 
  DollarSign, 
  Calendar, 
  Clock,
  Info
} from 'lucide-react';

// Import chart components
import { 
  ResponsiveContainer, 
  LineChart as RechartsLineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  BarChart as RechartsBarChart,
  Bar
} from 'recharts';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface PredictiveAnalyticsDashboardProps {
  organizationId: string;
}

export default function PredictiveAnalyticsDashboard({ organizationId }: PredictiveAnalyticsDashboardProps) {
  const { t } = useTranslation('analytics');
  const { announce } = useAccessibility();
  
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('churn');
  const [timeRange, setTimeRange] = useState('30d');
  const [predictionData, setPredictionData] = useState<any>(null);
  const [customerRiskData, setCustomerRiskData] = useState<any[]>([]);
  const [revenueForecasts, setRevenueForecasts] = useState<any[]>([]);
  const [carbonTrends, setCarbonTrends] = useState<any[]>([]);
  
  // Mock data for demonstration
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock churn prediction data
        setPredictionData({
          churnRisk: 0.15,
          riskFactors: [
            { factor: 'Inactivity', weight: 0.35, trend: 'increasing' },
            { factor: 'Support Tickets', weight: 0.25, trend: 'stable' },
            { factor: 'Billing Issues', weight: 0.20, trend: 'decreasing' },
            { factor: 'Feature Usage', weight: 0.15, trend: 'decreasing' },
            { factor: 'Engagement', weight: 0.05, trend: 'stable' }
          ],
          recommendedActions: [
            { action: 'Engagement Campaign', impact: 'high', effort: 'medium' },
            { action: 'Feature Onboarding', impact: 'medium', effort: 'low' },
            { action: 'Account Review', impact: 'high', effort: 'high' }
          ]
        });
        
        // Mock customer risk data
        setCustomerRiskData([
          { id: 'C1001', name: 'Acme Corp', risk: 'high', value: 15000, nextRenewal: '2025-08-15' },
          { id: 'C1002', name: 'TechSolutions', risk: 'medium', value: 8500, nextRenewal: '2025-07-22' },
          { id: 'C1003', name: 'EcoFriendly', risk: 'low', value: 12000, nextRenewal: '2025-09-05' },
          { id: 'C1004', name: 'Global Industries', risk: 'high', value: 22000, nextRenewal: '2025-06-30' },
          { id: 'C1005', name: 'Local Business', risk: 'low', value: 5500, nextRenewal: '2025-10-12' }
        ]);
        
        // Mock revenue forecast data
        setRevenueForecasts([
          { month: 'Jan', actual: 42000, predicted: 42000 },
          { month: 'Feb', actual: 45000, predicted: 44000 },
          { month: 'Mar', actual: 48000, predicted: 47000 },
          { month: 'Apr', actual: 51000, predicted: 50000 },
          { month: 'May', actual: 53000, predicted: 54000 },
          { month: 'Jun', actual: null, predicted: 58000 },
          { month: 'Jul', actual: null, predicted: 62000 },
          { month: 'Aug', actual: null, predicted: 65000 }
        ]);
        
        // Mock carbon trends data
        setCarbonTrends([
          { month: 'Jan', actual: 120, predicted: 120, target: 118 },
          { month: 'Feb', actual: 115, predicted: 116, target: 116 },
          { month: 'Mar', actual: 112, predicted: 113, target: 114 },
          { month: 'Apr', actual: 108, predicted: 110, target: 112 },
          { month: 'May', actual: 105, predicted: 106, target: 110 },
          { month: 'Jun', actual: null, predicted: 103, target: 108 },
          { month: 'Jul', actual: null, predicted: 101, target: 106 },
          { month: 'Aug', actual: null, predicted: 99, target: 104 }
        ]);
        
        setIsLoading(false);
        announce(t('analytics.predictive.loaded') || 'Predictive analytics dashboard loaded', false);
      } catch (error) {
        console.error('Error loading predictive analytics data:', error);
        setIsLoading(false);
        announce(t('analytics.predictive.loadError') || 'Error loading predictive analytics', true);
      }
    };
    
    loadData();
  }, [organizationId, timeRange]);
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    announce(t(`analytics.predictive.tabChanged.${value}`) || `Switched to ${value} tab`, false);
  };
  
  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value);
    setIsLoading(true);
    announce(t('analytics.predictive.timeRangeChanged', { range: value }) || `Time range changed to ${value}`, false);
  };
  
  const getRiskBadgeVariant = (risk: string) => {
    switch (risk) {
      case 'high': return 'destructive';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'outline';
    }
  };
  
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="h-4 w-4 text-destructive" />;
      case 'decreasing': return <TrendingDown className="h-4 w-4 text-success" />;
      default: return <TrendingDown className="h-4 w-4 text-muted-foreground" />;
    }
  };
  
  const getImpactBadgeVariant = (impact: string) => {
    switch (impact) {
      case 'high': return 'default';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };
  
  const getEffortBadgeVariant = (effort: string) => {
    switch (effort) {
      case 'high': return 'destructive';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'outline';
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t('analytics.predictive.title') || 'AI Predictive Analytics'}</h2>
          <p className="text-muted-foreground">
            {t('analytics.predictive.description') || 'Advanced analytics and predictions powered by machine learning'}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={handleTimeRangeChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t('analytics.timeRange') || 'Time Range'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">{t('analytics.timeRanges.7d') || 'Last 7 days'}</SelectItem>
              <SelectItem value="30d">{t('analytics.timeRanges.30d') || 'Last 30 days'}</SelectItem>
              <SelectItem value="90d">{t('analytics.timeRanges.90d') || 'Last 90 days'}</SelectItem>
              <SelectItem value="1y">{t('analytics.timeRanges.1y') || 'Last year'}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-4">
          <TabsTrigger value="churn">{t('analytics.predictive.tabs.churn') || 'Churn Prediction'}</TabsTrigger>
          <TabsTrigger value="revenue">{t('analytics.predictive.tabs.revenue') || 'Revenue Forecast'}</TabsTrigger>
          <TabsTrigger value="carbon">{t('analytics.predictive.tabs.carbon') || 'Carbon Trends'}</TabsTrigger>
          <TabsTrigger value="customers">{t('analytics.predictive.tabs.customers') || 'Customer Risk'}</TabsTrigger>
        </TabsList>
        
        {/* Churn Prediction Tab */}
        <TabsContent value="churn">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Skeleton className="h-[200px] w-full" />
              <Skeleton className="h-[200px] w-full" />
              <Skeleton className="h-[200px] w-full" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Churn Risk Overview */}
              <Card>
                <CardHeader>
                  <CardTitle>{t('analytics.predictive.churn.riskTitle') || 'Churn Risk'}</CardTitle>
                  <CardDescription>
                    {t('analytics.predictive.churn.riskDescription') || 'Overall risk of customer churn'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center h-32">
                    <div className={`text-5xl font-bold ${predictionData.churnRisk > 0.2 ? 'text-destructive' : predictionData.churnRisk > 0.1 ? 'text-warning' : 'text-success'}`}>
                      {(predictionData.churnRisk * 100).toFixed(1)}%
                    </div>
                    <p className="text-muted-foreground mt-2">
                      {predictionData.churnRisk > 0.2 
                        ? (t('analytics.predictive.churn.highRisk') || 'High Risk') 
                        : predictionData.churnRisk > 0.1 
                          ? (t('analytics.predictive.churn.mediumRisk') || 'Medium Risk')
                          : (t('analytics.predictive.churn.lowRisk') || 'Low Risk')
                      }
                    </p>
                  </div>
                </CardContent>
                <CardFooter>
                  <p className="text-sm text-muted-foreground">
                    {t('analytics.predictive.churn.lastUpdated') || 'Last updated'}: {new Date().toLocaleDateString()}
                  </p>
                </CardFooter>
              </Card>
              
              {/* Risk Factors */}
              <Card>
                <CardHeader>
                  <CardTitle>{t('analytics.predictive.churn.factorsTitle') || 'Risk Factors'}</CardTitle>
                  <CardDescription>
                    {t('analytics.predictive.churn.factorsDescription') || 'Key factors contributing to churn risk'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {predictionData.riskFactors.map((factor: any, index: number) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getTrendIcon(factor.trend)}
                          <span>{factor.factor}</span>
                        </div>
                        <div className="font-medium">{(factor.weight * 100).toFixed(0)}%</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              {/* Recommended Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>{t('analytics.predictive.churn.actionsTitle') || 'Recommended Actions'}</CardTitle>
                  <CardDescription>
                    {t('analytics.predictive.churn.actionsDescription') || 'AI-suggested actions to reduce churn'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {predictionData.recommendedActions.map((action: any, index: number) => (
                      <div key={index} className="flex flex-col gap-1">
                        <div className="font-medium">{action.action}</div>
                        <div className="flex items-center gap-2">
                          <Badge variant={getImpactBadgeVariant(action.impact)}>
                            {t(`analytics.predictive.impact.${action.impact}`) || `${action.impact} impact`}
                          </Badge>
                          <Badge variant={getEffortBadgeVariant(action.effort)}>
                            {t(`analytics.predictive.effort.${action.effort}`) || `${action.effort} effort`}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm" className="w-full">
                    {t('analytics.predictive.churn.viewAllActions') || 'View All Actions'}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}
        </TabsContent>
        
        {/* Revenue Forecast Tab */}
        <TabsContent value="revenue">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-4">
              <Skeleton className="h-[400px] w-full" />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>{t('analytics.predictive.revenue.forecastTitle') || 'Revenue Forecast'}</CardTitle>
                  <CardDescription>
                    {t('analytics.predictive.revenue.forecastDescription') || 'Predicted revenue based on historical data and market trends'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsLineChart data={revenueForecasts}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <RechartsTooltip />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="actual" 
                          stroke="#3b82f6" 
                          name={t('analytics.predictive.revenue.actual') || 'Actual Revenue'} 
                          strokeWidth={2}
                          dot={{ r: 4 }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="predicted" 
                          stroke="#10b981" 
                          name={t('analytics.predictive.revenue.predicted') || 'Predicted Revenue'} 
                          strokeDasharray="5 5"
                          strokeWidth={2}
                          dot={{ r: 4 }}
                        />
                      </RechartsLineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {t('analytics.predictive.revenue.forecastNote') || 'Forecast based on AI model with 92% accuracy'}
                    </span>
                  </div>
                  <Button variant="outline" size="sm">
                    {t('analytics.predictive.revenue.exportData') || 'Export Data'}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}
        </TabsContent>
        
        {/* Carbon Trends Tab */}
        <TabsContent value="carbon">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-4">
              <Skeleton className="h-[400px] w-full" />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>{t('analytics.predictive.carbon.trendsTitle') || 'Carbon Emission Trends'}</CardTitle>
                  <CardDescription>
                    {t('analytics.predictive.carbon.trendsDescription') || 'Actual vs predicted carbon emissions with reduction targets'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsLineChart data={carbonTrends}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <RechartsTooltip />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="actual" 
                          stroke="#3b82f6" 
                          name={t('analytics.predictive.carbon.actual') || 'Actual Emissions'} 
                          strokeWidth={2}
                          dot={{ r: 4 }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="predicted" 
                          stroke="#10b981" 
                          name={t('analytics.predictive.carbon.predicted') || 'Predicted Emissions'} 
                          strokeDasharray="5 5"
                          strokeWidth={2}
                          dot={{ r: 4 }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="target" 
                          stroke="#f59e0b" 
                          name={t('analytics.predictive.carbon.target') || 'Target Emissions'} 
                          strokeDasharray="3 3"
                          strokeWidth={2}
                          dot={{ r: 4 }}
                        />
                      </RechartsLineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {t('analytics.predictive.carbon.trendsNote') || 'Emissions measured in tons of CO2 equivalent'}
                    </span>
                  </div>
                  <Button variant="outline" size="sm">
                    {t('analytics.predictive.carbon.viewDetails') || 'View Details'}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}
        </TabsContent>
        
        {/* Customer Risk Tab */}
        <TabsContent value="customers">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-4">
              <Skeleton className="h-[400px] w-full" />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>{t('analytics.predictive.customers.riskTitle') || 'Customer Risk Analysis'}</CardTitle>
                  <CardDescription>
                    {t('analytics.predictive.customers.riskDescription') || 'High-value customers at risk of churning'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4">{t('analytics.predictive.customers.name') || 'Customer'}</th>
                          <th className="text-left py-3 px-4">{t('analytics.predictive.customers.risk') || 'Risk'}</th>
                          <th className="text-left py-3 px-4">{t('analytics.predictive.customers.value') || 'Value'}</th>
                          <th className="text-left py-3 px-4">{t('analytics.predictive.customers.renewal') || 'Next Renewal'}</th>
                          <th className="text-left py-3 px-4">{t('analytics.predictive.customers.actions') || 'Actions'}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {customerRiskData.map((customer, index) => (
                          <tr key={index} className="border-b">
                            <td className="py-3 px-4">{customer.name}</td>
                            <td className="py-3 px-4">
                              <Badge variant={getRiskBadgeVariant(customer.risk)}>
                                {t(`analytics.predictive.risk.${customer.risk}`) || customer.risk}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">${customer.value.toLocaleString()}</td>
                            <td className="py-3 px-4">{new Date(customer.nextRenewal).toLocaleDateString()}</td>
                            <td className="py-3 px-4">
                              <Button variant="outline" size="sm">
                                {t('analytics.predictive.customers.viewDetails') || 'View Details'}
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm" className="w-full">
                    {t('analytics.predictive.customers.viewAllCustomers') || 'View All Customers'}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
