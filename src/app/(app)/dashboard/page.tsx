
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { DollarSign, Users, TrendingUp, Activity, Leaf, Settings, FileText, Sparkles, ArrowRight, Briefcase } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";

const ONBOARDING_SEEN_KEY = 'climabill_has_seen_onboarding';

const dashboardChartConfig = {
  revenue: {
    label: "Revenue ($)",
    color: "hsl(var(--chart-1))",
    icon: Briefcase,
  },
} satisfies ChartConfig;

const revenueData = [
  { month: "Jan", revenue: 4000 },
  { month: "Feb", revenue: 3000 },
  { month: "Mar", revenue: 5000 },
  { month: "Apr", revenue: 4500 },
  { month: "May", revenue: 6000 },
  { month: "Jun", revenue: 5500 },
];


export default function DashboardPage() {
  const [monthlyEmissions, setMonthlyEmissions] = useState<string>("0.00");
  const [offsetPercentage, setOffsetPercentage] = useState<string>("0%");
  const [isMounted, setIsMounted] = useState(false);
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(true); 

  useEffect(() => {
    setIsMounted(true);
    const hasSeenOnboarding = localStorage.getItem(ONBOARDING_SEEN_KEY);
    if (hasSeenOnboarding) {
      setIsFirstTimeUser(false);
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      const randomEmissions = (Math.random() * 2 + 0.5).toFixed(2); 
      const randomOffset = Math.floor(Math.random() * 50 + 5);   
      setMonthlyEmissions(randomEmissions);
      setOffsetPercentage(`${randomOffset}%`);
    }
  }, [isMounted]);

  const handleDismissOnboarding = () => {
    localStorage.setItem(ONBOARDING_SEEN_KEY, 'true');
    setIsFirstTimeUser(false);
  };

  const overviewMetrics = [
    {
      title: "Total Revenue",
      value: "$45,231.89",
      change: "+20.1% from last month",
      icon: DollarSign,
      iconColor: "text-primary",
    },
    {
      title: "Active Subscriptions",
      value: "+2350",
      change: "+180.1% from last month",
      icon: Users,
      iconColor: "text-primary",
    },
    {
      title: "Churn Rate",
      value: "2.5%",
      change: "-0.5% from last month",
      icon: TrendingUp, // Changed from TrendingDown to TrendingUp to better reflect "Churn Rate" logic if positive is bad, this implies decrease is good
      iconColor: "text-destructive", // Or text-green-500 if lower is better
    },
    {
      title: "Avg. Customer Health",
      value: "82%",
      change: "+2% from last week",
      icon: Activity,
      iconColor: "text-accent",
    },
  ];

  const onboardingSteps = [
    {
      icon: FileText,
      title: "Customize Invoice Templates",
      description: "Choose a professional look for your invoices.",
      href: "/invoices",
    },
    {
      icon: Leaf,
      title: "Explore Carbon Tracking",
      description: "Understand and manage your environmental impact.",
      href: "/carbon-footprint",
    },
    {
      icon: Sparkles,
      title: "Try AI Smart Discounts",
      description: "Let AI help you find the best discount strategies.",
      href: "/smart-discounts",
    },
    {
      icon: Settings,
      title: "Configure Your Settings",
      description: "Set up payment reminders and other preferences.",
      href: "/settings",
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
          <Card className="shadow-lg"> {/* Skeleton for Revenue Forecast */}
            <CardHeader>
              <Skeleton className="h-6 w-1/2 mb-1 rounded-md" />
              <Skeleton className="h-4 w-3/4 rounded-md" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full rounded-md" />
            </CardContent>
          </Card>
          <Card className="shadow-lg"> {/* Skeleton for Customer Health */}
            <CardHeader>
              <Skeleton className="h-6 w-1/2 mb-1 rounded-md" />
              <Skeleton className="h-4 w-3/4 rounded-md" />
            </CardHeader>
            <CardContent className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="h-4 w-1/2 rounded-md" />
                  <Skeleton className="h-4 w-1/4 rounded-md" />
                </div>
              ))}
              <Skeleton className="h-10 w-full mt-2 rounded-md" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isFirstTimeUser) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <Card className="w-full max-w-2xl shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-primary">Welcome to ClimaBill!</CardTitle>
            <CardDescription className="text-lg text-muted-foreground pt-2">
              We're excited to help you manage your billing sustainably. Here are a few things you can do to get started:
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {onboardingSteps.map((step) => (
                <Link href={step.href} key={step.title} className="block group">
                  <Card className="h-full hover:shadow-lg transition-shadow hover:border-primary/50">
                    <CardHeader className="flex-row items-center gap-3 pb-3">
                      <step.icon className="h-8 w-8 text-primary flex-shrink-0" />
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">{step.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </CardContent>
          <CardFooter className="pt-6">
            <Button size="lg" className="w-full" onClick={handleDismissOnboarding}>
              Explore Dashboard <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </CardFooter>
        </Card>
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
              <metric.icon className={`h-5 w-5 ${metric.iconColor}`} />
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

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-foreground flex items-center">
              <Briefcase className="mr-2 h-5 w-5 text-primary" />
              Revenue Forecast
            </CardTitle>
            <CardDescription>Projected revenue for the next few months.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={dashboardChartConfig} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={revenueData}
                  margin={{
                    top: 5,
                    right: 10,
                    left: -20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    fontSize={12}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    fontSize={12}
                    tickFormatter={(value) => `$${value / 1000}k`}
                  />
                  <RechartsTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dot" />}
                  />
                  <Line
                    dataKey="revenue"
                    type="monotone"
                    stroke="var(--color-revenue)"
                    strokeWidth={2}
                    dot={{
                      fill: "var(--color-revenue)",
                      r: 4,
                    }}
                    activeDot={{
                      r: 6,
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-foreground flex items-center">
              <Activity className="mr-2 h-5 w-5 text-primary" />
              Customer Health
            </CardTitle>
            <CardDescription>Overall health scores of your customer base.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">High Risk</span>
              <span className="text-sm font-semibold text-destructive">15 Customers</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Needs Attention</span>
              <span className="text-sm font-semibold text-yellow-600">42 Customers</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Healthy</span>
              <span className="text-sm font-semibold text-accent">183 Customers</span>
            </div>
            <Button variant="outline" size="sm" className="w-full mt-2">View Health Details</Button>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}

    