'use client';

import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ClipboardCheck, AlertCircle, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ComplianceData {
  frameworks: string[];
  reportingFrequency: string;
}

interface OnboardingComplianceStepProps {
  data: ComplianceData;
  updateData: (data: Partial<ComplianceData>) => void;
}

export function OnboardingComplianceStep({ data, updateData }: OnboardingComplianceStepProps) {
  const [selectedFrameworks, setSelectedFrameworks] = useState<string[]>(data.frameworks || []);
  const [reportingFrequency, setReportingFrequency] = useState<string>(data.reportingFrequency || '');

  // Compliance framework options
  const complianceFrameworks = [
    {
      id: 'ghg-protocol',
      name: 'GHG Protocol',
      description: 'The Greenhouse Gas Protocol provides standards and guidance for businesses and governments to measure and manage climate-warming emissions.',
      regions: ['Global']
    },
    {
      id: 'tcfd',
      name: 'TCFD',
      description: 'The Task Force on Climate-related Financial Disclosures provides recommendations for more effective climate-related disclosures.',
      regions: ['Global']
    },
    {
      id: 'cdp',
      name: 'CDP',
      description: 'CDP (formerly Carbon Disclosure Project) runs a global disclosure system for investors, companies, cities, states, and regions to manage their environmental impacts.',
      regions: ['Global']
    },
    {
      id: 'sasb',
      name: 'SASB',
      description: 'The Sustainability Accounting Standards Board connects businesses and investors on the financial impacts of sustainability.',
      regions: ['Global', 'US']
    },
    {
      id: 'gri',
      name: 'GRI',
      description: 'The Global Reporting Initiative helps businesses and governments understand and communicate their impact on sustainability issues.',
      regions: ['Global']
    },
    {
      id: 'eu-csrd',
      name: 'EU CSRD',
      description: 'The Corporate Sustainability Reporting Directive requires companies to report on their social and environmental impacts.',
      regions: ['EU']
    },
    {
      id: 'sfdr',
      name: 'SFDR',
      description: 'The Sustainable Finance Disclosure Regulation requires financial market participants to disclose sustainability information.',
      regions: ['EU']
    },
    {
      id: 'secr',
      name: 'SECR',
      description: 'The Streamlined Energy and Carbon Reporting framework requires UK companies to report on their energy use and carbon emissions.',
      regions: ['UK']
    }
  ];

  // Reporting frequency options
  const frequencyOptions = [
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'semi-annually', label: 'Semi-Annually' },
    { value: 'annually', label: 'Annually' },
    { value: 'custom', label: 'Custom Schedule' }
  ];

  // Handle framework selection
  const handleFrameworkToggle = (frameworkId: string) => {
    setSelectedFrameworks(prev => {
      const newFrameworks = prev.includes(frameworkId)
        ? prev.filter(id => id !== frameworkId)
        : [...prev, frameworkId];
      
      // Update parent component data
      updateData({ frameworks: newFrameworks });
      
      return newFrameworks;
    });
  };

  // Handle reporting frequency change
  const handleFrequencyChange = (value: string) => {
    setReportingFrequency(value);
    updateData({ reportingFrequency: value });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center p-6 bg-primary/5 rounded-lg mb-6">
        <ClipboardCheck className="h-12 w-12 text-primary" />
      </div>

      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Select the compliance frameworks that are relevant to your organization. ClimaBill will help you generate reports that meet these requirements.
        </p>

        <div className="space-y-4 mt-4">
          {complianceFrameworks.map((framework) => {
            const isSelected = selectedFrameworks.includes(framework.id);
            
            return (
              <div 
                key={framework.id} 
                className={`flex items-start space-x-3 p-4 rounded-lg border transition-colors ${
                  isSelected ? 'border-primary bg-primary/5' : 'border-border'
                }`}
              >
                <Checkbox 
                  id={`framework-${framework.id}`} 
                  checked={isSelected}
                  onCheckedChange={() => handleFrameworkToggle(framework.id)}
                  className="mt-1"
                />
                <div className="space-y-1">
                  <div className="flex items-center">
                    <Label 
                      htmlFor={`framework-${framework.id}`}
                      className="font-medium cursor-pointer"
                    >
                      {framework.name}
                    </Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 ml-2 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">{framework.description}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Regions: {framework.regions.join(', ')}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="space-y-2 mt-6">
          <Label htmlFor="reporting-frequency">
            Preferred Reporting Frequency
          </Label>
          <Select
            value={reportingFrequency}
            onValueChange={handleFrequencyChange}
          >
            <SelectTrigger id="reporting-frequency">
              <SelectValue placeholder="Select reporting frequency" />
            </SelectTrigger>
            <SelectContent>
              {frequencyOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Alert variant="info" className="bg-blue-50 text-blue-800 border-blue-200 mt-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You can change your compliance framework settings at any time in the Compliance Reporting section.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
