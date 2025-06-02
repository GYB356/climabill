"use client";

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  Download, 
  Share2,
  Leaf,
  Globe
} from 'lucide-react';
import { useTranslation } from 'next-i18next';

interface DashboardHeaderProps {
  carbonSummary: {
    totalCarbonInKg: number;
    offsetCarbonInKg: number;
    netCarbonInKg: number;
    trend: {
      value: number;
      isIncrease: boolean;
    } | null;
  };
  className?: string;
  onShare?: () => void;
  onExport?: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  carbonSummary,
  className = '',
  onShare,
  onExport
}) => {
  const { t } = useTranslation('common');
  
  // Format carbon value
  const formatCarbonValue = (value: number) => {
    return value.toLocaleString(undefined, { maximumFractionDigits: 1 });
  };
  
  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Leaf className="h-6 w-6 text-emerald-500" />
            {t('dashboard.carbonFootprint')}
          </h1>
          <p className="text-gray-500">
            {t('dashboard.trackReduceOffset')}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {onExport && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onExport}
              className="flex items-center gap-1"
            >
              <Download className="h-4 w-4" />
              {t('dashboard.exportData')}
            </Button>
          )}
          {onShare && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onShare}
              className="flex items-center gap-1"
            >
              <Share2 className="h-4 w-4" />
              {t('dashboard.share')}
            </Button>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Carbon */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 mb-1">{t('dashboard.totalEmissions')}</p>
                <p className="text-3xl font-bold">
                  {formatCarbonValue(carbonSummary.totalCarbonInKg)}
                  <span className="text-base font-normal ml-1">kg CO₂</span>
                </p>
              </div>
              <div className="bg-orange-100 p-2 rounded-full">
                <Leaf className="h-5 w-5 text-orange-600" />
              </div>
            </div>
            
            {carbonSummary.trend && (
              <div className="mt-4 flex items-center">
                {carbonSummary.trend.isIncrease ? (
                  <>
                    <TrendingUp className="h-4 w-4 text-red-500 mr-1" />
                    <span className="text-sm text-red-500">
                      +{carbonSummary.trend.value}% {t('dashboard.fromPrevious')}
                    </span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-500">
                      -{carbonSummary.trend.value}% {t('dashboard.fromPrevious')}
                    </span>
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Offset Carbon */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 mb-1">{t('dashboard.offsetEmissions')}</p>
                <p className="text-3xl font-bold">
                  {formatCarbonValue(carbonSummary.offsetCarbonInKg)}
                  <span className="text-base font-normal ml-1">kg CO₂</span>
                </p>
              </div>
              <div className="bg-green-100 p-2 rounded-full">
                <Globe className="h-5 w-5 text-green-600" />
              </div>
            </div>
            
            <div className="mt-4">
              <Badge className="bg-green-100 text-green-800">
                {Math.round((carbonSummary.offsetCarbonInKg / carbonSummary.totalCarbonInKg) * 100)}% {t('dashboard.offset')}
              </Badge>
            </div>
          </CardContent>
        </Card>
        
        {/* Net Carbon */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 mb-1">{t('dashboard.netEmissions')}</p>
                <p className="text-3xl font-bold">
                  {formatCarbonValue(carbonSummary.netCarbonInKg)}
                  <span className="text-base font-normal ml-1">kg CO₂</span>
                </p>
              </div>
              <div className={`p-2 rounded-full ${
                carbonSummary.netCarbonInKg === 0 
                  ? 'bg-blue-100' 
                  : carbonSummary.netCarbonInKg < carbonSummary.totalCarbonInKg * 0.5 
                    ? 'bg-yellow-100' 
                    : 'bg-red-100'
              }`}>
                <AlertCircle className={`h-5 w-5 ${
                  carbonSummary.netCarbonInKg === 0 
                    ? 'text-blue-600' 
                    : carbonSummary.netCarbonInKg < carbonSummary.totalCarbonInKg * 0.5 
                      ? 'text-yellow-600' 
                      : 'text-red-600'
                }`} />
              </div>
            </div>
            
            <div className="mt-4">
              {carbonSummary.netCarbonInKg === 0 ? (
                <Badge className="bg-blue-100 text-blue-800">
                  {t('dashboard.carbonNeutral')}
                </Badge>
              ) : carbonSummary.netCarbonInKg < carbonSummary.totalCarbonInKg * 0.2 ? (
                <Badge className="bg-green-100 text-green-800">
                  {t('dashboard.lowEmissions')}
                </Badge>
              ) : carbonSummary.netCarbonInKg < carbonSummary.totalCarbonInKg * 0.5 ? (
                <Badge className="bg-yellow-100 text-yellow-800">
                  {t('dashboard.moderateEmissions')}
                </Badge>
              ) : (
                <Badge className="bg-red-100 text-red-800">
                  {t('dashboard.highEmissions')}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardHeader;
