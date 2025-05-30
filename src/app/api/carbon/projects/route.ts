import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { DepartmentProjectService } from '@/lib/carbon/department-project-service';
import { Project } from '@/lib/carbon/models/department-project';

// GET /api/carbon/projects
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { searchParams } = new URL(req.url);
    const organizationId = searchParams.get('organizationId') || session.user.id;
    const departmentId = searchParams.get('departmentId') || undefined;
    
    const projectService = new DepartmentProjectService();
    const projects = await projectService.getProjects(organizationId, departmentId);
    
    return NextResponse.json({ projects });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

// POST /api/carbon/projects
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await req.json();
    const { name, description, organizationId, departmentId } = body;
    
    if (!name) {
      return NextResponse.json(
        { error: 'Project name is required' },
        { status: 400 }
      );
    }
    
    // Use the provided organizationId or default to the user's ID
    const projectOrganizationId = organizationId || session.user.id;
    
    // If departmentId is provided, verify it belongs to the organization
    if (departmentId) {
      const departmentService = new DepartmentProjectService();
      const department = await departmentService.getDepartment(departmentId);
      
      if (!department) {
        return NextResponse.json(
          { error: 'Department not found' },
          { status: 404 }
        );
      }
      
      if (department.organizationId !== projectOrganizationId) {
        return NextResponse.json(
          { error: 'Department does not belong to the specified organization' },
          { status: 400 }
        );
      }
    }
    
    const projectService = new DepartmentProjectService();
    const project = await projectService.createProject({
      name,
      description,
      organizationId: projectOrganizationId,
      departmentId,
    });
    
    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}

// PUT /api/carbon/projects
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await req.json();
    const { id, name, description, departmentId } = body;
    
    if (!id || !name) {
      return NextResponse.json(
        { error: 'Project ID and name are required' },
        { status: 400 }
      );
    }
    
    const projectService = new DepartmentProjectService();
    
    // Verify the project belongs to the user's organization
    const project = await projectService.getProject(id);
    
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }
    
    if (project.organizationId !== session.user.id && !session.user.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized to update this project' },
        { status: 403 }
      );
    }
    
    // If departmentId is changing, verify it belongs to the same organization
    if (departmentId && departmentId !== project.departmentId) {
      const departmentService = new DepartmentProjectService();
      const department = await departmentService.getDepartment(departmentId);
      
      if (!department) {
        return NextResponse.json(
          { error: 'Department not found' },
          { status: 404 }
        );
      }
      
      if (department.organizationId !== project.organizationId) {
        return NextResponse.json(
          { error: 'Department does not belong to the project organization' },
          { status: 400 }
        );
      }
    }
    
    const updatedProject = await projectService.updateProject(id, {
      name,
      description,
      departmentId,
    });
    
    return NextResponse.json({ project: updatedProject });
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    );
  }
}

// DELETE /api/carbon/projects
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }
    
    const projectService = new DepartmentProjectService();
    
    // Verify the project belongs to the user's organization
    const project = await projectService.getProject(id);
    
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }
    
    if (project.organizationId !== session.user.id && !session.user.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized to delete this project' },
        { status: 403 }
      );
    }
    
    await projectService.deleteProject(id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    );
  }
}
