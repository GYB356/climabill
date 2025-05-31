"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

interface DashboardHeaderProps {
  heading: string;
  text?: string;
  children?: React.ReactNode;
  className?: string;
}

export function DashboardHeader({
  heading,
  text,
  children,
  className,
}: DashboardHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-4 pb-4", className)}>
      <div className="space-y-1.5">
        <h1 className="font-heading text-2xl font-bold leading-tight tracking-tight md:text-3xl">
          {heading}
        </h1>
        {text && <p className="text-muted-foreground">{text}</p>}
      </div>
      {children}
      <Separator className="my-2" />
    </div>
  );
}
