"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/components/ui/use-toast';
import { CarbonOffsetService } from '@/lib/carbon/carbon-offset-service';
import { OffsetProjectType, PaymentGateway } from '@/lib/carbon/config';
import { useAuth } from '@/lib/firebase/auth-context';
import { Loader2, AlertCircle, Leaf, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function CarbonOffsetPage() {
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recommendation, setRecommendation] = useState<{
    recommendedCarbonInKg: number;
    estimatedCostInUsd: number;
    currentFootprint: {
      totalCarbonInKg: number;
      offsetCarbonInKg: number;
      remainingCarbonInKg: number;
      offsetPercentage: number;
    };
  } | null>(null);
  
  // Form state
  const [carbonAmount, setCarbonAmount] = useState(0);
  const [customAmount, setCustomAmount] = useState('');
  const [projectType, setProjectType] = useState<OffsetProjectType>(OffsetProjectType.RENEWABLE_ENERGY);
  const [paymentGateway, setPaymentGateway] = useState<PaymentGateway>(PaymentGateway.STRIPE);
  const [estimatedCost, setEstimatedCost] = useState(0);
  const [activeTab, setActiveTab] = useState('recommended');
  
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  // Services
  const carbonOffsetService = new CarbonOffsetService();
  
  // Load recommendation data
  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      router.push('/login');
      return;
    }
    
    const loadRecommendation = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get offset recommendation
        const recommendation = await carbonOffsetService.calculateRecommendedOffset(user.uid);
        setRecommendation(recommendation);
        
        // Set initial carbon amount to recommended amount
        setCarbonAmount(Math.round(recommendation.recommendedCarbonInKg));
        setEstimatedCost(recommendation.estimatedCostInUsd);
        
      } catch (err) {
        console.error('Error loading offset recommendation:', err);
        setError('Failed to load offset recommendation. Please try again later.');
        toast({
          title: 'Error',
          description: 'Failed to load offset recommendation. Please try again later.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadRecommendation();
  }, [user, authLoading, router, toast]);
  
  // Update estimated cost when carbon amount or project type changes
  useEffect(() => {
    const updateEstimatedCost = async () => {
      if (carbonAmount <= 0) {
        setEstimatedCost(0);
        return;
      }
      
      try {
        // Get offset estimate from service
        const carbonService = new CarbonOffsetService();
        const estimate = await carbonService.estimateOffset(carbonAmount, projectType);
        setEstimatedCost(estimate.estimatedCostInUsd);
      } catch (err) {
        console.error('Error updating estimated cost:', err);
        toast({
          title: 'Error',
          description: 'Failed to update cost estimate. Please try again.',
          variant: 'destructive',
        });
      }
    };
    
    updateEstimatedCost();
  }, [carbonAmount, projectType, toast]);
  
  // Handle custom amount change
  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0) {
      setCarbonAmount(numValue);
    } else {
      setCarbonAmount(0);
    }
  };
  
  // Handle slider change
  const handleSliderChange = (value: number[]) => {
    setCarbonAmount(value[0]);
    setCustomAmount(value[0].toString());
  };
  
  // Handle purchase
  const handlePurchase = async () => {
    if (!user || carbonAmount <= 0) return;
    
    try {
      setProcessingPayment(true);
      setError(null);
      
      // Create donation intent
      const donationResult = await carbonOffsetService.createDonationIntent(
        user.uid,
        carbonAmount,
        paymentGateway,
        projectType
      );
      
      // Handle different payment gateways
      if (paymentGateway === PaymentGateway.STRIPE && donationResult.clientSecret) {
        // Redirect to Stripe checkout or handle in-app
        router.push(`/carbon/offset/checkout?donation_id=${donationResult.donationId}&client_secret=${donationResult.clientSecret}`);
      } else if (paymentGateway === PaymentGateway.PAYPAL && donationResult.paymentUrl) {
        // Redirect to PayPal
        window.location.href = donationResult.paymentUrl;
      } else if (paymentGateway === PaymentGateway.INTERNAL) {
        // Process internal payment
        await carbonOffsetService.processInternalDonation(donationResult.donationId, user.uid);
        
        // Show success message
        toast({
          title: 'Purchase Successful',
          description: 'Your carbon offset purchase was successful!',
        });
        
        // Redirect to dashboard
        router.push('/carbon/dashboard');
      }
    } catch (err) {
      console.error('Error processing purchase:', err);
      setError('Failed to process purchase. Please try again later.');
      toast({
        title: 'Purchase Failed',
        description: 'Failed to process your purchase. Please try again later.',
        variant: 'destructive',
      });
      setProcessingPayment(false);
    }
  };
  
  // Format number with commas and fixed decimal places
  const formatNumber = (num: number, decimals = 2) => {
    return num.toLocaleString(undefined, { 
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  };
  
  // Format currency
  const formatCurrency = (dollars: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(dollars);
  };
  
  if (loading || authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading offset options...</p>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Carbon Offset Purchase</h1>
          <p className="text-muted-foreground">
            Offset your carbon footprint and support sustainability projects
          </p>
        </div>
        <Button 
          variant="outline"
          onClick={() => router.push('/carbon/dashboard')}
          className="mt-4 md:mt-0"
        >
          Back to Dashboard
        </Button>
      </div>
      
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Purchase Carbon Offsets</CardTitle>
              <CardDescription>
                Select how much carbon you want to offset and your preferred project type
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Amount Selection Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="recommended">Recommended</TabsTrigger>
                  <TabsTrigger value="custom">Custom Amount</TabsTrigger>
                </TabsList>
                
                <TabsContent value="recommended" className="space-y-4 pt-4">
                  {recommendation && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Recommended Offset Amount:</span>
                        <span className="text-lg font-bold">
                          {formatNumber(recommendation.recommendedCarbonInKg)} kg CO₂e
                        </span>
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        This is the amount needed to offset your remaining carbon footprint.
                      </div>
                      
                      <Alert variant="default" className="bg-blue-50 border-blue-200">
                        <Info className="h-4 w-4 text-blue-500" />
                        <AlertDescription className="text-blue-700 text-sm">
                          Offsetting this amount will make you carbon neutral.
                        </AlertDescription>
                      </Alert>
                    </>
                  )}
                </TabsContent>
                
                <TabsContent value="custom" className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="custom-amount">Custom Carbon Amount (kg CO₂e)</Label>
                    <Input
                      id="custom-amount"
                      type="number"
                      min="1"
                      step="1"
                      placeholder="Enter amount in kg"
                      value={customAmount}
                      onChange={(e) => handleCustomAmountChange(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>Adjust Amount</Label>
                      <span className="text-sm text-muted-foreground">
                        {formatNumber(carbonAmount)} kg CO₂e
                      </span>
                    </div>
                    <Slider
                      defaultValue={[carbonAmount]}
                      max={1000}
                      step={1}
                      onValueChange={handleSliderChange}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>1 kg</span>
                      <span>500 kg</span>
                      <span>1,000 kg</span>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
              
              {/* Project Type Selection */}
              <div className="space-y-2">
                <Label>Project Type</Label>
                <RadioGroup 
                  defaultValue={projectType} 
                  onValueChange={(value) => setProjectType(value as OffsetProjectType)}
                  className="grid grid-cols-1 md:grid-cols-2 gap-2"
                >
                  <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-accent">
                    <RadioGroupItem value={OffsetProjectType.RENEWABLE_ENERGY} id="renewable" />
                    <Label htmlFor="renewable" className="flex-1 cursor-pointer">Renewable Energy</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-accent">
                    <RadioGroupItem value={OffsetProjectType.FORESTRY} id="forestry" />
                    <Label htmlFor="forestry" className="flex-1 cursor-pointer">Forestry</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-accent">
                    <RadioGroupItem value={OffsetProjectType.METHANE_CAPTURE} id="methane" />
                    <Label htmlFor="methane" className="flex-1 cursor-pointer">Methane Capture</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-accent">
                    <RadioGroupItem value={OffsetProjectType.WATER_RESTORATION} id="water" />
                    <Label htmlFor="water" className="flex-1 cursor-pointer">Water Restoration</Label>
                  </div>
                </RadioGroup>
              </div>
              
              {/* Payment Method Selection */}
              <div className="space-y-2">
                <Label>Payment Method</Label>
                <RadioGroup 
                  defaultValue={paymentGateway} 
                  onValueChange={(value) => setPaymentGateway(value as PaymentGateway)}
                  className="grid grid-cols-1 md:grid-cols-3 gap-2"
                >
                  <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-accent">
                    <RadioGroupItem value={PaymentGateway.STRIPE} id="stripe" />
                    <Label htmlFor="stripe" className="flex-1 cursor-pointer">Credit Card</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-accent">
                    <RadioGroupItem value={PaymentGateway.PAYPAL} id="paypal" />
                    <Label htmlFor="paypal" className="flex-1 cursor-pointer">PayPal</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-accent">
                    <RadioGroupItem value={PaymentGateway.INTERNAL} id="internal" />
                    <Label htmlFor="internal" className="flex-1 cursor-pointer">Account Balance</Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => router.push('/carbon/dashboard')}>
                Cancel
              </Button>
              <Button 
                onClick={handlePurchase}
                disabled={carbonAmount <= 0 || processingPayment}
              >
                {processingPayment ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Leaf className="mr-2 h-4 w-4" />
                    Purchase Offset
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        <div className="space-y-6">
          {/* Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle>Purchase Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Carbon Amount:</span>
                <span className="font-medium">{formatNumber(carbonAmount)} kg CO₂e</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Estimated Cost:</span>
                <span className="font-medium">{formatCurrency(estimatedCost)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Project Type:</span>
                <span className="font-medium">
                  {projectType.split('_').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' ')}
                </span>
              </div>
              
              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between text-lg">
                  <span className="font-medium">Total:</span>
                  <span className="font-bold">{formatCurrency(estimatedCost)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>About Carbon Offsets</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <p>
                Carbon offsets fund projects that reduce greenhouse gas emissions, 
                such as renewable energy, forestry, and methane capture.
              </p>
              <p>
                By purchasing offsets, you're directly supporting projects that 
                help combat climate change and promote sustainability.
              </p>
              <p>
                All projects are verified by third-party standards to ensure 
                they deliver the promised environmental benefits.
              </p>
              <div className="pt-2">
                <Button variant="link" className="p-0 h-auto" asChild>
                  <a href="/carbon/learn-more" target="_blank">Learn more about carbon offsets</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
