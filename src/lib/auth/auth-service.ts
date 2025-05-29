import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth-config";
import { prisma } from "@/lib/db";

/**
 * Authentication service for server components
 */
export class AuthService {
  /**
   * Get the current session
   */
  static async getSession() {
    return await getServerSession(authOptions);
  }

  /**
   * Get the current authenticated user with additional data
   */
  static async getCurrentUser() {
    const session = await this.getSession();
    if (!session?.user?.email) return null;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        organizations: {
          include: {
            organization: true,
          },
        },
        preferences: true,
      },
    });

    return user;
  }

  /**
   * Check if user is authenticated
   */
  static async isAuthenticated() {
    const session = await this.getSession();
    return !!session;
  }

  /**
   * Get the authenticated user ID
   */
  static async getAuthenticatedUserId() {
    const user = await this.getCurrentUser();
    return user?.id;
  }

  /**
   * Get user organization
   */
  static async getUserOrganization() {
    const user = await this.getCurrentUser();
    if (!user) return null;

    const userOrg = user.organizations[0];
    if (!userOrg) return null;

    return userOrg.organization;
  }

  /**
   * Check if user has completed onboarding
   */
  static async hasCompletedOnboarding() {
    const user = await this.getCurrentUser();
    return !!user?.onboardingCompleted;
  }

  /**
   * Check if MFA is enabled for user
   */
  static async isMfaEnabled() {
    const user = await this.getCurrentUser();
    return !!user?.mfaEnabled;
  }
}
