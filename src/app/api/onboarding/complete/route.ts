import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/firebase/get-server-user';
// Firebase auth doesn't need authOptions
import prisma from '../../../../lib/db/prisma';

/**
 * API route for completing the onboarding process
 */
export async function POST(request: NextRequest) {
  try {
    // Get user from Firebase and validate authentication
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { userId, organization, dataSources, compliance, team, preferences } = body;

    // Validate required fields
    if (!userId || !organization) {
      return NextResponse.json(
        { error: 'Missing required fields: userId and organization are required' },
        { status: 400 }
      );
    }

    // Validate user has permission
    if (userId !== session.user.id) {
      return NextResponse.json(
        { error: 'You do not have permission to complete onboarding for this user' },
        { status: 403 }
      );
    }

    // Save organization details
    const savedOrganization = await db.organization.create({
      data: {
        name: organization.name,
        industry: organization.industry,
        size: organization.size,
        location: organization.location,
        createdBy: userId,
        updatedBy: userId
      }
    });

    // Save user organization relationship
    await db.userOrganization.create({
      data: {
        userId,
        organizationId: savedOrganization.id,
        role: 'ADMIN'
      }
    });

    // Save data sources if provided
    if (dataSources && dataSources.sources && dataSources.sources.length > 0) {
      await Promise.all(dataSources.sources.map(async (sourceId: string) => {
        await db.dataSource.create({
          data: {
            sourceId,
            organizationId: savedOrganization.id,
            status: dataSources.importNow ? 'PENDING_IMPORT' : 'CONFIGURED',
            createdBy: userId,
            updatedBy: userId
          }
        });
      }));
    }

    // Save compliance frameworks if provided
    if (compliance && compliance.frameworks && compliance.frameworks.length > 0) {
      await Promise.all(compliance.frameworks.map(async (frameworkId: string) => {
        await db.complianceFramework.create({
          data: {
            frameworkId,
            organizationId: savedOrganization.id,
            reportingFrequency: compliance.reportingFrequency || 'QUARTERLY',
            createdBy: userId,
            updatedBy: userId
          }
        });
      }));
    }

    // Process team invites if provided
    if (team && team.invites && team.invites.length > 0) {
      await Promise.all(team.invites.map(async (invite: { email: string; role: string }) => {
        await db.invitation.create({
          data: {
            email: invite.email,
            role: invite.role.toUpperCase(),
            organizationId: savedOrganization.id,
            invitedBy: userId,
            status: 'PENDING'
          }
        });
      }));
    }

    // Save user preferences if provided
    if (preferences) {
      await db.userPreference.upsert({
        where: { userId },
        update: {
          emailNotifications: preferences.notifications?.email ?? true,
          inAppNotifications: preferences.notifications?.inApp ?? true,
          slackNotifications: preferences.notifications?.slack ?? false,
          dataSharing: preferences.dataSharing ?? false,
          theme: preferences.theme || 'light',
          updatedAt: new Date()
        },
        create: {
          userId,
          emailNotifications: preferences.notifications?.email ?? true,
          inAppNotifications: preferences.notifications?.inApp ?? true,
          slackNotifications: preferences.notifications?.slack ?? false,
          dataSharing: preferences.dataSharing ?? false,
          theme: preferences.theme || 'light',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
    }

    // Update user onboarding status
    await db.user.update({
      where: { id: userId },
      data: {
        onboardingCompleted: true,
        onboardingCompletedAt: new Date()
      }
    });

    // Return success response
    return NextResponse.json({
      success: true,
      organizationId: savedOrganization.id
    });
  } catch (error) {
    console.error('Error completing onboarding:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
