
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ClimaBillLogo } from '@/components/icons';
import { Github, Menu } from 'lucide-react'; 

const APP_ROUTES_PREFIXES = [
  '/dashboard',
  '/invoices',
  '/smart-discounts',
  '/text-summarizer',
  '/invoice-item-suggester',
  '/carbon-footprint',
  '/settings',
];

export function LandingHeader() {
  const pathname = usePathname();

  const isAppRoute = APP_ROUTES_PREFIXES.some(prefix => pathname?.startsWith(prefix));

  if (isAppRoute) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <ClimaBillLogo className="h-7 text-primary" />
        </Link>
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          <Link href="/#features" className="text-muted-foreground transition-colors hover:text-foreground">
            Features
          </Link>
          <Link href="/#pricing" className="text-muted-foreground transition-colors hover:text-foreground">
            Pricing
          </Link>
          <Link href="/#contact" className="text-muted-foreground transition-colors hover:text-foreground">
            Contact
          </Link>
        </nav>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/signup">Sign Up</Link>
            </Button>
            {/* <Button variant="outline" size="icon" asChild>
              <a href="https://github.com/your-repo" target="_blank" rel="noopener noreferrer">
                <Github className="h-4 w-4" />
              </a>
            </Button> */}
          </nav>
          {/* Mobile Nav Trigger - can be implemented later */}
          {/* <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button> */}
        </div>
      </div>
    </header>
  );
}
