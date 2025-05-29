import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BestPractice } from '@/lib/analytics/benchmarking/types';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface BestPracticeCardProps {
  practice: BestPractice;
}

export function BestPracticeCard({ practice }: BestPracticeCardProps) {
  const [showCaseStudies, setShowCaseStudies] = React.useState(false);

  // Get impact color
  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get difficulty color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>{practice.title}</CardTitle>
        <CardDescription>
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge className={getImpactColor(practice.impact)}>
              {practice.impact.charAt(0).toUpperCase() + practice.impact.slice(1)} Impact
            </Badge>
            <Badge className={getDifficultyColor(practice.implementationDifficulty)}>
              {practice.implementationDifficulty.charAt(0).toUpperCase() + practice.implementationDifficulty.slice(1)} to Implement
            </Badge>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground">{practice.description}</p>
        
        <div className="mt-4">
          <h4 className="text-sm font-medium mb-1">Improves Metrics:</h4>
          <div className="flex flex-wrap gap-1">
            {practice.metrics.map((metric) => (
              <Badge key={metric} variant="outline" className="text-xs">
                {metric.replace(/_/g, ' ')}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => setShowCaseStudies(true)}
        >
          View Case Studies
        </Button>
      </CardFooter>

      <Dialog open={showCaseStudies} onOpenChange={setShowCaseStudies}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{practice.title} - Case Studies</DialogTitle>
            <DialogDescription>
              Real-world examples of successful implementation
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4 max-h-[60vh] overflow-y-auto">
            {practice.caseStudies.map((caseStudy) => (
              <div key={caseStudy.id} className="border rounded-lg p-4">
                <h3 className="font-semibold text-lg">{caseStudy.companyName}</h3>
                <p className="mt-2 text-sm">{caseStudy.description}</p>
                
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Results</h4>
                    <p className="text-sm">{caseStudy.results}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Implementation Time</h4>
                    <p className="text-sm">{caseStudy.implementationTime}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">ROI</h4>
                    <p className="text-sm">{caseStudy.roi}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <DialogFooter>
            <Button onClick={() => setShowCaseStudies(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
