import { db as firestore } from '../firebase/config';
import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  Timestamp,
  limit
} from 'firebase/firestore';
import { SustainabilityReport, CarbonAccountingStandard, StandardCompliance } from './models/department-project';
import { CarbonTrackingService } from './carbon-tracking-service';
import { CarbonGoalsService } from './carbon-goals-service';

/**
 * Service for generating sustainability reports and managing compliance with carbon accounting standards
 */
export class SustainabilityReportingService {
  private carbonTrackingService: CarbonTrackingService;
  private carbonGoalsService: CarbonGoalsService;
  private readonly REPORTS_COLLECTION = 'sustainabilityReports';
  private readonly STANDARDS_COLLECTION = 'standardCompliance';
  
  constructor() {
    this.carbonTrackingService = new CarbonTrackingService();
    this.carbonGoalsService = new CarbonGoalsService();
  }
  
  /**
   * Generate a sustainability report for an organization
   * @param organizationId Organization ID
   * @param reportType Report type
   * @param startDate Start date of the reporting period
   * @param endDate End date of the reporting period
   * @param departmentId Optional department ID for department-specific report
   * @param projectId Optional project ID for project-specific report
   * @returns Generated report
   */
  async generateReport(
    organizationId: string,
    reportType: 'monthly' | 'quarterly' | 'annual' | 'custom',
    startDate: Date,
    endDate: Date,
    departmentId?: string,
    projectId?: string
  ): Promise<SustainabilityReport> {
    try {
      // Get carbon usage for the period
      const carbonUsage = await this.carbonTrackingService.getCarbonUsageForPeriod(
        '', // Not used for organization-specific query
        startDate,
        endDate,
        organizationId,
        departmentId,
        projectId
      );
      
      if (!carbonUsage) {
        throw new Error('No carbon usage data found for the specified period');
      }
      
      // Get previous period data for comparison
      const previousPeriodDuration = endDate.getTime() - startDate.getTime();
      const previousPeriodEndDate = new Date(startDate.getTime() - 1); // 1 ms before start date
      const previousPeriodStartDate = new Date(previousPeriodEndDate.getTime() - previousPeriodDuration);
      
      const previousCarbonUsage = await this.carbonTrackingService.getCarbonUsageForPeriod(
        '', // Not used for organization-specific query
        previousPeriodStartDate,
        previousPeriodEndDate,
        organizationId,
        departmentId,
        projectId
      );
      
      // Calculate reduction from previous period
      let reductionFromPreviousPeriod = 0;
      let reductionPercentage = 0;
      
      if (previousCarbonUsage) {
        reductionFromPreviousPeriod = Math.max(0, previousCarbonUsage.totalCarbonInKg - carbonUsage.totalCarbonInKg);
        reductionPercentage = previousCarbonUsage.totalCarbonInKg > 0
          ? (reductionFromPreviousPeriod / previousCarbonUsage.totalCarbonInKg) * 100
          : 0;
      }
      
      // Get standards compliance
      const standardsCompliance = await this.getStandardsCompliance(organizationId);
      
      // Create report name based on type and period
      const reportName = this.generateReportName(reportType, startDate, endDate, departmentId, projectId);
      
      // Create report
      const report: Omit<SustainabilityReport, 'id'> = {
        organizationId,
        departmentId,
        projectId,
        reportType,
        name: reportName,
        period: {
          startDate: Timestamp.fromDate(startDate),
          endDate: Timestamp.fromDate(endDate),
        },
        totalCarbonInKg: carbonUsage.totalCarbonInKg,
        offsetCarbonInKg: carbonUsage.offsetCarbonInKg,
        remainingCarbonInKg: carbonUsage.remainingCarbonInKg,
        offsetPercentage: carbonUsage.totalCarbonInKg > 0
          ? (carbonUsage.offsetCarbonInKg / carbonUsage.totalCarbonInKg) * 100
          : 0,
        reductionFromPreviousPeriod,
        reductionPercentage,
        standards: standardsCompliance.map(standard => ({
          name: standard.standard,
          compliant: standard.compliant,
          details: standard.compliant 
            ? `Verified by ${standard.verificationBody || 'internal assessment'}`
            : 'Not compliant',
        })),
        generatedAt: Timestamp.now(),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };
      
      // Save report to Firestore
      const docRef = await addDoc(collection(firestore, this.REPORTS_COLLECTION), report);
      
      // Generate PDF report and update with URL
      const reportUrl = await this.generatePdfReport({
        ...report,
        id: docRef.id,
      });
      
      // Return the complete report
      return {
        ...report,
        id: docRef.id,
        reportUrl,
      };
    } catch (error) {
      console.error('Error generating sustainability report:', error);
      throw error;
    }
  }
  
  /**
   * Get a sustainability report by ID
   * @param reportId Report ID
   * @returns Report data or null if not found
   */
  async getReport(reportId: string): Promise<SustainabilityReport | null> {
    try {
      const reportRef = doc(firestore, this.REPORTS_COLLECTION, reportId);
      const reportSnap = await getDoc(reportRef);
      
      if (!reportSnap.exists()) {
        return null;
      }
      
      const reportData = reportSnap.data() as SustainabilityReport;
      
      return {
        ...reportData,
        id: reportSnap.id,
      };
    } catch (error) {
      console.error('Error getting sustainability report:', error);
      throw error;
    }
  }
  
  /**
   * Get all sustainability reports for an organization
   * @param organizationId Organization ID
   * @param reportType Optional report type to filter by
   * @param departmentId Optional department ID to filter by
   * @param projectId Optional project ID to filter by
   * @param limit Maximum number of reports to return
   * @returns List of sustainability reports
   */
  async getReports(
    organizationId: string,
    reportType?: 'monthly' | 'quarterly' | 'annual' | 'custom',
    departmentId?: string,
    projectId?: string,
    maxResults = 10
  ): Promise<SustainabilityReport[]> {
    try {
      let reportsQuery = query(
        collection(firestore, this.REPORTS_COLLECTION),
        where('organizationId', '==', organizationId),
        orderBy('generatedAt', 'desc'),
        limit(maxResults)
      );
      
      // Add report type filter if provided
      if (reportType) {
        reportsQuery = query(
          collection(firestore, this.REPORTS_COLLECTION),
          where('organizationId', '==', organizationId),
          where('reportType', '==', reportType),
          orderBy('generatedAt', 'desc'),
          limit(maxResults)
        );
      }
      
      // Add department filter if provided
      if (departmentId) {
        reportsQuery = query(
          collection(firestore, this.REPORTS_COLLECTION),
          where('organizationId', '==', organizationId),
          where('departmentId', '==', departmentId),
          orderBy('generatedAt', 'desc'),
          limit(maxResults)
        );
      }
      
      // Add project filter if provided
      if (projectId) {
        reportsQuery = query(
          collection(firestore, this.REPORTS_COLLECTION),
          where('organizationId', '==', organizationId),
          where('projectId', '==', projectId),
          orderBy('generatedAt', 'desc'),
          limit(maxResults)
        );
      }
      
      const reportsSnap = await getDocs(reportsQuery);
      
      return reportsSnap.docs.map(doc => ({
        ...(doc.data() as SustainabilityReport),
        id: doc.id,
      }));
    } catch (error) {
      console.error('Error getting sustainability reports:', error);
      throw error;
    }
  }
  
  /**
   * Set compliance status for a carbon accounting standard
   * @param organizationId Organization ID
   * @param standard Carbon accounting standard
   * @param compliant Whether the organization is compliant with the standard
   * @param verificationDetails Optional verification details
   * @returns Updated compliance status
   */
  async setStandardCompliance(
    organizationId: string,
    standard: CarbonAccountingStandard,
    compliant: boolean,
    verificationDetails?: {
      verificationBody?: string;
      verificationDate?: Date;
      nextVerificationDate?: Date;
      certificateUrl?: string;
      notes?: string;
    }
  ): Promise<StandardCompliance> {
    try {
      // Check if compliance record already exists
      const existingCompliance = await this.getStandardCompliance(organizationId, standard);
      
      const now = Timestamp.now();
      
      // Create or update compliance record
      const complianceData: Omit<StandardCompliance, 'id'> = {
        organizationId,
        standard,
        compliant,
        lastVerificationDate: verificationDetails?.verificationDate 
          ? Timestamp.fromDate(verificationDetails.verificationDate) 
          : now,
        nextVerificationDate: verificationDetails?.nextVerificationDate 
          ? Timestamp.fromDate(verificationDetails.nextVerificationDate) 
          : undefined,
        verificationBody: verificationDetails?.verificationBody,
        certificateUrl: verificationDetails?.certificateUrl,
        notes: verificationDetails?.notes,
        createdAt: existingCompliance ? existingCompliance.createdAt : now,
        updatedAt: now,
      };
      
      let complianceId: string;
      
      if (existingCompliance) {
        // Update existing record
        const complianceRef = doc(firestore, this.STANDARDS_COLLECTION, existingCompliance.id!);
        await complianceRef.update(complianceData);
        complianceId = existingCompliance.id!;
      } else {
        // Create new record
        const docRef = await addDoc(collection(firestore, this.STANDARDS_COLLECTION), complianceData);
        complianceId = docRef.id;
      }
      
      return {
        ...complianceData,
        id: complianceId,
      };
    } catch (error) {
      console.error('Error setting standard compliance:', error);
      throw error;
    }
  }
  
  /**
   * Get compliance status for a carbon accounting standard
   * @param organizationId Organization ID
   * @param standard Optional specific standard to get compliance for
   * @returns Compliance status or list of compliance statuses
   */
  async getStandardsCompliance(
    organizationId: string,
    standard?: CarbonAccountingStandard
  ): Promise<StandardCompliance[]> {
    try {
      let complianceQuery = query(
        collection(firestore, this.STANDARDS_COLLECTION),
        where('organizationId', '==', organizationId)
      );
      
      // Add standard filter if provided
      if (standard) {
        complianceQuery = query(
          collection(firestore, this.STANDARDS_COLLECTION),
          where('organizationId', '==', organizationId),
          where('standard', '==', standard)
        );
      }
      
      const complianceSnap = await getDocs(complianceQuery);
      
      return complianceSnap.docs.map(doc => ({
        ...(doc.data() as StandardCompliance),
        id: doc.id,
      }));
    } catch (error) {
      console.error('Error getting standard compliance:', error);
      throw error;
    }
  }
  
  /**
   * Generate a PDF report for a sustainability report
   * @param report Sustainability report data
   * @returns URL to the generated PDF
   */
  private async generatePdfReport(report: SustainabilityReport): Promise<string> {
    try {
      // This is a placeholder for actual PDF generation logic
      // In a real implementation, this would use a PDF generation library
      // and upload the PDF to a storage service
      
      // For now, we'll just return a mock URL
      return `https://storage.climabill.com/reports/${report.id}.pdf`;
    } catch (error) {
      console.error('Error generating PDF report:', error);
      throw error;
    }
  }
  
  /**
   * Generate a report name based on type and period
   * @param reportType Report type
   * @param startDate Start date
   * @param endDate End date
   * @param departmentId Optional department ID
   * @param projectId Optional project ID
   * @returns Report name
   */
  private generateReportName(
    reportType: 'monthly' | 'quarterly' | 'annual' | 'custom',
    startDate: Date,
    endDate: Date,
    departmentId?: string,
    projectId?: string
  ): string {
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    };
    
    let scope = 'Organization';
    
    if (departmentId) {
      scope = 'Department';
    }
    
    if (projectId) {
      scope = 'Project';
    }
    
    switch (reportType) {
      case 'monthly':
        return `${scope} Monthly Sustainability Report - ${startDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
      
      case 'quarterly':
        const quarter = Math.floor(startDate.getMonth() / 3) + 1;
        return `${scope} Q${quarter} Sustainability Report - ${startDate.getFullYear()}`;
      
      case 'annual':
        return `${scope} Annual Sustainability Report - ${startDate.getFullYear()}`;
      
      case 'custom':
        return `${scope} Sustainability Report - ${formatDate(startDate)} to ${formatDate(endDate)}`;
      
      default:
        return `${scope} Sustainability Report - ${formatDate(startDate)} to ${formatDate(endDate)}`;
    }
  }
}
