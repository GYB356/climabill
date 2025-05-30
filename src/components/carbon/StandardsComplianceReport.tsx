import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { 
  Loader2, 
  FileText, 
  Download, 
  Calendar, 
  CheckCircle, 
  AlertCircle, 
  FileSpreadsheet, 
  FilePdf, 
  Building, 
  BarChart4 
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/date-picker';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CarbonAccountingStandard, StandardCompliance } from '@/lib/carbon/models/department-project';
import { SustainabilityReportingService } from '@/lib/carbon/sustainability-reporting-service';
import { CarbonTrackingService } from '@/lib/carbon/carbon-tracking-service';
import { useAuth } from '@/lib/firebase/auth-context';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

interface StandardsComplianceReportProps {
  organizationId: string;
}

// Define the form validation schema
const formSchema = z.object({
  reportTitle: z.string().min(3, {
    message: "Report title must be at least 3 characters.",
  }),
  reportingPeriodStart: z.date({
    required_error: "Please select a start date.",
  }),
  reportingPeriodEnd: z.date({
    required_error: "Please select an end date.",
  }),
  standard: z.enum(['GHG_PROTOCOL', 'ISO_14064', 'TCFD', 'CDP', 'SASB', 'OTHER'], {
    required_error: "Please select a standard.",
  }),
  reportFormat: z.enum(['PDF', 'EXCEL', 'CSV'], {
    required_error: "Please select a format.",
  }),
  includeExecutiveSummary: z.boolean().default(true),
  includeDetailedMetrics: z.boolean().default(true),
  includeOffsetInformation: z.boolean().default(true),
  includeComplianceVerification: z.boolean().default(true),
  customNotes: z.string().optional(),
}).refine(data => data.reportingPeriodEnd > data.reportingPeriodStart, {
  message: "End date must be after start date",
  path: ["reportingPeriodEnd"],
});

type FormValues = z.infer<typeof formSchema>;

export function StandardsComplianceReport({ organizationId }: StandardsComplianceReportProps) {
  const [loading, setLoading] = useState(false);
  const [standards, setStandards] = useState<StandardCompliance[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const sustainabilityService = new SustainabilityReportingService();
  const carbonTrackingService = new CarbonTrackingService();
  
  // Setup form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reportTitle: `Carbon Compliance Report - ${new Date().toLocaleDateString()}`,
      reportingPeriodStart: new Date(new Date().getFullYear(), 0, 1), // Jan 1 of current year
      reportingPeriodEnd: new Date(),
      standard: 'GHG_PROTOCOL',
      reportFormat: 'PDF',
      includeExecutiveSummary: true,
      includeDetailedMetrics: true,
      includeOffsetInformation: true,
      includeComplianceVerification: true,
      customNotes: '',
    },
  });
  
  // Load standards and reports
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        if (!user) return;
        
        // Load compliance data
        const targetId = organizationId || user.uid;
        const standardsData = await sustainabilityService.getStandardsCompliance(targetId);
        setStandards(standardsData);
        
        // Load reports
        const reportsData = await sustainabilityService.getComplianceReports(targetId);
        setReports(reportsData);
        
      } catch (err) {
        console.error('Error loading standards compliance data:', err);
        toast({
          title: 'Error',
          description: 'Failed to load compliance data. Please try again later.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [user, organizationId]);
  
  // Handle form submission
  const onSubmit = async (data: FormValues) => {
    try {
      setGenerating(true);
      setProgress(0);
      
      if (!user) return;
      
      const targetId = organizationId || user.uid;
      
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);
      
      // Generate the report
      const reportData = {
        ...data,
        organizationId: targetId,
        generatedBy: user.uid,
        generatedAt: new Date(),
      };
      
      const report = await sustainabilityService.generateComplianceReport(reportData);
      
      // Clear the interval and set to 100%
      clearInterval(progressInterval);
      setProgress(100);
      
      // Add report to the list
      setReports(prev => [report, ...prev]);
      
      toast({
        title: 'Report Generated',
        description: 'Your compliance report has been successfully generated.',
      });
      
      // Close the dialog
      setTimeout(() => {
        setOpenDialog(false);
        setGenerating(false);
        setProgress(0);
      }, 1000);
      
    } catch (err) {
      console.error('Error generating compliance report:', err);
      toast({
        title: 'Error',
        description: 'Failed to generate compliance report. Please try again later.',
        variant: 'destructive',
      });
      setGenerating(false);
      setProgress(0);
    }
  };
  
  // Format standard name for display
  const formatStandardName = (standard: CarbonAccountingStandard) => {
    switch (standard) {
      case 'GHG_PROTOCOL':
        return 'GHG Protocol';
      case 'ISO_14064':
        return 'ISO 14064';
      case 'TCFD':
        return 'TCFD';
      case 'CDP':
        return 'CDP';
      case 'SASB':
        return 'SASB';
      case 'OTHER':
        return 'Other';
      default:
        return standard;
    }
  };
  
  // Download a report
  const downloadReport = async (reportId: string) => {
    try {
      await sustainabilityService.downloadReport(reportId);
      
      toast({
        title: 'Download Started',
        description: 'Your report download has started.',
      });
    } catch (err) {
      console.error('Error downloading report:', err);
      toast({
        title: 'Error',
        description: 'Failed to download report. Please try again later.',
        variant: 'destructive',
      });
    }
  };
  
  // Delete a report
  const deleteReport = async (reportId: string) => {
    try {
      await sustainabilityService.deleteReport(reportId);
      
      // Remove from list
      setReports(prev => prev.filter(report => report.id !== reportId));
      
      toast({
        title: 'Report Deleted',
        description: 'The report has been successfully deleted.',
      });
    } catch (err) {
      console.error('Error deleting report:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete report. Please try again later.',
        variant: 'destructive',
      });
    }
  };
  
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Standards Compliance Reporting</CardTitle>
        </CardHeader>
        <CardContent className="pt-2 flex justify-center items-center min-h-[300px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }
  
  const standardsCompliant = standards.filter(s => s.compliant).length;
  const compliancePercentage = standards.length > 0 
    ? Math.round((standardsCompliant / standards.length) * 100) 
    : 0;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Standards Compliance Reporting
        </CardTitle>
        <CardDescription>
          Generate and manage compliance reports for sustainability standards
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="standards">Standards</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Standards Compliance</span>
                <span className="text-sm font-bold">{compliancePercentage}%</span>
              </div>
              <Progress value={compliancePercentage} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2">
                Your organization is compliant with {standardsCompliant} out of {standards.length} standards
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg font-medium mb-3">Compliance Summary</h3>
                {standards.length > 0 ? (
                  <div className="space-y-3">
                    {standards.map(standard => (
                      <div key={standard.id} className="flex items-center justify-between border-b pb-2">
                        <div className="flex items-center gap-2">
                          {standard.compliant ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-orange-500" />
                          )}
                          <span>{formatStandardName(standard.standard)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {standard.verificationDate && (
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(standard.verificationDate).toLocaleDateString()}
                            </div>
                          )}
                          <Badge variant={standard.compliant ? "success" : "outline"}>
                            {standard.compliant ? 'Compliant' : 'Pending'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    No compliance standards have been added yet.
                  </p>
                )}
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-3">Recent Reports</h3>
                {reports.length > 0 ? (
                  <div className="space-y-3">
                    {reports.slice(0, 3).map(report => (
                      <div key={report.id} className="flex items-center justify-between border-b pb-2">
                        <div className="flex items-center gap-2">
                          {report.format === 'PDF' ? (
                            <FilePdf className="h-4 w-4 text-red-500" />
                          ) : (
                            <FileSpreadsheet className="h-4 w-4 text-green-600" />
                          )}
                          <span className="text-sm truncate max-w-[150px]">{report.title}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {new Date(report.generatedAt).toLocaleDateString()}
                          </span>
                          <Button variant="ghost" size="icon" onClick={() => downloadReport(report.id)}>
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    No reports have been generated yet.
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex justify-center mt-4">
              <Button onClick={() => setOpenDialog(true)} className="w-full md:w-auto">
                Generate New Report
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="reports" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">All Reports</h3>
              <Button onClick={() => setOpenDialog(true)}>
                <FileText className="mr-2 h-4 w-4" />
                Generate New Report
              </Button>
            </div>
            
            {reports.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Report Title</TableHead>
                    <TableHead>Standard</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Format</TableHead>
                    <TableHead>Generated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map(report => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">{report.title}</TableCell>
                      <TableCell>{formatStandardName(report.standard)}</TableCell>
                      <TableCell>
                        {new Date(report.periodStart).toLocaleDateString()} - {new Date(report.periodEnd).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {report.format}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(report.generatedAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => downloadReport(report.id)}>
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteReport(report.id)}>
                          <AlertCircle className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">
                  No reports have been generated yet. Generate your first compliance report to get started.
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="standards" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Standards Compliance</h3>
              <Button variant="outline" onClick={() => window.location.href = '/carbon/management'}>
                <Building className="mr-2 h-4 w-4" />
                Manage Standards
              </Button>
            </div>
            
            {standards.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Standard</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Verification Body</TableHead>
                    <TableHead>Verification Date</TableHead>
                    <TableHead>Next Verification</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {standards.map(standard => (
                    <TableRow key={standard.id}>
                      <TableCell className="font-medium">{formatStandardName(standard.standard)}</TableCell>
                      <TableCell>
                        <Badge variant={standard.compliant ? "success" : "outline"}>
                          {standard.compliant ? 'Compliant' : 'Pending'}
                        </Badge>
                      </TableCell>
                      <TableCell>{standard.verificationBody || 'N/A'}</TableCell>
                      <TableCell>
                        {standard.verificationDate ? new Date(standard.verificationDate).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {standard.nextVerificationDate ? new Date(standard.nextVerificationDate).toLocaleDateString() : 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <Building className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">
                  No compliance standards have been added yet. Visit the Carbon Management page to add standards.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      
      {/* Generate Report Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Generate Compliance Report</DialogTitle>
            <DialogDescription>
              Create a new standards compliance report based on your carbon data
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="reportTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Report Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter report title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="reportingPeriodStart"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start Date</FormLabel>
                      <DatePicker
                        selected={field.value}
                        onSelect={field.onChange}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="reportingPeriodEnd"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>End Date</FormLabel>
                      <DatePicker
                        selected={field.value}
                        onSelect={field.onChange}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="standard"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Compliance Standard</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select standard" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="GHG_PROTOCOL">GHG Protocol</SelectItem>
                          <SelectItem value="ISO_14064">ISO 14064</SelectItem>
                          <SelectItem value="TCFD">TCFD</SelectItem>
                          <SelectItem value="CDP">CDP</SelectItem>
                          <SelectItem value="SASB">SASB</SelectItem>
                          <SelectItem value="OTHER">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="reportFormat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Report Format</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select format" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="PDF">PDF</SelectItem>
                          <SelectItem value="EXCEL">Excel</SelectItem>
                          <SelectItem value="CSV">CSV</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="customNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Custom Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add any additional notes or context for this report..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Separator />
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Report Sections</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {/* These would be actual form fields with proper hookup */}
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="executive" className="checkbox" defaultChecked />
                    <label htmlFor="executive" className="text-sm">Executive Summary</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="metrics" className="checkbox" defaultChecked />
                    <label htmlFor="metrics" className="text-sm">Detailed Metrics</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="offsets" className="checkbox" defaultChecked />
                    <label htmlFor="offsets" className="text-sm">Offset Information</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="verification" className="checkbox" defaultChecked />
                    <label htmlFor="verification" className="text-sm">Compliance Verification</label>
                  </div>
                </div>
              </div>
              
              {generating && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Generating report...</span>
                    <span className="text-sm font-medium">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )}
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpenDialog(false)} disabled={generating}>
                  Cancel
                </Button>
                <Button type="submit" disabled={generating}>
                  {generating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FileText className="mr-2 h-4 w-4" />
                      Generate Report
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
