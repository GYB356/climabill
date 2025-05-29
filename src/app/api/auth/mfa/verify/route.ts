import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/firebase/get-server-user";
import prisma from "@/lib/db/prisma";
import { verifyTOTP } from "../../../../../lib/auth/mfa-utils";
import { withAuth } from "@/lib/firebase/api-auth";

/**
 * API endpoint for verifying MFA setup
 */
export const POST = withAuth(async (request: NextRequest, firebaseUser) => {
  try {

    // Parse request body
    const body = await request.json();
    const { userId, verificationCode } = body;

    // Validate request
    if (!verificationCode) {
      return NextResponse.json(
        { error: "Verification code is required" },
        { status: 400 }
      );
    }

    // Verify user has permission
    if (userId !== firebaseUser.uid) {
      return NextResponse.json(
        { error: "You do not have permission to configure MFA for this user" },
        { status: 403 }
      );
    }

    // Get MFA setup data
    const mfaSetup = await prisma.mfaSetup.findUnique({
      where: { userId },
    });

    if (!mfaSetup) {
      return NextResponse.json(
        { error: "MFA setup not found. Please initiate setup first." },
        { status: 404 }
      );
    }

    let isVerified = false;

    // Verify based on method
    if (mfaSetup.method === "APP" && mfaSetup.secret) {
      // Verify TOTP code for authenticator app
      isVerified = verifyTOTP(mfaSetup.secret, verificationCode);
    } else if (mfaSetup.method === "SMS" && mfaSetup.verificationCode) {
      // Verify SMS code
      isVerified = mfaSetup.verificationCode === verificationCode;
    } else {
      return NextResponse.json(
        { error: "Invalid MFA method or missing setup data" },
        { status: 400 }
      );
    }

    if (!isVerified) {
      return NextResponse.json(
        { error: "Invalid verification code" },
        { status: 400 }
      );
    }

    // Mark setup as verified
    await prisma.mfaSetup.update({
      where: { userId },
      data: {
        verified: true,
        verifiedAt: new Date(),
      },
    });

    // Enable MFA for user
    await prisma.user.update({
      where: { id: userId },
      data: {
        mfaEnabled: true,
        mfaMethod: mfaSetup.method,
        mfaPhone: mfaSetup.method === "SMS" ? mfaSetup.phoneNumber : null,
        mfaSecret: mfaSetup.secret,
        mfaRecoveryCode: mfaSetup.recoveryCode,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "MFA successfully enabled",
    });
  } catch (error) {
    console.error("Error verifying MFA:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
});
