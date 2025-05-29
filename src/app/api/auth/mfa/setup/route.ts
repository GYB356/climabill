import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/auth-config";
import { prisma } from "@/lib/db";
import { generateSecret, generateRecoveryCode } from "@/lib/auth/mfa-utils";

/**
 * API endpoint for setting up MFA with an authenticator app
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { userId } = body;

    // Verify user has permission
    if (userId !== session.user.id) {
      return NextResponse.json(
        { error: "You do not have permission to configure MFA for this user" },
        { status: 403 }
      );
    }

    // Check if MFA is already enabled
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, mfaEnabled: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.mfaEnabled) {
      return NextResponse.json(
        { error: "MFA is already enabled for this user" },
        { status: 400 }
      );
    }

    // Generate MFA secret
    const { secret, uri, qrCode } = await generateSecret(
      session.user.email || "user@example.com",
      "ClimaBill"
    );

    // Generate recovery code
    const recoveryCode = generateRecoveryCode();

    // Store MFA data temporarily (will be finalized after verification)
    await prisma.mfaSetup.upsert({
      where: { userId },
      update: {
        secret,
        recoveryCode,
        method: "APP",
        createdAt: new Date(),
        verified: false,
      },
      create: {
        userId,
        secret,
        recoveryCode,
        method: "APP",
        createdAt: new Date(),
        verified: false,
      },
    });

    // Return MFA setup information
    return NextResponse.json({
      success: true,
      uri,
      qrCode,
      recoveryCode,
    });
  } catch (error) {
    console.error("Error setting up MFA:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}
