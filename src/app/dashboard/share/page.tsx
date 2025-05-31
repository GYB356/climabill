"use client";

import React, { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SocialImpactSharing } from '@/components/carbon/SocialImpactSharing';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { CarbonTrackingService } from '@/lib/carbon/carbon-tracking-service';
import { CarbonOffsetService } from '@/lib/carbon/carbon-offset-service';
import { useAuth } from '@/lib/firebase/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';

export default function SharePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [impactData, setImpactData] = useState({
    carbonOffset: 0,
    treesPlanted: 0,
    projectsSupported: 0,
    carbonReduction: 0,
    organizationName: '',
  });
  
  useEffect(() => {
    const fetchImpactData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        const carbonTrackingService = new CarbonTrackingService();
        const carbonOffsetService = new CarbonOffsetService();
        
        // Get user's organization name
        const userProfile = await carbonTrackingService.getUserProfile(user.uid);
        const organizationName = userProfile?.organizationName || 'My Organization';
        
        // Get carbon offset data
        const offsetData = await carbonOffsetService.getUserOffsets(user.uid);
        const totalOffset = offsetData.reduce((total, offset) => total + offset.amountInKg, 0);
        
        // Get projects supported
        const uniqueProjects = new Set(offsetData.map(offset => offset.projectId));
        
        // Calculate trees planted (estimation: 1 tree = ~20kg CO2e)
        const treesPlanted = Math.round(totalOffset / 20);
        
        // Get carbon reduction percentage (compared to baseline or previous period)
        const usageData = await carbonTrackingService.getUserCarbonUsage(user.uid);
        let carbonReduction = 0;
        
        if (usageData.length >= 2) {
          // Sort by date descending
          const sortedData = [...usageData].sort((a, b) => b.date.seconds - a.date.seconds);
          const currentPeriod = sortedData[0];
          const previousPeriod = sortedData[1];
          
          if (previousPeriod.totalCarbonInKg > 0) {
            carbonReduction = Math.round(
              ((previousPeriod.totalCarbonInKg - currentPeriod.totalCarbonInKg) / previousPeriod.totalCarbonInKg) * 100
            );
          }
        }
        
        setImpactData({
          carbonOffset: totalOffset,
          treesPlanted,
          projectsSupported: uniqueProjects.size,
          carbonReduction: Math.max(0, carbonReduction), // Ensure it's not negative for display
          organizationName,
        });
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching impact data:', err);
        setError('Failed to load your climate impact data. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchImpactData();
  }, [user]);
  
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Share Your Climate Impact"
        text="Share your sustainability achievements with your network and inspire others to take action."
      />
      
      <div className="grid gap-4">
        {loading ? (
          <Card>
            <CardContent className="pt-6 flex flex-col items-center justify-center min-h-[300px]">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Loading your climate impact data...</p>
            </CardContent>
          </Card>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : (
          <Tabs defaultValue="social" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="social">Social Media</TabsTrigger>
              <TabsTrigger value="certificate">Impact Certificate</TabsTrigger>
            </TabsList>
            
            <TabsContent value="social">
              <ScrollArea className="h-full max-h-[calc(100vh-220px)]">
                <SocialImpactSharing
                  carbonOffset={impactData.carbonOffset}
                  treesPlanted={impactData.treesPlanted}
                  projectsSupported={impactData.projectsSupported}
                  carbonReduction={impactData.carbonReduction}
                  organizationName={impactData.organizationName}
                />
                
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle>Why Share Your Impact?</CardTitle>
                    <CardDescription>
                      Sharing your climate action has multiple benefits
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-4 sm:grid-cols-2">
                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium mb-2">Inspire Others</h3>
                      <p className="text-sm text-muted-foreground">
                        Your actions can motivate friends, colleagues, and connections to take climate action themselves.
                      </p>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium mb-2">Build Your Brand</h3>
                      <p className="text-sm text-muted-foreground">
                        Demonstrate your commitment to sustainability and enhance your organization's reputation.
                      </p>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium mb-2">Create Accountability</h3>
                      <p className="text-sm text-muted-foreground">
                        Public commitments help you stay on track with your sustainability goals.
                      </p>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium mb-2">Expand the Movement</h3>
                      <p className="text-sm text-muted-foreground">
                        Every share helps grow the climate action movement and builds momentum for change.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="certificate">
              <Card>
                <CardHeader>
                  <CardTitle>Climate Impact Certificate</CardTitle>
                  <CardDescription>
                    Generate an official certificate of your climate action to display in your office or share with stakeholders
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <div className="border rounded-lg p-8 mb-6 w-full max-w-2xl bg-card/50">
                    <div className="text-center mb-8">
                      <h2 className="text-2xl font-bold mb-1">Certificate of Climate Action</h2>
                      <p className="text-muted-foreground">This certifies that</p>
                      <p className="text-xl font-medium my-2">{impactData.organizationName}</p>
                      <p className="text-muted-foreground mb-6">has demonstrated commitment to environmental sustainability by</p>
                      
                      <div className="grid grid-cols-2 gap-6 mb-6">
                        <div>
                          <p className="text-3xl font-bold text-primary mb-1">{impactData.carbonOffset.toLocaleString()}</p>
                          <p className="text-sm">kilograms of CO₂e offset</p>
                        </div>
                        
                        <div>
                          <p className="text-3xl font-bold text-primary mb-1">{impactData.treesPlanted.toLocaleString()}</p>
                          <p className="text-sm">equivalent trees planted</p>
                        </div>
                      </div>
                      
                      <p className="text-muted-foreground text-sm mb-1">Issued on</p>
                      <p className="font-medium">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                      
                      <div className="mt-6 pt-6 border-t">
                        <p className="text-sm">Verified by ClimaBill</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <Button>Download Certificate (PDF)</Button>
                    <Button variant="outline">Share Certificate</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </DashboardShell>
  );
}
