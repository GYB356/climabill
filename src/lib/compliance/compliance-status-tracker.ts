/**
 * Compliance Status Tracker
 * 
 * Tracks the compliance status of an organization against various regulatory frameworks.
 * Manages compliance status, completion percentage, deadlines, and evidence documents.
 */

import { db } from '../firebase/config';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  Timestamp,
  serverTimestamp,
  deleteDoc
} from 'firebase/firestore';
import { ComplianceFramework, ComplianceRequirement } from './compliance-framework-registry';

/**
 * Evidence document for compliance requirements
 */
export interface EvidenceDocument {
  id: string;
  name: string;
  description?: string;
  fileUrl?: string;
  fileType?: string;
  uploadedBy: string;
  uploadedAt: Date | Timestamp;
  requirementIds: string[];
  status: 'pending-review' | 'approved' | 'rejected';
  comments?: string;
  reviewedBy?: string;
  reviewedAt?: Date | Timestamp;
}

/**
 * Status for an individual compliance requirement
 */
export interface RequirementStatus {
  requirementId: string;
  status: 'not-started' | 'in-progress' | 'completed' | 'not-applicable';
  completionPercentage: number;
  assignedTo?: string[];
  notes?: string;
  evidenceDocumentIds: string[];
  lastUpdated: Date | Timestamp;
}

/**
 * Overall compliance status for a framework
 */
export interface ComplianceStatus {
  id?: string;
  organizationId: string;
  frameworkId: string;
  status: 'not-started' | 'in-progress' | 'compliant' | 'non-compliant' | 'exempt';
  completionPercentage: number;
  startDate: Date | Timestamp;
  periodEndDate: Date | Timestamp;
  nextDeadline?: Date | Timestamp;
  nextDeadlineId?: string;
  assignedTo: string[];
  requirementStatuses: RequirementStatus[];
  notes?: string;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
  lastUpdatedBy: string;
}

/**
 * Service for tracking compliance status
 */
export class ComplianceStatusTracker {
  private readonly COMPLIANCE_STATUS_COLLECTION = 'complianceStatuses';
  private readonly EVIDENCE_DOCUMENTS_COLLECTION = 'evidenceDocuments';
  
  /**
   * Create a new compliance status
   */
  async createComplianceStatus(
    organizationId: string,
    frameworkId: string,
    periodEndDate: Date,
    assignedTo: string[] = []
  ): Promise<string> {
    try {
      // Get the framework to set up requirement statuses
      const frameworkRegistry = await import('./compliance-framework-registry');
      const registry = frameworkRegistry.ComplianceFrameworkRegistry.getInstance();
      const framework = registry.getFramework(frameworkId);
      
      if (!framework) {
        throw new Error(`Framework with ID ${frameworkId} not found`);
      }
      
      // Initialize requirement statuses
      const requirementStatuses: RequirementStatus[] = framework.requirements.map(req => ({
        requirementId: req.id,
        status: 'not-started',
        completionPercentage: 0,
        evidenceDocumentIds: [],
        lastUpdated: serverTimestamp() as Timestamp,
      }));
      
      // Create the compliance status
      const complianceStatus: Omit<ComplianceStatus, 'id'> = {
        organizationId,
        frameworkId,
        status: 'not-started',
        completionPercentage: 0,
        startDate: new Date(),
        periodEndDate,
        assignedTo,
        requirementStatuses,
        createdAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp,
        lastUpdatedBy: 'system', // Default to system
      };
      
      // Calculate the next deadline if applicable
      this.calculateNextDeadline(complianceStatus, framework);
      
      // Add to Firestore
      const docRef = await addDoc(
        collection(db, this.COMPLIANCE_STATUS_COLLECTION),
        complianceStatus
      );
      
      return docRef.id;
    } catch (error) {
      console.error('Error creating compliance status:', error);
      throw error;
    }
  }
  
  /**
   * Calculate the next deadline for a compliance status
   */
  private calculateNextDeadline(
    complianceStatus: Omit<ComplianceStatus, 'id'>, 
    framework: ComplianceFramework
  ): void {
    if (framework.deadlines.length === 0) {
      return;
    }
    
    const periodEndDate = complianceStatus.periodEndDate instanceof Date 
      ? complianceStatus.periodEndDate 
      : (complianceStatus.periodEndDate as Timestamp).toDate();
    
    // Find the next deadline by sorting deadlines by their relative days
    const sortedDeadlines = [...framework.deadlines].sort((a, b) => a.relativeDays - b.relativeDays);
    
    // Find the closest deadline that hasn't passed yet
    const now = new Date();
    let nextDeadline: Date | null = null;
    let nextDeadlineId: string | undefined;
    
    for (const deadline of sortedDeadlines) {
      // Calculate deadline date by adding relative days to period end
      const deadlineDate = new Date(periodEndDate);
      deadlineDate.setDate(deadlineDate.getDate() + deadline.relativeDays);
      
      if (deadlineDate > now) {
        nextDeadline = deadlineDate;
        nextDeadlineId = deadline.id;
        break;
      }
    }
    
    if (nextDeadline) {
      complianceStatus.nextDeadline = nextDeadline;
      complianceStatus.nextDeadlineId = nextDeadlineId;
    }
  }
  
  /**
   * Get a compliance status by ID
   */
  async getComplianceStatus(id: string): Promise<ComplianceStatus | null> {
    try {
      const docRef = doc(db, this.COMPLIANCE_STATUS_COLLECTION, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as ComplianceStatus;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting compliance status:', error);
      throw error;
    }
  }
  
  /**
   * Get all compliance statuses for an organization
   */
  async getComplianceStatusesByOrganization(organizationId: string): Promise<ComplianceStatus[]> {
    try {
      const q = query(
        collection(db, this.COMPLIANCE_STATUS_COLLECTION),
        where('organizationId', '==', organizationId)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as ComplianceStatus);
    } catch (error) {
      console.error('Error getting compliance statuses by organization:', error);
      throw error;
    }
  }
  
  /**
   * Get compliance statuses for an organization by framework
   */
  async getComplianceStatusByFramework(
    organizationId: string,
    frameworkId: string
  ): Promise<ComplianceStatus[]> {
    try {
      const q = query(
        collection(db, this.COMPLIANCE_STATUS_COLLECTION),
        where('organizationId', '==', organizationId),
        where('frameworkId', '==', frameworkId)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as ComplianceStatus);
    } catch (error) {
      console.error('Error getting compliance status by framework:', error);
      throw error;
    }
  }
  
  /**
   * Update a requirement status
   */
  async updateRequirementStatus(
    complianceStatusId: string,
    requirementId: string,
    update: Partial<RequirementStatus>,
    updatedBy: string
  ): Promise<void> {
    try {
      // Get current compliance status
      const complianceStatus = await this.getComplianceStatus(complianceStatusId);
      
      if (!complianceStatus) {
        throw new Error(`Compliance status with ID ${complianceStatusId} not found`);
      }
      
      // Find the requirement status to update
      const requirementIndex = complianceStatus.requirementStatuses.findIndex(
        rs => rs.requirementId === requirementId
      );
      
      if (requirementIndex === -1) {
        throw new Error(`Requirement with ID ${requirementId} not found in compliance status`);
      }
      
      // Update the requirement status
      const updatedRequirementStatuses = [...complianceStatus.requirementStatuses];
      updatedRequirementStatuses[requirementIndex] = {
        ...updatedRequirementStatuses[requirementIndex],
        ...update,
        lastUpdated: serverTimestamp() as Timestamp,
      };
      
      // Calculate new overall completion percentage
      const totalRequirements = updatedRequirementStatuses.length;
      const completedRequirements = updatedRequirementStatuses.filter(
        rs => rs.status === 'completed' || rs.status === 'not-applicable'
      ).length;
      const inProgressRequirements = updatedRequirementStatuses.filter(
        rs => rs.status === 'in-progress'
      );
      
      // Calculate progress including partial completion of in-progress items
      const inProgressPercentage = inProgressRequirements.reduce(
        (sum, req) => sum + req.completionPercentage, 
        0
      ) / (totalRequirements * 100);
      
      const completionPercentage = Math.round(
        ((completedRequirements / totalRequirements) + inProgressPercentage) * 100
      );
      
      // Determine overall status
      let overallStatus: ComplianceStatus['status'] = 'not-started';
      
      if (completionPercentage === 100) {
        overallStatus = 'compliant';
      } else if (completionPercentage > 0) {
        overallStatus = 'in-progress';
      }
      
      // Update the document
      const docRef = doc(db, this.COMPLIANCE_STATUS_COLLECTION, complianceStatusId);
      await updateDoc(docRef, {
        requirementStatuses: updatedRequirementStatuses,
        completionPercentage,
        status: overallStatus,
        updatedAt: serverTimestamp(),
        lastUpdatedBy: updatedBy,
      });
    } catch (error) {
      console.error('Error updating requirement status:', error);
      throw error;
    }
  }
  
  /**
   * Add an evidence document
   */
  async addEvidenceDocument(
    organizationId: string,
    document: Omit<EvidenceDocument, 'id' | 'uploadedAt' | 'status'>
  ): Promise<string> {
    try {
      // Create the evidence document
      const evidenceDoc: Omit<EvidenceDocument, 'id'> = {
        ...document,
        uploadedAt: serverTimestamp() as Timestamp,
        status: 'pending-review',
      };
      
      // Add to Firestore
      const docRef = await addDoc(
        collection(db, this.EVIDENCE_DOCUMENTS_COLLECTION),
        evidenceDoc
      );
      
      // Update the requirement statuses to include this document
      for (const requirementId of document.requirementIds) {
        // Find compliance statuses that include this requirement
        const q = query(
          collection(db, this.COMPLIANCE_STATUS_COLLECTION),
          where('organizationId', '==', organizationId)
        );
        
        const querySnapshot = await getDocs(q);
        
        for (const doc of querySnapshot.docs) {
          const complianceStatus = { id: doc.id, ...doc.data() } as ComplianceStatus;
          const requirementIndex = complianceStatus.requirementStatuses.findIndex(
            rs => rs.requirementId === requirementId
          );
          
          if (requirementIndex !== -1) {
            // Update the requirement status to include this document
            await this.updateRequirementStatus(
              complianceStatus.id!,
              requirementId,
              {
                evidenceDocumentIds: [
                  ...complianceStatus.requirementStatuses[requirementIndex].evidenceDocumentIds,
                  docRef.id
                ],
                status: 'in-progress',
                completionPercentage: 50, // Default to 50% when evidence is added
              },
              document.uploadedBy
            );
          }
        }
      }
      
      return docRef.id;
    } catch (error) {
      console.error('Error adding evidence document:', error);
      throw error;
    }
  }
  
  /**
   * Get an evidence document by ID
   */
  async getEvidenceDocument(id: string): Promise<EvidenceDocument | null> {
    try {
      const docRef = doc(db, this.EVIDENCE_DOCUMENTS_COLLECTION, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as EvidenceDocument;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting evidence document:', error);
      throw error;
    }
  }
  
  /**
   * Update an evidence document's status
   */
  async updateEvidenceDocumentStatus(
    id: string,
    status: EvidenceDocument['status'],
    reviewedBy: string,
    comments?: string
  ): Promise<void> {
    try {
      const docRef = doc(db, this.EVIDENCE_DOCUMENTS_COLLECTION, id);
      await updateDoc(docRef, {
        status,
        reviewedBy,
        reviewedAt: serverTimestamp(),
        comments: comments || '',
      });
      
      // If document is approved, update the requirement completion
      if (status === 'approved') {
        const evidenceDoc = await this.getEvidenceDocument(id);
        
        if (evidenceDoc) {
          // Find and update associated requirement statuses
          for (const requirementId of evidenceDoc.requirementIds) {
            // Find compliance statuses that include this requirement
            const q = query(collection(db, this.COMPLIANCE_STATUS_COLLECTION));
            const querySnapshot = await getDocs(q);
            
            for (const doc of querySnapshot.docs) {
              const complianceStatus = { id: doc.id, ...doc.data() } as ComplianceStatus;
              const requirementIndex = complianceStatus.requirementStatuses.findIndex(
                rs => rs.requirementId === requirementId
              );
              
              if (requirementIndex !== -1 && 
                  complianceStatus.requirementStatuses[requirementIndex].evidenceDocumentIds.includes(id)) {
                // Update the requirement status to completed
                await this.updateRequirementStatus(
                  complianceStatus.id!,
                  requirementId,
                  {
                    status: 'completed',
                    completionPercentage: 100,
                  },
                  reviewedBy
                );
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error updating evidence document status:', error);
      throw error;
    }
  }
  
  /**
   * Delete a compliance status
   */
  async deleteComplianceStatus(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, this.COMPLIANCE_STATUS_COLLECTION, id));
    } catch (error) {
      console.error('Error deleting compliance status:', error);
      throw error;
    }
  }
}
