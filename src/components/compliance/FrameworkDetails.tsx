"use client";

import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { ComplianceFramework, ComplianceRequirement } from '@/lib/compliance/compliance-framework-registry';
import { ComplianceStatus, RequirementStatus } from '@/lib/compliance/compliance-status-tracker';
import { useAccessibility } from '@/lib/a11y/accessibility-context';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Search, 
  Filter, 
  Calendar, 
  FileText, 
  Users, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Info
} from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Timeline,
  TimelineItem,
  TimelineConnector,
  TimelineHeader,
  TimelineIcon,
  TimelineContent,
} from "@/components/ui/timeline";

interface FrameworkDetailsProps {
  framework: ComplianceFramework;
  complianceStatus: ComplianceStatus;
}

/**
 * Framework Details component
 * Displays detailed information about a specific compliance framework
 */
export default function FrameworkDetails({ 
  framework, 
  complianceStatus 
}: FrameworkDetailsProps) {
  const { t } = useTranslation('compliance');
  const { announce } = useAccessibility();
  
  // State for filtering and sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('requirements');
  const [expandedRequirements, setExpandedRequirements] = useState<string[]>([]);
  
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  // Handle category filter change
  const handleCategoryFilterChange = (value: string) => {
    setCategoryFilter(value);
  };
  
  // Handle status filter change
  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
  };
  
  // Toggle requirement expansion
  const toggleRequirementExpansion = (requirementId: string) => {
    if (expandedRequirements.includes(requirementId)) {
      setExpandedRequirements(expandedRequirements.filter(id => id !== requirementId));
    } else {
      setExpandedRequirements([...expandedRequirements, requirementId]);
    }
  };
  
  // Get unique categories from requirements
  const categories = ['all', ...new Set(framework.requirements.map(req => req.category))];
  
  // Filter requirements based on search and filters
  const filteredRequirements = framework.requirements.filter(requirement => {
    // Search filter
    const matchesSearch = searchQuery === '' || 
      requirement.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      requirement.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Category filter
    const matchesCategory = categoryFilter === 'all' || requirement.category === categoryFilter;
    
    // Status filter
    const requirementStatus = complianceStatus.requirementStatuses.find(
      rs => rs.requirementId === requirement.id
    );
    const matchesStatus = statusFilter === 'all' || 
      (requirementStatus && requirementStatus.status === statusFilter);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });
  
  // Get requirement status by id
  const getRequirementStatus = (requirementId: string): RequirementStatus | undefined => {
    return complianceStatus.requirementStatuses.find(rs => rs.requirementId === requirementId);
  };
  
  // Get status badge variant
  const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'in-progress':
        return 'secondary';
      case 'not-started':
        return 'outline';
      case 'not-applicable':
        return 'outline';
      default:
        return 'outline';
    }
  };
  
  // Create timeline events from deadlines
  const timelineEvents = framework.deadlines.map(deadline => {
    const deadlineDate = new Date(complianceStatus.periodEndDate instanceof Date 
      ? complianceStatus.periodEndDate 
      : (complianceStatus.periodEndDate as any).seconds * 1000);
    
    // Add relative days to period end date
    deadlineDate.setDate(deadlineDate.getDate() + deadline.relativeDays);
    
    // Check if deadline is past, current, or future
    const now = new Date();
    const isPast = deadlineDate < now;
    const isCurrent = deadline.id === complianceStatus.nextDeadlineId;
    
    return {
      id: deadline.id,
      name: deadline.name,
      description: deadline.description,
      date: deadlineDate,
      relativeDays: deadline.relativeDays,
      category: deadline.category,
      isPast,
      isCurrent
    };
  }).sort((a, b) => a.date.getTime() - b.date.getTime());
  
  return (
    <div className="space-y-6">
      {/* Framework Information */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <CardTitle>{framework.name} ({framework.version})</CardTitle>
              <CardDescription>{framework.description}</CardDescription>
            </div>
            {framework.website && (
              <Button variant="outline" size="sm" onClick={() => window.open(framework.website, '_blank')}>
                <ExternalLink className="mr-2 h-4 w-4" />
                {t('compliance.visitWebsite')}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h3 className="text-sm font-medium mb-1">{t('compliance.category')}</h3>
              <Badge variant="outline">{framework.category}</Badge>
            </div>
            <div>
              <h3 className="text-sm font-medium mb-1">{t('compliance.region')}</h3>
              <div className="flex flex-wrap gap-1">
                {framework.region.map(region => (
                  <Badge key={region} variant="outline">{region}</Badge>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium mb-1">{t('compliance.effectiveDate')}</h3>
              <p className="text-sm">{new Date(framework.effectiveDate).toLocaleDateString()}</p>
            </div>
          </div>
          
          <div className="mt-4">
            <h3 className="text-sm font-medium mb-1">{t('compliance.applicableSectors')}</h3>
            <div className="flex flex-wrap gap-1">
              {framework.applicableSectors.map(sector => (
                <Badge key={sector} variant="outline">{sector}</Badge>
              ))}
            </div>
          </div>
          
          {framework.referenceDocuments && framework.referenceDocuments.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-1">{t('compliance.referenceDocuments')}</h3>
              <ul className="list-disc list-inside text-sm">
                {framework.referenceDocuments.map((doc, index) => (
                  <li key={index}>{doc}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Tabs for Requirements and Timeline */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="requirements">{t('compliance.requirements')}</TabsTrigger>
          <TabsTrigger value="timeline">{t('compliance.timeline')}</TabsTrigger>
        </TabsList>
        
        {/* Requirements Tab */}
        <TabsContent value="requirements">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <CardTitle>{t('compliance.requirementsList')}</CardTitle>
                <div className="flex flex-col md:flex-row gap-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={t('compliance.searchRequirements')}
                      className="pl-8"
                      value={searchQuery}
                      onChange={handleSearchChange}
                    />
                  </div>
                  <Select value={categoryFilter} onValueChange={handleCategoryFilterChange}>
                    <SelectTrigger className="w-[180px]">
                      <Filter className="mr-2 h-4 w-4" />
                      <SelectValue placeholder={t('compliance.filterByCategory')} />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category === 'all' 
                            ? t('compliance.allCategories') 
                            : t(`compliance.category.${category}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                    <SelectTrigger className="w-[180px]">
                      <Filter className="mr-2 h-4 w-4" />
                      <SelectValue placeholder={t('compliance.filterByStatus')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('compliance.allStatuses')}</SelectItem>
                      <SelectItem value="completed">{t('compliance.status.completed')}</SelectItem>
                      <SelectItem value="in-progress">{t('compliance.status.in-progress')}</SelectItem>
                      <SelectItem value="not-started">{t('compliance.status.not-started')}</SelectItem>
                      <SelectItem value="not-applicable">{t('compliance.status.not-applicable')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredRequirements.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Search className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-1">{t('compliance.noRequirementsFound')}</h3>
                  <p className="text-sm text-muted-foreground">{t('compliance.noRequirementsFoundDescription')}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredRequirements.map(requirement => {
                    const status = getRequirementStatus(requirement.id);
                    const isExpanded = expandedRequirements.includes(requirement.id);
                    
                    return (
                      <Collapsible 
                        key={requirement.id} 
                        open={isExpanded} 
                        onOpenChange={() => toggleRequirementExpansion(requirement.id)}
                        className="border rounded-md"
                      >
                        <div className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{t(`compliance.category.${requirement.category}`)}</Badge>
                              <Badge variant="outline">{t(`compliance.level.${requirement.level}`)}</Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              {status && (
                                <Badge variant={getStatusBadgeVariant(status.status)}>
                                  {t(`compliance.status.${status.status}`)}
                                </Badge>
                              )}
                              <CollapsibleTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  {isExpanded ? (
                                    <ChevronUp className="h-4 w-4" />
                                  ) : (
                                    <ChevronDown className="h-4 w-4" />
                                  )}
                                </Button>
                              </CollapsibleTrigger>
                            </div>
                          </div>
                          
                          <h3 className="text-lg font-medium mt-2">{requirement.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{requirement.description}</p>
                          
                          {status && (
                            <div className="mt-2">
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">{t('compliance.completion')}</span>
                                <span className="text-sm">{status.completionPercentage}%</span>
                              </div>
                              <Progress value={status.completionPercentage} className="h-2 mt-1" />
                            </div>
                          )}
                        </div>
                        
                        <CollapsibleContent>
                          <div className="px-4 pb-4 pt-0 border-t mt-2">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                              <div>
                                <h4 className="text-sm font-medium mb-2">{t('compliance.evidenceTypes')}</h4>
                                <ul className="list-disc list-inside text-sm">
                                  {requirement.evidenceTypes.map((evidence, index) => (
                                    <li key={index}>{t(`compliance.evidence.${evidence}`)}</li>
                                  ))}
                                </ul>
                              </div>
                              
                              {requirement.guidance && (
                                <div>
                                  <h4 className="text-sm font-medium mb-2">{t('compliance.guidance')}</h4>
                                  <p className="text-sm">{requirement.guidance}</p>
                                </div>
                              )}
                            </div>
                            
                            {requirement.validationCriteria && requirement.validationCriteria.length > 0 && (
                              <div className="mt-4">
                                <h4 className="text-sm font-medium mb-2">{t('compliance.validationCriteria')}</h4>
                                <ul className="list-disc list-inside text-sm">
                                  {requirement.validationCriteria.map((criteria, index) => (
                                    <li key={index}>{criteria}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {status && status.notes && (
                              <div className="mt-4">
                                <h4 className="text-sm font-medium mb-2">{t('compliance.notes')}</h4>
                                <p className="text-sm">{status.notes}</p>
                              </div>
                            )}
                            
                            {status && status.evidenceDocumentIds.length > 0 && (
                              <div className="mt-4">
                                <h4 className="text-sm font-medium mb-2">{t('compliance.evidenceDocuments')}</h4>
                                <div className="flex flex-wrap gap-2">
                                  {status.evidenceDocumentIds.map(docId => (
                                    <Badge key={docId} variant="secondary">
                                      <FileText className="mr-1 h-3 w-3" />
                                      {docId}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {status && status.assignedTo && status.assignedTo.length > 0 && (
                              <div className="mt-4">
                                <h4 className="text-sm font-medium mb-2">{t('compliance.assignedTo')}</h4>
                                <div className="flex flex-wrap gap-2">
                                  {status.assignedTo.map(assignee => (
                                    <Badge key={assignee} variant="outline">
                                      <Users className="mr-1 h-3 w-3" />
                                      {assignee}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    );
                  })}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-muted-foreground">
                {t('compliance.showingRequirements', { 
                  count: filteredRequirements.length,
                  total: framework.requirements.length
                })}
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Timeline Tab */}
        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle>{t('compliance.complianceTimeline')}</CardTitle>
              <CardDescription>{t('compliance.complianceTimelineDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              {timelineEvents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-1">{t('compliance.noTimelineEvents')}</h3>
                  <p className="text-sm text-muted-foreground">{t('compliance.noTimelineEventsDescription')}</p>
                </div>
              ) : (
                <Timeline>
                  {timelineEvents.map((event, index) => (
                    <TimelineItem key={event.id}>
                      {index < timelineEvents.length - 1 && <TimelineConnector />}
                      <TimelineHeader>
                        <TimelineIcon>
                          {event.isPast ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : event.isCurrent ? (
                            <Clock className="h-4 w-4 text-amber-500" />
                          ) : (
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                          )}
                        </TimelineIcon>
                        <div className="flex flex-col">
                          <span className="font-medium">{event.name}</span>
                          <span className="text-sm text-muted-foreground">
                            {event.date.toLocaleDateString()}
                          </span>
                        </div>
                      </TimelineHeader>
                      <TimelineContent>
                        <div className="space-y-2">
                          <p className="text-sm">{event.description}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {t(`compliance.deadlineCategory.${event.category}`)}
                            </Badge>
                            {!event.isPast && (
                              <Badge 
                                variant={event.isCurrent ? "secondary" : "outline"}
                                className={event.isCurrent && Math.ceil((event.date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) <= 7 ? "bg-amber-100 text-amber-800" : ""}
                              >
                                {Math.ceil((event.date.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} {t('compliance.daysRemaining')}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TimelineContent>
                    </TimelineItem>
                  ))}
                </Timeline>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
