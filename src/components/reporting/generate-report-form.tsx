'use client';

import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ComplianceFramework, ReportFormat } from '@/lib/reporting/compliance/types';
import { Loader2 } from 'lucide-react';

interface GenerateReportFormProps {
  organizationId: string;
  framework: ComplianceFramework;
  onCancel: () => void;
  onGenerated: () => void;
}

export function GenerateReportForm({ organizationId, framework, onCancel, onGenerated }: GenerateReportFormProps) {
  const [startDate, setStartDate] = useState<Date | undefined>(new Date(new Date().getFullYear(), 0, 1));
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [format, setFormat] = useState<ReportFormat>(ReportFormat.PDF);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  // Handle form submission
  const handleSubmit = async () => {
    try {
      // Validate dates
      if (!startDate || !endDate) {
        setError('Please select both start and end dates');
        return;
      }

      if (startDate > endDate) {
        setError('Start date must be before end date');
        return;
      }

      setIsLoading(true);
      setError(null);

      // Call API to generate report
      const response = await fetch('/api/compliance/reporting/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          organizationId,
          framework,
          period: {
            startDate,
            endDate
          },
          format
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate report');
      }

      // Show success message
      setSuccess(true);

      // Notify parent component
      setTimeout(() => {
        onGenerated();
      }, 2000);
    } catch (error) {
      console.error('Error generating report:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate report');
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

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Generate {getFrameworkName(framework)} Report</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Start Date</label>
            <DatePicker
              date={startDate}
              onSelect={setStartDate}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">End Date</label>
            <DatePicker
              date={endDate}
              onSelect={setEndDate}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Format</label>
            <Select
              value={format}
              onValueChange={(value) => setFormat(value as ReportFormat)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ReportFormat.PDF}>PDF</SelectItem>
                <SelectItem value={ReportFormat.EXCEL}>Excel</SelectItem>
                <SelectItem value={ReportFormat.CSV}>CSV</SelectItem>
                <SelectItem value={ReportFormat.JSON}>JSON</SelectItem>
                <SelectItem value={ReportFormat.HTML}>HTML</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mt-6">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mt-6 bg-green-50 text-green-800 border-green-200">
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>Report generated successfully!</AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={isLoading || success}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            'Generate Report'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
