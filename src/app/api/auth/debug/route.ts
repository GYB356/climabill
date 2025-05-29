import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/auth-config";

export async function GET() {
  const session = await getServerSession(authOptions);
  
  return NextResponse.json({
    authenticated: !!session,
    session: session,
    env: {
      nextAuthUrl: process.env.NEXTAUTH_URL,
      hasSecret: !!process.env.NEXTAUTH_SECRET,
      nodeEnv: process.env.NODE_ENV,
    }
  });
}
