
"use client"; // This page uses client-side state for the chart

import { useState, useEffect, useCallback } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip as RechartsTooltip } from "recharts";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Info, Leaf, Cloud, BarChart3, History, DollarSign, Zap, ExternalLink } from "lucide-react";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";

const initialChartDataSixMonths = [
  { month: "Jan", emissions: 0, offset: 0 },
  { month: "Feb", emissions: 0, offset: 0 },
  { month: "Mar", emissions: 0, offset: 0 },
  { month: "Apr", emissions: 0, offset: 0 },
  { month: "May", emissions: 0, offset: 0 },
  { month: "Jun", emissions: 0, offset: 0 },
];

const initialChartDataTwelveMonths = [
  { month: "Jan", emissions: 0, offset: 0 }, { month: "Feb", emissions: 0, offset: 0 },
  { month: "Mar", emissions: 0, offset: 0 }, { month: "Apr", emissions: 0, offset: 0 },
  { month: "May", emissions: 0, offset: 0 }, { month: "Jun", emissions: 0, offset: 0 },
  { month: "Jul", emissions: 0, offset: 0 }, { month: "Aug", emissions: 0, offset: 0 },
  { month: "Sep", emissions: 0, offset: 0 }, { month: "Oct", emissions: 0, offset: 0 },
  { month: "Nov", emissions: 0, offset: 0 }, { month: "Dec", emissions: 0, offset: 0 },
];


const chartConfig = {
  emissions: {
    label: "Emissions (tCO₂e)",
    color: "hsl(var(--primary))",
    icon: Cloud,
  },
  offset: {
    label: "Offset (tCO₂e)",
    color: "hsl(var(--accent))",
    icon: Leaf,
  },
} satisfies ChartConfig;

const mockContributionHistory = [
  { id: "1", date: "2024-05-15", amount: 25.00, project: "Amazon Rainforest Preservation", status: "Completed" },
  { id: "2", date: "2024-04-20", amount: 15.50, project: "African Savanna Carbon Capture", status: "Completed" },
  { id: "3", date: "2024-03-10", amount: 30.00, project: "Global Reforestation Initiative", status: "Completed" },
];

const mockOffsetProjects = [
  {
    id: "proj1",
    name: "Verified Reforestation Initiative",
    description: "Support tree planting in degraded lands. Each contribution helps restore ecosystems and sequester CO2.",
    type: "Reforestation",
    imageUrl: "https://placehold.co/600x400.png",
    dataAiHint: "forest trees",
    minContribution: 10,
  },
  {
    id: "proj2",
    name: "Renewable Energy Development",
    description: "Fund the development of wind and solar projects, reducing reliance on fossil fuels.",
    type: "Renewable Energy",
    imageUrl: "https://placehold.co/600x400.png",
    dataAiHint: "wind turbine",
    minContribution: 15,
  },
  {
    id: "proj3",
    name: "Direct Air Capture Technology",
    description: "Invest in innovative technologies that directly remove CO2 from the atmosphere.",
    type: "Technology",
    imageUrl: "https://placehold.co/600x400.png",
    dataAiHint: "carbon capture",
    minContribution: 25,
  },
];

export default function CarbonFootprintPage() {
  const [chartData, setChartData] = useState(initialChartDataSixMonths);
  const [timeframe, setTimeframe] = useState("6m");
  const [enableRealtime, setEnableRealtime] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const generateNewDataValues = useCallback(() => {
    return {
      emissions: parseFloat((Math.random() * 5 + 1).toFixed(2)), // 1 to 6 tCO₂e
      offset: parseFloat((Math.random() * 2).toFixed(2)),      // 0 to 2 tCO₂e
    };
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const generateInitialData = () => {
      const months = timeframe === "12m"
        ? ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        : ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
      
      return months.map(month => ({
        month,
        ...generateNewDataValues(),
      }));
    };
    setChartData(generateInitialData());
  }, [timeframe, isMounted, generateNewDataValues]);


  useEffect(() => {
    if (!isMounted || !enableRealtime) {
      return;
    }

    const intervalId = setInterval(() => {
      setChartData(prevData =>
        prevData.map(item => ({
          ...item,
          ...generateNewDataValues(),
        }))
      );
    }, 2000); // Update every 2 seconds

    return () => clearInterval(intervalId);
  }, [enableRealtime, isMounted, generateNewDataValues, timeframe]);

  const totalEmissions = chartData.reduce((sum, item) => sum + item.emissions, 0);
  const totalOffset = chartData.reduce((sum, item) => sum + item.offset, 0);

  const handleContributeNow = (projectName?: string) => {
    toast({
      title: "Thank You!",
      description: `Your contribution to ${projectName || 'offset projects'} is appreciated. (Feature in development)`,
    });
  };

  const handleViewAllContributions = () => {
    toast({
      title: "Coming Soon!",
      description: "The feature to view all contributions is currently in development.",
    });
  };

  if (!isMounted) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-72" />
          </div>
          <div className="flex items-center space-x-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-12 rounded-full" />
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[1,2,3].map(i => (
            <Card key={i} className="shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-5 w-5 rounded-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-1/2 mb-1" />
                <Skeleton className="h-3 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
         <Card className="shadow-xl">
            <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                    <Skeleton className="h-6 w-48 mb-1" />
                    <Skeleton className="h-4 w-64" />
                </div>
                <Skeleton className="h-10 w-full sm:w-[180px] rounded-md" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-[350px] w-full rounded-md" />
            </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader>
            <Skeleton className="h-6 w-56 mb-1" />
            <Skeleton className="h-4 w-72" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1,2,3].map((i) => (
              <div key={i} className="p-3 border rounded-lg bg-muted/30">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-1.5 gap-1">
                    <Skeleton className="h-5 w-3/5" />
                    <Skeleton className="h-4 w-1/4" />
                </div>
                <div className="flex justify-between items-center">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
              </div>
            ))}
            <Skeleton className="h-9 w-full mt-2 rounded-md" />
          </CardContent>
        </Card>
         <Card className="shadow-lg">
            <CardHeader>
                <Skeleton className="h-6 w-56 mb-1" />
                <Skeleton className="h-4 w-72" />
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1,2,3].map(i => (
                        <Card key={i} className="flex flex-col">
                            <Skeleton className="aspect-video w-full rounded-t-md" />
                            <CardHeader className="pb-2">
                                <Skeleton className="h-5 w-3/4 mb-1" />
                                <Skeleton className="h-3 w-1/2" />
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <Skeleton className="h-3 w-full mb-1" />
                                <Skeleton className="h-3 w-5/6" />
                            </CardContent>
                            <CardFooter>
                                <Skeleton className="h-9 w-full" />
                            </CardFooter>
                        </Card>
                    ))}
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg bg-background mt-4">
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-5 w-2/3" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                  <Skeleton className="h-6 w-11 rounded-full" />
                </div>
            </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Carbon Footprint</h1>
          <p className="text-muted-foreground">Track and manage your environmental impact.</p>
        </div>
        <div className="flex items-center space-x-2">
          <Label htmlFor="realtime-toggle" className="text-sm">Real-time Updates</Label>
          <Switch id="realtime-toggle" checked={enableRealtime} onCheckedChange={setEnableRealtime} />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Emissions ({timeframe})</CardTitle>
            <Cloud className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{totalEmissions.toFixed(2)} tCO₂e</div>
            <p className="text-xs text-muted-foreground">Estimated total carbon dioxide equivalent</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Offset ({timeframe})</CardTitle>
            <Leaf className="h-5 w-5 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{totalOffset.toFixed(2)} tCO₂e</div>
            <p className="text-xs text-muted-foreground">Amount offset through ClimaBill partners</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg bg-primary/5 border-primary">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-primary">Net Impact</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{(totalEmissions - totalOffset).toFixed(2)} tCO₂e</div>
            <p className="text-xs text-muted-foreground">Your net carbon footprint after offsets</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-xl">
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <CardTitle className="text-xl text-foreground flex items-center">
              <BarChart3 className="mr-2 h-6 w-6 text-primary" />
              Emissions Over Time
            </CardTitle>
            <CardDescription>Monthly breakdown of emissions and offsets.</CardDescription>
          </div>
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="6m">Last 6 Months</SelectItem>
              <SelectItem value="12m">Last 12 Months</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} unit=" tCO₂e" />
                <RechartsTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" />}
                />
                <Bar dataKey="emissions" fill="var(--color-emissions)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="offset" fill="var(--color-offset)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl text-foreground flex items-center">
            <History className="mr-2 h-6 w-6 text-primary" />
            Offset Contribution History
          </CardTitle>
          <CardDescription>
            A record of your contributions to carbon offset projects.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {mockContributionHistory.length > 0 ? (
            mockContributionHistory.map((item, index) => (
              <div key={item.id}>
                <div className="p-3 border rounded-lg bg-background hover:bg-muted/50 transition-colors">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-1.5 gap-1">
                    <span className="font-semibold text-foreground">{item.project}</span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(item.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground flex items-center">
                      <DollarSign className="mr-1 h-4 w-4 text-accent" />
                      Amount: ${item.amount.toFixed(2)}
                    </p>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${item.status === "Completed" ? "bg-accent/20 text-accent-foreground" : "bg-muted text-muted-foreground"}`}>
                      {item.status}
                    </span>
                  </div>
                </div>
                {index < mockContributionHistory.length - 1 && <Separator className="my-3 sm:hidden" />}
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-center py-4">No contribution history yet.</p>
          )}
          {mockContributionHistory.length > 0 && (
             <Button variant="link" className="w-full mt-2 text-primary hover:text-primary/80" onClick={handleViewAllContributions}>View All Contributions</Button>
          )}
        </CardContent>
      </Card>


      <Card className="shadow-lg">
        <CardHeader>
            <CardTitle className="text-xl text-foreground">Carbon Offset Preferences & Projects</CardTitle>
            <CardDescription>Manage your contributions and explore certified offset projects.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mockOffsetProjects.map(project => (
                    <Card key={project.id} className="flex flex-col shadow-md hover:shadow-lg transition-shadow">
                         <div className="relative aspect-video w-full rounded-t-md overflow-hidden">
                            <Image 
                                src={project.imageUrl} 
                                alt={project.name} 
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                className="object-cover"
                                data-ai-hint={project.dataAiHint}
                            />
                        </div>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg">{project.name}</CardTitle>
                            <CardDescription className="text-xs pt-1">{project.type}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow">
                            <p className="text-sm text-muted-foreground line-clamp-3">{project.description}</p>
                        </CardContent>
                        <CardFooter className="flex-col items-start gap-2">
                            <p className="text-xs text-muted-foreground">Min. Contribution: ${project.minContribution.toFixed(2)}</p>
                            <Button variant="outline" className="w-full" onClick={() => handleContributeNow(project.name)}>
                                <Leaf className="mr-2 h-4 w-4 text-accent"/> Contribute to this Project
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
            <Separator />
            <div className="flex items-center justify-between p-4 border rounded-lg bg-background">
              <div>
                <Label htmlFor="auto-offset" className="text-base font-medium">Automatic Carbon Offset</Label>
                <p className="text-sm text-muted-foreground">Enable to automatically offset a percentage of your emissions.</p>
              </div>
              <Switch id="auto-offset" />
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
