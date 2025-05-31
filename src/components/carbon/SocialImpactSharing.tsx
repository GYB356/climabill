"use client";

import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Facebook, 
  Twitter, 
  Linkedin, 
  Share2, 
  Copy, 
  Check, 
  Instagram, 
  Download 
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import html2canvas from 'html2canvas';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface SocialImpactSharingProps {
  carbonOffset: number; // in kg CO2e
  treesPlanted: number;
  projectsSupported: number;
  carbonReduction: number; // percentage reduction
  organizationName?: string;
  className?: string;
}

export function SocialImpactSharing({
  carbonOffset,
  treesPlanted,
  projectsSupported,
  carbonReduction,
  organizationName = 'Your Organization',
  className
}: SocialImpactSharingProps) {
  const [shareType, setShareType] = useState<'image' | 'text'>('image');
  const [copying, setCopying] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [includeCompanyName, setIncludeCompanyName] = useState(true);
  const { toast } = useToast();
  
  // Calculate social equivalents
  const carMiles = Math.round(carbonOffset * 2.32); // 1kg CO2e = 2.32 miles
  const flightHours = Math.round((carbonOffset / 200) * 10) / 10; // 200kg CO2e per hour of flight
  
  // Generate share text
  const generateShareText = () => {
    const companyPrefix = includeCompanyName ? `${organizationName} has ` : 'We have ';
    return `${companyPrefix}offset ${carbonOffset.toLocaleString()} kg of CO2e, equivalent to planting ${treesPlanted} trees or taking a car off the road for ${carMiles.toLocaleString()} miles. Join our climate action journey! #ClimateAction #CarbonOffset #Sustainability`;
  };
  
  // Generate share URL
  const generateShareUrl = (platform: 'twitter' | 'facebook' | 'linkedin' | 'instagram') => {
    const text = encodeURIComponent(generateShareText());
    const url = encodeURIComponent('https://climabill.app/share');
    
    switch(platform) {
      case 'twitter':
        return `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
      case 'facebook':
        return `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`;
      case 'linkedin':
        return `https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=Climate%20Impact&summary=${text}`;
      case 'instagram':
        // Instagram doesn't support direct sharing via URL, so we'll copy the text
        return '';
    }
  };
  
  // Copy share text to clipboard
  const copyToClipboard = async () => {
    setCopying(true);
    try {
      await navigator.clipboard.writeText(generateShareText());
      toast({
        title: "Copied to clipboard",
        description: "Share text has been copied to your clipboard.",
        duration: 3000,
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Could not copy text to clipboard. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setCopying(false);
    }
  };
  
  // Download as image
  const downloadAsImage = async () => {
    setDownloading(true);
    try {
      const element = document.getElementById('impact-share-card');
      if (!element) return;
      
      const canvas = await html2canvas(element, {
        backgroundColor: null,
        scale: 2,
      });
      
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = 'climate-impact.png';
      link.click();
      
      toast({
        title: "Image downloaded",
        description: "Your climate impact card has been downloaded.",
        duration: 3000,
      });
    } catch (err) {
      toast({
        title: "Download failed",
        description: "Could not download image. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Share2 className="h-5 w-5 text-primary mr-2" />
          Share Your Climate Impact
        </CardTitle>
        <CardDescription>
          Spread the word about your sustainability efforts and inspire others to take action
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Tabs defaultValue="share" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="share">Share</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
          
          <TabsContent value="share" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Label htmlFor="share-type">Share as:</Label>
                <div className="flex items-center space-x-2">
                  <Label htmlFor="share-type-image" className={shareType === 'image' ? 'font-bold' : 'text-muted-foreground'}>Image</Label>
                  <Switch 
                    id="share-type" 
                    checked={shareType === 'text'} 
                    onCheckedChange={(checked) => setShareType(checked ? 'text' : 'image')} 
                  />
                  <Label htmlFor="share-type-text" className={shareType === 'text' ? 'font-bold' : 'text-muted-foreground'}>Text</Label>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id="include-company" 
                  checked={includeCompanyName} 
                  onCheckedChange={setIncludeCompanyName} 
                />
                <Label htmlFor="include-company">Include company name</Label>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button variant="outline" className="flex flex-col items-center py-6" onClick={() => window.open(generateShareUrl('twitter'), '_blank')}>
                <Twitter className="h-6 w-6 mb-2 text-[#1DA1F2]" />
                <span>Twitter</span>
              </Button>
              
              <Button variant="outline" className="flex flex-col items-center py-6" onClick={() => window.open(generateShareUrl('facebook'), '_blank')}>
                <Facebook className="h-6 w-6 mb-2 text-[#4267B2]" />
                <span>Facebook</span>
              </Button>
              
              <Button variant="outline" className="flex flex-col items-center py-6" onClick={() => window.open(generateShareUrl('linkedin'), '_blank')}>
                <Linkedin className="h-6 w-6 mb-2 text-[#0077B5]" />
                <span>LinkedIn</span>
              </Button>
              
              <Button variant="outline" className="flex flex-col items-center py-6" onClick={copyToClipboard}>
                <Instagram className="h-6 w-6 mb-2 text-[#E1306C]" />
                <span>Instagram</span>
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <Button variant="secondary" className="w-full" onClick={copyToClipboard}>
                {copying ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                {copying ? 'Copied' : 'Copy Text'}
              </Button>
              
              {shareType === 'image' && (
                <Button variant="secondary" className="w-full" onClick={downloadAsImage}>
                  {downloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                  {downloading ? 'Downloading...' : 'Download Image'}
                </Button>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="preview">
            <div id="impact-share-card" className="border rounded-lg p-6 bg-gradient-to-br from-primary/5 to-background">
              {includeCompanyName && (
                <h3 className="text-lg font-bold text-center mb-2">{organizationName}'s Climate Impact</h3>
              )}
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="border rounded-lg p-4 text-center bg-card">
                  <div className="text-3xl font-bold text-primary">{carbonOffset.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">kg CO₂e offset</div>
                </div>
                
                <div className="border rounded-lg p-4 text-center bg-card">
                  <div className="text-3xl font-bold text-primary">{treesPlanted.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">trees planted</div>
                </div>
                
                <div className="border rounded-lg p-4 text-center bg-card">
                  <div className="text-3xl font-bold text-primary">{projectsSupported}</div>
                  <div className="text-sm text-muted-foreground">projects supported</div>
                </div>
                
                <div className="border rounded-lg p-4 text-center bg-card">
                  <div className="text-3xl font-bold text-primary">{carbonReduction}%</div>
                  <div className="text-sm text-muted-foreground">carbon reduction</div>
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="text-sm text-muted-foreground">This is equivalent to:</div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="text-xs">{carMiles.toLocaleString()} miles not driven</Badge>
                  <Badge variant="secondary" className="text-xs">{flightHours} flight hours avoided</Badge>
                </div>
              </div>
              
              <div className="text-xs text-center text-muted-foreground mt-4">
                #ClimateAction #Sustainability
              </div>
              
              <div className="flex justify-center mt-2">
                <Badge variant="outline" className="text-xs">climabill.app</Badge>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="text-xs text-muted-foreground">
        Sharing your climate impact helps raise awareness and encourages others to take action.
      </CardFooter>
    </Card>
  );
}
