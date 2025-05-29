'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ComplianceFramework, ValidationStatus } from '@/lib/reporting/compliance/types';
import { GenerateReportForm } from '@/components/reporting/generate-report-form';
import { ScheduleReportForm } from '@/components/reporting/schedule-report-form';
import { ReportList } from '@/components/reporting/report-list';
import { ValidationResult } from '@/components/reporting/validation-result';

export default function ComplianceReportingPage() {
  const [selectedFramework, setSelectedFramework] = useState<ComplianceFramework>(ComplianceFramework.GHG_PROTOCOL);
  const [organizationId, setOrganizationId] = useState<string>('org-001'); // This would come from user context in a real app
  const [showGenerateForm, setShowGenerateForm] = useState<boolean>(false);
  const [showScheduleForm, setShowScheduleForm] = useState<boolean>(false);

  // Fetch validation result
  const { data: validationData, isLoading: isLoadingValidation, error: validationError, refetch: refetchValidation } = useQuery({
    queryKey: ['validationResult', organizationId, selectedFramework],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      queryParams.append('organizationId', organizationId);
      queryParams.append('framework', selectedFramework);
      
      const response = await fetch(`/api/compliance/reporting/validate?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch validation result');
      }
      
      return response.json();
    }
  });

  // Fetch reports
  const { data: reportsData, isLoading: isLoadingReports, error: reportsError, refetch: refetchReports } = useQuery({
    queryKey: ['reports', organizationId],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      queryParams.append('organizationId', organizationId);
      
      // In a real implementation, this would fetch from an API
      // For now, we'll return mock data
      return {
        reports: [
          {
            id: 'report-001',
            organizationId,
            framework: ComplianceFramework.GHG_PROTOCOL,
            period: {
              startDate: new Date(2024, 0, 1),
              endDate: new Date(2024, 2, 31)
            },
            generatedAt: new Date(2024, 3, 5),
            format: 'pdf',
            fileUrl: '/reports/ghg_protocol_2024_q1.pdf',
            validationStatus: ValidationStatus.VALID
          },
          {
            id: 'report-002',
            organizationId,
            framework: ComplianceFramework.TCFD,
            period: {
              startDate: new Date(2023, 0, 1),
              endDate: new Date(2023, 11, 31)
            },
            generatedAt: new Date(2024, 1, 15),
            format: 'pdf',
            fileUrl: '/reports/tcfd_2023.pdf',
            validationStatus: ValidationStatus.WARNING
          }
        ]
      };
    }
  });

  // Fetch schedules
  const { data: schedulesData, isLoading: isLoadingSchedules, error: schedulesError, refetch: refetchSchedules } = useQuery({
    queryKey: ['schedules', organizationId],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      queryParams.append('organizationId', organizationId);
      
      const response = await fetch(`/api/compliance/reporting/schedule?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch schedules');
      }
      
      return response.json();
    }
  });

  // Handle framework change
  const handleFrameworkChange = (framework: ComplianceFramework) => {
    setSelectedFramework(framework);
  };

  // Handle report generation
  const handleReportGenerated = () => {
    setShowGenerateForm(false);
    refetchReports();
  };

  // Handle report scheduling
  const handleReportScheduled = () => {
    setShowScheduleForm(false);
    refetchSchedules();
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
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Compliance Reporting</h1>
          <p className="text-muted-foreground mt-1">
            Generate and schedule regulatory compliance reports
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Select value={selectedFramework} onValueChange={(value) => handleFrameworkChange(value as ComplianceFramework)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select Framework" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ComplianceFramework.GHG_PROTOCOL}>GHG Protocol</SelectItem>
              <SelectItem value={ComplianceFramework.TCFD}>TCFD</SelectItem>
              <SelectItem value={ComplianceFramework.CDP}>CDP</SelectItem>
              <SelectItem value={ComplianceFramework.SASB}>SASB</SelectItem>
              <SelectItem value={ComplianceFramework.GRI}>GRI</SelectItem>
              <SelectItem value={ComplianceFramework.EU_CSRD}>EU CSRD</SelectItem>
              <SelectItem value={ComplianceFramework.SFDR}>SFDR</SelectItem>
              <SelectItem value={ComplianceFramework.SECR}>SECR</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={() => setShowGenerateForm(true)}>Generate Report</Button>
          <Button variant="outline" onClick={() => setShowScheduleForm(true)}>Schedule Report</Button>
        </div>
      </div>
      
      {showGenerateForm && (
        <GenerateReportForm
          organizationId={organizationId}
          framework={selectedFramework}
          onCancel={() => setShowGenerateForm(false)}
          onGenerated={handleReportGenerated}
        />
      )}
      
      {showScheduleForm && (
        <ScheduleReportForm
          organizationId={organizationId}
          framework={selectedFramework}
          onCancel={() => setShowScheduleForm(false)}
          onScheduled={handleReportScheduled}
        />
      )}
      
      <div className="mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Data Validation: {getFrameworkName(selectedFramework)}</CardTitle>
            <CardDescription>
              Validate your data before generating reports
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingValidation ? (
              <div className="text-center py-6">Loading validation results...</div>
            ) : validationError ? (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  Failed to load validation results. Please try again.
                </AlertDescription>
              </Alert>
            ) : (
              <ValidationResult validationResult={validationData?.validationResult} />
            )}
          </CardContent>
          <CardFooter>
            <Button variant="outline" onClick={() => refetchValidation()}>
              Refresh Validation
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      <Tabs defaultValue="reports" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="reports">Generated Reports</TabsTrigger>
          <TabsTrigger value="schedules">Scheduled Reports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="reports" className="mt-6">
          {isLoadingReports ? (
            <div className="text-center py-6">Loading reports...</div>
          ) : reportsError ? (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                Failed to load reports. Please try again.
              </AlertDescription>
            </Alert>
          ) : (
            <ReportList reports={reportsData?.reports || []} />
          )}
        </TabsContent>
        
        <TabsContent value="schedules" className="mt-6">
          {isLoadingSchedules ? (
            <div className="text-center py-6">Loading schedules...</div>
          ) : schedulesError ? (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                Failed to load schedules. Please try again.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {schedulesData?.schedules.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <p className="text-muted-foreground">
                    No scheduled reports found.
                  </p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setShowScheduleForm(true)}
                  >
                    Schedule a Report
                  </Button>
                </div>
              ) : (
                schedulesData?.schedules.map((schedule: any) => (
                  <Card key={schedule.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{getFrameworkName(schedule.framework)}</CardTitle>
                          <CardDescription>
                            Next run: {new Date(schedule.nextRunDate).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <Badge variant={schedule.enabled ? 'default' : 'outline'}>
                          {schedule.enabled ? 'Active' : 'Disabled'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Frequency</p>
                          <p>{schedule.frequency.replace('_', ' ')}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Format</p>
                          <p>{schedule.format.toUpperCase()}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Recipients</p>
                          <p>{schedule.recipients.join(', ')}</p>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                      <Button variant="outline" size="sm">Edit</Button>
                      <Button variant="outline" size="sm" className={schedule.enabled ? 'text-red-500' : 'text-green-500'}>
                        {schedule.enabled ? 'Disable' : 'Enable'}
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
