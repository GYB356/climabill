import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ComplianceFramework, ValidationStatus } from '@/lib/reporting/compliance/types';
import { Download, FileText } from 'lucide-react';

interface ReportListProps {
  reports: any[]; // In a real implementation, this would be properly typed
}

export function ReportList({ reports }: ReportListProps) {
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

  // Get validation status badge
  const getValidationStatusBadge = (status: ValidationStatus) => {
    switch (status) {
      case ValidationStatus.VALID:
        return <Badge className="bg-green-500">Valid</Badge>;
      case ValidationStatus.WARNING:
        return <Badge className="bg-yellow-500">Warning</Badge>;
      case ValidationStatus.ERROR:
        return <Badge className="bg-red-500">Error</Badge>;
      default:
        return <Badge className="bg-gray-500">Not Validated</Badge>;
    }
  };

  // Format date
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString();
  };

  // Get period string
  const getPeriodString = (period: { startDate: Date | string; endDate: Date | string }) => {
    return `${formatDate(period.startDate)} - ${formatDate(period.endDate)}`;
  };

  // Get file extension
  const getFileExtension = (format: string) => {
    return format.toLowerCase();
  };

  return (
    <div className="space-y-4">
      {reports.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-muted-foreground">
            No reports found.
          </p>
          <Button 
            variant="outline" 
            className="mt-4"
          >
            Generate a Report
          </Button>
        </div>
      ) : (
        reports.map((report) => (
          <Card key={report.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{getFrameworkName(report.framework)}</CardTitle>
                  <CardDescription>
                    Generated on {formatDate(report.generatedAt)}
                  </CardDescription>
                </div>
                {getValidationStatusBadge(report.validationStatus)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Period</p>
                  <p>{getPeriodString(report.period)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Format</p>
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    <span>{getFileExtension(report.format).toUpperCase()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button variant="outline" size="sm" asChild>
                <a href={report.fileUrl} download target="_blank" rel="noopener noreferrer">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </a>
              </Button>
            </CardFooter>
          </Card>
        ))
      )}
    </div>
  );
}
