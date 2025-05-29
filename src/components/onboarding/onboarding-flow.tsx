'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { OnboardingOrganizationStep } from './steps/organization-step';
import { OnboardingDataSourcesStep } from './steps/data-sources-step';
import { OnboardingComplianceStep } from './steps/compliance-step';
import { OnboardingTeamStep } from './steps/team-step';
import { OnboardingPreferencesStep } from './steps/preferences-step';
import { OnboardingCompleteStep } from './steps/complete-step';

interface OnboardingFlowProps {
  userId: string;
}

export function OnboardingFlow({ userId }: OnboardingFlowProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [onboardingData, setOnboardingData] = useState({
    organization: {
      name: '',
      industry: '',
      size: '',
      location: ''
    },
    dataSources: {
      sources: [],
      importNow: false
    },
    compliance: {
      frameworks: [],
      reportingFrequency: ''
    },
    team: {
      invites: []
    },
    preferences: {
      notifications: {
        email: true,
        inApp: true,
        slack: false
      },
      dataSharing: false,
      theme: 'light'
    }
  });

  // Define steps
  const steps = [
    {
      title: 'Organization Details',
      description: 'Tell us about your organization',
      component: OnboardingOrganizationStep
    },
    {
      title: 'Data Sources',
      description: 'Connect your data sources',
      component: OnboardingDataSourcesStep
    },
    {
      title: 'Compliance Frameworks',
      description: 'Select relevant compliance frameworks',
      component: OnboardingComplianceStep
    },
    {
      title: 'Invite Team Members',
      description: 'Invite your team to collaborate',
      component: OnboardingTeamStep
    },
    {
      title: 'Preferences',
      description: 'Set your preferences',
      component: OnboardingPreferencesStep
    },
    {
      title: 'All Set!',
      description: 'Your account is ready to use',
      component: OnboardingCompleteStep
    }
  ];

  // Handle data updates from steps
  const updateData = (stepName: string, data: any) => {
    setOnboardingData(prev => ({
      ...prev,
      [stepName]: {
        ...prev[stepName as keyof typeof prev],
        ...data
      }
    }));
  };

  // Handle next step
  const handleNext = async () => {
    if (currentStep === steps.length - 1) {
      // Final step - complete onboarding
      await completeOnboarding();
      return;
    }

    setCurrentStep(prev => prev + 1);
  };

  // Handle previous step
  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  };

  // Handle skip
  const handleSkip = () => {
    if (currentStep === steps.length - 1) {
      // Final step - complete onboarding
      completeOnboarding();
      return;
    }

    setCurrentStep(prev => prev + 1);
  };

  // Complete onboarding
  const completeOnboarding = async () => {
    try {
      setIsSubmitting(true);

      // Call API to save onboarding data
      const response = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          ...onboardingData
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to complete onboarding');
      }

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Error completing onboarding:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate progress
  const progress = ((currentStep + 1) / steps.length) * 100;

  // Get current step component
  const CurrentStepComponent = steps[currentStep].component;

  // Determine if current step can be skipped
  const canSkip = currentStep < steps.length - 1 && currentStep !== 0;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-muted/20">
      <Card className="w-full max-w-3xl shadow-lg">
        <CardHeader className="space-y-1">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl">{steps[currentStep].title}</CardTitle>
              <CardDescription>{steps[currentStep].description}</CardDescription>
            </div>
            <div className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {steps.length}
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </CardHeader>
        <CardContent>
          <CurrentStepComponent 
            data={onboardingData[steps[currentStep].title.toLowerCase().replace(' ', '') as keyof typeof onboardingData]} 
            updateData={(data: any) => updateData(steps[currentStep].title.toLowerCase().replace(' ', ''), data)}
          />
        </CardContent>
        <CardFooter className="flex justify-between">
          <div>
            {currentStep > 0 && (
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={isSubmitting}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            {canSkip && (
              <Button
                variant="ghost"
                onClick={handleSkip}
                disabled={isSubmitting}
              >
                Skip
              </Button>
            )}
            <Button
              onClick={handleNext}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>Loading...</>
              ) : currentStep === steps.length - 1 ? (
                <>
                  Complete
                  <Check className="ml-2 h-4 w-4" />
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
