"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { CarbonTrackingService } from '@/lib/carbon/carbon-tracking-service';
import { CarbonOffsetService } from '@/lib/carbon/carbon-offset-service';
import { useAuth } from '@/lib/firebase/auth-context';
import { Loader2, AlertCircle, TrendingUp, TrendingDown, Leaf, DollarSign } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { CarbonEmissionsChart } from '@/components/carbon/CarbonEmissionsChart';
import { CarbonOffsetHistory } from '@/components/carbon/CarbonOffsetHistory';
import { CarbonUsageBreakdown } from '@/components/carbon/CarbonUsageBreakdown';
import { CarbonOffsetRecommendation } from '@/components/carbon/CarbonOffsetRecommendation';

export default function CarbonDashboardPage() {
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
  const carbonTrackingService = new CarbonTrackingService();
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
    <div className="container mx-auto py-8 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Carbon Dashboard</h1>
          <p className="text-muted-foreground">
            Track, analyze, and offset your carbon footprint
          </p>
        </div>
        <Button 
          onClick={() => router.push('/carbon/offset')}
          className="mt-4 md:mt-0"
        >
          <Leaf className="mr-2 h-4 w-4" />
          Purchase Carbon Offsets
        </Button>
      </div>
      
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="emissions">Emissions</TabsTrigger>
          <TabsTrigger value="offsets">Offsets</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
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
