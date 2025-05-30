import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authService } from "@/lib/firebase/auth";
import { isRateLimited, getRemainingAttempts } from "@/lib/auth/rate-limiter";

// Schema for password reset request validation
const resetPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

/**
 * API endpoint for initiating password reset
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    
    // Validate request body
    const validationResult = resetPasswordSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }
    
    const { email } = validationResult.data;
    
    // Get client IP for rate limiting
    const forwardedFor = request.headers.get("x-forwarded-for");
    const clientIp = forwardedFor ? forwardedFor.split(",")[0] : "unknown";
    
    // Create a rate limit key that combines email and IP
    // This prevents someone from using the same IP to attack multiple email addresses
    // and also prevents someone from using multiple IPs to attack a single email
    const rateLimitKey = `password-reset:${email}:${clientIp}`;
    
    // Check if rate limited
    if (isRateLimited(rateLimitKey, "passwordReset")) {
      const remainingTime = Math.ceil(getRemainingAttempts(rateLimitKey, "passwordReset") / 60000);
      return NextResponse.json(
        { 
          error: "Too many password reset attempts",
          message: `Too many password reset attempts. Please try again later.`,
          retryAfter: remainingTime
        },
        { status: 429 }
      );
    }
    
    // Send password reset email
    await authService.resetPassword(email);
    
    // Return success response
    return NextResponse.json({
      success: true,
      message: "Password reset email sent. Check your inbox for further instructions.",
    });
  } catch (error) {
    console.error("Password reset error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}
