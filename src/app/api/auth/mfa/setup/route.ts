import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/firebase/get-server-user";
import prisma from "@/lib/db/prisma";
import { generateSecret, generateRecoveryCode } from "../../../../../lib/auth/mfa-utils";
import { withAuth } from "@/lib/firebase/api-auth";

/**
 * API endpoint for setting up MFA with an authenticator app
 */
export const POST = withAuth(async (request: NextRequest, firebaseUser) => {
  try {

    // Parse request body
    const body = await request.json();
    const { userId } = body;

    // Verify user has permission
    if (userId !== firebaseUser.uid) {
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
      firebaseUser.email || "user@example.com",
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
});
