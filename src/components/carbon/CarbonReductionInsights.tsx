"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Info, Check, AlertTriangle, TreePine, Factory, PlugZap, Building2, Receipt, Mail, Cloud } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { CarbonTrackingService } from '@/lib/carbon/carbon-tracking-service';
import { useAuth } from '@/lib/firebase/auth-context';

interface CarbonReductionInsightsProps {
  organizationId?: string;
  departmentId?: string;
  projectId?: string;
  className?: string;
}

// Interface for insight recommendation
interface Recommendation {
  id: string;
  title: string;
  description: string;
  potentialReduction: number; // in kg CO2e
  difficulty: 'easy' | 'medium' | 'hard';
  category: 'energy' | 'travel' | 'procurement' | 'operations' | 'it';
  icon: React.ReactNode;
}

export function CarbonReductionInsights({
  organizationId,
  departmentId,
  projectId,
  className
}: CarbonReductionInsightsProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [totalPotentialReduction, setTotalPotentialReduction] = useState(0);
  const [currentCarbonUsage, setCurrentCarbonUsage] = useState(0);
  const [savedRecommendations, setSavedRecommendations] = useState<string[]>([]);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const carbonTrackingService = new CarbonTrackingService();
  
  // Maps category to icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'energy':
        return <PlugZap className="h-4 w-4" />;
      case 'travel':
        return <Building2 className="h-4 w-4" />;
      case 'procurement':
        return <Receipt className="h-4 w-4" />;
      case 'operations':
        return <Factory className="h-4 w-4" />;
      case 'it':
        return <Cloud className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };
  
  // Generate insights based on carbon usage data
  const generateInsights = (usageData: any) => {
    // This would ideally come from an AI model or a more sophisticated algorithm
    // Here we're simulating some basic recommendations based on usage patterns
    
    const recommendations: Recommendation[] = [];
    let totalReduction = 0;
    
    // Base recommendations on usage metrics
    if (usageData.emailCount > 100) {
      const potentialReduction = Math.round(usageData.emailCount * 0.3 * 0.004); // 30% reduction in emails
      recommendations.push({
        id: 'email-reduction',
        title: 'Reduce unnecessary emails',
        description: 'Implement an internal messaging platform to reduce email volume and consider weekly digest emails rather than individual notifications.',
        potentialReduction,
        difficulty: 'easy',
        category: 'it',
        icon: <Mail className="h-4 w-4" />
      });
      totalReduction += potentialReduction;
    }
    
    if (usageData.storageGb > 50) {
      const potentialReduction = Math.round(usageData.storageGb * 0.2 * 0.02); // 20% reduction in storage
      recommendations.push({
        id: 'storage-optimization',
        title: 'Optimize cloud storage',
        description: 'Implement data lifecycle policies to archive or delete unused data, and consider more efficient file formats for large datasets.',
        potentialReduction,
        difficulty: 'medium',
        category: 'it',
        icon: <Cloud className="h-4 w-4" />
      });
      totalReduction += potentialReduction;
    }
    
    // Add general recommendations
    recommendations.push({
      id: 'renewable-energy',
      title: 'Switch to renewable energy',
      description: 'Transition your office energy supply to a certified renewable energy provider to reduce emissions from your operations.',
      potentialReduction: Math.round(usageData.totalCarbonInKg * 0.4), // 40% reduction
      difficulty: 'medium',
      category: 'energy',
      icon: <PlugZap className="h-4 w-4" />
    });
    totalReduction += Math.round(usageData.totalCarbonInKg * 0.4);
    
    recommendations.push({
      id: 'supplier-assessment',
      title: 'Low-carbon supplier assessment',
      description: 'Evaluate your suppliers\' carbon footprints and shift procurement to vendors with lower emissions profiles.',
      potentialReduction: Math.round(usageData.totalCarbonInKg * 0.15), // 15% reduction
      difficulty: 'hard',
      category: 'procurement',
      icon: <Receipt className="h-4 w-4" />
    });
    totalReduction += Math.round(usageData.totalCarbonInKg * 0.15);
    
    // Sort recommendations by potential reduction (highest first)
    recommendations.sort((a, b) => b.potentialReduction - a.potentialReduction);
    
    setRecommendations(recommendations);
    setTotalPotentialReduction(totalReduction);
    setCurrentCarbonUsage(usageData.totalCarbonInKg);
  };
  
  useEffect(() => {
    const loadInsights = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!user) return;
        
        // Get carbon usage data for the last month
        const targetId = organizationId || user.uid;
        const usageData = await carbonTrackingService.getLatestCarbonUsage(targetId, departmentId, projectId);
        
        if (!usageData) {
          setError('No carbon usage data available to generate insights.');
          return;
        }
        
        // Generate insights based on usage data
        generateInsights(usageData);
        
        // Load saved recommendations
        const saved = await carbonTrackingService.getSavedRecommendations(targetId);
        setSavedRecommendations(saved || []);
        
      } catch (err) {
        console.error('Error loading carbon insights:', err);
        setError('Failed to load carbon reduction insights');
        toast({
          title: 'Error',
          description: 'Failed to load carbon reduction insights. Please try again later.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadInsights();
  }, [user, organizationId, departmentId, projectId]);
  
  // Save a recommendation to the user's saved list
  const saveRecommendation = async (recommendationId: string) => {
    try {
      if (!user) return;
      
      const targetId = organizationId || user.uid;
      await carbonTrackingService.saveRecommendation(targetId, recommendationId);
      
      setSavedRecommendations(prev => [...prev, recommendationId]);
      
      toast({
        title: 'Recommendation saved',
        description: 'The recommendation has been saved to your action plan.',
      });
    } catch (err) {
      console.error('Error saving recommendation:', err);
      toast({
        title: 'Error',
        description: 'Failed to save recommendation. Please try again later.',
        variant: 'destructive',
      });
    }
  };
  
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'hard':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };
  
  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Carbon Reduction Insights</CardTitle>
        </CardHeader>
        <CardContent className="pt-2 flex justify-center items-center min-h-[300px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Carbon Reduction Insights</CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }
  
  const potentialReductionPercentage = Math.round((totalPotentialReduction / currentCarbonUsage) * 100);
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TreePine className="h-5 w-5 text-green-600" />
          Carbon Reduction Insights
        </CardTitle>
        <CardDescription>
          AI-generated recommendations to reduce your carbon footprint
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        {recommendations.length > 0 ? (
          <>
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Potential Carbon Reduction</span>
                <span className="text-sm font-bold text-green-600">{potentialReductionPercentage}%</span>
              </div>
              <Progress value={potentialReductionPercentage} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2">
                Implementing all recommendations could reduce your carbon footprint by approximately {totalPotentialReduction.toLocaleString()} kg CO₂e
              </p>
            </div>
            
            <div className="space-y-4">
              {recommendations.map((recommendation) => (
                <div key={recommendation.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-full text-primary">
                        {recommendation.icon}
                      </div>
                      <div>
                        <h4 className="font-medium">{recommendation.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {recommendation.category}
                          </Badge>
                          <div className="flex items-center gap-1">
                            <div className={`w-2 h-2 rounded-full ${getDifficultyColor(recommendation.difficulty)}`} />
                            <span className="text-xs text-muted-foreground capitalize">{recommendation.difficulty}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Badge variant="secondary" className="ml-2">
                      {recommendation.potentialReduction.toLocaleString()} kg CO₂e
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mt-3">
                    {recommendation.description}
                  </p>
                  
                  <div className="mt-3">
                    {savedRecommendations.includes(recommendation.id) ? (
                      <Button variant="outline" size="sm" className="w-full" disabled>
                        <Check className="mr-2 h-4 w-4" />
                        Saved to Action Plan
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" className="w-full" onClick={() => saveRecommendation(recommendation.id)}>
                        Add to Action Plan
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-10">
            <Info className="h-10 w-10 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              No reduction insights available at this time. Continue tracking your carbon usage to receive personalized recommendations.
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t pt-4 text-xs text-muted-foreground">
        Insights are based on your historical carbon usage patterns and industry best practices. Actual results may vary.
      </CardFooter>
    </Card>
  );
}
