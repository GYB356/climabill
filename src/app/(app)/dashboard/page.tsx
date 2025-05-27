
"use client";

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DollarSign, Users, TrendingUp, Activity, Leaf } from "lucide-react";

export default function DashboardPage() {
  const [monthlyEmissions, setMonthlyEmissions] = useState<string>("0.00");
  const [offsetPercentage, setOffsetPercentage] = useState<string>("0%");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      // Generate plausible random values client-side
      const randomEmissions = (Math.random() * 2 + 0.5).toFixed(2); // 0.50 to 2.50 tCO₂e
      const randomOffset = Math.floor(Math.random() * 50 + 5);   // 5% to 55%
      setMonthlyEmissions(randomEmissions);
      setOffsetPercentage(`${randomOffset}%`);
    }
  }, [isMounted]);

  const overviewMetrics = [
    {
      title: "Total Revenue",
      value: "$45,231.89",
      change: "+20.1% from last month",
      icon: DollarSign,
      iconColor: "text-green-500", // Will be styled by theme
    },
    {
      title: "Active Subscriptions",
      value: "+2350",
      change: "+180.1% from last month",
      icon: Users,
      iconColor: "text-blue-500", // Will be styled by theme
    },
    {
      title: "Churn Rate",
      value: "2.5%",
      change: "-0.5% from last month",
      icon: TrendingUp, 
      iconColor: "text-red-500", // Will be styled by theme
    },
    {
      title: "Avg. Customer Health",
      value: "82%",
      change: "+2% from last week",
      icon: Activity,
      iconColor: "text-yellow-500", // Will be styled by theme
    },
  ];

  if (!isMounted) {
    // Basic loading state to prevent hydration mismatch & show content is loading
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-5 w-5 bg-muted rounded-full"></div>
              </CardHeader>
              <CardContent>
                <div className="h-7 bg-muted rounded w-1/2 mb-1"></div>
                <div className="h-3 bg-muted rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="shadow-lg">
            <CardHeader>
              <div className="h-6 bg-muted rounded w-1/3 mb-1"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center">
                  <div className="mr-2 h-2 w-2 rounded-full bg-muted"></div>
                  <div className="h-4 bg-muted rounded w-full"></div>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card className="shadow-lg">
            <CardHeader>
              <div className="h-6 bg-muted rounded w-1/2 mb-1"></div>
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center space-y-4">
              <div className="h-16 w-16 bg-muted rounded-full"></div>
              <div className="text-center w-full">
                <div className="h-8 bg-muted rounded w-1/3 mx-auto mb-2"></div>
                <div className="h-4 bg-muted rounded w-1/2 mx-auto"></div>
              </div>
              <div className="text-center w-full">
                <div className="h-6 bg-muted rounded w-1/4 mx-auto mb-1"></div>
                <div className="h-3 bg-muted rounded w-1/3 mx-auto"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {overviewMetrics.map((metric) => (
          <Card key={metric.title} className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.title}
              </CardTitle>
              {/* Theme will color these icons via CSS variables if needed, otherwise default color */}
              <metric.icon className={`h-5 w-5 ${metric.iconColor.replace(/text-(green|blue|red|yellow)-500/, '')}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{metric.value}</div>
              <p className="text-xs text-muted-foreground pt-1">{metric.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-foreground">Recent Activity</CardTitle>
            <CardDescription>An overview of recent billing events.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {[
                "New subscription: Acme Corp (Premium Plan)",
                "Payment received: John Doe ($49.00)",
                "Invoice #INV-00123 overdue",
                "Trial ending soon: Beta User Inc.",
                "Carbon offset added: EcoFriendly Ltd."
              ].map((activity, index) => (
                <li key={index} className="text-sm text-muted-foreground flex items-center">
                  <span className="mr-2 h-2 w-2 rounded-full bg-primary"></span>
                  {activity}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-foreground">Eco Impact Snapshot</CardTitle>
            <CardDescription>Your current carbon footprint status.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center space-y-4">
            <Leaf className="h-16 w-16 text-accent" /> {/* text-accent will be from globals.css */}
            <div className="text-center">
              <p className="text-3xl font-bold text-foreground">{monthlyEmissions} tCO₂e</p>
              <p className="text-sm text-muted-foreground">Estimated monthly emissions</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-accent">{offsetPercentage} Offset</p> {/* text-accent */}
              <p className="text-xs text-muted-foreground">via ClimaBill Offset Program</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
