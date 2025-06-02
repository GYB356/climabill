"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  Lightbulb, 
  TrendingUp, 
  BarChart, 
  PieChart,
  Calendar,
  Download
} from 'lucide-react';
import { useTranslation } from 'next-i18next';
import { EnhancedChart } from '@/components/data-visualization/EnhancedChart';
import RecommendationCard from './RecommendationCard';
import { PersonalizedRecommendation } from '@/lib/carbon/gamification-types';

interface InsightsSectionProps {
  recommendations: PersonalizedRecommendation[];
  emissionsData: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
    }>;
  };
  breakdownData: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
    }>;
  };
  timeRanges: string[];
  selectedTimeRange: string;
  onTimeRangeChange: (range: string) => void;
  onImplementRecommendation: (id: string) => void;
  onSaveRecommendation: (id: string) => void;
  onDismissRecommendation: (id: string) => void;
  className?: string;
}

const InsightsSection: React.FC<InsightsSectionProps> = ({
  recommendations,
  emissionsData,
  breakdownData,
  timeRanges,
  selectedTimeRange,
  onTimeRangeChange,
  onImplementRecommendation,
  onSaveRecommendation,
  onDismissRecommendation,
  className = ''
}) => {
  const { t } = useTranslation('common');
  
  // Format carbon value
  const formatCarbonValue = (value: number) => {
    return `${value.toLocaleString(undefined, { maximumFractionDigits: 0 })} kg CO₂`;
  };
  
  return (
    <div className={`space-y-6 ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* AI-Powered Insights */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-amber-500" />
              {t('insights.personalizedRecommendations')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recommendations.length > 0 ? (
                recommendations.slice(0, 3).map((recommendation) => (
                  <RecommendationCard
                    key={recommendation.id}
                    recommendation={recommendation}
                    onImplement={onImplementRecommendation}
                    onSaveForLater={onSaveRecommendation}
                    onDismiss={onDismissRecommendation}
                  />
                ))
              ) : (
                <p className="text-center text-gray-500 py-8">
                  {t('insights.noRecommendations')}
                </p>
              )}
              
              {recommendations.length > 3 && (
                <Button variant="outline" className="w-full">
                  {t('insights.viewAllRecommendations')}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Emissions Analysis */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              {t('insights.emissionsAnalysis')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="trends" className="space-y-4">
              <TabsList className="grid grid-cols-2">
                <TabsTrigger value="trends" className="flex items-center gap-1">
                  <BarChart className="h-4 w-4" />
                  {t('insights.trends')}
                </TabsTrigger>
                <TabsTrigger value="breakdown" className="flex items-center gap-1">
                  <PieChart className="h-4 w-4" />
                  {t('insights.breakdown')}
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="trends" className="space-y-4">
                <div className="h-64">
                  <EnhancedChart
                    type="line"
                    labels={emissionsData.labels}
                    datasets={emissionsData.datasets}
                    timeRanges={timeRanges}
                    onTimeRangeChange={onTimeRangeChange}
                    dataFormatter={formatCarbonValue}
                    options={{
                      scales: {
                        y: {
                          beginAtZero: true,
                          title: {
                            display: true,
                            text: t('insights.carbonEmissionsKg')
                          }
                        }
                      }
                    }}
                  />
                </div>
                
                <div className="flex justify-end">
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <Download className="h-4 w-4" />
                    {t('insights.exportData')}
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="breakdown" className="space-y-4">
                <div className="h-64">
                  <EnhancedChart
                    type="doughnut"
                    labels={breakdownData.labels}
                    datasets={breakdownData.datasets}
                    dataFormatter={formatCarbonValue}
                    options={{
                      plugins: {
                        legend: {
                          position: 'right'
                        }
                      }
                    }}
                    showControls={false}
                  />
                </div>
                
                <div className="flex justify-end">
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <Download className="h-4 w-4" />
                    {t('insights.exportData')}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InsightsSection;
