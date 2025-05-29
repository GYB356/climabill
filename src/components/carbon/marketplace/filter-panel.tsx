import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { CreditFilters, CreditType, VerificationStandard } from '@/lib/carbon/marketplace/types';

interface FilterPanelProps {
  filters: CreditFilters;
  onFilterChange: (filters: CreditFilters) => void;
}

export function FilterPanel({ filters, onFilterChange }: FilterPanelProps) {
  const [localFilters, setLocalFilters] = useState<CreditFilters>(filters);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50]);

  // Update local filters when props change
  useEffect(() => {
    setLocalFilters(filters);
    setPriceRange([
      filters.minPrice !== undefined ? filters.minPrice : 0,
      filters.maxPrice !== undefined ? filters.maxPrice : 50
    ]);
  }, [filters]);

  // Handle filter changes
  const handleFilterChange = (key: keyof CreditFilters, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
  };

  // Handle price range change
  const handlePriceRangeChange = (values: number[]) => {
    setPriceRange([values[0], values[1]]);
    setLocalFilters({
      ...localFilters,
      minPrice: values[0],
      maxPrice: values[1]
    });
  };

  // Apply filters
  const applyFilters = () => {
    onFilterChange(localFilters);
  };

  // Reset filters
  const resetFilters = () => {
    const emptyFilters: CreditFilters = {};
    setLocalFilters(emptyFilters);
    setPriceRange([0, 50]);
    onFilterChange(emptyFilters);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filter Credits</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="creditType">Credit Type</Label>
          <Select
            value={localFilters.creditType}
            onValueChange={(value) => handleFilterChange('creditType', value as CreditType)}
          >
            <SelectTrigger id="creditType">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={undefined}>All Types</SelectItem>
              <SelectItem value={CreditType.RENEWABLE_ENERGY}>Renewable Energy</SelectItem>
              <SelectItem value={CreditType.REFORESTATION}>Reforestation</SelectItem>
              <SelectItem value={CreditType.METHANE_CAPTURE}>Methane Capture</SelectItem>
              <SelectItem value={CreditType.ENERGY_EFFICIENCY}>Energy Efficiency</SelectItem>
              <SelectItem value={CreditType.BLUE_CARBON}>Blue Carbon</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="verificationStandard">Verification Standard</Label>
          <Select
            value={localFilters.verificationStandard}
            onValueChange={(value) => handleFilterChange('verificationStandard', value as VerificationStandard)}
          >
            <SelectTrigger id="verificationStandard">
              <SelectValue placeholder="All Standards" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={undefined}>All Standards</SelectItem>
              <SelectItem value={VerificationStandard.VERRA}>Verra</SelectItem>
              <SelectItem value={VerificationStandard.GOLD_STANDARD}>Gold Standard</SelectItem>
              <SelectItem value={VerificationStandard.CLIMATE_ACTION_RESERVE}>Climate Action Reserve</SelectItem>
              <SelectItem value={VerificationStandard.AMERICAN_CARBON_REGISTRY}>American Carbon Registry</SelectItem>
              <SelectItem value={VerificationStandard.PLAN_VIVO}>Plan Vivo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label>Price Range ($/kg)</Label>
            <div className="flex items-center gap-2 text-sm">
              <span>${priceRange[0]}</span>
              <span>-</span>
              <span>${priceRange[1]}</span>
            </div>
          </div>
          <Slider
            defaultValue={[0, 50]}
            value={priceRange}
            max={50}
            step={1}
            onValueChange={handlePriceRangeChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            placeholder="Any location"
            value={localFilters.location || ''}
            onChange={(e) => handleFilterChange('location', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="vintage">Vintage</Label>
          <Select
            value={localFilters.vintage}
            onValueChange={(value) => handleFilterChange('vintage', value)}
          >
            <SelectTrigger id="vintage">
              <SelectValue placeholder="All Years" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={undefined}>All Years</SelectItem>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
              <SelectItem value="2022">2022</SelectItem>
              <SelectItem value="2021">2021</SelectItem>
              <SelectItem value="2020">2020</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <Button onClick={applyFilters}>Apply Filters</Button>
          <Button variant="outline" onClick={resetFilters}>Reset Filters</Button>
        </div>
      </CardContent>
    </Card>
  );
}
