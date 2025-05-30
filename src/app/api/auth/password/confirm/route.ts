import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authService } from "@/lib/firebase/auth";
import { isRateLimited } from "@/lib/auth/rate-limiter";

// Schema for password reset confirmation
const confirmPasswordResetSchema = z.object({
  oobCode: z.string().min(1, "Reset token is required"),
  password: z.string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
});

/**
 * API endpoint for confirming password resets
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    
    // Validate request body
    const validationResult = confirmPasswordResetSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: "Invalid request",
          message: validationResult.error.errors[0].message
        },
        { status: 400 }
      );
    }
    
    const { oobCode, password } = validationResult.data;
    
    // Get client IP for rate limiting
    const forwardedFor = request.headers.get("x-forwarded-for");
    const clientIp = forwardedFor ? forwardedFor.split(",")[0] : "unknown";
    
    // Create a rate limit key
    const rateLimitKey = `confirm-reset:${clientIp}`;
    
    // Check if rate limited
    if (isRateLimited(rateLimitKey, "passwordReset")) {
      return NextResponse.json(
        { 
          error: "Too many attempts",
          message: "Too many password reset attempts. Please try again later.",
          retryAfter: 60 // 1 minute in seconds
        },
        { status: 429 }
      );
    }
    
    // Confirm password reset
    await authService.confirmPasswordReset(oobCode, password);
    
    // Return success response
    return NextResponse.json({
      success: true,
      message: "Password has been reset successfully",
    });
  } catch (error) {
    console.error("Password reset confirmation error:", error);
    return NextResponse.json(
      {
        error: "Failed to reset password",
        message: "There was a problem resetting your password. The link may be invalid or expired."
      },
      { status: 400 }
    );
  }
}
