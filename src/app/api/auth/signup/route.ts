import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcrypt";
import prisma from "../../../../lib/db/prisma";
import { isRateLimited, getRemainingAttempts } from "@/lib/auth/rate-limiter";
import { verifyCsrfToken } from "@/lib/auth/csrf";

export async function POST(request: NextRequest) {
  try {
    // CSRF protection
    if (!verifyCsrfToken(request)) {
      return NextResponse.json(
        { error: "Invalid or missing CSRF token" },
        { status: 403 }
      );
    }

    const { name, email, password } = await request.json();

    // Get client IP for rate limiting
    const forwardedFor = request.headers.get("x-forwarded-for");
    const clientIp = forwardedFor ? forwardedFor.split(",")[0] : "unknown";
    const rateLimitKey = `signup:${email}:${clientIp}`;

    // Check if rate limited
    if (isRateLimited(rateLimitKey, "login")) {
      return NextResponse.json(
        { error: "Too many signup attempts. Please try again later." },
        { status: 429 }
      );
    }

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
        onboardingCompleted: false,
        role: "USER",
        // Set default preferences
        preferences: {
          create: {
            theme: "light",
            emailNotifications: true,
            inAppNotifications: true,
            slackNotifications: false,
            dataSharing: false,
          },
        },
        // Create onboarding status
        onboardingStatus: {
          create: {
            status: "STARTED",
            currentStep: "ORGANIZATION",
          },
        },
      },
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      { 
        user: userWithoutPassword, 
        message: "User created successfully" 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "An error occurred while creating the user" },
      { status: 500 }
    );
  }
}
