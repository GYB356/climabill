"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  
  const errorMessages: Record<string, string> = {
    default: "An error occurred during authentication.",
    configuration: "There is a problem with the server configuration.",
    accessdenied: "You do not have permission to sign in.",
    verification: "The verification link has expired or has already been used.",
    credentials: "Invalid email or password.",
    oauthcallback: "There was a problem with the social login provider.",
    callback: "An error occurred during the authentication callback.",
    CredentialsSignin: "Invalid email or password."
  };
  
  const errorMessage = error ? (errorMessages[error] || errorMessages.default) : errorMessages.default;
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-tr from-green-50 to-blue-50 p-4">
      <div className="w-full max-w-md space-y-6 rounded-lg bg-white p-8 shadow-lg">
        <div className="text-center">
          <svg 
            className="mx-auto h-12 w-12 text-red-500" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
            />
          </svg>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">Authentication Error</h1>
          <p className="mt-2 text-gray-600">{errorMessage}</p>
        </div>
        
        <div className="space-y-4">
          <Button asChild className="w-full">
            <Link href="/auth/signin">
              Try Again
            </Link>
          </Button>
          
          <Button asChild variant="outline" className="w-full">
            <Link href="/">
              Return to Home
            </Link>
          </Button>
        </div>
        
        <div className="text-center text-sm text-gray-500">
          <p>If you continue to experience issues, please contact support.</p>
        </div>
      </div>
    </div>
  );
}
