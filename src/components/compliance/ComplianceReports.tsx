"use client";

import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { ComplianceFramework } from '@/lib/compliance/compliance-framework-registry';
import { ComplianceStatus } from '@/lib/compliance/compliance-status-tracker';
import { GapAnalysisResult } from '@/lib/compliance/gap-analysis';
import { useAccessibility } from '@/lib/a11y/accessibility-context';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  FileText, 
  Download, 
  Calendar, 
  Clock,
  FileBarChart,
  FilePieChart,
  FileCheck,
  Printer,
  Share2,
  Mail,
  Loader2,
  CheckCircle
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ComplianceReportsProps {
  organizationId: string;
  framework: ComplianceFramework;
  complianceStatus: ComplianceStatus;
  gapAnalysis: GapAnalysisResult;
}

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: 'summary' | 'detailed' | 'gap-analysis' | 'evidence-log' | 'regulatory';
  format: 'pdf' | 'excel' | 'word' | 'html';
  lastGenerated?: Date;
  icon: React.ReactNode;
}

interface GeneratedReport {
  id: string;
  templateId: string;
  name: string;
  description: string;
  generatedDate: Date;
  format: 'pdf' | 'excel' | 'word' | 'html';
  size: number;
  url: string;
  sharedWith: string[];
}

/**
 * Compliance Reports component
 * Manages report generation and history for compliance frameworks
 */
export default function ComplianceReports({ 
  organizationId, 
  framework, 
  complianceStatus,
  gapAnalysis
}: ComplianceReportsProps) {
  const { t } = useTranslation('compliance');
  const { announce } = useAccessibility();
  
  // State for report generation
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [showGenerationSuccess, setShowGenerationSuccess] = useState(false);
  
  // State for report sharing
  const [reportToShare, setReportToShare] = useState<string | null>(null);
  const [sharingEmail, setSharingEmail] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  
  // Available report templates
  const reportTemplates: ReportTemplate[] = [
    {
      id: 'summary-report',
      name: t('compliance.reports.summaryReport'),
      description: t('compliance.reports.summaryReportDescription'),
      type: 'summary',
      format: 'pdf',
      icon: <FileBarChart className="h-6 w-6 text-primary" />
    },
    {
      id: 'detailed-compliance',
      name: t('compliance.reports.detailedReport'),
      description: t('compliance.reports.detailedReportDescription'),
      type: 'detailed',
      format: 'pdf',
      icon: <FileText className="h-6 w-6 text-primary" />
    },
    {
      id: 'gap-analysis',
      name: t('compliance.reports.gapAnalysisReport'),
      description: t('compliance.reports.gapAnalysisReportDescription'),
      type: 'gap-analysis',
      format: 'pdf',
      icon: <FilePieChart className="h-6 w-6 text-primary" />
    },
    {
      id: 'evidence-log',
      name: t('compliance.reports.evidenceLogReport'),
      description: t('compliance.reports.evidenceLogReportDescription'),
      type: 'evidence-log',
      format: 'excel',
      icon: <FileCheck className="h-6 w-6 text-primary" />
    },
    {
      id: 'regulatory-filing',
      name: t('compliance.reports.regulatoryReport'),
      description: t('compliance.reports.regulatoryReportDescription'),
      type: 'regulatory',
      format: 'word',
      lastGenerated: new Date(2023, 10, 15),
      icon: <FileText className="h-6 w-6 text-primary" />
    }
  ];
  
  // Previously generated reports
  const [generatedReports, setGeneratedReports] = useState<GeneratedReport[]>([
    {
      id: 'report-001',
      templateId: 'summary-report',
      name: 'Q4 2023 Compliance Summary',
      description: 'Quarterly compliance summary for Q4 2023',
      generatedDate: new Date(2023, 11, 15),
      format: 'pdf',
      size: 2456789,
      url: '#',
      sharedWith: ['jane.doe@example.com']
    },
    {
      id: 'report-002',
      templateId: 'gap-analysis',
      name: 'Gap Analysis Report - December 2023',
      description: 'Detailed gap analysis for all compliance requirements',
      generatedDate: new Date(2023, 11, 10),
      format: 'pdf',
      size: 3567890,
      url: '#',
      sharedWith: []
    },
    {
      id: 'report-003',
      templateId: 'evidence-log',
      name: 'Evidence Log - Q4 2023',
      description: 'Complete log of all evidence documents with metadata',
      generatedDate: new Date(2023, 11, 5),
      format: 'excel',
      size: 1234567,
      url: '#',
      sharedWith: ['john.smith@example.com', 'jane.doe@example.com']
    }
  ]);
  
  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB';
    else return (bytes / 1073741824).toFixed(1) + ' GB';
  };
  
  // Get file icon based on format
  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'pdf':
        return <FileText className="h-4 w-4" />;
      case 'excel':
        return <FileBarChart className="h-4 w-4" />;
      case 'word':
        return <FileText className="h-4 w-4" />;
      case 'html':
        return <FileText className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };
  
  // Handle report generation
  const handleGenerateReport = async (templateId: string) => {
    setSelectedTemplateId(templateId);
    setGenerationError(null);
    setIsGenerating(true);
    
    try {
      // In a real implementation, this would call an API to generate the report
      // For now, we'll simulate the generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const template = reportTemplates.find(t => t.id === templateId);
      if (!template) throw new Error(t('compliance.reports.templateNotFound'));
      
      // Create new report
      const newReport: GeneratedReport = {
        id: `report-${Date.now()}`,
        templateId,
        name: `${template.name} - ${new Date().toLocaleDateString()}`,
        description: template.description,
        generatedDate: new Date(),
        format: template.format,
        size: Math.floor(Math.random() * 5000000) + 1000000, // Random size between 1-6MB
        url: '#',
        sharedWith: []
      };
      
      // Update state
      setGeneratedReports([newReport, ...generatedReports]);
      setIsGenerating(false);
      setShowGenerationSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowGenerationSuccess(false);
      }, 3000);
      
      announce(t('compliance.reports.reportGenerated', { name: newReport.name }), false);
    } catch (err) {
      setIsGenerating(false);
      setGenerationError(err instanceof Error ? err.message : String(err));
      announce(t('compliance.reports.errorGeneratingReport'), true);
    }
  };
  
  // Handle report download
  const handleDownloadReport = (reportId: string) => {
    // In a real implementation, this would download the file
    // For now, we'll just show a message
    announce(t('compliance.reports.downloadingReport'), false);
  };
  
  // Handle report sharing
  const handleShareReport = (reportId: string) => {
    setReportToShare(reportId);
  };
  
  // Confirm report sharing
  const confirmShareReport = async () => {
    if (!reportToShare || !sharingEmail) return;
    
    try {
      setIsSharing(true);
      
      // In a real implementation, this would share the report via email
      // For now, we'll simulate the sharing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update report's sharedWith list
      setGeneratedReports(generatedReports.map(report => {
        if (report.id === reportToShare) {
          return {
            ...report,
            sharedWith: [...report.sharedWith, sharingEmail]
          };
        }
        return report;
      }));
      
      setReportToShare(null);
      setSharingEmail('');
      setIsSharing(false);
      
      announce(t('compliance.reports.reportShared', { email: sharingEmail }), false);
    } catch (err) {
      setIsSharing(false);
      announce(t('compliance.reports.errorSharingReport'), true);
    }
  };
  
  // Cancel report sharing
  const cancelShareReport = () => {
    setReportToShare(null);
    setSharingEmail('');
  };
  
  return (
    <div className="space-y-6">
      {/* Report Templates */}
      <Card>
        <CardHeader>
          <CardTitle>{t('compliance.reports.generateReport')}</CardTitle>
          <CardDescription>{t('compliance.reports.generateReportDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Success Alert */}
          {showGenerationSuccess && (
            <Alert className="mb-4 bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <AlertTitle className="text-green-700">{t('compliance.reports.reportGeneratedTitle')}</AlertTitle>
              <AlertDescription className="text-green-600">
                {t('compliance.reports.reportGeneratedDescription')}
              </AlertDescription>
            </Alert>
          )}
          
          {/* Error Alert */}
          {generationError && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>{t('compliance.reports.error')}</AlertTitle>
              <AlertDescription>{generationError}</AlertDescription>
            </Alert>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {reportTemplates.map(template => (
              <Card key={template.id} className="border">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    {template.icon}
                    <Badge variant="outline">
                      {template.format.toUpperCase()}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg mt-2">{template.name}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  {template.lastGenerated && (
                    <div className="flex items-center text-sm text-muted-foreground mb-2">
                      <Clock className="mr-2 h-4 w-4" />
                      {t('compliance.reports.lastGenerated', { 
                        date: template.lastGenerated.toLocaleDateString() 
                      })}
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={() => handleGenerateReport(template.id)}
                    disabled={isGenerating && selectedTemplateId === template.id}
                    className="w-full"
                  >
                    {isGenerating && selectedTemplateId === template.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t('compliance.reports.generating')}
                      </>
                    ) : (
                      <>
                        <FileText className="mr-2 h-4 w-4" />
                        {t('compliance.reports.generate')}
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Generated Reports */}
      <Card>
        <CardHeader>
          <CardTitle>{t('compliance.reports.generatedReports')}</CardTitle>
          <CardDescription>{t('compliance.reports.generatedReportsDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          {generatedReports.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-1">{t('compliance.reports.noReportsGenerated')}</h3>
              <p className="text-sm text-muted-foreground">{t('compliance.reports.noReportsGeneratedDescription')}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('compliance.reports.reportName')}</TableHead>
                  <TableHead>{t('compliance.reports.generatedDate')}</TableHead>
                  <TableHead>{t('compliance.reports.format')}</TableHead>
                  <TableHead>{t('compliance.reports.size')}</TableHead>
                  <TableHead>{t('compliance.reports.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {generatedReports.map(report => (
                  <TableRow key={report.id}>
                    <TableCell>
                      <div className="font-medium">{report.name}</div>
                      <div className="text-sm text-muted-foreground">{report.description}</div>
                    </TableCell>
                    <TableCell>
                      {report.generatedDate.toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="flex items-center gap-1">
                        {getFormatIcon(report.format)}
                        {report.format.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {formatFileSize(report.size)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleDownloadReport(report.id)}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{t('compliance.reports.downloadReport')}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => window.print()}
                              >
                                <Printer className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{t('compliance.reports.printReport')}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleShareReport(report.id)}
                              >
                                <Share2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{t('compliance.reports.shareReport')}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      {/* Share Report Dialog */}
      <Dialog open={!!reportToShare} onOpenChange={(open) => !open && cancelShareReport()}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t('compliance.reports.shareReport')}</DialogTitle>
            <DialogDescription>
              {t('compliance.reports.shareReportDescription')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="email" className="text-right text-sm font-medium">
                {t('compliance.reports.email')}
              </label>
              <input
                id="email"
                type="email"
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={sharingEmail}
                onChange={(e) => setSharingEmail(e.target.value)}
                placeholder="example@company.com"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={cancelShareReport}>
              {t('compliance.reports.cancel')}
            </Button>
            <Button 
              onClick={confirmShareReport}
              disabled={isSharing || !sharingEmail}
            >
              {isSharing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('compliance.reports.sharing')}
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  {t('compliance.reports.share')}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
