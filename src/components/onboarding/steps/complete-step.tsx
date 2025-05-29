'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, ArrowRight, BarChart2, FileText, ShoppingCart, Users } from 'lucide-react';
import Link from 'next/link';

interface OnboardingCompleteStepProps {
  data: any;
  updateData: (data: any) => void;
}

export function OnboardingCompleteStep({ data, updateData }: OnboardingCompleteStepProps) {
  // Key features to highlight
  const keyFeatures = [
    {
      title: 'Carbon Marketplace',
      description: 'Browse and purchase verified carbon credits',
      icon: ShoppingCart,
      href: '/carbon/marketplace'
    },
    {
      title: 'Industry Benchmarking',
      description: 'Compare your performance against industry standards',
      icon: BarChart2,
      href: '/analytics/benchmarking'
    },
    {
      title: 'Compliance Reporting',
      description: 'Generate reports for regulatory compliance',
      icon: FileText,
      href: '/compliance-reporting'
    },
    {
      title: 'Team Collaboration',
      description: 'Work together with your team on sustainability goals',
      icon: Users,
      href: '/team'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center justify-center text-center space-y-4">
        <div className="rounded-full bg-green-100 p-4">
          <CheckCircle2 className="h-12 w-12 text-green-600" />
        </div>
        <h3 className="text-xl font-bold">Your ClimaBill account is ready!</h3>
        <p className="text-muted-foreground max-w-md">
          You've successfully set up your ClimaBill account. Here are some features you might want to explore:
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        {keyFeatures.map((feature, index) => {
          const Icon = feature.icon;
          
          return (
            <Card key={index} className="overflow-hidden border-border hover:border-primary transition-colors">
              <Link href={feature.href}>
                <CardContent className="p-6 flex items-start space-x-4">
                  <div className="rounded-full bg-primary/10 p-3 flex-shrink-0">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-medium">{feature.title}</h4>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </CardContent>
              </Link>
            </Card>
          );
        })}
      </div>

      <div className="flex flex-col items-center justify-center mt-8 space-y-4">
        <p className="text-sm text-muted-foreground">
          Click "Complete" to go to your dashboard and start using ClimaBill.
        </p>
        <Button asChild size="lg">
          <Link href="/dashboard">
            Go to Dashboard
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
