"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { CachedCarbonTrackingService } from '@/lib/carbon/cached-carbon-tracking-service';
import { CarbonOffsetService } from '@/lib/carbon/carbon-offset-service';
import { useAuth } from '@/lib/firebase/auth-context';
import { Loader2, AlertCircle, TrendingUp, TrendingDown, Leaf, DollarSign, BarChart4, Activity, ListTodo } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { CarbonEmissionsChart } from '@/components/carbon/CarbonEmissionsChart';
import { CarbonOffsetHistory } from '@/components/carbon/CarbonOffsetHistory';
import { CarbonUsageBreakdown } from '@/components/carbon/CarbonUsageBreakdown';
import { CarbonOffsetRecommendation } from '@/components/carbon/CarbonOffsetRecommendation';
import { CarbonForecastChart } from '@/components/carbon/CarbonForecastChart';
import { CarbonReductionInsights } from '@/components/carbon/CarbonReductionInsights';
import { CarbonGoalTracker } from '@/components/carbon/CarbonGoalTracker';
import { CarbonAnalytics } from '@/components/carbon/CarbonAnalytics';
import EnhancedCarbonDashboard from '@/components/carbon/EnhancedCarbonDashboard';
import { useTranslation } from 'next-i18next';

export default function CarbonDashboardPage() {
  const { t } = useTranslation('common');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [carbonSummary, setCarbonSummary] = useState<{
    totalCarbonInKg: number;
    offsetCarbonInKg: number;
    remainingCarbonInKg: number;
    offsetPercentage: number;
    totalOffsetPurchases: number;
    monthlyCarbonTrend: Array<{
      month: string;
      totalCarbonInKg: number;
      offsetCarbonInKg: number;
    }>;
  } | null>(null);
  const [offsetRecommendation, setOffsetRecommendation] = useState<{
    recommendedCarbonInKg: number;
    estimatedCostInUsd: number;
  } | null>(null);
  const [offsetHistory, setOffsetHistory] = useState<any[]>([]);
  
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  // Services
  const carbonTrackingService = new CachedCarbonTrackingService();
  const carbonOffsetService = new CarbonOffsetService();
  
  // Load carbon data
  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      router.push('/login');
      return;
    }
    
    const loadCarbonData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get carbon footprint summary
        const summary = await carbonTrackingService.getCarbonFootprintSummary(user.uid);
        setCarbonSummary(summary);
        
        // Get offset recommendation
        const recommendation = await carbonOffsetService.calculateRecommendedOffset(user.uid);
        setOffsetRecommendation({
          recommendedCarbonInKg: recommendation.recommendedCarbonInKg,
          estimatedCostInUsd: recommendation.estimatedCostInUsd,
        });
        
        // Get offset history
        const history = await carbonTrackingService.getCarbonOffsetHistory(user.uid, 5);
        setOffsetHistory(history);
        
      } catch (err) {
        console.error('Error loading carbon data:', err);
        setError('Failed to load carbon data. Please try again later.');
        toast({
          title: 'Error',
          description: 'Failed to load carbon data. Please try again later.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadCarbonData();
  }, [user, authLoading, router, toast]);
  
  // Format number with commas and fixed decimal places
  const formatNumber = (num: number, decimals = 2) => {
    return num.toLocaleString(undefined, { 
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  };
  
  // Calculate trend percentage
  const calculateTrend = () => {
    if (!carbonSummary || carbonSummary.monthlyCarbonTrend.length < 2) return null;
    
    const trend = carbonSummary.monthlyCarbonTrend;
    const currentMonth = trend[trend.length - 1];
    const previousMonth = trend[trend.length - 2];
    
    if (previousMonth.totalCarbonInKg === 0) return null;
    
    const percentChange = ((currentMonth.totalCarbonInKg - previousMonth.totalCarbonInKg) / previousMonth.totalCarbonInKg) * 100;
    
    return {
      value: Math.abs(percentChange).toFixed(1),
      isIncrease: percentChange > 0,
    };
  };
  
  const trend = calculateTrend();
  
  if (loading || authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading carbon data...</p>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{t('carbon.dashboard')}</h1>
        <Button
          variant="outline"
          onClick={() => router.push('/carbon/offset')}
        >
          {t('buttons.offset')}
        </Button>
      </div>
      
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <Tabs defaultValue="overview" className="space-y-4" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">{t('navigation.dashboard')}</TabsTrigger>
          <TabsTrigger value="emissions">Emissions</TabsTrigger>
          <TabsTrigger value="offsets">Offsets</TabsTrigger>
          <TabsTrigger value="analytics">{t('carbon.analytics')}</TabsTrigger>
          <TabsTrigger value="insights">{t('carbon.insights')}</TabsTrigger>
          <TabsTrigger value="goals">{t('carbon.goals')}</TabsTrigger>
          <TabsTrigger value="enhanced">{t('carbon.analytics')} 2.0</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Total Carbon Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Carbon Footprint
                </CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-muted-foreground"
                >
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {carbonSummary ? formatNumber(carbonSummary.totalCarbonInKg) : '0.00'} kg
                </div>
                <p className="text-xs text-muted-foreground">
                  CO₂ equivalent
                </p>
                {trend && (
                  <div className="flex items-center mt-2">
                    {trend.isIncrease ? (
                      <TrendingUp className="h-4 w-4 text-destructive mr-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-green-500 mr-1" />
                    )}
                    <span className={trend.isIncrease ? 'text-destructive text-xs' : 'text-green-500 text-xs'}>
                      {trend.value}% {trend.isIncrease ? 'increase' : 'decrease'} from last month
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Offset Carbon Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Carbon Offset
                </CardTitle>
                <Leaf className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {carbonSummary ? formatNumber(carbonSummary.offsetCarbonInKg) : '0.00'} kg
                </div>
                <p className="text-xs text-muted-foreground">
                  CO₂ offset through purchases
                </p>
                <div className="mt-2">
                  <Progress 
                    value={carbonSummary?.offsetPercentage || 0} 
                    className="h-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {carbonSummary ? formatNumber(carbonSummary.offsetPercentage, 1) : '0.0'}% offset
                  </p>
                </div>
              </CardContent>
            </Card>
            
            {/* Remaining Carbon Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Remaining Carbon
                </CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {carbonSummary ? formatNumber(carbonSummary.remainingCarbonInKg) : '0.00'} kg
                </div>
                <p className="text-xs text-muted-foreground">
                  CO₂ not yet offset
                </p>
                {offsetRecommendation && offsetRecommendation.recommendedCarbonInKg > 0 && (
                  <div className="mt-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => router.push('/carbon/offset')}
                    >
                      Offset Now
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Offset Cost Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Estimated Offset Cost
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${offsetRecommendation ? formatNumber(offsetRecommendation.estimatedCostInUsd, 2) : '0.00'}
                </div>
                <p className="text-xs text-muted-foreground">
                  To offset remaining carbon
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Based on current market rates
                </p>
              </CardContent>
            </Card>
          </div>
          
          {/* Charts */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Carbon Emissions Trend</CardTitle>
                <CardDescription>
                  Monthly carbon emissions over time
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                {carbonSummary && (
                  <CarbonEmissionsChart data={carbonSummary.monthlyCarbonTrend} />
                )}
              </CardContent>
            </Card>
            
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Carbon Usage Breakdown</CardTitle>
                <CardDescription>
                  Sources of carbon emissions
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <CarbonUsageBreakdown userId={user?.uid || ''} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="emissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Emissions Analysis</CardTitle>
              <CardDescription>
                Comprehensive breakdown of your carbon emissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* This will be implemented in the CarbonEmissionsDetail component */}
              <p className="text-muted-foreground">
                Detailed emissions analysis will be displayed here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="offsets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Carbon Offset History</CardTitle>
              <CardDescription>
                Your past carbon offset purchases
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CarbonOffsetHistory 
                offsetHistory={offsetHistory} 
                userId={user?.uid || ''} 
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-4">
            <Card className="col-span-1 lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart4 className="h-5 w-5" />
                  Advanced Analytics
                </CardTitle>
                <CardDescription>
                  Detailed carbon usage analysis with customizable filters
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CarbonAnalytics 
                  organizationId={user?.uid || ''} 
                  departmentId={undefined}
                  projectId={undefined}
                />
              </CardContent>
            </Card>
            
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Goal Tracking
                </CardTitle>
                <CardDescription>
                  Track progress on your carbon reduction goals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CarbonGoalTracker 
                  organizationId={user?.uid || ''} 
                  showAddNew={true}
                />
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Carbon Usage Forecast</CardTitle>
              <CardDescription>
                AI-powered forecast of your future carbon usage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CarbonForecastChart 
                organizationId={user?.uid || ''} 
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="insights" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ListTodo className="h-5 w-5" />
                  Carbon Reduction Insights
                </CardTitle>
                <CardDescription>
                  AI-generated recommendations to reduce your carbon footprint
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CarbonReductionInsights 
                  organizationId={user?.uid || ''} 
                />
              </CardContent>
            </Card>
            
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Offset Recommendations</CardTitle>
                <CardDescription>
                  Personalized recommendations for carbon offsetting
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CarbonOffsetRecommendation 
                  userId={user?.uid || ''} 
                  currentFootprint={carbonSummary || undefined}
                  recommendation={offsetRecommendation || undefined}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Carbon Offset Recommendations</CardTitle>
              <CardDescription>
                Personalized recommendations to reduce your carbon footprint
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CarbonOffsetRecommendation 
                userId={user?.uid || ''} 
                currentFootprint={carbonSummary || undefined}
                recommendation={offsetRecommendation || undefined}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
