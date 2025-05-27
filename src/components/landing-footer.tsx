
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ClimaBillLogo } from '@/components/icons';

const APP_ROUTES_PREFIXES = [
  '/dashboard',
  '/invoices',
  '/smart-discounts',
  '/text-summarizer',
  '/invoice-item-suggester',
  '/carbon-footprint',
  '/settings',
  // Note: '/developer/api-docs' is considered a public page, not an app route
];

export function LandingFooter() {
  const pathname = usePathname();

  const isAppRoute = APP_ROUTES_PREFIXES.some(prefix => pathname?.startsWith(prefix));

  if (isAppRoute) {
    return null;
  }

  return (
    <footer className="border-t border-border/40 bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <ClimaBillLogo className="h-8 text-primary" />
            </Link>
            <p className="text-sm text-muted-foreground">
              Empowering businesses with AI-driven billing and sustainable practices.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/#features" className="text-muted-foreground hover:text-primary">Features</Link></li>
              <li><Link href="/#pricing" className="text-muted-foreground hover:text-primary">Pricing</Link></li>
              <li><Link href="/#contact" className="text-muted-foreground hover:text-primary">Contact</Link></li>
              <li><Link href="/login" className="text-muted-foreground hover:text-primary">Login</Link></li>
              <li><Link href="/signup" className="text-muted-foreground hover:text-primary">Sign Up</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-3">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/#privacy" className="text-muted-foreground hover:text-primary">Privacy Policy</Link></li>
              <li><Link href="/#terms" className="text-muted-foreground hover:text-primary">Terms of Service</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-3">Developer</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/developer/api-docs" className="text-muted-foreground hover:text-primary">API Documentation</Link></li>
              {/* Add more developer links here if needed */}
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-border/40 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} ClimaBill. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
