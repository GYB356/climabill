
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
import { Skeleton } from "@/components/ui/skeleton"; // Added Skeleton import

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
      iconColor: "text-green-500", 
    },
    {
      title: "Active Subscriptions",
      value: "+2350",
      change: "+180.1% from last month",
      icon: Users,
      iconColor: "text-blue-500", 
    },
    {
      title: "Churn Rate",
      value: "2.5%",
      change: "-0.5% from last month",
      icon: TrendingUp, 
      iconColor: "text-red-500",
    },
    {
      title: "Avg. Customer Health",
      value: "82%",
      change: "+2% from last week",
      icon: Activity,
      iconColor: "text-yellow-500",
    },
  ];

  if (!isMounted) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-1/3 mb-4 rounded-md" /> 
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-3/4 rounded-md" />
                <Skeleton className="h-5 w-5 rounded-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-7 w-1/2 mb-1 rounded-md" />
                <Skeleton className="h-3 w-full rounded-md" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="shadow-lg">
            <CardHeader>
              <Skeleton className="h-6 w-1/2 mb-1 rounded-md" />
              <Skeleton className="h-4 w-3/4 rounded-md" />
            </CardHeader>
            <CardContent className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center">
                  <Skeleton className="mr-2 h-2 w-2 rounded-full" />
                  <Skeleton className="h-4 w-full rounded-md" />
                </div>
              ))}
            </CardContent>
          </Card>
          <Card className="shadow-lg">
            <CardHeader>
              <Skeleton className="h-6 w-1/2 mb-1 rounded-md" />
              <Skeleton className="h-4 w-3/4 rounded-md" />
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center space-y-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="text-center w-full">
                <Skeleton className="h-8 w-1/3 mx-auto mb-2 rounded-md" />
                <Skeleton className="h-4 w-1/2 mx-auto rounded-md" />
              </div>
              <div className="text-center w-full">
                <Skeleton className="h-6 w-1/4 mx-auto mb-1 rounded-md" />
                <Skeleton className="h-3 w-1/3 mx-auto rounded-md" />
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
            <Leaf className="h-16 w-16 text-accent" />
            <div className="text-center">
              <p className="text-3xl font-bold text-foreground">{monthlyEmissions} tCO₂e</p>
              <p className="text-sm text-muted-foreground">Estimated monthly emissions</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-accent">{offsetPercentage} Offset</p>
              <p className="text-xs text-muted-foreground">via ClimaBill Offset Program</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
