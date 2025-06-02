"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  Save, 
  RefreshCw, 
  Share2, 
  Download,
  ArrowDown,
  ArrowUp
} from 'lucide-react';
import { ScenarioModel } from '@/lib/carbon/gamification-types';
import { useTranslation } from 'next-i18next';
import { EnhancedChart } from '@/components/data-visualization/EnhancedChart';

interface ScenarioModelerProps {
  scenario: ScenarioModel;
  className?: string;
  onSave?: (updatedScenario: ScenarioModel) => void;
  onShare?: (scenarioId: string) => void;
  onExport?: (scenarioId: string) => void;
  onReset?: () => void;
}

const ScenarioModeler: React.FC<ScenarioModelerProps> = ({ 
  scenario, 
  className = '',
  onSave,
  onShare,
  onExport,
  onReset
}) => {
  const { t } = useTranslation('common');
  const [currentScenario, setCurrentScenario] = useState<ScenarioModel>(scenario);
  const [paramValues, setParamValues] = useState<Record<string, number>>({});
  const [chartData, setChartData] = useState({
    labels: ['Baseline', 'Optimized'],
    datasets: [
      {
        label: t('scenarios.carbonEmissions'),
        data: [scenario.baselineCarbonInKg, scenario.modifiedCarbonInKg],
        backgroundColor: ['#f97316', '#10b981']
      }
    ]
  });
  
  // Initialize parameter values from scenario
  useEffect(() => {
    const initialValues: Record<string, number> = {};
    Object.entries(scenario.parameters).forEach(([key, param]) => {
      initialValues[key] = param.value;
    });
    setParamValues(initialValues);
    setCurrentScenario(scenario);
  }, [scenario]);
  
  // Update chart data when scenario changes
  useEffect(() => {
    setChartData({
      labels: ['Baseline', 'Optimized'],
      datasets: [
        {
          label: t('scenarios.carbonEmissions'),
          data: [currentScenario.baselineCarbonInKg, currentScenario.modifiedCarbonInKg],
          backgroundColor: ['#f97316', '#10b981']
        }
      ]
    });
  }, [currentScenario, t]);
  
  // Handle parameter change
  const handleParamChange = (paramKey: string, value: number) => {
    const newValues = { ...paramValues, [paramKey]: value };
    setParamValues(newValues);
    
    // Calculate new carbon impact
    let newModifiedCarbon = 0;
    Object.entries(currentScenario.parameters).forEach(([key, param]) => {
      const paramValue = key === paramKey ? value : paramValues[key];
      newModifiedCarbon += paramValue * param.impact;
    });
    
    // Update scenario
    const updatedScenario = {
      ...currentScenario,
      modifiedCarbonInKg: newModifiedCarbon,
      reductionPercentage: ((currentScenario.baselineCarbonInKg - newModifiedCarbon) / currentScenario.baselineCarbonInKg) * 100,
      parameters: Object.entries(currentScenario.parameters).reduce((acc, [key, param]) => {
        acc[key] = {
          ...param,
          value: key === paramKey ? value : paramValues[key]
        };
        return acc;
      }, {} as ScenarioModel['parameters']),
      updatedAt: new Date()
    };
    
    setCurrentScenario(updatedScenario);
  };
  
  // Reset parameters to default values
  const handleReset = () => {
    const defaultValues: Record<string, number> = {};
    const defaultParams = { ...currentScenario.parameters };
    
    Object.entries(scenario.parameters).forEach(([key, param]) => {
      defaultValues[key] = param.defaultValue;
      defaultParams[key] = {
        ...param,
        value: param.defaultValue
      };
    });
    
    // Calculate new carbon impact
    let newModifiedCarbon = 0;
    Object.entries(defaultParams).forEach(([_, param]) => {
      newModifiedCarbon += param.value * param.impact;
    });
    
    const resetScenario = {
      ...currentScenario,
      modifiedCarbonInKg: newModifiedCarbon,
      reductionPercentage: ((currentScenario.baselineCarbonInKg - newModifiedCarbon) / currentScenario.baselineCarbonInKg) * 100,
      parameters: defaultParams,
      updatedAt: new Date()
    };
    
    setParamValues(defaultValues);
    setCurrentScenario(resetScenario);
    
    if (onReset) {
      onReset();
    }
  };
  
  // Save current scenario
  const handleSave = () => {
    if (onSave) {
      onSave(currentScenario);
    }
  };
  
  // Format carbon value
  const formatCarbonValue = (value: number) => {
    return `${value.toLocaleString(undefined, { maximumFractionDigits: 0 })} kg CO₂`;
  };
  
  return (
    <Card className={`${className} transition-all`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <Badge className="bg-blue-500 text-white">
            {t('scenarios.whatIf')}
          </Badge>
          <Badge 
            className={`flex items-center gap-1 ${
              currentScenario.reductionPercentage > 0 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}
          >
            {currentScenario.reductionPercentage > 0 ? (
              <ArrowDown className="h-3 w-3" />
            ) : (
              <ArrowUp className="h-3 w-3" />
            )}
            {Math.abs(currentScenario.reductionPercentage).toFixed(1)}% {t('scenarios.change')}
          </Badge>
        </div>
        <CardTitle className="text-lg flex items-center gap-2 mt-2">
          <BarChart3 className="h-5 w-5 text-blue-500" />
          {currentScenario.name}
        </CardTitle>
        <p className="text-sm text-gray-600 mt-1">{currentScenario.description}</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Chart visualization */}
        <div className="h-64">
          <EnhancedChart
            type="bar"
            labels={chartData.labels}
            datasets={chartData.datasets}
            options={{
              scales: {
                y: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: t('scenarios.carbonEmissionsKg')
                  },
                  ticks: {
                    callback: (value) => formatCarbonValue(Number(value))
                  }
                }
              },
              plugins: {
                tooltip: {
                  callbacks: {
                    label: (context) => formatCarbonValue(context.parsed.y)
                  }
                }
              }
            }}
            showControls={false}
            allowTypeChange={false}
            colorPalette={['#f97316', '#10b981']}
          />
        </div>
        
        {/* Parameter sliders */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">{t('scenarios.adjustParameters')}</h3>
          
          {Object.entries(currentScenario.parameters).map(([key, param]) => (
            <div key={key} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{param.name}</span>
                <span className="font-medium">
                  {paramValues[key]} {param.unit}
                </span>
              </div>
              <Slider
                value={[paramValues[key] || param.defaultValue]}
                min={param.minValue}
                max={param.maxValue}
                step={param.step}
                onValueChange={(values) => handleParamChange(key, values[0])}
                className="py-2"
              />
              <div className="text-xs text-gray-500 flex justify-between">
                <span>{param.minValue} {param.unit}</span>
                <span>{param.maxValue} {param.unit}</span>
              </div>
            </div>
          ))}
        </div>
        
        {/* Summary */}
        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="text-sm font-medium mb-2">{t('scenarios.summary')}</h3>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">{t('scenarios.baseline')}:</span>
              <span className="font-medium">{formatCarbonValue(currentScenario.baselineCarbonInKg)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{t('scenarios.optimized')}:</span>
              <span className="font-medium">{formatCarbonValue(currentScenario.modifiedCarbonInKg)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{t('scenarios.reduction')}:</span>
              <span className={`font-medium ${currentScenario.reductionPercentage > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {currentScenario.reductionPercentage > 0 ? '-' : '+'}
                {Math.abs(currentScenario.modifiedCarbonInKg - currentScenario.baselineCarbonInKg).toLocaleString()} kg
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{t('scenarios.percentage')}:</span>
              <span className={`font-medium ${currentScenario.reductionPercentage > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {currentScenario.reductionPercentage > 0 ? '-' : '+'}
                {Math.abs(currentScenario.reductionPercentage).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2 pt-0">
        {onSave && (
          <Button 
            variant="default" 
            size="sm" 
            className="flex-1 bg-emerald-600 hover:bg-emerald-700" 
            onClick={handleSave}
          >
            <Save className="h-4 w-4 mr-1" />
            {t('scenarios.saveScenario')}
          </Button>
        )}
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1" 
          onClick={handleReset}
        >
          <RefreshCw className="h-4 w-4 mr-1" />
          {t('scenarios.reset')}
        </Button>
        {onShare && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex-none" 
            onClick={() => onShare(currentScenario.id)}
          >
            <Share2 className="h-4 w-4" />
          </Button>
        )}
        {onExport && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex-none" 
            onClick={() => onExport(currentScenario.id)}
          >
            <Download className="h-4 w-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ScenarioModeler;
