import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authService } from "@/lib/firebase/auth";
import { isRateLimited } from "@/lib/auth/rate-limiter";

// Schema for password reset token verification
const verifyTokenSchema = z.object({
  oobCode: z.string().min(1, "Reset token is required"),
});

/**
 * API endpoint for verifying password reset tokens
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    
    // Validate request body
    const validationResult = verifyTokenSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid reset token" },
        { status: 400 }
      );
    }
    
    const { oobCode } = validationResult.data;
    
    // Get client IP for rate limiting
    const forwardedFor = request.headers.get("x-forwarded-for");
    const clientIp = forwardedFor ? forwardedFor.split(",")[0] : "unknown";
    
    // Create a rate limit key
    const rateLimitKey = `verify-token:${clientIp}`;
    
    // Check if rate limited
    if (isRateLimited(rateLimitKey, "verification")) {
      return NextResponse.json(
        { 
          error: "Too many verification attempts",
          message: "Too many verification attempts. Please try again later."
        },
        { status: 429 }
      );
    }
    
    // Verify the reset token
    const email = await authService.verifyPasswordResetCode(oobCode);
    
    // Return success response with the email
    return NextResponse.json({
      success: true,
      email,
    });
  } catch (error) {
    console.error("Token verification error:", error);
    return NextResponse.json(
      {
        error: "Invalid or expired reset token",
        message: "The password reset link is invalid or has expired. Please request a new password reset link."
      },
      { status: 400 }
    );
  }
}
