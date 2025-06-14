
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/protected-route';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { DollarSign, Users, Activity, Leaf, Settings, FileText, Sparkles, ArrowRight, Briefcase, AlertTriangle, BarChart3, DivideCircle, TrendingDown, Clock, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Separator } from '@/components/ui/separator';

const ONBOARDING_SEEN_KEY = 'climabill_has_seen_onboarding';

const dashboardChartConfig = {
  revenue: {
    label: "Projected Revenue ($)",
    color: "hsl(var(--chart-1))",
    icon: Briefcase,
  },
} satisfies ChartConfig;

const revenueDataThirtyDays = [
  { period: "Week 1", revenue: 5200 }, { period: "Week 2", revenue: 5350 },
  { period: "Week 3", revenue: 5500 }, { period: "Week 4", revenue: 5600 },
];

const revenueDataSixtyDays = [
  { period: "W1", revenue: 5200 }, { period: "W2", revenue: 5350 }, { period: "W3", revenue: 5500 }, { period: "W4", revenue: 5600 },
  { period: "W5", revenue: 5750 }, { period: "W6", revenue: 5850 }, { period: "W7", revenue: 6000 }, { period: "W8", revenue: 6100 },
];

const revenueDataNinetyDays = [
  { period: "W1", revenue: 5200 }, { period: "W2", revenue: 5350 }, { period: "W3", revenue: 5500 }, { period: "W4", revenue: 5600 },
  { period: "W5", revenue: 5750 }, { period: "W6", revenue: 5850 }, { period: "W7", revenue: 6000 }, { period: "W8", revenue: 6100 },
  { period: "W9", revenue: 6250 }, { period: "W10", revenue: 6350 }, { period: "W11", revenue: 6500 }, { period: "W12", revenue: 6600 },
];


export default function DashboardPage() {
  const [monthlyEmissions, setMonthlyEmissions] = useState<string>("0.00");
  const [offsetPercentage, setOffsetPercentage] = useState<string>("0%");
  const [churnPrediction, setChurnPrediction] = useState<string>("0%");
  const [avgCo2PerInvoice, setAvgCo2PerInvoice] = useState<string>("0.0");
  const [netMonthlyImpact, setNetMonthlyImpact] = useState<string>("0.00");
  const [isMounted, setIsMounted] = useState(false);
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(true);
  const [revenueTimeframe, setRevenueTimeframe] = useState("30d");
  const [revenueChartData, setRevenueChartData] = useState(revenueDataThirtyDays);
  const { toast } = useToast();

  useEffect(() => {
    setIsMounted(true);
    const hasSeenOnboarding = localStorage.getItem(ONBOARDING_SEEN_KEY);
    if (hasSeenOnboarding) {
      setIsFirstTimeUser(false);
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      const randomEmissions = parseFloat((Math.random() * 2 + 0.5).toFixed(2));
      const randomOffsetPercent = Math.floor(Math.random() * 50 + 5);
      const randomChurn = (Math.random() * 10 + 2).toFixed(1); // 2.0 to 12.0%
      const randomAvgCo2 = (Math.random() * 4 + 1).toFixed(1); // 1.0 to 5.0 kg CO2e

      setMonthlyEmissions(randomEmissions.toFixed(2));
      setOffsetPercentage(`${randomOffsetPercent}%`);
      setChurnPrediction(`${randomChurn}%`);
      setAvgCo2PerInvoice(randomAvgCo2);

      const offsetAmount = randomEmissions * (randomOffsetPercent / 100);
      const netImpact = randomEmissions - offsetAmount;
      setNetMonthlyImpact(netImpact.toFixed(2));
    }
  }, [isMounted]);

  useEffect(() => {
    if (isMounted) {
      if (revenueTimeframe === "60d") {
        setRevenueChartData(revenueDataSixtyDays);
      } else if (revenueTimeframe === "90d") {
        setRevenueChartData(revenueDataNinetyDays);
      } else {
        setRevenueChartData(revenueDataThirtyDays);
      }
    }
  }, [revenueTimeframe, isMounted]);

  const handleDismissOnboarding = () => {
    localStorage.setItem(ONBOARDING_SEEN_KEY, 'true');
    setIsFirstTimeUser(false);
  };

  const handleViewHealthDetails = () => {
    toast({
      title: "Feature in Development",
      description: "Detailed customer health analytics are coming soon!",
    });
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
      title: "AI Churn Prediction",
      value: churnPrediction,
      change: "Risk in next 30 days",
      icon: AlertTriangle,
      iconColor: "text-destructive",
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
            <CardContent className="flex flex-col items-center justify-center space-y-3">
              <Skeleton className="h-16 w-16 rounded-full" /> 
              <div className="text-center w-full">
                <Skeleton className="h-8 w-1/3 mx-auto mb-1 rounded-md" /> 
                <Skeleton className="h-3 w-1/2 mx-auto rounded-md" /> 
              </div>
              <div className="text-center w-full">
                <Skeleton className="h-6 w-1/4 mx-auto mb-1 rounded-md" /> 
                <Skeleton className="h-3 w-1/3 mx-auto rounded-md" /> 
              </div>
               <div className="text-center w-full pt-1">
                <Skeleton className="h-5 w-1/3 mx-auto mb-1 rounded-md" /> 
                <Skeleton className="h-3 w-1/2 mx-auto rounded-md" /> 
              </div>
              <div className="text-center w-full pt-2 border-t mt-2">
                <Skeleton className="h-6 w-1/3 mx-auto mt-2 mb-1 rounded-md" /> 
                <Skeleton className="h-3 w-1/2 mx-auto rounded-md" /> 
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-lg">
            <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                    <Skeleton className="h-6 w-1/2 mb-1 rounded-md" />
                    <Skeleton className="h-4 w-3/4 rounded-md" />
                </div>
                <Skeleton className="h-10 w-full sm:w-[180px] rounded-md" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full rounded-md" />
            </CardContent>
          </Card>
          <Card className="shadow-lg">
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
          <Card className="shadow-lg md:col-span-2">
            <CardHeader>
                <Skeleton className="h-6 w-1/3 mb-1 rounded-md" />
                <Skeleton className="h-4 w-1/2 rounded-md" />
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[1,2,3].map(i => (
                    <div key={i} className="p-3 border rounded-lg bg-muted/30">
                        <Skeleton className="h-4 w-3/4 mb-2 rounded-md" />
                        <Skeleton className="h-6 w-1/2 mb-1 rounded-md" />
                        <Skeleton className="h-3 w-full rounded-md" />
                    </div>
                ))}
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
    <ProtectedRoute>
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
            <CardTitle className="text-xl text-foreground flex items-center">
             <Leaf className="mr-2 h-5 w-5 text-accent" />
              Eco Impact Snapshot</CardTitle>
            <CardDescription>Your current carbon footprint status.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center space-y-3">
             <Leaf className="h-16 w-16 text-accent" />
            <div className="text-center">
              <p className="text-3xl font-bold text-foreground">{monthlyEmissions} tCO₂e</p>
              <p className="text-sm text-muted-foreground">Estimated monthly emissions</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-accent">{offsetPercentage} Offset</p>
              <p className="text-xs text-muted-foreground">via ClimaBill Offset Program</p>
            </div>
            <div className="text-center pt-1">
              <p className="text-lg font-semibold text-muted-foreground flex items-center justify-center">
                <DivideCircle className="mr-1.5 h-4 w-4 text-muted-foreground/80" />
                {avgCo2PerInvoice} kg CO₂e
              </p>
              <p className="text-xs text-muted-foreground">Avg. per Invoice (simulated)</p>
            </div>
            <Separator className="my-2 w-3/4" />
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{netMonthlyImpact} tCO₂e</p>
              <p className="text-xs text-muted-foreground">Net Monthly Impact</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <CardTitle className="text-xl text-foreground flex items-center">
                <Briefcase className="mr-2 h-5 w-5 text-primary" />
                Revenue Forecast
              </CardTitle>
              <CardDescription>Projected revenue for the selected period.</CardDescription>
            </div>
            <Select value={revenueTimeframe} onValueChange={setRevenueTimeframe}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Select timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30d">Next 30 Days</SelectItem>
                <SelectItem value="60d">Next 60 Days</SelectItem>
                <SelectItem value="90d">Next 90 Days</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <ChartContainer config={dashboardChartConfig} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={revenueChartData}
                  margin={{
                    top: 5,
                    right: 10,
                    left: -20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="period"
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
            <Button variant="outline" size="sm" className="w-full mt-2" onClick={handleViewHealthDetails}>View Health Details</Button>
          </CardContent>
        </Card>

        <Card className="shadow-lg md:col-span-2">
            <CardHeader>
                <CardTitle className="text-xl text-foreground flex items-center">
                    <DollarSign className="mr-2 h-5 w-5 text-primary"/>
                    Key Billing Stats
                </CardTitle>
                <CardDescription>A quick overview of important billing metrics.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="p-4 border rounded-lg bg-background hover:shadow-md transition-shadow">
                    <h4 className="text-sm font-medium text-muted-foreground flex items-center">
                        <TrendingDown className="mr-1.5 h-4 w-4 text-destructive"/> Overdue Invoices
                    </h4>
                    <p className="text-2xl font-bold text-destructive mt-1">$1,250.75</p>
                    <p className="text-xs text-muted-foreground">from 5 invoices</p>
                </div>
                <div className="p-4 border rounded-lg bg-background hover:shadow-md transition-shadow">
                    <h4 className="text-sm font-medium text-muted-foreground flex items-center">
                        <Clock className="mr-1.5 h-4 w-4 text-primary"/> Paid Last 30 Days
                    </h4>
                    <p className="text-2xl font-bold text-primary mt-1">$12,830.00</p>
                    <p className="text-xs text-muted-foreground">from 123 invoices</p>
                </div>
                <div className="p-4 border rounded-lg bg-background hover:shadow-md transition-shadow">
                    <h4 className="text-sm font-medium text-muted-foreground flex items-center">
                        <RefreshCw className="mr-1.5 h-4 w-4 text-accent"/> Upcoming Renewals
                    </h4>
                    <p className="text-2xl font-bold text-accent mt-1">17 Subscriptions</p>
                    <p className="text-xs text-muted-foreground">in next 7 days</p>
                </div>
            </CardContent>
          </Card>
      </div>
    </div>
    </ProtectedRoute>
  );
}
    

    