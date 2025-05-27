
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Sparkles,
  Leaf,
  Settings as SettingsIcon,
  Menu,
  NotebookText,
  Lightbulb, // Added new icon for suggester
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ClimaBillLogo } from "@/components/icons";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";


const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/invoices", label: "Invoices", icon: FileText },
  { href: "/smart-discounts", label: "Smart Discounts", icon: Sparkles },
  { href: "/text-summarizer", label: "Text Summarizer", icon: NotebookText },
  { href: "/invoice-item-suggester", label: "Item Suggester", icon: Lightbulb }, // New item
  { href: "/carbon-footprint", label: "Carbon Footprint", icon: Leaf },
  { href: "/settings", label: "Settings", icon: SettingsIcon },
];

export function AppNavigation() {
  const pathname = usePathname();

  const renderNavLinks = (isMobile = false) => (
    <nav className={cn("flex flex-col gap-2 px-4", isMobile ? "mt-6" : "mt-8")}>
      {navItems.map((item) => {
        const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
        const linkContent = (
          <>
            <item.icon className={cn("h-5 w-5", isActive ? "text-sidebar-primary" : "text-sidebar-foreground/80 group-hover:text-sidebar-accent-foreground")} />
            <span className={cn(isMobile ? "text-base" : "text-sm", isActive ? "font-semibold text-sidebar-primary" : "group-hover:text-sidebar-accent-foreground")}>
              {item.label}
            </span>
          </>
        );

        if (!isMobile) {
          return (
            <TooltipProvider key={item.href} delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      "group flex items-center gap-3 rounded-md p-2 transition-colors",
                      isActive
                        ? "bg-sidebar-primary/10 text-sidebar-primary"
                        : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    )}
                  >
                    {linkContent}
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-card text-card-foreground">
                  <p>{item.label}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "group flex items-center gap-3 rounded-md p-3 transition-colors",
              isActive
                ? "bg-primary/10 text-primary" // Adjusted mobile active style for consistency
                : "hover:bg-accent/10 hover:text-accent-foreground"
            )}
          >
            {linkContent}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border fixed inset-y-0">
        <div className="flex items-center h-16 px-6 border-b border-sidebar-border">
          <ClimaBillLogo className="h-8 text-sidebar-primary-foreground" />
        </div>
        {renderNavLinks()}
      </aside>

      {/* Mobile Header with Sheet Navigation */}
      <header className="md:hidden sticky top-0 z-50 flex items-center justify-between h-16 px-4 border-b bg-background">
        <Link href="/dashboard">
          <ClimaBillLogo className="h-7 text-primary" />
        </Link>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle navigation</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 bg-background p-0"> {/* Changed from bg-sidebar to bg-background for mobile consistency */}
            <SheetHeader className="p-4 border-b"> {/* Ensure border is visible */}
              <Link href="/dashboard">
                 <ClimaBillLogo className="h-8 text-primary" />
              </Link>
            </SheetHeader>
            {renderNavLinks(true)}
          </SheetContent>
        </Sheet>
      </header>
    </>
  );
}
