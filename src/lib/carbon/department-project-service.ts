import { db as firestore } from '../firebase/config';
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
  limit,
  Timestamp,
  deleteDoc
} from 'firebase/firestore';
import { Department, Project } from './models/department-project';

/**
 * Service for managing departments and projects for granular carbon tracking
 */
export class DepartmentProjectService {
  private readonly DEPARTMENT_COLLECTION = 'departments';
  private readonly PROJECT_COLLECTION = 'projects';
  
  /**
   * Create a new department
   * @param department Department data
   * @returns Created department with ID
   */
  async createDepartment(department: Omit<Department, 'id' | 'createdAt' | 'updatedAt'>): Promise<Department> {
    try {
      const now = Timestamp.now();
      
      const departmentData: Omit<Department, 'id'> = {
        ...department,
        createdAt: now,
        updatedAt: now,
      };
      
      const docRef = await addDoc(collection(firestore, this.DEPARTMENT_COLLECTION), departmentData);
      
      return {
        ...departmentData,
        id: docRef.id,
      };
    } catch (error) {
      console.error('Error creating department:', error);
      throw error;
    }
  }
  
  /**
   * Update an existing department
   * @param id Department ID
   * @param data Department data to update
   * @returns Updated department
   */
  async updateDepartment(id: string, data: Partial<Omit<Department, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Department> {
    try {
      const departmentRef = doc(firestore, this.DEPARTMENT_COLLECTION, id);
      const departmentSnap = await getDoc(departmentRef);
      
      if (!departmentSnap.exists()) {
        throw new Error(`Department with ID ${id} not found`);
      }
      
      const updateData = {
        ...data,
        updatedAt: Timestamp.now(),
      };
      
      await updateDoc(departmentRef, updateData);
      
      const updatedSnap = await getDoc(departmentRef);
      const updatedDepartment = updatedSnap.data() as Department;
      
      return {
        ...updatedDepartment,
        id: updatedSnap.id,
      };
    } catch (error) {
      console.error('Error updating department:', error);
      throw error;
    }
  }
  
  /**
   * Delete a department
   * @param id Department ID
   * @returns True if successful
   */
  async deleteDepartment(id: string): Promise<boolean> {
    try {
      // Check if department exists
      const departmentRef = doc(firestore, this.DEPARTMENT_COLLECTION, id);
      const departmentSnap = await getDoc(departmentRef);
      
      if (!departmentSnap.exists()) {
        throw new Error(`Department with ID ${id} not found`);
      }
      
      // Check if there are any projects associated with this department
      const projectsQuery = query(
        collection(firestore, this.PROJECT_COLLECTION),
        where('departmentId', '==', id)
      );
      
      const projectsSnap = await getDocs(projectsQuery);
      
      if (!projectsSnap.empty) {
        throw new Error(`Cannot delete department with ID ${id} because it has associated projects`);
      }
      
      // Delete the department
      await deleteDoc(departmentRef);
      
      return true;
    } catch (error) {
      console.error('Error deleting department:', error);
      throw error;
    }
  }
  
  /**
   * Get a department by ID
   * @param id Department ID
   * @returns Department data or null if not found
   */
  async getDepartment(id: string): Promise<Department | null> {
    try {
      const departmentRef = doc(firestore, this.DEPARTMENT_COLLECTION, id);
      const departmentSnap = await getDoc(departmentRef);
      
      if (!departmentSnap.exists()) {
        return null;
      }
      
      const departmentData = departmentSnap.data() as Department;
      
      return {
        ...departmentData,
        id: departmentSnap.id,
      };
    } catch (error) {
      console.error('Error getting department:', error);
      throw error;
    }
  }
  
  /**
   * Get all departments for an organization
   * @param organizationId Organization ID
   * @returns List of departments
   */
  async getDepartments(organizationId: string): Promise<Department[]> {
    try {
      const departmentsQuery = query(
        collection(firestore, this.DEPARTMENT_COLLECTION),
        where('organizationId', '==', organizationId),
        orderBy('name', 'asc')
      );
      
      const departmentsSnap = await getDocs(departmentsQuery);
      
      return departmentsSnap.docs.map(doc => ({
        ...(doc.data() as Department),
        id: doc.id,
      }));
    } catch (error) {
      console.error('Error getting departments:', error);
      throw error;
    }
  }
  
  /**
   * Create a new project
   * @param project Project data
   * @returns Created project with ID
   */
  async createProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    try {
      const now = Timestamp.now();
      
      // If departmentId is provided, verify it exists
      if (project.departmentId) {
        const departmentRef = doc(firestore, this.DEPARTMENT_COLLECTION, project.departmentId);
        const departmentSnap = await getDoc(departmentRef);
        
        if (!departmentSnap.exists()) {
          throw new Error(`Department with ID ${project.departmentId} not found`);
        }
      }
      
      const projectData: Omit<Project, 'id'> = {
        ...project,
        createdAt: now,
        updatedAt: now,
      };
      
      const docRef = await addDoc(collection(firestore, this.PROJECT_COLLECTION), projectData);
      
      return {
        ...projectData,
        id: docRef.id,
      };
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  }
  
  /**
   * Update an existing project
   * @param id Project ID
   * @param data Project data to update
   * @returns Updated project
   */
  async updateProject(id: string, data: Partial<Omit<Project, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Project> {
    try {
      const projectRef = doc(firestore, this.PROJECT_COLLECTION, id);
      const projectSnap = await getDoc(projectRef);
      
      if (!projectSnap.exists()) {
        throw new Error(`Project with ID ${id} not found`);
      }
      
      // If departmentId is provided, verify it exists
      if (data.departmentId) {
        const departmentRef = doc(firestore, this.DEPARTMENT_COLLECTION, data.departmentId);
        const departmentSnap = await getDoc(departmentRef);
        
        if (!departmentSnap.exists()) {
          throw new Error(`Department with ID ${data.departmentId} not found`);
        }
      }
      
      const updateData = {
        ...data,
        updatedAt: Timestamp.now(),
      };
      
      await updateDoc(projectRef, updateData);
      
      const updatedSnap = await getDoc(projectRef);
      const updatedProject = updatedSnap.data() as Project;
      
      return {
        ...updatedProject,
        id: updatedSnap.id,
      };
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  }
  
  /**
   * Delete a project
   * @param id Project ID
   * @returns True if successful
   */
  async deleteProject(id: string): Promise<boolean> {
    try {
      // Check if project exists
      const projectRef = doc(firestore, this.PROJECT_COLLECTION, id);
      const projectSnap = await getDoc(projectRef);
      
      if (!projectSnap.exists()) {
        throw new Error(`Project with ID ${id} not found`);
      }
      
      // Delete the project
      await deleteDoc(projectRef);
      
      return true;
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  }
  
  /**
   * Get a project by ID
   * @param id Project ID
   * @returns Project data or null if not found
   */
  async getProject(id: string): Promise<Project | null> {
    try {
      const projectRef = doc(firestore, this.PROJECT_COLLECTION, id);
      const projectSnap = await getDoc(projectRef);
      
      if (!projectSnap.exists()) {
        return null;
      }
      
      const projectData = projectSnap.data() as Project;
      
      return {
        ...projectData,
        id: projectSnap.id,
      };
    } catch (error) {
      console.error('Error getting project:', error);
      throw error;
    }
  }
  
  /**
   * Get all projects for an organization
   * @param organizationId Organization ID
   * @param departmentId Optional department ID to filter by
   * @param status Optional status to filter by
   * @returns List of projects
   */
  async getProjects(
    organizationId: string,
    departmentId?: string,
    status?: 'active' | 'completed' | 'archived'
  ): Promise<Project[]> {
    try {
      let projectsQuery = query(
        collection(firestore, this.PROJECT_COLLECTION),
        where('organizationId', '==', organizationId)
      );
      
      // Add department filter if provided
      if (departmentId) {
        projectsQuery = query(
          collection(firestore, this.PROJECT_COLLECTION),
          where('organizationId', '==', organizationId),
          where('departmentId', '==', departmentId)
        );
      }
      
      // Add status filter if provided
      if (status) {
        projectsQuery = query(
          collection(firestore, this.PROJECT_COLLECTION),
          where('organizationId', '==', organizationId),
          where('status', '==', status)
        );
      }
      
      // Add both filters if both are provided
      if (departmentId && status) {
        projectsQuery = query(
          collection(firestore, this.PROJECT_COLLECTION),
          where('organizationId', '==', organizationId),
          where('departmentId', '==', departmentId),
          where('status', '==', status)
        );
      }
      
      // Add ordering
      projectsQuery = query(projectsQuery, orderBy('name', 'asc'));
      
      const projectsSnap = await getDocs(projectsQuery);
      
      return projectsSnap.docs.map(doc => ({
        ...(doc.data() as Project),
        id: doc.id,
      }));
    } catch (error) {
      console.error('Error getting projects:', error);
      throw error;
    }
  }
}
