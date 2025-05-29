'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { SharingPreferences, MetricType } from '@/lib/analytics/benchmarking/types';

interface DataSharingModalProps {
  isOpen: boolean;
  onClose: () => void;
  organizationId: string;
  onSaved: () => void;
}

export function DataSharingModal({ isOpen, onClose, organizationId, onSaved }: DataSharingModalProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [sharingPreferences, setSharingPreferences] = useState<SharingPreferences>({
    shareAnonymousData: false,
    shareMetrics: [],
    shareIndustryInfo: false,
    shareCompanySize: false
  });

  // Fetch current sharing preferences
  useEffect(() => {
    if (isOpen && organizationId) {
      fetchSharingPreferences();
    }
  }, [isOpen, organizationId]);

  // Fetch sharing preferences
  const fetchSharingPreferences = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/analytics/benchmarking/data-sharing?organizationId=${organizationId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch data sharing preferences');
      }

      const data = await response.json();
      setSharingPreferences(data.sharingPreferences);
    } catch (error) {
      console.error('Error fetching data sharing preferences:', error);
      setError('Failed to fetch data sharing preferences');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle checkbox change
  const handleCheckboxChange = (field: keyof SharingPreferences, value: boolean) => {
    setSharingPreferences({
      ...sharingPreferences,
      [field]: value
    });
  };

  // Handle metric toggle
  const handleMetricToggle = (metric: MetricType) => {
    const newMetrics = sharingPreferences.shareMetrics.includes(metric)
      ? sharingPreferences.shareMetrics.filter(m => m !== metric)
      : [...sharingPreferences.shareMetrics, metric];

    setSharingPreferences({
      ...sharingPreferences,
      shareMetrics: newMetrics
    });
  };

  // Save preferences
  const handleSave = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/analytics/benchmarking/data-sharing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          organizationId,
          sharingPreferences
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save data sharing preferences');
      }

      onSaved();
      onClose();
    } catch (error) {
      console.error('Error saving data sharing preferences:', error);
      setError('Failed to save data sharing preferences');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Data Sharing Settings</DialogTitle>
          <DialogDescription>
            Control how your data is shared for industry benchmarking
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="shareAnonymousData"
                checked={sharingPreferences.shareAnonymousData}
                onCheckedChange={(checked) => handleCheckboxChange('shareAnonymousData', checked as boolean)}
              />
              <div>
                <Label htmlFor="shareAnonymousData" className="font-medium">
                  Share Anonymous Data
                </Label>
                <p className="text-sm text-muted-foreground">
                  Allow your anonymized data to be included in industry benchmarks to help improve accuracy for all users.
                </p>
              </div>
            </div>

            {sharingPreferences.shareAnonymousData && (
              <>
                <div className="ml-7 space-y-4 border-l-2 pl-4 border-muted">
                  <div>
                    <Label className="font-medium mb-2 block">
                      Share Specific Metrics
                    </Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="shareMetricCarbonEmissions"
                          checked={sharingPreferences.shareMetrics.includes(MetricType.CARBON_EMISSIONS)}
                          onCheckedChange={(checked) => handleMetricToggle(MetricType.CARBON_EMISSIONS)}
                        />
                        <Label htmlFor="shareMetricCarbonEmissions">Carbon Emissions</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="shareMetricEnergyUsage"
                          checked={sharingPreferences.shareMetrics.includes(MetricType.ENERGY_USAGE)}
                          onCheckedChange={(checked) => handleMetricToggle(MetricType.ENERGY_USAGE)}
                        />
                        <Label htmlFor="shareMetricEnergyUsage">Energy Usage</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="shareMetricWaterUsage"
                          checked={sharingPreferences.shareMetrics.includes(MetricType.WATER_USAGE)}
                          onCheckedChange={(checked) => handleMetricToggle(MetricType.WATER_USAGE)}
                        />
                        <Label htmlFor="shareMetricWaterUsage">Water Usage</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="shareMetricWasteGenerated"
                          checked={sharingPreferences.shareMetrics.includes(MetricType.WASTE_GENERATED)}
                          onCheckedChange={(checked) => handleMetricToggle(MetricType.WASTE_GENERATED)}
                        />
                        <Label htmlFor="shareMetricWasteGenerated">Waste Generated</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="shareMetricRenewableEnergy"
                          checked={sharingPreferences.shareMetrics.includes(MetricType.RENEWABLE_ENERGY_PERCENTAGE)}
                          onCheckedChange={(checked) => handleMetricToggle(MetricType.RENEWABLE_ENERGY_PERCENTAGE)}
                        />
                        <Label htmlFor="shareMetricRenewableEnergy">Renewable Energy Percentage</Label>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="shareIndustryInfo"
                      checked={sharingPreferences.shareIndustryInfo}
                      onCheckedChange={(checked) => handleCheckboxChange('shareIndustryInfo', checked as boolean)}
                    />
                    <div>
                      <Label htmlFor="shareIndustryInfo" className="font-medium">
                        Share Industry Information
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Allow your industry classification to be included with your data.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="shareCompanySize"
                      checked={sharingPreferences.shareCompanySize}
                      onCheckedChange={(checked) => handleCheckboxChange('shareCompanySize', checked as boolean)}
                    />
                    <div>
                      <Label htmlFor="shareCompanySize" className="font-medium">
                        Share Company Size
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Allow your company size classification to be included with your data.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {error && (
            <div className="text-sm text-red-500 p-2 bg-red-50 rounded-md">
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Preferences'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
