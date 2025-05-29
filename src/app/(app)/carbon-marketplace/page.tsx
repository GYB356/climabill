'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CarbonCredit, CreditFilters, CreditType, VerificationStandard } from '@/lib/carbon/marketplace/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CreditCard } from '@/components/carbon/marketplace/credit-card';
import { FilterPanel } from '@/components/carbon/marketplace/filter-panel';
import { PurchaseModal } from '@/components/carbon/marketplace/purchase-modal';

export default function CarbonMarketplacePage() {
  const [filters, setFilters] = useState<CreditFilters>({});
  const [selectedCredit, setSelectedCredit] = useState<CarbonCredit | null>(null);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('marketplace');

  // Fetch available credits
  const { data: creditsData, isLoading: isLoadingCredits, error: creditsError } = useQuery({
    queryKey: ['carbonCredits', filters],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      
      if (filters.creditType) {
        queryParams.append('creditType', filters.creditType);
      }
      
      if (filters.verificationStandard) {
        queryParams.append('verificationStandard', filters.verificationStandard);
      }
      
      if (filters.minPrice !== undefined) {
        queryParams.append('minPrice', filters.minPrice.toString());
      }
      
      if (filters.maxPrice !== undefined) {
        queryParams.append('maxPrice', filters.maxPrice.toString());
      }
      
      if (filters.location) {
        queryParams.append('location', filters.location);
      }
      
      if (filters.vintage) {
        queryParams.append('vintage', filters.vintage);
      }
      
      const response = await fetch(`/api/carbon/marketplace?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch carbon credits');
      }
      
      return response.json();
    }
  });

  // Fetch user portfolio
  const { data: portfolioData, isLoading: isLoadingPortfolio, error: portfolioError, refetch: refetchPortfolio } = useQuery({
    queryKey: ['carbonPortfolio'],
    queryFn: async () => {
      const response = await fetch('/api/carbon/marketplace/portfolio');
      
      if (!response.ok) {
        throw new Error('Failed to fetch carbon portfolio');
      }
      
      return response.json();
    }
  });

  // Handle credit selection
  const handleCreditSelect = (credit: CarbonCredit) => {
    setSelectedCredit(credit);
    setIsPurchaseModalOpen(true);
  };

  // Handle purchase completion
  const handlePurchaseComplete = () => {
    setIsPurchaseModalOpen(false);
    setSelectedCredit(null);
    refetchPortfolio();
  };

  // Handle filter changes
  const handleFilterChange = (newFilters: CreditFilters) => {
    setFilters(newFilters);
  };

  // Handle credit retirement
  const handleRetireCredits = async (creditIds: string[]) => {
    try {
      const response = await fetch('/api/carbon/marketplace/retire', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ creditIds }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to retire carbon credits');
      }
      
      refetchPortfolio();
    } catch (error) {
      console.error('Error retiring carbon credits:', error);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Carbon Marketplace</h1>
          <p className="text-muted-foreground mt-1">
            Purchase and manage verified carbon credits to offset your emissions
          </p>
        </div>
        
        {portfolioData?.portfolio && (
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="text-sm text-muted-foreground">Your Carbon Offset</div>
            <div className="text-2xl font-bold text-green-700">
              {portfolioData.portfolio.totalCarbonOffset} kg CO₂e
            </div>
          </div>
        )}
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
          <TabsTrigger value="portfolio">My Portfolio</TabsTrigger>
        </TabsList>
        
        <TabsContent value="marketplace" className="mt-6">
          <div className="grid grid-cols-4 gap-6">
            <div className="col-span-1">
              <FilterPanel filters={filters} onFilterChange={handleFilterChange} />
            </div>
            
            <div className="col-span-3">
              {isLoadingCredits ? (
                <div className="text-center py-12">Loading carbon credits...</div>
              ) : creditsError ? (
                <div className="text-center py-12 text-red-500">
                  Error loading carbon credits. Please try again.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {creditsData?.credits.map((credit: CarbonCredit) => (
                    <CreditCard
                      key={credit.id}
                      credit={credit}
                      onSelect={() => handleCreditSelect(credit)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="portfolio" className="mt-6">
          {isLoadingPortfolio ? (
            <div className="text-center py-12">Loading your portfolio...</div>
          ) : portfolioError ? (
            <div className="text-center py-12 text-red-500">
              Error loading your portfolio. Please try again.
            </div>
          ) : (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Total Credits</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {portfolioData?.portfolio.totalCredits || 0}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Carbon Offset</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-700">
                      {portfolioData?.portfolio.totalCarbonOffset || 0} kg CO₂e
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Retired Credits</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {portfolioData?.portfolio.retiredCredits.length || 0}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div>
                <h2 className="text-xl font-bold mb-4">Active Credits</h2>
                {portfolioData?.portfolio.credits.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-muted-foreground">
                      You don't have any active carbon credits.
                    </p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => setActiveTab('marketplace')}
                    >
                      Browse Marketplace
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {portfolioData?.portfolio.credits.map((credit: CarbonCredit) => (
                      <Card key={credit.id} className="overflow-hidden">
                        <div className="h-40 bg-gray-100 relative">
                          {credit.imageUrl && (
                            <img 
                              src={credit.imageUrl} 
                              alt={credit.projectName}
                              className="w-full h-full object-cover"
                            />
                          )}
                          {credit.isVerified && (
                            <Badge className="absolute top-2 right-2 bg-green-600">
                              Verified
                            </Badge>
                          )}
                        </div>
                        <CardHeader>
                          <CardTitle>{credit.projectName}</CardTitle>
                          <CardDescription>{credit.creditType}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm text-muted-foreground">Quantity</span>
                            <span className="font-medium">{credit.quantity} kg CO₂e</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Vintage</span>
                            <span className="font-medium">{credit.vintage}</span>
                          </div>
                        </CardContent>
                        <CardFooter>
                          <Button 
                            className="w-full"
                            onClick={() => handleRetireCredits([credit.id])}
                          >
                            Retire Credit
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
              
              <div>
                <h2 className="text-xl font-bold mb-4">Retired Credits</h2>
                {portfolioData?.portfolio.retiredCredits.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-muted-foreground">
                      You haven't retired any carbon credits yet.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {portfolioData?.portfolio.retiredCredits.map((credit: CarbonCredit) => (
                      <Card key={credit.id} className="overflow-hidden">
                        <div className="h-40 bg-gray-100 relative">
                          {credit.imageUrl && (
                            <img 
                              src={credit.imageUrl} 
                              alt={credit.projectName}
                              className="w-full h-full object-cover"
                            />
                          )}
                          <Badge className="absolute top-2 right-2 bg-gray-600">
                            Retired
                          </Badge>
                        </div>
                        <CardHeader>
                          <CardTitle>{credit.projectName}</CardTitle>
                          <CardDescription>{credit.creditType}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm text-muted-foreground">Quantity</span>
                            <span className="font-medium">{credit.quantity} kg CO₂e</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Vintage</span>
                            <span className="font-medium">{credit.vintage}</span>
                          </div>
                        </CardContent>
                        <CardFooter>
                          <Button 
                            variant="outline" 
                            className="w-full"
                            disabled
                          >
                            Retired
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {selectedCredit && (
        <PurchaseModal
          credit={selectedCredit}
          isOpen={isPurchaseModalOpen}
          onClose={() => setIsPurchaseModalOpen(false)}
          onPurchaseComplete={handlePurchaseComplete}
        />
      )}
    </div>
  );
}
