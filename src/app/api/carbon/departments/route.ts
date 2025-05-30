import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { DepartmentProjectService } from '@/lib/carbon/department-project-service';
import { Department } from '@/lib/carbon/models/department-project';

// GET /api/carbon/departments
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { searchParams } = new URL(req.url);
    const organizationId = searchParams.get('organizationId') || session.user.id;
    
    const departmentService = new DepartmentProjectService();
    const departments = await departmentService.getDepartments(organizationId);
    
    return NextResponse.json({ departments });
  } catch (error) {
    console.error('Error fetching departments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch departments' },
      { status: 500 }
    );
  }
}

// POST /api/carbon/departments
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await req.json();
    const { name, description, organizationId } = body;
    
    if (!name) {
      return NextResponse.json(
        { error: 'Department name is required' },
        { status: 400 }
      );
    }
    
    // Use the provided organizationId or default to the user's ID
    const departmentOrganizationId = organizationId || session.user.id;
    
    const departmentService = new DepartmentProjectService();
    const department = await departmentService.createDepartment({
      name,
      description,
      organizationId: departmentOrganizationId,
    });
    
    return NextResponse.json({ department }, { status: 201 });
  } catch (error) {
    console.error('Error creating department:', error);
    return NextResponse.json(
      { error: 'Failed to create department' },
      { status: 500 }
    );
  }
}

// PUT /api/carbon/departments
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await req.json();
    const { id, name, description } = body;
    
    if (!id || !name) {
      return NextResponse.json(
        { error: 'Department ID and name are required' },
        { status: 400 }
      );
    }
    
    const departmentService = new DepartmentProjectService();
    
    // Verify the department belongs to the user's organization
    const department = await departmentService.getDepartment(id);
    
    if (!department) {
      return NextResponse.json(
        { error: 'Department not found' },
        { status: 404 }
      );
    }
    
    if (department.organizationId !== session.user.id && !session.user.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized to update this department' },
        { status: 403 }
      );
    }
    
    const updatedDepartment = await departmentService.updateDepartment(id, {
      name,
      description,
    });
    
    return NextResponse.json({ department: updatedDepartment }, { status: 200 });
  } catch (error) {
    console.error('Error updating department:', error);
    return NextResponse.json(
      { error: 'Failed to update department' },
      { status: 500 }
    );
  }
}

// DELETE /api/carbon/departments
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
        { error: 'Department ID is required' },
        { status: 400 }
      );
    }
    
    const departmentService = new DepartmentProjectService();
    
    // Verify the department belongs to the user's organization
    const department = await departmentService.getDepartment(id);
    
    if (!department) {
      return NextResponse.json(
        { error: 'Department not found' },
        { status: 404 }
      );
    }
    
    if (department.organizationId !== session.user.id && !session.user.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized to delete this department' },
        { status: 403 }
      );
    }
    
    await departmentService.deleteDepartment(id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting department:', error);
    return NextResponse.json(
      { error: 'Failed to delete department' },
      { status: 500 }
    );
  }
}
