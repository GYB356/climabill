'use client';

import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ComplianceFramework, ReportFormat, ReportFrequency } from '@/lib/reporting/compliance/types';
import { Loader2, Plus, X } from 'lucide-react';

interface ScheduleReportFormProps {
  organizationId: string;
  framework: ComplianceFramework;
  onCancel: () => void;
  onScheduled: () => void;
}

export function ScheduleReportForm({ organizationId, framework, onCancel, onScheduled }: ScheduleReportFormProps) {
  const [frequency, setFrequency] = useState<ReportFrequency>(ReportFrequency.QUARTERLY);
  const [format, setFormat] = useState<ReportFormat>(ReportFormat.PDF);
  const [recipients, setRecipients] = useState<string[]>(['']);
  const [customSchedule, setCustomSchedule] = useState<{ months: number[]; dayOfMonth: number }>({
    months: [0, 3, 6, 9], // Jan, Apr, Jul, Oct
    dayOfMonth: 1
  });
  const [isEnabled, setIsEnabled] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  // Handle form submission
  const handleSubmit = async () => {
    try {
      // Validate recipients
      const validRecipients = recipients.filter(r => r.trim() !== '');
      if (validRecipients.length === 0) {
        setError('Please add at least one recipient');
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      for (const recipient of validRecipients) {
        if (!emailRegex.test(recipient)) {
          setError(`Invalid email format: ${recipient}`);
          return;
        }
      }

      setIsLoading(true);
      setError(null);

      // Call API to schedule report
      const response = await fetch('/api/compliance/reporting/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          organizationId,
          framework,
          frequency,
          format,
          recipients: validRecipients,
          customSchedule: frequency === ReportFrequency.CUSTOM ? customSchedule : undefined,
          enabled: isEnabled
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to schedule report');
      }

      // Show success message
      setSuccess(true);

      // Notify parent component
      setTimeout(() => {
        onScheduled();
      }, 2000);
    } catch (error) {
      console.error('Error scheduling report:', error);
      setError(error instanceof Error ? error.message : 'Failed to schedule report');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle recipient change
  const handleRecipientChange = (index: number, value: string) => {
    const newRecipients = [...recipients];
    newRecipients[index] = value;
    setRecipients(newRecipients);
  };

  // Add recipient
  const addRecipient = () => {
    setRecipients([...recipients, '']);
  };

  // Remove recipient
  const removeRecipient = (index: number) => {
    if (recipients.length > 1) {
      const newRecipients = [...recipients];
      newRecipients.splice(index, 1);
      setRecipients(newRecipients);
    }
  };

  // Handle month selection for custom schedule
  const handleMonthToggle = (month: number) => {
    const newMonths = customSchedule.months.includes(month)
      ? customSchedule.months.filter(m => m !== month)
      : [...customSchedule.months, month];
    
    setCustomSchedule({
      ...customSchedule,
      months: newMonths.sort((a, b) => a - b)
    });
  };

  // Handle day of month change for custom schedule
  const handleDayOfMonthChange = (day: number) => {
    setCustomSchedule({
      ...customSchedule,
      dayOfMonth: Math.min(Math.max(1, day), 28) // Limit to 1-28
    });
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

  // Get month name
  const getMonthName = (month: number) => {
    return new Date(2000, month, 1).toLocaleString('default', { month: 'short' });
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Schedule {getFrameworkName(framework)} Report</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Frequency</label>
            <Select
              value={frequency}
              onValueChange={(value) => setFrequency(value as ReportFrequency)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ReportFrequency.MONTHLY}>Monthly</SelectItem>
                <SelectItem value={ReportFrequency.QUARTERLY}>Quarterly</SelectItem>
                <SelectItem value={ReportFrequency.SEMI_ANNUALLY}>Semi-Annually</SelectItem>
                <SelectItem value={ReportFrequency.ANNUALLY}>Annually</SelectItem>
                <SelectItem value={ReportFrequency.CUSTOM}>Custom</SelectItem>
              </SelectContent>
            </Select>
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
          
          {frequency === ReportFrequency.CUSTOM && (
            <>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Months</label>
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: 12 }, (_, i) => (
                    <Button
                      key={i}
                      type="button"
                      variant={customSchedule.months.includes(i) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleMonthToggle(i)}
                      disabled={isLoading}
                    >
                      {getMonthName(i)}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Day of Month</label>
                <Input
                  type="number"
                  min={1}
                  max={28}
                  value={customSchedule.dayOfMonth}
                  onChange={(e) => handleDayOfMonthChange(parseInt(e.target.value))}
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground">
                  Choose a day between 1-28 to ensure it exists in all months
                </p>
              </div>
            </>
          )}
          
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">Recipients</label>
            <div className="space-y-2">
              {recipients.map((recipient, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    placeholder="Email address"
                    value={recipient}
                    onChange={(e) => handleRecipientChange(index, e.target.value)}
                    disabled={isLoading}
                  />
                  {recipients.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeRecipient(index)}
                      disabled={isLoading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addRecipient}
                disabled={isLoading}
                className="mt-2"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Recipient
              </Button>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 md:col-span-2">
            <Checkbox
              id="enabled"
              checked={isEnabled}
              onCheckedChange={(checked) => setIsEnabled(checked as boolean)}
              disabled={isLoading}
            />
            <Label htmlFor="enabled">Enable this schedule</Label>
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
            <AlertDescription>Report scheduled successfully!</AlertDescription>
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
              Scheduling...
            </>
          ) : (
            'Schedule Report'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
