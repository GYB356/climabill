"use client";

import { useState, useEffect } from 'react';
import { CarbonTrackingService, CarbonOffset } from '@/lib/carbon/carbon-tracking-service';
import { Loader2, ExternalLink, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Timestamp } from 'firebase/firestore';

interface CarbonOffsetHistoryProps {
  offsetHistory?: CarbonOffset[];
  userId: string;
  limit?: number;
  organizationId?: string;
}

export function CarbonOffsetHistory({ 
  offsetHistory: initialHistory,
  userId,
  limit = 10,
  organizationId 
}: CarbonOffsetHistoryProps) {
  const [loading, setLoading] = useState(!initialHistory);
  const [error, setError] = useState<string | null>(null);
  const [offsetHistory, setOffsetHistory] = useState<CarbonOffset[]>(initialHistory || []);
  
  useEffect(() => {
    // If history was provided as a prop, use it
    if (initialHistory) {
      setOffsetHistory(initialHistory);
      setLoading(false);
      return;
    }
    
    // Otherwise, fetch the history
    const loadOffsetHistory = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        // Create a carbon tracking service instance
        const carbonService = new CarbonTrackingService();
        
        // Get carbon offset history
        const history = await carbonService.getCarbonOffsetHistory(
          userId,
          limit,
          organizationId
        );
        
        setOffsetHistory(history);
      } catch (err) {
        console.error('Error loading carbon offset history:', err);
        setError('Failed to load carbon offset history');
      } finally {
        setLoading(false);
      }
    };
    
    loadOffsetHistory();
  }, [userId, limit, organizationId, initialHistory]);
  
  // Format date from Timestamp or Date
  const formatDate = (timestamp: Timestamp | Date) => {
    const date = timestamp instanceof Timestamp ? timestamp.toDate() : timestamp;
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };
  
  // Format currency
  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };
  
  // Get project type badge color
  const getProjectBadgeColor = (projectType: string) => {
    switch (projectType) {
      case 'renewable_energy':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'forestry':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'methane_capture':
        return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
      case 'energy_efficiency':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'water_restoration':
        return 'bg-cyan-100 text-cyan-800 hover:bg-cyan-200';
      case 'community':
        return 'bg-orange-100 text-orange-800 hover:bg-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };
  
  // Format project type for display
  const formatProjectType = (projectType: string) => {
    return projectType
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }
  
  if (offsetHistory.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <p className="text-muted-foreground mb-4">You haven't purchased any carbon offsets yet.</p>
        <Button onClick={() => window.location.href = '/carbon/offset'}>
          Purchase Carbon Offsets
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4 font-medium">Date</th>
              <th className="text-left py-3 px-4 font-medium">Project</th>
              <th className="text-left py-3 px-4 font-medium">Location</th>
              <th className="text-right py-3 px-4 font-medium">Carbon</th>
              <th className="text-right py-3 px-4 font-medium">Cost</th>
              <th className="text-right py-3 px-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {offsetHistory.map((offset) => (
              <tr key={offset.id} className="border-b hover:bg-muted/50">
                <td className="py-3 px-4">{formatDate(offset.purchaseDate)}</td>
                <td className="py-3 px-4">
                  <div className="flex flex-col">
                    <span>{offset.projectName}</span>
                    <Badge 
                      variant="outline" 
                      className={`mt-1 w-fit ${getProjectBadgeColor(offset.projectType)}`}
                    >
                      {formatProjectType(offset.projectType)}
                    </Badge>
                  </div>
                </td>
                <td className="py-3 px-4">{offset.projectLocation}</td>
                <td className="py-3 px-4 text-right">{offset.carbonInKg.toFixed(2)} kg</td>
                <td className="py-3 px-4 text-right">{formatCurrency(offset.costInUsdCents)}</td>
                <td className="py-3 px-4 text-right">
                  <div className="flex justify-end space-x-2">
                    {offset.receiptUrl && (
                      <Button variant="ghost" size="icon" asChild>
                        <a href={offset.receiptUrl} target="_blank" rel="noopener noreferrer" title="View Receipt">
                          <FileText className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    {offset.certificateUrl && (
                      <Button variant="ghost" size="icon" asChild>
                        <a href={offset.certificateUrl} target="_blank" rel="noopener noreferrer" title="View Certificate">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {offsetHistory.length >= limit && (
        <div className="flex justify-center">
          <Button variant="outline">
            Load More
          </Button>
        </div>
      )}
    </div>
  );
}
