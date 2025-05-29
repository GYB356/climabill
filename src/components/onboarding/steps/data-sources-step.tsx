'use client';

import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Database, FileSpreadsheet, AlertCircle, Plus, Check } from 'lucide-react';

interface DataSourcesData {
  sources: string[];
  importNow: boolean;
}

interface OnboardingDataSourcesStepProps {
  data: DataSourcesData;
  updateData: (data: Partial<DataSourcesData>) => void;
}

export function OnboardingDataSourcesStep({ data, updateData }: OnboardingDataSourcesStepProps) {
  const [selectedSources, setSelectedSources] = useState<string[]>(data.sources || []);
  const [importNow, setImportNow] = useState<boolean>(data.importNow || false);

  // Data source options
  const dataSources = [
    {
      id: 'utility-bills',
      name: 'Utility Bills',
      description: 'Import electricity, gas, and water bills',
      icon: FileSpreadsheet
    },
    {
      id: 'erp-system',
      name: 'ERP System',
      description: 'Connect to your ERP system for procurement data',
      icon: Database
    },
    {
      id: 'travel-system',
      name: 'Travel Management',
      description: 'Connect to your travel management system',
      icon: Database
    },
    {
      id: 'fleet-management',
      name: 'Fleet Management',
      description: 'Import data from your fleet management system',
      icon: Database
    },
    {
      id: 'spreadsheets',
      name: 'Spreadsheets',
      description: 'Upload data from Excel or CSV files',
      icon: FileSpreadsheet
    },
    {
      id: 'iot-devices',
      name: 'IoT Devices',
      description: 'Connect smart meters and IoT devices',
      icon: Database
    }
  ];

  // Handle data source selection
  const handleSourceToggle = (sourceId: string) => {
    setSelectedSources(prev => {
      const newSources = prev.includes(sourceId)
        ? prev.filter(id => id !== sourceId)
        : [...prev, sourceId];
      
      // Update parent component data
      updateData({ sources: newSources });
      
      return newSources;
    });
  };

  // Handle import now toggle
  const handleImportNowToggle = (checked: boolean) => {
    setImportNow(checked);
    updateData({ importNow: checked });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center p-6 bg-primary/5 rounded-lg mb-6">
        <Database className="h-12 w-12 text-primary" />
      </div>

      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Connect your data sources to start tracking your environmental impact. You can add more sources later.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {dataSources.map((source) => {
            const isSelected = selectedSources.includes(source.id);
            const Icon = source.icon;
            
            return (
              <Card 
                key={source.id} 
                className={`cursor-pointer transition-colors ${
                  isSelected ? 'border-primary bg-primary/5' : ''
                }`}
                onClick={() => handleSourceToggle(source.id)}
              >
                <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between space-y-0">
                  <div>
                    <CardTitle className="text-base">{source.name}</CardTitle>
                    <CardDescription>{source.description}</CardDescription>
                  </div>
                  <div className="flex items-center justify-center h-6 w-6 rounded-full border">
                    {isSelected ? <Check className="h-3 w-3 text-primary" /> : <Plus className="h-3 w-3 text-muted-foreground" />}
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mx-auto">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="flex items-center space-x-2 mt-6">
          <Checkbox 
            id="import-now" 
            checked={importNow}
            onCheckedChange={handleImportNowToggle}
          />
          <Label htmlFor="import-now">
            Set up data import now (recommended)
          </Label>
        </div>

        <Alert variant="info" className="bg-blue-50 text-blue-800 border-blue-200 mt-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You can skip this step and set up your data sources later, but we recommend connecting at least one source now to get the most out of ClimaBill.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
