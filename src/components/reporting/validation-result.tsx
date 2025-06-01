'use client';

import { ValidationResult as ValidationResultType } from '@/lib/reporting/compliance/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react';

interface ValidationResultProps {
  validationResult: ValidationResultType | null;
}

export function ValidationResult({ validationResult }: ValidationResultProps) {
  if (!validationResult) {
    return (
      <Card>
        <CardContent className="py-6">
          <p className="text-center text-muted-foreground">No validation results available</p>
        </CardContent>
      </Card>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'VALID':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'WARNING':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'ERROR':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'VALID':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'WARNING':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'ERROR':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon(validationResult.status)}
          Validation Results
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className={`p-4 rounded-lg border ${getStatusColor(validationResult.status)}`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">
                Framework: {validationResult.framework.toUpperCase()}
              </h3>
              <p className="text-sm mt-1">
                Completeness: {validationResult.completeness.toFixed(1)}%
              </p>
            </div>
            <Badge variant={validationResult.status === 'VALID' ? 'default' : 'destructive'}>
              {validationResult.status}
            </Badge>
          </div>
        </div>

        {validationResult.issues && validationResult.issues.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Issues Found</h4>
            {validationResult.issues.map((issue, index) => (
              <Alert key={index} variant={issue.severity === 'error' ? 'destructive' : 'default'}>
                <AlertDescription>
                  <div className="flex items-start gap-2">
                    {issue.severity === 'error' ? (
                      <XCircle className="h-4 w-4 text-red-500 mt-0.5" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
                    )}
                    <div>
                      <p className="font-medium">{issue.dataPoint}</p>
                      <p className="text-sm">{issue.message}</p>
                      {issue.recommendation && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Recommendation: {issue.recommendation}
                        </p>
                      )}
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        )}

        {(!validationResult.issues || validationResult.issues.length === 0) && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              All validation checks passed successfully.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
