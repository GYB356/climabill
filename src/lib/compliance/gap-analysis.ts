/**
 * Compliance Gap Analysis
 * 
 * Provides utilities for analyzing gaps in compliance status
 * and generating recommendations for improvement.
 */

import { 
  ComplianceFramework, 
  ComplianceRequirement,
  ComplianceFrameworkRegistry
} from './compliance-framework-registry';
import { 
  ComplianceStatus, 
  RequirementStatus,
  EvidenceDocument
} from './compliance-status-tracker';

/**
 * Gap severity levels
 */
export type GapSeverity = 'critical' | 'high' | 'medium' | 'low';

/**
 * Priority level for recommendations
 */
export type Priority = 'immediate' | 'high' | 'medium' | 'low';

/**
 * A gap in compliance
 */
export interface ComplianceGap {
  id: string;
  frameworkId: string;
  requirementId: string;
  organizationId: string;
  description: string;
  severity: GapSeverity;
  impact: string;
  deadline?: Date;
  remainingDays?: number;
  evidenceMissing: boolean;
  isBlocking: boolean;
}

/**
 * A recommendation to address a gap
 */
export interface ComplianceRecommendation {
  id: string;
  gapId: string;
  description: string;
  priority: Priority;
  estimatedEffort: 'low' | 'medium' | 'high';
  suggestedActions: string[];
  resources?: string[];
}

/**
 * Result of a gap analysis
 */
export interface GapAnalysisResult {
  organizationId: string;
  frameworkId: string;
  analysisDate: Date;
  overallCompletionPercentage: number;
  riskScore: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  gaps: ComplianceGap[];
  recommendations: ComplianceRecommendation[];
  nextDeadline?: Date;
  criticalGapsCount: number;
  highGapsCount: number;
  mediumGapsCount: number;
  lowGapsCount: number;
}

/**
 * Service for compliance gap analysis
 */
export class GapAnalysisService {
  private frameworkRegistry = ComplianceFrameworkRegistry.getInstance();
  
  /**
   * Perform a gap analysis on a compliance status
   */
  analyzeGaps(
    complianceStatus: ComplianceStatus,
    evidenceDocuments: EvidenceDocument[] = []
  ): GapAnalysisResult {
    // Get the framework
    const framework = this.frameworkRegistry.getFramework(complianceStatus.frameworkId);
    
    if (!framework) {
      throw new Error(`Framework with ID ${complianceStatus.frameworkId} not found`);
    }
    
    const gaps: ComplianceGap[] = [];
    const recommendations: ComplianceRecommendation[] = [];
    
    // Analyze each requirement
    framework.requirements.forEach(requirement => {
      const requirementStatus = complianceStatus.requirementStatuses.find(
        rs => rs.requirementId === requirement.id
      );
      
      if (!requirementStatus || requirementStatus.status !== 'completed') {
        // Calculate gap details
        const gap = this.identifyGap(
          requirement, 
          requirementStatus, 
          framework, 
          complianceStatus, 
          evidenceDocuments
        );
        
        if (gap) {
          gaps.push(gap);
          
          // Generate recommendations for this gap
          const recommendation = this.generateRecommendation(gap, requirement);
          recommendations.push(recommendation);
        }
      }
    });
    
    // Calculate overall metrics
    const criticalGaps = gaps.filter(gap => gap.severity === 'critical');
    const highGaps = gaps.filter(gap => gap.severity === 'high');
    const mediumGaps = gaps.filter(gap => gap.severity === 'medium');
    const lowGaps = gaps.filter(gap => gap.severity === 'low');
    
    // Calculate risk score based on gap severity and count
    const riskScore = this.calculateRiskScore(
      criticalGaps.length,
      highGaps.length,
      mediumGaps.length,
      lowGaps.length,
      framework.requirements.length
    );
    
    // Determine risk level
    const riskLevel = this.determineRiskLevel(riskScore);
    
    return {
      organizationId: complianceStatus.organizationId,
      frameworkId: complianceStatus.frameworkId,
      analysisDate: new Date(),
      overallCompletionPercentage: complianceStatus.completionPercentage,
      riskScore,
      riskLevel,
      gaps,
      recommendations,
      nextDeadline: complianceStatus.nextDeadline instanceof Date 
        ? complianceStatus.nextDeadline 
        : complianceStatus.nextDeadline 
          ? new Date((complianceStatus.nextDeadline as any).seconds * 1000) 
          : undefined,
      criticalGapsCount: criticalGaps.length,
      highGapsCount: highGaps.length,
      mediumGapsCount: mediumGaps.length,
      lowGapsCount: lowGaps.length
    };
  }
  
  /**
   * Identify a gap for a requirement
   */
  private identifyGap(
    requirement: ComplianceRequirement,
    requirementStatus: RequirementStatus | undefined,
    framework: ComplianceFramework,
    complianceStatus: ComplianceStatus,
    evidenceDocuments: EvidenceDocument[]
  ): ComplianceGap | null {
    // If requirement is completed or not applicable, no gap exists
    if (requirementStatus?.status === 'completed' || requirementStatus?.status === 'not-applicable') {
      return null;
    }
    
    // Calculate deadline if applicable
    let deadline: Date | undefined;
    let remainingDays: number | undefined;
    
    if (complianceStatus.nextDeadline) {
      const nextDeadline = complianceStatus.nextDeadline instanceof Date 
        ? complianceStatus.nextDeadline 
        : new Date((complianceStatus.nextDeadline as any).seconds * 1000);
      
      deadline = nextDeadline;
      remainingDays = Math.ceil((nextDeadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    }
    
    // Determine if evidence is missing
    const evidenceMissing = !requirementStatus || requirementStatus.evidenceDocumentIds.length === 0;
    
    // Determine severity based on requirement level, deadline, and evidence
    const severity = this.determineGapSeverity(
      requirement, 
      evidenceMissing, 
      remainingDays
    );
    
    // Determine if this gap is blocking other requirements
    const isBlocking = this.isBlockingRequirement(requirement, framework);
    
    return {
      id: `gap-${requirement.id}-${complianceStatus.organizationId}`,
      frameworkId: framework.id,
      requirementId: requirement.id,
      organizationId: complianceStatus.organizationId,
      description: `Missing compliance for: ${requirement.name}`,
      severity,
      impact: this.determineImpact(requirement, framework),
      deadline,
      remainingDays,
      evidenceMissing,
      isBlocking
    };
  }
  
  /**
   * Determine gap severity
   */
  private determineGapSeverity(
    requirement: ComplianceRequirement,
    evidenceMissing: boolean,
    remainingDays?: number
  ): GapSeverity {
    // Critical if mandatory with approaching deadline
    if (requirement.level === 'mandatory' && remainingDays !== undefined && remainingDays <= 7) {
      return 'critical';
    }
    
    // High if mandatory but deadline not imminent
    if (requirement.level === 'mandatory') {
      return 'high';
    }
    
    // Medium if recommended with evidence missing
    if (requirement.level === 'recommended' && evidenceMissing) {
      return 'medium';
    }
    
    // Low for optional requirements or recommended with some evidence
    return 'low';
  }
  
  /**
   * Determine the impact of a missing requirement
   */
  private determineImpact(
    requirement: ComplianceRequirement,
    framework: ComplianceFramework
  ): string {
    switch (requirement.level) {
      case 'mandatory':
        return `Non-compliance with ${framework.name} mandatory requirement may result in regulatory penalties.`;
      case 'recommended':
        return `Missing recommended practice may impact reporting quality and stakeholder trust.`;
      case 'optional':
        return `Optional requirement that would enhance reporting comprehensiveness.`;
      default:
        return 'Unknown impact';
    }
  }
  
  /**
   * Check if a requirement blocks other requirements
   */
  private isBlockingRequirement(
    requirement: ComplianceRequirement, 
    framework: ComplianceFramework
  ): boolean {
    // In a real system, this would check dependency relationships between requirements
    // For simplicity, we'll consider category-based blocking
    
    // Measurement requirements often block reporting requirements
    if (requirement.category === 'measurement') {
      const hasReportingRequirements = framework.requirements.some(
        r => r.category === 'reporting' && r.id !== requirement.id
      );
      
      if (hasReportingRequirements) {
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * Generate a recommendation for a gap
   */
  private generateRecommendation(
    gap: ComplianceGap,
    requirement: ComplianceRequirement
  ): ComplianceRecommendation {
    const priority = this.determinePriority(gap);
    const estimatedEffort = this.estimateEffort(requirement);
    const actions = this.suggestActions(gap, requirement);
    
    return {
      id: `rec-${gap.id}`,
      gapId: gap.id,
      description: `Address compliance gap in ${requirement.name}`,
      priority,
      estimatedEffort,
      suggestedActions: actions,
      resources: this.suggestResources(requirement)
    };
  }
  
  /**
   * Determine recommendation priority
   */
  private determinePriority(gap: ComplianceGap): Priority {
    if (gap.severity === 'critical') {
      return 'immediate';
    } else if (gap.severity === 'high' || gap.isBlocking) {
      return 'high';
    } else if (gap.severity === 'medium') {
      return 'medium';
    } else {
      return 'low';
    }
  }
  
  /**
   * Estimate effort required to address a requirement
   */
  private estimateEffort(requirement: ComplianceRequirement): 'low' | 'medium' | 'high' {
    // This is a simplified estimation; in reality would be more complex
    switch (requirement.category) {
      case 'disclosure':
        return 'medium'; // Disclosures often require gathering existing data
      case 'measurement':
        return 'high'; // Measurements often require new data collection
      case 'verification':
        return 'high'; // Verification often requires third-party involvement
      case 'reporting':
        return 'medium'; // Reporting requires synthesis of data
      default:
        return 'medium';
    }
  }
  
  /**
   * Suggest actions to address a gap
   */
  private suggestActions(
    gap: ComplianceGap,
    requirement: ComplianceRequirement
  ): string[] {
    const actions: string[] = [];
    
    // Evidence collection action
    if (gap.evidenceMissing) {
      actions.push(`Collect required evidence for ${requirement.name}.`);
    }
    
    // Category-specific actions
    switch (requirement.category) {
      case 'disclosure':
        actions.push(`Prepare disclosure documentation for ${requirement.name}.`);
        break;
      case 'measurement':
        actions.push(`Implement measurement methodology for ${requirement.name}.`);
        actions.push('Validate data collection process with stakeholders.');
        break;
      case 'reporting':
        actions.push(`Develop reporting template for ${requirement.name}.`);
        actions.push('Review report with legal and compliance teams.');
        break;
      case 'verification':
        actions.push(`Engage third-party verifier for ${requirement.name}.`);
        actions.push('Prepare verification documentation.');
        break;
    }
    
    // Deadline-specific actions
    if (gap.remainingDays !== undefined && gap.remainingDays <= 30) {
      actions.push(`Prioritize completion before deadline in ${gap.remainingDays} days.`);
    }
    
    // Add general action
    actions.push(`Assign responsibility for addressing ${requirement.name} to team member.`);
    
    return actions;
  }
  
  /**
   * Suggest resources for addressing a requirement
   */
  private suggestResources(requirement: ComplianceRequirement): string[] {
    // This would typically link to internal resources, templates, guidance docs
    const resources: string[] = [];
    
    if (requirement.guidance) {
      resources.push(`Framework guidance: ${requirement.guidance}`);
    }
    
    // Add general resources based on category
    switch (requirement.category) {
      case 'disclosure':
        resources.push('Disclosure best practices guide');
        resources.push('Data privacy review checklist');
        break;
      case 'measurement':
        resources.push('Measurement methodology templates');
        resources.push('Data collection forms');
        break;
      case 'reporting':
        resources.push('Reporting templates');
        resources.push('Example reports from industry peers');
        break;
      case 'verification':
        resources.push('Verification provider directory');
        resources.push('Pre-verification checklist');
        break;
    }
    
    return resources;
  }
  
  /**
   * Calculate risk score
   */
  private calculateRiskScore(
    criticalCount: number,
    highCount: number,
    mediumCount: number,
    lowCount: number,
    totalRequirements: number
  ): number {
    // Weighted score calculation
    const weightedSum = 
      (criticalCount * 100) + 
      (highCount * 70) + 
      (mediumCount * 40) + 
      (lowCount * 10);
    
    // Maximum possible weighted sum if all requirements were critical
    const maxPossibleSum = totalRequirements * 100;
    
    // Normalize to 0-100 scale
    return Math.min(100, Math.round((weightedSum / maxPossibleSum) * 100));
  }
  
  /**
   * Determine risk level from risk score
   */
  private determineRiskLevel(riskScore: number): 'low' | 'medium' | 'high' | 'critical' {
    if (riskScore >= 75) {
      return 'critical';
    } else if (riskScore >= 50) {
      return 'high';
    } else if (riskScore >= 25) {
      return 'medium';
    } else {
      return 'low';
    }
  }
}
