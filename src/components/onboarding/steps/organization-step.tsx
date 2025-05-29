'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Building2, AlertCircle } from 'lucide-react';

interface OrganizationData {
  name: string;
  industry: string;
  size: string;
  location: string;
}

interface OnboardingOrganizationStepProps {
  data: OrganizationData;
  updateData: (data: Partial<OrganizationData>) => void;
}

export function OnboardingOrganizationStep({ data, updateData }: OnboardingOrganizationStepProps) {
  const [errors, setErrors] = useState<Partial<Record<keyof OrganizationData, string>>>({});

  // Validate form on mount and when data changes
  useEffect(() => {
    validateForm();
  }, [data]);

  // Validate form fields
  const validateForm = () => {
    const newErrors: Partial<Record<keyof OrganizationData, string>> = {};

    if (!data.name.trim()) {
      newErrors.name = 'Organization name is required';
    }

    if (!data.industry) {
      newErrors.industry = 'Industry is required';
    }

    setErrors(newErrors);
  };

  // Handle input change
  const handleChange = (field: keyof OrganizationData, value: string) => {
    updateData({ [field]: value });
  };

  // Industry options
  const industries = [
    { value: 'agriculture', label: 'Agriculture' },
    { value: 'automotive', label: 'Automotive' },
    { value: 'banking', label: 'Banking & Finance' },
    { value: 'construction', label: 'Construction' },
    { value: 'education', label: 'Education' },
    { value: 'energy', label: 'Energy & Utilities' },
    { value: 'food', label: 'Food & Beverage' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'hospitality', label: 'Hospitality & Tourism' },
    { value: 'manufacturing', label: 'Manufacturing' },
    { value: 'media', label: 'Media & Entertainment' },
    { value: 'retail', label: 'Retail' },
    { value: 'technology', label: 'Technology' },
    { value: 'telecom', label: 'Telecommunications' },
    { value: 'transportation', label: 'Transportation & Logistics' },
    { value: 'other', label: 'Other' }
  ];

  // Organization size options
  const organizationSizes = [
    { value: '1-10', label: '1-10 employees' },
    { value: '11-50', label: '11-50 employees' },
    { value: '51-200', label: '51-200 employees' },
    { value: '201-500', label: '201-500 employees' },
    { value: '501-1000', label: '501-1000 employees' },
    { value: '1001-5000', label: '1001-5000 employees' },
    { value: '5001-10000', label: '5001-10000 employees' },
    { value: '10000+', label: 'More than 10000 employees' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center p-6 bg-primary/5 rounded-lg mb-6">
        <Building2 className="h-12 w-12 text-primary" />
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="organization-name">
            Organization Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="organization-name"
            placeholder="Enter your organization's name"
            value={data.name}
            onChange={(e) => handleChange('name', e.target.value)}
          />
          {errors.name && (
            <p className="text-sm text-red-500">{errors.name}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="industry">
            Industry <span className="text-red-500">*</span>
          </Label>
          <Select
            value={data.industry}
            onValueChange={(value) => handleChange('industry', value)}
          >
            <SelectTrigger id="industry">
              <SelectValue placeholder="Select your industry" />
            </SelectTrigger>
            <SelectContent>
              {industries.map((industry) => (
                <SelectItem key={industry.value} value={industry.value}>
                  {industry.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.industry && (
            <p className="text-sm text-red-500">{errors.industry}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="size">Organization Size</Label>
          <Select
            value={data.size}
            onValueChange={(value) => handleChange('size', value)}
          >
            <SelectTrigger id="size">
              <SelectValue placeholder="Select your organization size" />
            </SelectTrigger>
            <SelectContent>
              {organizationSizes.map((size) => (
                <SelectItem key={size.value} value={size.value}>
                  {size.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Primary Location</Label>
          <Input
            id="location"
            placeholder="City, Country"
            value={data.location}
            onChange={(e) => handleChange('location', e.target.value)}
          />
        </div>
      </div>

      <Alert variant="info" className="bg-blue-50 text-blue-800 border-blue-200">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          This information helps us customize your ClimaBill experience and provide relevant industry benchmarks.
        </AlertDescription>
      </Alert>
    </div>
  );
}
