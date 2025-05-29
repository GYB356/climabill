import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../../lib/auth/auth-config";
import prisma from "../../../../../lib/db/prisma";
import { generateRecoveryCode } from "../../../../../lib/auth/mfa-utils";

/**
 * API endpoint for setting up MFA with SMS
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
    const { userId, phoneNumber } = body;

    // Validate request
    if (!phoneNumber) {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 }
      );
    }

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

    // Generate a 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Generate recovery code
    const recoveryCode = generateRecoveryCode();

    // Store MFA data temporarily (will be finalized after verification)
    await prisma.mfaSetup.upsert({
      where: { userId },
      update: {
        phoneNumber,
        verificationCode,
        recoveryCode,
        method: "SMS",
        createdAt: new Date(),
        verified: false,
      },
      create: {
        userId,
        phoneNumber,
        verificationCode,
        recoveryCode,
        method: "SMS",
        createdAt: new Date(),
        verified: false,
      },
    });

    // Send SMS verification code
    // In a production environment, you would integrate with an SMS provider like Twilio
    // For development, we'll log the code and mock the SMS sending
    console.log(`[DEV] SMS verification code for ${phoneNumber}: ${verificationCode}`);

    if (process.env.NODE_ENV === "production") {
      try {
        // TODO: Integrate with your SMS provider
        // await sendSMS(phoneNumber, `Your ClimaBill verification code is: ${verificationCode}`);
      } catch (smsError) {
        console.error("Error sending SMS:", smsError);
        return NextResponse.json(
          { error: "Failed to send SMS verification code" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: "Verification code sent",
      // In development, return the code for testing
      ...(process.env.NODE_ENV !== "production" && { verificationCode }),
    });
  } catch (error) {
    console.error("Error setting up SMS MFA:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}
