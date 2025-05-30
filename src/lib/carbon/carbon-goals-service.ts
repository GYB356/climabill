import { firestore } from '../firebase/config';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  Timestamp,
  DocumentReference,
  DocumentData
} from 'firebase/firestore';
import { CarbonReductionGoal } from './models/department-project';
import { CarbonTrackingService } from './carbon-tracking-service';

/**
 * Service for managing carbon reduction goals and tracking progress
 */
export class CarbonGoalsService {
  private carbonTrackingService: CarbonTrackingService;
  private readonly GOALS_COLLECTION = 'carbonReductionGoals';
  
  constructor() {
    this.carbonTrackingService = new CarbonTrackingService();
  }
  
  /**
   * Create a new carbon reduction goal
   * @param goal Goal data
   * @returns Created goal with ID
   */
  async createGoal(goal: Omit<CarbonReductionGoal, 'id' | 'createdAt' | 'updatedAt'>): Promise<CarbonReductionGoal> {
    try {
      const now = Timestamp.now();
      
      // Validate target reduction percentage
      if (goal.targetReductionPercentage < 0 || goal.targetReductionPercentage > 100) {
        throw new Error('Target reduction percentage must be between 0 and 100');
      }
      
      // Ensure target carbon is less than baseline carbon
      if (goal.targetCarbonInKg > goal.baselineCarbonInKg) {
        throw new Error('Target carbon must be less than baseline carbon');
      }
      
      // Ensure target date is in the future
      const targetDate = goal.targetDate instanceof Timestamp 
        ? goal.targetDate.toDate() 
        : goal.targetDate;
      
      if (targetDate < new Date()) {
        throw new Error('Target date must be in the future');
      }
      
      const goalData: Omit<CarbonReductionGoal, 'id'> = {
        ...goal,
        status: 'active',
        createdAt: now,
        updatedAt: now,
      };
      
      const docRef = await addDoc(collection(firestore, this.GOALS_COLLECTION), goalData);
      
      return {
        ...goalData,
        id: docRef.id,
      };
    } catch (error) {
      console.error('Error creating carbon reduction goal:', error);
      throw error;
    }
  }
  
  /**
   * Update an existing carbon reduction goal
   * @param id Goal ID
   * @param data Goal data to update
   * @returns Updated goal
   */
  async updateGoal(id: string, data: Partial<Omit<CarbonReductionGoal, 'id' | 'createdAt' | 'updatedAt'>>): Promise<CarbonReductionGoal> {
    try {
      const goalRef = doc(firestore, this.GOALS_COLLECTION, id);
      const goalSnap = await getDoc(goalRef);
      
      if (!goalSnap.exists()) {
        throw new Error(`Carbon reduction goal with ID ${id} not found`);
      }
      
      // Validate target reduction percentage if provided
      if (data.targetReductionPercentage !== undefined && 
          (data.targetReductionPercentage < 0 || data.targetReductionPercentage > 100)) {
        throw new Error('Target reduction percentage must be between 0 and 100');
      }
      
      // Ensure target date is in the future if provided
      if (data.targetDate) {
        const targetDate = data.targetDate instanceof Timestamp 
          ? data.targetDate.toDate() 
          : data.targetDate;
        
        if (targetDate < new Date()) {
          throw new Error('Target date must be in the future');
        }
      }
      
      const updateData = {
        ...data,
        updatedAt: Timestamp.now(),
      };
      
      await updateDoc(goalRef, updateData);
      
      const updatedSnap = await getDoc(goalRef);
      const updatedGoal = updatedSnap.data() as CarbonReductionGoal;
      
      return {
        ...updatedGoal,
        id: updatedSnap.id,
      };
    } catch (error) {
      console.error('Error updating carbon reduction goal:', error);
      throw error;
    }
  }
  
  /**
   * Get a carbon reduction goal by ID
   * @param id Goal ID
   * @returns Goal data or null if not found
   */
  async getGoal(id: string): Promise<CarbonReductionGoal | null> {
    try {
      const goalRef = doc(firestore, this.GOALS_COLLECTION, id);
      const goalSnap = await getDoc(goalRef);
      
      if (!goalSnap.exists()) {
        return null;
      }
      
      const goalData = goalSnap.data() as CarbonReductionGoal;
      
      return {
        ...goalData,
        id: goalSnap.id,
      };
    } catch (error) {
      console.error('Error getting carbon reduction goal:', error);
      throw error;
    }
  }
  
  /**
   * Get all carbon reduction goals for an organization
   * @param organizationId Organization ID
   * @param departmentId Optional department ID to filter by
   * @param projectId Optional project ID to filter by
   * @param status Optional status to filter by
   * @returns List of carbon reduction goals
   */
  async getGoals(
    organizationId: string,
    departmentId?: string,
    projectId?: string,
    status?: 'active' | 'achieved' | 'missed' | 'archived'
  ): Promise<CarbonReductionGoal[]> {
    try {
      let goalsQuery = query(
        collection(firestore, this.GOALS_COLLECTION),
        where('organizationId', '==', organizationId)
      );
      
      // Add department filter if provided
      if (departmentId) {
        goalsQuery = query(
          collection(firestore, this.GOALS_COLLECTION),
          where('organizationId', '==', organizationId),
          where('departmentId', '==', departmentId)
        );
      }
      
      // Add project filter if provided
      if (projectId) {
        goalsQuery = query(
          collection(firestore, this.GOALS_COLLECTION),
          where('organizationId', '==', organizationId),
          where('projectId', '==', projectId)
        );
      }
      
      // Add status filter if provided
      if (status) {
        goalsQuery = query(
          collection(firestore, this.GOALS_COLLECTION),
          where('organizationId', '==', organizationId),
          where('status', '==', status)
        );
      }
      
      // Add ordering
      goalsQuery = query(goalsQuery, orderBy('targetDate', 'asc'));
      
      const goalsSnap = await getDocs(goalsQuery);
      
      return goalsSnap.docs.map(doc => ({
        ...(doc.data() as CarbonReductionGoal),
        id: doc.id,
      }));
    } catch (error) {
      console.error('Error getting carbon reduction goals:', error);
      throw error;
    }
  }
  
  /**
   * Check and update goal progress
   * @param goalId Goal ID
   * @returns Updated goal with current progress
   */
  async updateGoalProgress(goalId: string): Promise<{
    goal: CarbonReductionGoal;
    currentCarbonInKg: number;
    progressPercentage: number;
    isAchieved: boolean;
  }> {
    try {
      // Get the goal
      const goal = await this.getGoal(goalId);
      
      if (!goal) {
        throw new Error(`Carbon reduction goal with ID ${goalId} not found`);
      }
      
      // Skip if goal is not active
      if (goal.status !== 'active') {
        return {
          goal,
          currentCarbonInKg: 0,
          progressPercentage: 0,
          isAchieved: goal.status === 'achieved',
        };
      }
      
      // Get current carbon footprint
      const now = new Date();
      const startDate = goal.startDate instanceof Timestamp 
        ? goal.startDate.toDate() 
        : goal.startDate;
      
      let currentCarbonInKg = 0;
      
      // Get carbon footprint based on scope (organization, department, or project)
      if (goal.projectId) {
        // Project-specific carbon footprint
        const usage = await this.carbonTrackingService.getCarbonUsageForPeriod(
          '', // Not used for project-specific query
          startDate,
          now,
          goal.organizationId,
          goal.departmentId,
          goal.projectId
        );
        
        currentCarbonInKg = usage ? usage.totalCarbonInKg : 0;
      } else if (goal.departmentId) {
        // Department-specific carbon footprint
        const usage = await this.carbonTrackingService.getCarbonUsageForPeriod(
          '', // Not used for department-specific query
          startDate,
          now,
          goal.organizationId,
          goal.departmentId
        );
        
        currentCarbonInKg = usage ? usage.totalCarbonInKg : 0;
      } else {
        // Organization-wide carbon footprint
        const summary = await this.carbonTrackingService.getCarbonFootprintSummary(
          '', // Not used for organization-specific query
          goal.organizationId
        );
        
        currentCarbonInKg = summary.totalCarbonInKg;
      }
      
      // Calculate progress
      const targetReduction = goal.baselineCarbonInKg - goal.targetCarbonInKg;
      const currentReduction = Math.max(0, goal.baselineCarbonInKg - currentCarbonInKg);
      const progressPercentage = targetReduction > 0 
        ? Math.min(100, (currentReduction / targetReduction) * 100)
        : 0;
      
      // Check if goal is achieved
      const isAchieved = currentCarbonInKg <= goal.targetCarbonInKg;
      
      // Check if goal is missed (past target date and not achieved)
      const targetDate = goal.targetDate instanceof Timestamp 
        ? goal.targetDate.toDate() 
        : goal.targetDate;
      
      const isMissed = !isAchieved && targetDate < now;
      
      // Update goal status if needed
      let updatedGoal = goal;
      
      if (isAchieved && goal.status !== 'achieved') {
        updatedGoal = await this.updateGoal(goalId, { 
          status: 'achieved' 
        });
      } else if (isMissed && goal.status !== 'missed') {
        updatedGoal = await this.updateGoal(goalId, { 
          status: 'missed' 
        });
      }
      
      // Update milestone status if applicable
      if (goal.milestones && goal.milestones.length > 0) {
        const updatedMilestones = goal.milestones.map(milestone => {
          const milestoneDate = milestone.targetDate instanceof Timestamp 
            ? milestone.targetDate.toDate() 
            : milestone.targetDate;
          
          // If milestone is not achieved yet and current carbon is below milestone target
          if (!milestone.achieved && currentCarbonInKg <= milestone.targetCarbonInKg) {
            return {
              ...milestone,
              achieved: true,
              achievedDate: Timestamp.now(),
            };
          }
          
          return milestone;
        });
        
        // Update goal with updated milestones if any changed
        const milestonesChanged = updatedMilestones.some((milestone, index) => 
          milestone.achieved !== goal.milestones![index].achieved
        );
        
        if (milestonesChanged) {
          updatedGoal = await this.updateGoal(goalId, { 
            milestones: updatedMilestones 
          });
        }
      }
      
      return {
        goal: updatedGoal,
        currentCarbonInKg,
        progressPercentage,
        isAchieved,
      };
    } catch (error) {
      console.error('Error updating goal progress:', error);
      throw error;
    }
  }
  
  /**
   * Add a milestone to a goal
   * @param goalId Goal ID
   * @param milestone Milestone data
   * @returns Updated goal
   */
  async addMilestone(
    goalId: string,
    milestone: {
      name: string;
      targetDate: Date | Timestamp;
      targetCarbonInKg: number;
    }
  ): Promise<CarbonReductionGoal> {
    try {
      const goal = await this.getGoal(goalId);
      
      if (!goal) {
        throw new Error(`Carbon reduction goal with ID ${goalId} not found`);
      }
      
      // Validate milestone target date
      const milestoneDate = milestone.targetDate instanceof Timestamp 
        ? milestone.targetDate.toDate() 
        : milestone.targetDate;
      
      const goalStartDate = goal.startDate instanceof Timestamp 
        ? goal.startDate.toDate() 
        : goal.startDate;
      
      const goalTargetDate = goal.targetDate instanceof Timestamp 
        ? goal.targetDate.toDate() 
        : goal.targetDate;
      
      if (milestoneDate < goalStartDate || milestoneDate > goalTargetDate) {
        throw new Error('Milestone target date must be between goal start date and target date');
      }
      
      // Validate milestone target carbon
      if (milestone.targetCarbonInKg < goal.targetCarbonInKg || 
          milestone.targetCarbonInKg > goal.baselineCarbonInKg) {
        throw new Error('Milestone target carbon must be between goal baseline carbon and target carbon');
      }
      
      // Add milestone to goal
      const milestones = goal.milestones || [];
      
      const newMilestone = {
        ...milestone,
        achieved: false,
      };
      
      const updatedMilestones = [...milestones, newMilestone];
      
      // Sort milestones by target date
      updatedMilestones.sort((a, b) => {
        const dateA = a.targetDate instanceof Timestamp ? a.targetDate.toDate() : a.targetDate;
        const dateB = b.targetDate instanceof Timestamp ? b.targetDate.toDate() : b.targetDate;
        return dateA.getTime() - dateB.getTime();
      });
      
      // Update goal with new milestone
      return this.updateGoal(goalId, { milestones: updatedMilestones });
    } catch (error) {
      console.error('Error adding milestone to goal:', error);
      throw error;
    }
  }
}
