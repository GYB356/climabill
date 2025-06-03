"use client";

import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { ComplianceFramework } from '@/lib/compliance/compliance-framework-registry';
import { GapAnalysisResult, ComplianceGap, ComplianceRecommendation } from '@/lib/compliance/gap-analysis';
import { useAccessibility } from '@/lib/a11y/accessibility-context';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  FileText,
  AlertCircle,
  ShieldAlert,
  ArrowRight,
  Filter,
  Lightbulb,
  BarChart4
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  ResponsiveContainer,
  Treemap,
  Tooltip as RechartsTooltip,
} from "recharts";

interface GapAnalysisViewProps {
  gapAnalysis: GapAnalysisResult;
  framework: ComplianceFramework;
}

/**
 * Gap Analysis View component
 * Visualizes compliance gaps and provides recommendations
 */
export default function GapAnalysisView({ 
  gapAnalysis, 
  framework 
}: GapAnalysisViewProps) {
  const { t } = useTranslation('compliance');
  const { announce } = useAccessibility();
  
  // State for filtering
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('gaps');
  
  // Handle severity filter change
  const handleSeverityFilterChange = (value: string) => {
    setSeverityFilter(value);
    announce(t('compliance.filteredBySeverity', { severity: value }), false);
  };
  
  // Filter gaps based on severity
  const filteredGaps = gapAnalysis.gaps.filter(gap => {
    return severityFilter === 'all' || gap.severity === severityFilter;
  });
  
  // Get recommendations for filtered gaps
  const filteredRecommendations = gapAnalysis.recommendations.filter(rec => {
    const relatedGap = filteredGaps.find(gap => gap.id === rec.gapId);
    return !!relatedGap;
  });
  
  // Prepare data for treemap visualization
  const prepareTreemapData = () => {
    // Group gaps by category
    const categoryCounts: Record<string, { 
      name: string; 
      size: number; 
      color: string;
      children: { name: string; size: number; color: string; gapId: string }[]
    }> = {};
    
    framework.requirements.forEach(req => {
      if (!categoryCounts[req.category]) {
        categoryCounts[req.category] = {
          name: t(`compliance.category.${req.category}`),
          size: 0,
          color: getCategoryColor(req.category),
          children: []
        };
      }
    });
    
    // Add gaps to their categories
    gapAnalysis.gaps.forEach(gap => {
      const requirement = framework.requirements.find(req => req.id === gap.requirementId);
      if (requirement) {
        const category = requirement.category;
        const severityValue = getSeverityValue(gap.severity);
        
        categoryCounts[category].size += severityValue;
        categoryCounts[category].children.push({
          name: requirement.name,
          size: severityValue,
          color: getSeverityColor(gap.severity),
          gapId: gap.id
        });
      }
    });
    
    // Convert to array format for treemap
    return Object.values(categoryCounts).filter(cat => cat.size > 0);
  };
  
  // Get color for severity
  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'critical':
        return '#ef4444';
      case 'high':
        return '#f97316';
      case 'medium':
        return '#eab308';
      case 'low':
        return '#22c55e';
      default:
        return '#6b7280';
    }
  };
  
  // Get color for category
  const getCategoryColor = (category: string): string => {
    switch (category) {
      case 'disclosure':
        return '#3b82f6';
      case 'measurement':
        return '#8b5cf6';
      case 'reporting':
        return '#ec4899';
      case 'verification':
        return '#14b8a6';
      default:
        return '#6b7280';
    }
  };
  
  // Get numeric value for severity (for sizing)
  const getSeverityValue = (severity: string): number => {
    switch (severity) {
      case 'critical':
        return 100;
      case 'high':
        return 70;
      case 'medium':
        return 40;
      case 'low':
        return 20;
      default:
        return 10;
    }
  };
  
  // Get badge variant based on severity
  const getSeverityBadgeVariant = (severity: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (severity) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'default';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'outline';
    }
  };
  
  // Get badge variant based on priority
  const getPriorityBadgeVariant = (priority: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (priority) {
      case 'immediate':
        return 'destructive';
      case 'high':
        return 'default';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'outline';
    }
  };
  
  // Custom treemap tooltip
  const CustomTreemapTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-2 border rounded shadow-sm">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            {data.gapId ? t('compliance.requirement') : t('compliance.category')}
          </p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Risk Score Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>{t('compliance.riskScore')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">{t('compliance.score')}</span>
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
        
        {/* Critical Gaps Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>{t('compliance.criticalGaps')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 flex items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-7 w-7 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{gapAnalysis.criticalGapsCount}</p>
                <p className="text-sm text-muted-foreground">{t('compliance.criticalIssues')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* High Gaps Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>{t('compliance.highGaps')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 flex items-center justify-center rounded-full bg-orange-100">
                <AlertCircle className="h-7 w-7 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{gapAnalysis.highGapsCount}</p>
                <p className="text-sm text-muted-foreground">{t('compliance.highIssues')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Medium/Low Gaps Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>{t('compliance.otherGaps')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 flex items-center justify-center rounded-full bg-blue-100">
                <ShieldAlert className="h-7 w-7 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{gapAnalysis.mediumGapsCount + gapAnalysis.lowGapsCount}</p>
                <p className="text-sm text-muted-foreground">{t('compliance.otherIssues')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Gap Visualization */}
      <Card>
        <CardHeader>
          <CardTitle>{t('compliance.gapVisualization')}</CardTitle>
          <CardDescription>{t('compliance.gapVisualizationDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <Treemap
                data={prepareTreemapData()}
                dataKey="size"
                nameKey="name"
                stroke="#fff"
                fill="#8884d8"
                content={({ root, depth, x, y, width, height, index, payload, colors, rank, name }) => {
                  const data = root.children[index];
                  return (
                    <g>
                      <rect
                        x={x}
                        y={y}
                        width={width}
                        height={height}
                        style={{
                          fill: data.color,
                          stroke: '#fff',
                          strokeWidth: 2 / (depth + 1e-10),
                          strokeOpacity: 1 / (depth + 1e-10),
                        }}
                      />
                      {width > 50 && height > 30 && (
                        <text
                          x={x + width / 2}
                          y={y + height / 2}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fill="#fff"
                          fontSize={12}
                          fontWeight="bold"
                        >
                          {name}
                        </text>
                      )}
                    </g>
                  );
                }}
              >
                <RechartsTooltip content={<CustomTreemapTooltip />} />
              </Treemap>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 mt-4 justify-center">
            <Badge variant="outline" className="border-red-500 text-red-500">
              {t('compliance.severity.critical')}
            </Badge>
            <Badge variant="outline" className="border-orange-500 text-orange-500">
              {t('compliance.severity.high')}
            </Badge>
            <Badge variant="outline" className="border-yellow-500 text-yellow-500">
              {t('compliance.severity.medium')}
            </Badge>
            <Badge variant="outline" className="border-green-500 text-green-500">
              {t('compliance.severity.low')}
            </Badge>
          </div>
        </CardContent>
      </Card>
      
      {/* Tabs for Gaps and Recommendations */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="gaps">{t('compliance.gaps')}</TabsTrigger>
            <TabsTrigger value="recommendations">{t('compliance.recommendations')}</TabsTrigger>
          </TabsList>
          
          <Select value={severityFilter} onValueChange={handleSeverityFilterChange}>
            <SelectTrigger className="w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder={t('compliance.filterBySeverity')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('compliance.allSeverities')}</SelectItem>
              <SelectItem value="critical">{t('compliance.severity.critical')}</SelectItem>
              <SelectItem value="high">{t('compliance.severity.high')}</SelectItem>
              <SelectItem value="medium">{t('compliance.severity.medium')}</SelectItem>
              <SelectItem value="low">{t('compliance.severity.low')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Gaps Tab */}
        <TabsContent value="gaps">
          <Card>
            <CardHeader>
              <CardTitle>{t('compliance.complianceGaps')}</CardTitle>
              <CardDescription>{t('compliance.complianceGapsDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredGaps.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                  <h3 className="text-lg font-medium mb-1">{t('compliance.noGapsFound')}</h3>
                  <p className="text-sm text-muted-foreground">{t('compliance.noGapsFoundDescription')}</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('compliance.severity')}</TableHead>
                      <TableHead>{t('compliance.description')}</TableHead>
                      <TableHead>{t('compliance.deadline')}</TableHead>
                      <TableHead>{t('compliance.impact')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredGaps.map(gap => {
                      const requirement = framework.requirements.find(req => req.id === gap.requirementId);
                      
                      return (
                        <TableRow key={gap.id}>
                          <TableCell>
                            <Badge variant={getSeverityBadgeVariant(gap.severity)}>
                              {t(`compliance.severity.${gap.severity}`)}
                            </Badge>
                            {gap.isBlocking && (
                              <Badge variant="outline" className="ml-2">
                                {t('compliance.blocking')}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{gap.description}</div>
                            <div className="text-sm text-muted-foreground">
                              {requirement?.category && t(`compliance.category.${requirement.category}`)}
                            </div>
                          </TableCell>
                          <TableCell>
                            {gap.deadline ? (
                              <div>
                                <div>{gap.deadline.toLocaleDateString()}</div>
                                {gap.remainingDays !== undefined && (
                                  <div className={`text-sm ${gap.remainingDays <= 7 ? 'text-destructive' : 'text-muted-foreground'}`}>
                                    {gap.remainingDays} {t('compliance.daysRemaining')}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">{t('compliance.noDeadline')}</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <HoverCard>
                              <HoverCardTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  {t('compliance.viewImpact')}
                                </Button>
                              </HoverCardTrigger>
                              <HoverCardContent className="w-80">
                                <div className="space-y-2">
                                  <h4 className="font-medium">{t('compliance.impact')}</h4>
                                  <p className="text-sm">{gap.impact}</p>
                                </div>
                              </HoverCardContent>
                            </HoverCard>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
            <CardFooter>
              <div className="text-sm text-muted-foreground">
                {t('compliance.showingGaps', { 
                  count: filteredGaps.length,
                  total: gapAnalysis.gaps.length
                })}
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Recommendations Tab */}
        <TabsContent value="recommendations">
          <Card>
            <CardHeader>
              <CardTitle>{t('compliance.complianceRecommendations')}</CardTitle>
              <CardDescription>{t('compliance.complianceRecommendationsDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredRecommendations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Lightbulb className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-1">{t('compliance.noRecommendationsFound')}</h3>
                  <p className="text-sm text-muted-foreground">{t('compliance.noRecommendationsFoundDescription')}</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredRecommendations.map(recommendation => {
                    const relatedGap = gapAnalysis.gaps.find(gap => gap.id === recommendation.gapId);
                    
                    return (
                      <div key={recommendation.id} className="border rounded-lg p-4">
                        <div className="flex flex-col md:flex-row justify-between md:items-center gap-2 mb-4">
                          <div>
                            <h3 className="text-lg font-medium">{recommendation.description}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant={getPriorityBadgeVariant(recommendation.priority)}>
                                {t(`compliance.priority.${recommendation.priority}`)}
                              </Badge>
                              <Badge variant="outline">
                                {t(`compliance.effort.${recommendation.estimatedEffort}`)}
                              </Badge>
                              {relatedGap && (
                                <Badge variant={getSeverityBadgeVariant(relatedGap.severity)}>
                                  {t(`compliance.severity.${relatedGap.severity}`)}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-sm font-medium mb-2">{t('compliance.suggestedActions')}</h4>
                            <ul className="space-y-2">
                              {recommendation.suggestedActions.map((action, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <ArrowRight className="h-4 w-4 mt-1 text-muted-foreground" />
                                  <span className="text-sm">{action}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          {recommendation.resources && recommendation.resources.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium mb-2">{t('compliance.resources')}</h4>
                              <ul className="space-y-2">
                                {recommendation.resources.map((resource, index) => (
                                  <li key={index} className="flex items-start gap-2">
                                    <FileText className="h-4 w-4 mt-1 text-muted-foreground" />
                                    <span className="text-sm">{resource}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <div className="text-sm text-muted-foreground">
                {t('compliance.showingRecommendations', { 
                  count: filteredRecommendations.length,
                  total: gapAnalysis.recommendations.length
                })}
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
