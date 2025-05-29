'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ComplianceFramework, ValidationResult, ValidationStatus } from '@/lib/reporting/compliance/types';
import { AlertTriangle, CheckCircle, XCircle, Info, Loader2 } from 'lucide-react';

interface ValidationResultsProps {
  organizationId: string;
  framework: ComplianceFramework;
}

export function ValidationResults({ organizationId, framework }: ValidationResultsProps) {
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch validation results
  const fetchValidationResults = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/compliance/reporting/validate?organizationId=${organizationId}&framework=${framework}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch validation results');
      }

      const data = await response.json();
      setValidationResult(data);
    } catch (error) {
      console.error('Error fetching validation results:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch validation results');
    } finally {
      setIsLoading(false);
    }
  };

  // Get framework name
  const getFrameworkName = (framework: ComplianceFramework) => {
    switch (framework) {
      case ComplianceFramework.GHG_PROTOCOL:
        return 'GHG Protocol';
      case ComplianceFramework.TCFD:
        return 'TCFD';
      case ComplianceFramework.CDP:
        return 'CDP';
      case ComplianceFramework.SASB:
        return 'SASB';
      case ComplianceFramework.GRI:
        return 'GRI';
      case ComplianceFramework.EU_CSRD:
        return 'EU CSRD';
      case ComplianceFramework.SFDR:
        return 'SFDR';
      case ComplianceFramework.SECR:
        return 'SECR';
      default:
        return framework;
    }
  };

  // Get status icon
  const getStatusIcon = (status: ValidationStatus) => {
    switch (status) {
      case ValidationStatus.VALID:
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case ValidationStatus.WARNING:
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case ValidationStatus.ERROR:
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  // Get status color class
  const getStatusColorClass = (status: ValidationStatus) => {
    switch (status) {
      case ValidationStatus.VALID:
        return 'bg-green-50 border-green-200 text-green-800';
      case ValidationStatus.WARNING:
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case ValidationStatus.ERROR:
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  // Get status text
  const getStatusText = (status: ValidationStatus) => {
    switch (status) {
      case ValidationStatus.VALID:
        return 'Valid';
      case ValidationStatus.WARNING:
        return 'Warning';
      case ValidationStatus.ERROR:
        return 'Error';
      default:
        return 'Unknown';
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Validation Status for {getFrameworkName(framework)}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : validationResult ? (
          <div className="space-y-6">
            <div className={`p-4 rounded-md border ${getStatusColorClass(validationResult.status)}`}>
              <div className="flex items-center">
                {getStatusIcon(validationResult.status)}
                <div className="ml-3">
                  <h3 className="text-sm font-medium">
                    Overall Status: {getStatusText(validationResult.status)}
                  </h3>
                  <div className="mt-2 text-sm">
                    <p>{validationResult.message}</p>
                  </div>
                </div>
              </div>
            </div>

            <Tabs defaultValue="errors" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="errors">
                  Errors ({validationResult.errors.length})
                </TabsTrigger>
                <TabsTrigger value="warnings">
                  Warnings ({validationResult.warnings.length})
                </TabsTrigger>
                <TabsTrigger value="info">
                  Info ({validationResult.info.length})
                </TabsTrigger>
              </TabsList>
              <TabsContent value="errors" className="mt-4">
                {validationResult.errors.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4">No errors found.</p>
                ) : (
                  <div className="space-y-3">
                    {validationResult.errors.map((error, index) => (
                      <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-md">
                        <div className="flex">
                          <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                          <div className="ml-3">
                            <h4 className="text-sm font-medium text-red-800">{error.field}</h4>
                            <p className="text-sm text-red-700 mt-1">{error.message}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
              <TabsContent value="warnings" className="mt-4">
                {validationResult.warnings.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4">No warnings found.</p>
                ) : (
                  <div className="space-y-3">
                    {validationResult.warnings.map((warning, index) => (
                      <div key={index} className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                        <div className="flex">
                          <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                          <div className="ml-3">
                            <h4 className="text-sm font-medium text-yellow-800">{warning.field}</h4>
                            <p className="text-sm text-yellow-700 mt-1">{warning.message}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
              <TabsContent value="info" className="mt-4">
                {validationResult.info.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4">No additional information.</p>
                ) : (
                  <div className="space-y-3">
                    {validationResult.info.map((info, index) => (
                      <div key={index} className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                        <div className="flex">
                          <Info className="h-5 w-5 text-blue-500 mt-0.5" />
                          <div className="ml-3">
                            <h4 className="text-sm font-medium text-blue-800">{info.field}</h4>
                            <p className="text-sm text-blue-700 mt-1">{info.message}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              Click the button below to validate your data for {getFrameworkName(framework)} compliance.
            </p>
            <Button onClick={fetchValidationResults}>
              Run Validation
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
