"use client";

import { useState, useEffect } from 'react';
import { CarbonOffsetService } from '@/lib/carbon/carbon-offset-service';
import { OffsetProjectType } from '@/lib/carbon/config';
import { Loader2, Leaf, AlertTriangle, TrendingDown, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface CarbonOffsetRecommendationProps {
  userId: string;
  organizationId?: string;
  currentFootprint?: {
    totalCarbonInKg: number;
    offsetCarbonInKg: number;
    remainingCarbonInKg: number;
    offsetPercentage: number;
  };
  recommendation?: {
    recommendedCarbonInKg: number;
    estimatedCostInUsd: number;
  };
}

export function CarbonOffsetRecommendation({
  userId,
  organizationId,
  currentFootprint: initialFootprint,
  recommendation: initialRecommendation
}: CarbonOffsetRecommendationProps) {
  const [loading, setLoading] = useState(!initialFootprint || !initialRecommendation);
  const [error, setError] = useState<string | null>(null);
  const [currentFootprint, setCurrentFootprint] = useState(initialFootprint);
  const [recommendation, setRecommendation] = useState(initialRecommendation);
  const [activeTab, setActiveTab] = useState('offset');
  const router = useRouter();
  
  useEffect(() => {
    // If data was provided as props, use it
    if (initialFootprint && initialRecommendation) {
      setCurrentFootprint(initialFootprint);
      setRecommendation(initialRecommendation);
      setLoading(false);
      return;
    }
    
    // Otherwise, fetch the data
    const loadRecommendations = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        // Create a carbon offset service instance
        const offsetService = new CarbonOffsetService();
        
        // Get recommendations
        const data = await offsetService.calculateRecommendedOffset(
          userId,
          organizationId
        );
        
        setCurrentFootprint(data.currentFootprint);
        setRecommendation({
          recommendedCarbonInKg: data.recommendedCarbonInKg,
          estimatedCostInUsd: data.estimatedCostInUsd,
        });
      } catch (err) {
        console.error('Error loading carbon offset recommendations:', err);
        setError('Failed to load carbon offset recommendations');
      } finally {
        setLoading(false);
      }
    };
    
    loadRecommendations();
  }, [userId, organizationId, initialFootprint, initialRecommendation]);
  
  // Format number with commas and fixed decimal places
  const formatNumber = (num: number, decimals = 2) => {
    return num.toLocaleString(undefined, { 
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  };
  
  // Format currency
  const formatCurrency = (dollars: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(dollars);
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }
  
  if (!currentFootprint || !recommendation) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-muted-foreground">No recommendation data available</p>
      </div>
    );
  }
  
  // Calculate carbon neutrality status
  const isFullyOffset = currentFootprint.offsetPercentage >= 100;
  const isPartiallyOffset = currentFootprint.offsetPercentage > 0 && currentFootprint.offsetPercentage < 100;
  const hasNoOffset = currentFootprint.offsetPercentage === 0;
  
  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="offset">Offset Recommendations</TabsTrigger>
          <TabsTrigger value="reduce">Reduction Tips</TabsTrigger>
        </TabsList>
        
        <TabsContent value="offset" className="space-y-6">
          {/* Carbon Neutrality Status */}
          <Card className={`border-l-4 ${isFullyOffset ? 'border-l-green-500' : isPartiallyOffset ? 'border-l-amber-500' : 'border-l-red-500'}`}>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                {isFullyOffset ? (
                  <Check className="h-6 w-6 text-green-500 mt-1" />
                ) : isPartiallyOffset ? (
                  <AlertTriangle className="h-6 w-6 text-amber-500 mt-1" />
                ) : (
                  <AlertTriangle className="h-6 w-6 text-red-500 mt-1" />
                )}
                <div>
                  <h3 className="font-medium text-lg">
                    {isFullyOffset 
                      ? 'Carbon Neutral Status Achieved!' 
                      : isPartiallyOffset 
                        ? 'Partially Carbon Neutral' 
                        : 'Not Carbon Neutral'}
                  </h3>
                  <p className="text-muted-foreground">
                    {isFullyOffset 
                      ? 'Congratulations! You have offset 100% of your carbon emissions.'
                      : isPartiallyOffset
                        ? `You have offset ${formatNumber(currentFootprint.offsetPercentage, 1)}% of your carbon emissions.`
                        : 'You have not offset any of your carbon emissions yet.'}
                  </p>
                  
                  <div className="mt-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Carbon Offset Progress</span>
                      <span>{formatNumber(currentFootprint.offsetPercentage, 1)}%</span>
                    </div>
                    <Progress 
                      value={currentFootprint.offsetPercentage} 
                      className="h-2"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Offset Recommendation */}
          {recommendation.recommendedCarbonInKg > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Recommended Carbon Offset</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <h4 className="text-sm text-muted-foreground mb-1">Carbon to Offset</h4>
                      <p className="text-2xl font-bold">{formatNumber(recommendation.recommendedCarbonInKg)} kg</p>
                      <p className="text-xs text-muted-foreground mt-1">CO₂ equivalent</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <h4 className="text-sm text-muted-foreground mb-1">Estimated Cost</h4>
                      <p className="text-2xl font-bold">{formatCurrency(recommendation.estimatedCostInUsd)}</p>
                      <p className="text-xs text-muted-foreground mt-1">Based on current market rates</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <h4 className="text-sm text-muted-foreground mb-1">Offset Now</h4>
                      <Button 
                        className="mt-2 w-full"
                        onClick={() => router.push('/carbon/offset')}
                      >
                        <Leaf className="mr-2 h-4 w-4" />
                        Purchase Offsets
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="font-medium mb-2">Recommended Project Types</h3>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                        <span>Forestry Projects</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500" />
                        <span>Renewable Energy</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-purple-500" />
                        <span>Community Projects</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="font-medium mb-2">Benefits of Carbon Offsetting</h3>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span>Neutralize your environmental impact</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span>Support sustainable development projects</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span>Demonstrate environmental responsibility</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
          
          {recommendation.recommendedCarbonInKg === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Leaf className="h-12 w-12 text-green-500 mb-4" />
              <h3 className="text-xl font-medium mb-2">You're Carbon Neutral!</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Congratulations! You have offset all of your carbon emissions. Keep up the good work!
              </p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="reduce" className="space-y-6">
          <h3 className="text-lg font-medium">Carbon Reduction Strategies</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <TrendingDown className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <h4 className="font-medium">Optimize Digital Operations</h4>
                    <ul className="mt-2 space-y-2 text-sm">
                      <li>• Reduce unnecessary email communications</li>
                      <li>• Optimize data storage with regular cleanup</li>
                      <li>• Implement efficient API design to reduce calls</li>
                      <li>• Use compression for large file transfers</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <TrendingDown className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <h4 className="font-medium">Energy Efficiency</h4>
                    <ul className="mt-2 space-y-2 text-sm">
                      <li>• Choose cloud providers with renewable energy</li>
                      <li>• Implement sleep modes for idle services</li>
                      <li>• Optimize code for efficiency</li>
                      <li>• Use energy-efficient hardware</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <TrendingDown className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <h4 className="font-medium">Document Management</h4>
                    <ul className="mt-2 space-y-2 text-sm">
                      <li>• Switch to digital-first document workflows</li>
                      <li>• Reduce printing and paper usage</li>
                      <li>• Implement e-signature solutions</li>
                      <li>• Archive old documents efficiently</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <TrendingDown className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <h4 className="font-medium">Sustainable Practices</h4>
                    <ul className="mt-2 space-y-2 text-sm">
                      <li>• Implement remote work policies</li>
                      <li>• Use video conferencing instead of travel</li>
                      <li>• Choose sustainable vendors and partners</li>
                      <li>• Educate team members on carbon reduction</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="flex justify-center mt-4">
            <Button variant="outline" onClick={() => window.open('/carbon/reduction-guide', '_blank')}>
              View Complete Reduction Guide
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
