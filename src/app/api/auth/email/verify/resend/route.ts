import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authService } from "@/lib/firebase/auth";
import { isRateLimited } from "@/lib/auth/rate-limiter";

// Schema for email verification resend request
const resendVerificationSchema = z.object({
  email: z.string().email("Invalid email address"),
});

/**
 * API endpoint for resending email verification links
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    
    // Validate request body
    const validationResult = resendVerificationSchema.safeParse(body);
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
    
    // Create a rate limit key based on email and IP
    const rateLimitKey = `verify-email:${email}:${clientIp}`;
    
    // Check if rate limited
    if (isRateLimited(rateLimitKey, "verification")) {
      return NextResponse.json(
        { 
          error: "Too many verification attempts",
          message: "Too many verification attempts. Please try again later.",
          retryAfter: 60 // 1 minute in seconds
        },
        { status: 429 }
      );
    }
    
    // Send verification email
    await authService.sendEmailVerification(email);
    
    // Return success response
    return NextResponse.json({
      success: true,
      message: "Verification email sent successfully",
    });
  } catch (error) {
    console.error("Email verification resend error:", error);
    return NextResponse.json(
      {
        error: "Failed to send verification email",
        message: "There was a problem sending the verification email. Please try again later."
      },
      { status: 500 }
    );
  }
}
