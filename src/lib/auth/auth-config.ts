import { PrismaAdapter } from "@auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { compare } from "bcrypt";
import { prisma } from "@/lib/db";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt", // Use JWT for better performance
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          return null;
        }

        const isPasswordValid = await compare(credentials.password, user.password);

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    // Add other providers here
  ],
  callbacks: {
    async session({ session, token }) {
      // Ensure user ID is included in session
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      
      // Add user roles to session
      if (token.role) {
        session.user.role = token.role as string;
      }
      
      // Add user organization to session
      if (token.organizationId) {
        session.user.organizationId = token.organizationId as string;
      }
      
      return session;
    },
    async jwt({ token, user, account }) {
      // Add user data to JWT token
      if (user) {
        token.id = user.id;
        token.role = user.role;
        
        // Fetch user's organization
        const userOrg = await prisma.userOrganization.findFirst({
          where: { userId: user.id },
          select: { organizationId: true }
        });
        
        if (userOrg) {
          token.organizationId = userOrg.organizationId;
        }
      }
      
      return token;
    },
    // Ensure redirect works properly
    async redirect({ url, baseUrl }) {
      // Always allow relative URLs
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }
      // Allow same-origin absolute URLs
      else if (new URL(url).origin === baseUrl) {
        return url;
      }
      // Default to dashboard for other cases
      return `${baseUrl}/dashboard`;
    }
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  debug: process.env.NODE_ENV === "development",
};
