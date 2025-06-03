"use client";

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useAccessibility } from '@/lib/a11y/accessibility-context';
import { ComplianceFrameworkRegistry, ComplianceFramework } from '@/lib/compliance/compliance-framework-registry';
import { ComplianceStatusTracker, ComplianceStatus } from '@/lib/compliance/compliance-status-tracker';
import { GapAnalysisService, GapAnalysisResult } from '@/lib/compliance/gap-analysis';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CalendarIcon, ClipboardList, FileText, AlertTriangle, CheckCircle, Clock, Download } from 'lucide-react';

import ComplianceOverview from './ComplianceOverview';
import FrameworkDetails from './FrameworkDetails';
import GapAnalysisView from './GapAnalysisView';
import EvidenceUploader from './EvidenceUploader';
import ComplianceReports from './ComplianceReports';

interface ComplianceDashboardProps {
  organizationId: string;
}

/**
 * Main Compliance Dashboard component
 * Provides a comprehensive view of regulatory compliance status
 */
export default function ComplianceDashboard({ organizationId }: ComplianceDashboardProps) {
  const { t } = useTranslation('compliance');
  const router = useRouter();
  const { announce } = useAccessibility();
  
  // State for selected framework and tab
  const [selectedFrameworkId, setSelectedFrameworkId] = useState<string>('');
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  
  // State for compliance data
  const [frameworks, setFrameworks] = useState<ComplianceFramework[]>([]);
  const [complianceStatuses, setComplianceStatuses] = useState<ComplianceStatus[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<ComplianceStatus | null>(null);
  const [gapAnalysis, setGapAnalysis] = useState<GapAnalysisResult | null>(null);
  
  // Initialize services
  const frameworkRegistry = ComplianceFrameworkRegistry.getInstance();
  const complianceTracker = new ComplianceStatusTracker();
  const gapAnalysisService = new GapAnalysisService();
  
  // Load frameworks and compliance statuses
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Load available frameworks
        const availableFrameworks = frameworkRegistry.getAllFrameworks();
        setFrameworks(availableFrameworks);
        
        // Load compliance statuses for the organization
        const statuses = await complianceTracker.getComplianceStatusesByOrganization(organizationId);
        setComplianceStatuses(statuses);
        
        // Set default selected framework if available
        if (statuses.length > 0 && !selectedFrameworkId) {
          setSelectedFrameworkId(statuses[0].frameworkId);
          setSelectedStatus(statuses[0]);
          
          // Perform gap analysis
          const analysis = gapAnalysisService.analyzeGaps(statuses[0]);
          setGapAnalysis(analysis);
        }
        
        setIsLoading(false);
        announce(t('compliance.dashboardLoaded'), false);
      } catch (error) {
        console.error('Error loading compliance data:', error);
        setIsLoading(false);
        announce(t('compliance.loadError'), true);
      }
    };
    
    loadData();
  }, [organizationId]);
  
  // Update selected status when framework changes
  useEffect(() => {
    if (selectedFrameworkId && complianceStatuses.length > 0) {
      const status = complianceStatuses.find(s => s.frameworkId === selectedFrameworkId);
      
      if (status) {
        setSelectedStatus(status);
        
        // Perform gap analysis
        const analysis = gapAnalysisService.analyzeGaps(status);
        setGapAnalysis(analysis);
      } else {
        setSelectedStatus(null);
        setGapAnalysis(null);
      }
    }
  }, [selectedFrameworkId, complianceStatuses]);
  
  // Handle framework change
  const handleFrameworkChange = (frameworkId: string) => {
    setSelectedFrameworkId(frameworkId);
    announce(t('compliance.frameworkChanged', { framework: frameworks.find(f => f.id === frameworkId)?.name }), false);
  };
  
  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    announce(t(`compliance.tabChanged.${value}`), false);
  };
  
  // Create new compliance status
  const handleCreateComplianceStatus = async (frameworkId: string) => {
    try {
      setIsLoading(true);
      
      // Calculate period end date (1 year from now)
      const periodEndDate = new Date();
      periodEndDate.setFullYear(periodEndDate.getFullYear() + 1);
      
      // Create new compliance status
      const statusId = await complianceTracker.createComplianceStatus(
        organizationId,
        frameworkId,
        periodEndDate
      );
      
      // Reload compliance statuses
      const statuses = await complianceTracker.getComplianceStatusesByOrganization(organizationId);
      setComplianceStatuses(statuses);
      
      // Set selected framework to the new one
      setSelectedFrameworkId(frameworkId);
      
      setIsLoading(false);
      announce(t('compliance.statusCreated'), false);
    } catch (error) {
      console.error('Error creating compliance status:', error);
      setIsLoading(false);
      announce(t('compliance.createError'), true);
    }
  };
  
  // Render loading state
  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }
  
  // Render empty state if no frameworks
  if (frameworks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <ClipboardList className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">{t('compliance.noFrameworks')}</h2>
        <p className="text-muted-foreground mb-4">{t('compliance.noFrameworksDescription')}</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">{t('compliance.dashboardTitle')}</h1>
          <p className="text-muted-foreground">{t('compliance.dashboardDescription')}</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={selectedFrameworkId} onValueChange={handleFrameworkChange}>
            <SelectTrigger className="w-[240px]">
              <SelectValue placeholder={t('compliance.selectFramework')} />
            </SelectTrigger>
            <SelectContent>
              {frameworks.map((framework) => (
                <SelectItem key={framework.id} value={framework.id}>
                  {framework.name} ({framework.version})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={() => router.push('/compliance/settings')}>
            {t('compliance.settings')}
          </Button>
        </div>
      </div>
      
      {/* Summary Cards */}
      {selectedStatus && gapAnalysis && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Completion Status Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>{t('compliance.completionStatus')}</CardTitle>
              <CardDescription>{t('compliance.completionDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{t('compliance.completion')}</span>
                  <span className="text-2xl font-bold">{selectedStatus.completionPercentage}%</span>
                </div>
                <Progress value={selectedStatus.completionPercentage} className="h-2" />
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant={selectedStatus.status === 'compliant' ? 'default' : 'outline'}>
                    {t(`compliance.status.${selectedStatus.status}`)}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Risk Level Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>{t('compliance.riskLevel')}</CardTitle>
              <CardDescription>{t('compliance.riskDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{t('compliance.riskScore')}</span>
                  <span className="text-2xl font-bold">{gapAnalysis.riskScore}/100</span>
                </div>
                <Progress 
                  value={gapAnalysis.riskScore} 
                  className="h-2" 
                  indicatorClassName={
                    gapAnalysis.riskLevel === 'critical' ? 'bg-destructive' :
                    gapAnalysis.riskLevel === 'high' ? 'bg-amber-500' :
                    gapAnalysis.riskLevel === 'medium' ? 'bg-yellow-500' :
                    'bg-green-500'
                  }
                />
                <div className="flex items-center gap-2 mt-2">
                  <Badge 
                    variant="outline"
                    className={
                      gapAnalysis.riskLevel === 'critical' ? 'border-destructive text-destructive' :
                      gapAnalysis.riskLevel === 'high' ? 'border-amber-500 text-amber-500' :
                      gapAnalysis.riskLevel === 'medium' ? 'border-yellow-500 text-yellow-500' :
                      'border-green-500 text-green-500'
                    }
                  >
                    {t(`compliance.risk.${gapAnalysis.riskLevel}`)}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Next Deadline Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>{t('compliance.nextDeadline')}</CardTitle>
              <CardDescription>{t('compliance.deadlineDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              {selectedStatus.nextDeadline ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                    <span className="text-lg font-medium">
                      {new Date(
                        selectedStatus.nextDeadline instanceof Date 
                          ? selectedStatus.nextDeadline 
                          : (selectedStatus.nextDeadline as any).seconds * 1000
                      ).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <span>
                      {gapAnalysis.nextDeadline && Math.ceil((gapAnalysis.nextDeadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} {t('compliance.daysRemaining')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline">
                      {selectedStatus.nextDeadlineId && t(`compliance.deadline.${selectedStatus.nextDeadlineId}`)}
                    </Badge>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-20">
                  <span className="text-muted-foreground">{t('compliance.noDeadlines')}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* No compliance status alert */}
      {selectedFrameworkId && !selectedStatus && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>{t('compliance.noStatus')}</AlertTitle>
          <AlertDescription>
            {t('compliance.noStatusDescription')}
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-2"
              onClick={() => handleCreateComplianceStatus(selectedFrameworkId)}
            >
              {t('compliance.createStatus')}
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      {/* Main Content Tabs */}
      {selectedStatus && (
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid grid-cols-2 md:grid-cols-5 mb-4">
            <TabsTrigger value="overview">{t('compliance.tabs.overview')}</TabsTrigger>
            <TabsTrigger value="details">{t('compliance.tabs.details')}</TabsTrigger>
            <TabsTrigger value="gaps">{t('compliance.tabs.gaps')}</TabsTrigger>
            <TabsTrigger value="evidence">{t('compliance.tabs.evidence')}</TabsTrigger>
            <TabsTrigger value="reports">{t('compliance.tabs.reports')}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            {selectedStatus && (
              <ComplianceOverview 
                organizationId={organizationId}
                complianceStatuses={complianceStatuses}
                frameworks={frameworks}
              />
            )}
          </TabsContent>
          
          <TabsContent value="details">
            {selectedStatus && (
              <FrameworkDetails 
                complianceStatus={selectedStatus}
                framework={frameworks.find(f => f.id === selectedStatus.frameworkId)!}
              />
            )}
          </TabsContent>
          
          <TabsContent value="gaps">
            {gapAnalysis && (
              <GapAnalysisView 
                gapAnalysis={gapAnalysis}
                framework={frameworks.find(f => f.id === selectedStatus?.frameworkId)!}
              />
            )}
          </TabsContent>
          
          <TabsContent value="evidence">
            {selectedStatus && (
              <EvidenceUploader 
                organizationId={organizationId}
                complianceStatus={selectedStatus}
                framework={frameworks.find(f => f.id === selectedStatus.frameworkId)!}
              />
            )}
          </TabsContent>
          
          <TabsContent value="reports">
            {selectedStatus && (
              <ComplianceReports 
                organizationId={organizationId}
                complianceStatus={selectedStatus}
                framework={frameworks.find(f => f.id === selectedStatus.frameworkId)!}
                gapAnalysis={gapAnalysis}
              />
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
