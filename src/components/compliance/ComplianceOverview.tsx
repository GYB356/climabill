"use client";

import React from 'react';
import { useTranslation } from 'next-i18next';
import { ComplianceFramework } from '@/lib/compliance/compliance-framework-registry';
import { ComplianceStatus } from '@/lib/compliance/compliance-status-tracker';
import { GapAnalysisService } from '@/lib/compliance/gap-analysis';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { 
  CalendarIcon, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  AlertCircle,
  ShieldAlert,
  Shield
} from 'lucide-react';

interface ComplianceOverviewProps {
  organizationId: string;
  complianceStatuses: ComplianceStatus[];
  frameworks: ComplianceFramework[];
}

/**
 * Compliance Overview component
 * Provides a summary of compliance status across all frameworks
 */
export default function ComplianceOverview({ 
  organizationId, 
  complianceStatuses, 
  frameworks 
}: ComplianceOverviewProps) {
  const { t } = useTranslation('compliance');
  const gapAnalysisService = new GapAnalysisService();
  
  // Calculate overall compliance metrics
  const totalFrameworks = frameworks.length;
  const activeFrameworks = complianceStatuses.length;
  const compliantFrameworks = complianceStatuses.filter(s => s.status === 'compliant').length;
  const inProgressFrameworks = complianceStatuses.filter(s => s.status === 'in-progress').length;
  const nonCompliantFrameworks = complianceStatuses.filter(s => s.status === 'non-compliant').length;
  
  // Calculate average completion percentage
  const averageCompletion = complianceStatuses.length > 0
    ? Math.round(complianceStatuses.reduce((sum, status) => sum + status.completionPercentage, 0) / complianceStatuses.length)
    : 0;
  
  // Get upcoming deadlines
  const upcomingDeadlines = complianceStatuses
    .filter(status => status.nextDeadline)
    .map(status => {
      const framework = frameworks.find(f => f.id === status.frameworkId);
      const deadlineDate = status.nextDeadline instanceof Date 
        ? status.nextDeadline 
        : new Date((status.nextDeadline as any).seconds * 1000);
      const daysRemaining = Math.ceil((deadlineDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      
      return {
        id: status.id,
        frameworkId: status.frameworkId,
        frameworkName: framework?.name || 'Unknown',
        deadlineId: status.nextDeadlineId,
        deadlineDate,
        daysRemaining
      };
    })
    .sort((a, b) => a.daysRemaining - b.daysRemaining)
    .slice(0, 5); // Get top 5 closest deadlines
  
  // Get critical gaps
  const criticalGaps = complianceStatuses.flatMap(status => {
    const framework = frameworks.find(f => f.id === status.frameworkId);
    if (!framework) return [];
    
    const analysis = gapAnalysisService.analyzeGaps(status);
    return analysis.gaps
      .filter(gap => gap.severity === 'critical')
      .map(gap => ({
        ...gap,
        frameworkName: framework.name
      }));
  }).slice(0, 5); // Get top 5 critical gaps
  
  // Prepare chart data
  const frameworkStatusData = frameworks.map(framework => {
    const status = complianceStatuses.find(s => s.frameworkId === framework.id);
    return {
      name: framework.name,
      completion: status?.completionPercentage || 0,
      status: status?.status || 'not-started'
    };
  });
  
  // Prepare pie chart data
  const complianceDistributionData = [
    { name: t('compliance.status.compliant'), value: compliantFrameworks, color: '#10b981' },
    { name: t('compliance.status.in-progress'), value: inProgressFrameworks, color: '#f59e0b' },
    { name: t('compliance.status.non-compliant'), value: nonCompliantFrameworks, color: '#ef4444' },
    { name: t('compliance.status.not-started'), value: totalFrameworks - activeFrameworks, color: '#6b7280' }
  ].filter(item => item.value > 0);
  
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Overall Compliance Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>{t('compliance.overallCompliance')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">{t('compliance.averageCompletion')}</span>
                <span className="text-2xl font-bold">{averageCompletion}%</span>
              </div>
              <Progress value={averageCompletion} className="h-2" />
              <div className="flex items-center gap-2 mt-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {compliantFrameworks} / {totalFrameworks} {t('compliance.frameworksCompliant')}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Frameworks Status Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>{t('compliance.frameworksStatus')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col">
                  <span className="text-2xl font-bold">{activeFrameworks}</span>
                  <span className="text-sm text-muted-foreground">{t('compliance.activeFrameworks')}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-bold">{totalFrameworks - activeFrameworks}</span>
                  <span className="text-sm text-muted-foreground">{t('compliance.inactiveFrameworks')}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Next Deadline Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>{t('compliance.closestDeadline')}</CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingDeadlines.length > 0 ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                  <span className="text-lg font-medium">
                    {upcomingDeadlines[0].deadlineDate.toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <span className={upcomingDeadlines[0].daysRemaining <= 7 ? 'text-destructive' : ''}>
                    {upcomingDeadlines[0].daysRemaining} {t('compliance.daysRemaining')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {upcomingDeadlines[0].frameworkName}
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
        
        {/* Critical Gaps Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>{t('compliance.criticalGaps')}</CardTitle>
          </CardHeader>
          <CardContent>
            {criticalGaps.length > 0 ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                  <span className="text-lg font-medium">
                    {criticalGaps.length} {t('compliance.criticalIssues')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {t('compliance.requiresAttention')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="destructive">
                    {criticalGaps[0].frameworkName}
                  </Badge>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-20">
                <span className="text-muted-foreground">{t('compliance.noCriticalGaps')}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Charts and Detailed Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Framework Completion Chart */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>{t('compliance.frameworkCompletion')}</CardTitle>
            <CardDescription>{t('compliance.frameworkCompletionDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={frameworkStatusData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45} 
                    textAnchor="end" 
                    height={70}
                    interval={0}
                  />
                  <YAxis label={{ value: t('compliance.completion'), angle: -90, position: 'insideLeft' }} />
                  <Tooltip 
                    formatter={(value) => [`${value}%`, t('compliance.completion')]}
                    labelFormatter={(label) => label}
                  />
                  <Bar 
                    dataKey="completion" 
                    name={t('compliance.completion')}
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* Compliance Distribution Chart */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>{t('compliance.complianceDistribution')}</CardTitle>
            <CardDescription>{t('compliance.complianceDistributionDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={complianceDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {complianceDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value, t('compliance.frameworks')]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Upcoming Deadlines */}
      <Card>
        <CardHeader>
          <CardTitle>{t('compliance.upcomingDeadlines')}</CardTitle>
          <CardDescription>{t('compliance.upcomingDeadlinesDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          {upcomingDeadlines.length > 0 ? (
            <div className="space-y-4">
              {upcomingDeadlines.map((deadline) => (
                <div key={`${deadline.id}-${deadline.deadlineId}`} className="flex items-center justify-between border-b pb-4 last:border-0">
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-full ${deadline.daysRemaining <= 7 ? 'bg-red-100' : 'bg-blue-100'}`}>
                      <Clock className={`h-5 w-5 ${deadline.daysRemaining <= 7 ? 'text-destructive' : 'text-primary'}`} />
                    </div>
                    <div>
                      <h4 className="font-medium">{deadline.frameworkName}</h4>
                      <p className="text-sm text-muted-foreground">
                        {deadline.deadlineId && t(`compliance.deadline.${deadline.deadlineId}`)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{deadline.deadlineDate.toLocaleDateString()}</p>
                    <p className={`text-sm ${deadline.daysRemaining <= 7 ? 'text-destructive' : 'text-muted-foreground'}`}>
                      {deadline.daysRemaining} {t('compliance.daysRemaining')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8">
              <CalendarIcon className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-1">{t('compliance.noUpcomingDeadlines')}</h3>
              <p className="text-sm text-muted-foreground">{t('compliance.noUpcomingDeadlinesDescription')}</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Critical Gaps */}
      <Card>
        <CardHeader>
          <CardTitle>{t('compliance.criticalGapsTitle')}</CardTitle>
          <CardDescription>{t('compliance.criticalGapsDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          {criticalGaps.length > 0 ? (
            <div className="space-y-4">
              {criticalGaps.map((gap) => (
                <div key={gap.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-full bg-red-100">
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                    </div>
                    <div>
                      <h4 className="font-medium">{gap.frameworkName}</h4>
                      <p className="text-sm text-muted-foreground">
                        {gap.description}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="destructive">
                      {t('compliance.severity.critical')}
                    </Badge>
                    {gap.remainingDays !== undefined && (
                      <p className="text-sm text-destructive mt-1">
                        {gap.remainingDays} {t('compliance.daysRemaining')}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
              <h3 className="text-lg font-medium mb-1">{t('compliance.noCriticalGapsFound')}</h3>
              <p className="text-sm text-muted-foreground">{t('compliance.noCriticalGapsDescription')}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
