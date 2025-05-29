import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/firebase/get-server-user";

export async function GET() {
  const user = await getServerUser();
  
  return NextResponse.json({
    authenticated: !!user,
    user: user ? {
      uid: user.uid,
      email: user.email,
      name: user.name,
      picture: user.picture,
      role: user.role || user.claims?.role,
    } : null,
    env: {
      firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
      nodeEnv: process.env.NODE_ENV,
    }
  });
}
