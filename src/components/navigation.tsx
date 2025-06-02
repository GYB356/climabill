
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
  Lightbulb,
  BarChart3, 
  ReceiptText, 
  Trees, 
  BarChartHorizontalBig, // Added for Reports
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
  { 
    href: "/invoices", 
    label: "Invoices", 
    icon: FileText,
    subItems: [
      { href: "/invoices/sample-invoice", label: "View Sample Invoice", icon: ReceiptText },
      { href: "/invoices", label: "Template Selection", icon: FileText, exactMatch: true }, 
    ]
  },
  { href: "/reports", label: "Reporting", icon: BarChartHorizontalBig },
  { href: "/smart-discounts", label: "Smart Discounts", icon: Sparkles },
  { href: "/text-summarizer", label: "Text Summarizer", icon: NotebookText },
  { href: "/invoice-item-suggester", label: "Item Suggester", icon: Lightbulb },
  { 
    href: "/carbon", 
    label: "Carbon", 
    icon: Leaf,
    subItems: [
      { href: "/carbon/dashboard", label: "Dashboard", icon: BarChart3 },
      { href: "/carbon/gamified-dashboard", label: "Gamified Dashboard", icon: Sparkles },
      { href: "/carbon/management", label: "Management", icon: SettingsIcon },
      { href: "/carbon/offset", label: "Offset", icon: Trees },
    ]
  },
  { href: "/learn-sustainability", label: "Learn Sustainability", icon: Trees },
  { href: "/settings", label: "Settings", icon: SettingsIcon },
];

export function AppNavigation() {
  const pathname = usePathname();

  const renderNavLinks = (isMobile = false) => (
    <nav className={cn("flex flex-col gap-1 px-2", isMobile ? "mt-4" : "mt-6")}>
      {navItems.map((item) => {
        const isParentActive = pathname.startsWith(item.href) && item.href !== "/dashboard" && item.href !== "/invoices";
        const isItemActive = item.exactMatch ? pathname === item.href : pathname.startsWith(item.href);
        
        const linkContent = (
          <>
            <item.icon className={cn("h-5 w-5 shrink-0", isItemActive && !item.subItems ? "text-sidebar-primary" : "text-sidebar-foreground/80 group-hover:text-sidebar-accent-foreground")} />
            <span className={cn(isMobile ? "text-base" : "text-sm", isItemActive && !item.subItems ? "font-semibold text-sidebar-primary" : "group-hover:text-sidebar-accent-foreground")}>
              {item.label}
            </span>
          </>
        );

        const parentLinkClass = cn(
          "group flex items-center gap-3 rounded-md p-2 transition-colors w-full text-left",
          isItemActive && !item.subItems
            ? "bg-sidebar-primary/10 text-sidebar-primary"
            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        );

        if (item.subItems) {
          const isAnySubItemActive = item.subItems.some(subItem => subItem.exactMatch ? pathname === subItem.href : pathname.startsWith(subItem.href));
          return (
            <div key={item.href} className="space-y-1">
              <div
                className={cn(
                  "group flex items-center gap-3 rounded-md p-2 text-sidebar-foreground w-full text-left",
                   isAnySubItemActive ? "text-sidebar-primary font-medium" : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon className={cn("h-5 w-5 shrink-0", isAnySubItemActive ? "text-sidebar-primary" : "text-sidebar-foreground/80")} />
                 <span className={cn(isMobile ? "text-base" : "text-sm", isAnySubItemActive ? "font-semibold text-sidebar-primary" : "")}>
                    {item.label}
                </span>
              </div>
              <div className="ml-4 pl-3 border-l border-sidebar-border/50 space-y-1">
                {item.subItems.map(subItem => {
                   const isSubItemActive = subItem.exactMatch ? pathname === subItem.href : pathname.startsWith(subItem.href);
                   const subLinkContent = (
                     <>
                      <subItem.icon className={cn("h-4 w-4 shrink-0", isSubItemActive ? "text-sidebar-primary" : "text-sidebar-foreground/70 group-hover:text-sidebar-accent-foreground")} />
                      <span className={cn("text-xs", isSubItemActive ? "font-medium text-sidebar-primary" : "group-hover:text-sidebar-accent-foreground")}>
                        {subItem.label}
                      </span>
                    </>
                   );
                   const subLinkClass = cn(
                      "group flex items-center gap-2 rounded-md py-1.5 px-2 transition-colors w-full text-left",
                      isSubItemActive
                        ? "text-sidebar-primary" 
                        : "text-sidebar-foreground/90 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    );

                  if (!isMobile) {
                    return (
                       <TooltipProvider key={subItem.href} delayDuration={0}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Link href={subItem.href} className={subLinkClass}>
                              {subLinkContent}
                            </Link>
                          </TooltipTrigger>
                          <TooltipContent side="right" className="bg-card text-card-foreground text-xs">
                            <p>{subItem.label}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )
                  }
                  return (
                    <Link key={subItem.href} href={subItem.href} className={subLinkClass}>
                        {subLinkContent}
                    </Link>
                  )
                })}
              </div>
            </div>
          );
        }


        if (!isMobile) {
          return (
            <TooltipProvider key={item.href} delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href={item.href} className={parentLinkClass}>
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
          <Link key={item.href} href={item.href} className={parentLinkClass}>
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
      <header className="md:hidden sticky top-0 z-40 flex items-center justify-between h-16 px-4 border-b bg-background"> {/* z-40 to be below cookie banner */}
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
          <SheetContent side="left" className="w-72 bg-sidebar text-sidebar-foreground p-0">
            <SheetHeader className="p-4 border-b border-sidebar-border">
              <Link href="/dashboard">
                 <ClimaBillLogo className="h-8 text-sidebar-primary-foreground" />
              </Link>
            </SheetHeader>
            {renderNavLinks(true)}
          </SheetContent>
        </Sheet>
      </header>
    </>
  );
}

    