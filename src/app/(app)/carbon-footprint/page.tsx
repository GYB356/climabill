
"use client"; // This page uses client-side state for the chart

import { useState, useEffect, useCallback } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip as RechartsTooltip } from "recharts";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Info, Leaf, Cloud, BarChart3, History, DollarSign, Zap, ExternalLink, Award, ShieldHalf, Rocket, TrendingUp, Lightbulb, Filter, ListFilter, KeyRound } from "lucide-react";
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
  { month: "Jan", emissions: 0, offset: 0, source: "Compute" },
  { month: "Feb", emissions: 0, offset: 0, source: "Storage" },
  { month: "Mar", emissions: 0, offset: 0, source: "Network" },
  { month: "Apr", emissions: 0, offset: 0, source: "Compute" },
  { month: "May", emissions: 0, offset: 0, source: "Storage" },
  { month: "Jun", emissions: 0, offset: 0, source: "Other" },
];

const initialChartDataTwelveMonths = [
  { month: "Jan", emissions: 0, offset: 0, source: "Compute" }, { month: "Feb", emissions: 0, offset: 0, source: "Storage" },
  { month: "Mar", emissions: 0, offset: 0, source: "Network" }, { month: "Apr", emissions: 0, offset: 0, source: "Compute" },
  { month: "May", emissions: 0, offset: 0, source: "Storage" }, { month: "Jun", emissions: 0, offset: 0, source: "Other" },
  { month: "Jul", emissions: 0, offset: 0, source: "Compute" }, { month: "Aug", emissions: 0, offset: 0, source: "Network" },
  { month: "Sep", emissions: 0, offset: 0, source: "Storage" }, { month: "Oct", emissions: 0, offset: 0, source: "Compute" },
  { month: "Nov", emissions: 0, offset: 0, source: "Other" }, { month: "Dec", emissions: 0, offset: 0, source: "Network" },
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

const mockAchievements = [
  { id: "ach1", name: "Eco Pioneer", description: "Made your first carbon offset contribution!", icon: Award, achieved: true },
  { id: "ach2", name: "Green Guardian", description: "Offset 10 tCO₂e this year.", icon: ShieldHalf, achieved: true },
  { id: "ach3", name: "Climate Champion", description: "Maintained a carbon neutral footprint for 3 months.", icon: Rocket, achieved: false },
];

const mockEcoRecommendations = [
    "Optimize cloud instances: Choose right-sized instances and shut down unused ones.",
    "Utilize serverless architectures where possible to reduce idle server energy.",
    "Select cloud regions powered by renewable energy or with lower carbon intensity.",
    "Implement efficient data storage strategies: archive old data, use tiered storage.",
    "Encourage energy-saving practices for remote work setups.",
];

export default function CarbonFootprintPage() {
  const [chartData, setChartData] = useState(initialChartDataSixMonths);
  const [timeframe, setTimeframe] = useState("6m");
  const [enableRealtime, setEnableRealtime] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [filterSource, setFilterSource] = useState("all");
  const [sortOrder, setSortOrder] = useState("month_asc");
  const { toast } = useToast();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const generateNewDataValues = useCallback(() => {
    const sources = ["Compute", "Storage", "Network", "Other"];
    return {
      emissions: parseFloat((Math.random() * 5 + 1).toFixed(2)), // 1 to 6 tCO₂e
      offset: parseFloat((Math.random() * 2).toFixed(2)),      // 0 to 2 tCO₂e
      source: sources[Math.floor(Math.random() * sources.length)],
    };
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const generateInitialData = () => {
      const baseData = timeframe === "12m" ? initialChartDataTwelveMonths : initialChartDataSixMonths;
      return baseData.map(item => ({
        ...item,
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
        {/* Metric Cards Skeleton */}
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
        {/* Emissions Chart Skeleton */}
         <Card className="shadow-xl">
            <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                    <Skeleton className="h-6 w-48 mb-1" />
                    <Skeleton className="h-4 w-64" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-10 w-full sm:w-[150px] rounded-md" />
                  <Skeleton className="h-10 w-full sm:w-[150px] rounded-md" />
                  <Skeleton className="h-10 w-full sm:w-[150px] rounded-md" />
                </div>
            </CardHeader>
            <CardContent>
                <Skeleton className="h-[350px] w-full rounded-md" />
            </CardContent>
        </Card>
        {/* Contribution History Skeleton */}
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
        {/* Achievements Skeleton */}
        <Card className="shadow-lg">
          <CardHeader>
            <Skeleton className="h-6 w-56 mb-1" />
            <Skeleton className="h-4 w-72" />
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3].map(i => (
              <div key={i} className="flex flex-col items-center p-4 border rounded-lg bg-muted/30 space-y-2">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-3 w-full" />
              </div>
            ))}
          </CardContent>
        </Card>
        {/* Sustainability Benchmarking Skeleton */}
        <Card className="shadow-lg">
            <CardHeader>
                <Skeleton className="h-6 w-64 mb-1" />
                <Skeleton className="h-4 w-full" />
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="flex items-center justify-center gap-2 mb-2">
                    <Skeleton className="h-8 w-1/3" />
                    <Skeleton className="h-5 w-5 rounded-full" />
                    <Skeleton className="h-8 w-1/3" />
                </div>
                <Skeleton className="h-10 w-full rounded-md bg-muted" />
                <Skeleton className="h-3 w-2/3 mx-auto" />
            </CardContent>
        </Card>
        {/* Sustainability Recommendations Skeleton */}
        <Card className="shadow-lg">
            <CardHeader>
                <Skeleton className="h-6 w-64 mb-1" />
                <Skeleton className="h-4 w-full" />
            </CardHeader>
            <CardContent className="space-y-3">
                {[1,2,3].map(i => (
                     <div key={i} className="flex items-start gap-2 p-2 border-b border-dashed">
                        <Skeleton className="h-5 w-5 rounded-full mt-1" />
                        <Skeleton className="h-4 w-full" />
                    </div>
                ))}
            </CardContent>
        </Card>
        {/* Offset Projects Skeleton */}
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
        <CardHeader className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex-1">
            <CardTitle className="text-xl text-foreground flex items-center">
              <BarChart3 className="mr-2 h-6 w-6 text-primary" />
              Emissions &amp; Offset Data
            </CardTitle>
            <CardDescription>Monthly breakdown of emissions and offsets. (Mock data, filtering/sorting is UI only)</CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Select timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6m">Last 6 Months</SelectItem>
                <SelectItem value="12m">Last 12 Months</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterSource} onValueChange={setFilterSource}>
              <SelectTrigger className="w-full sm:w-[180px]">
                 <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Filter by source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="compute">Compute</SelectItem>
                <SelectItem value="storage">Storage</SelectItem>
                <SelectItem value="network">Network</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortOrder} onValueChange={setSortOrder}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <ListFilter className="mr-2 h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month_asc">Month (Asc)</SelectItem>
                <SelectItem value="month_desc">Month (Desc)</SelectItem>
                <SelectItem value="emissions_asc">Emissions (Low-High)</SelectItem>
                <SelectItem value="emissions_desc">Emissions (High-Low)</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
            <CardTitle className="text-xl text-foreground flex items-center">
                <Zap className="mr-2 h-6 w-6 text-primary" />
                Sustainability Achievements
            </CardTitle>
            <CardDescription>Track your progress and earn badges for your eco-friendly actions.</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockAchievements.map(achievement => (
                <div key={achievement.id} 
                     className={`flex flex-col items-center text-center p-4 border rounded-lg shadow-sm space-y-2 ${achievement.achieved ? 'bg-accent/10 border-accent/50' : 'bg-muted/30'}`}>
                    <achievement.icon className={`h-10 w-10 mb-2 ${achievement.achieved ? 'text-accent' : 'text-muted-foreground/70'}`} />
                    <h3 className={`font-semibold ${achievement.achieved ? 'text-accent-foreground' : 'text-foreground'}`}>{achievement.name}</h3>
                    <p className={`text-xs ${achievement.achieved ? 'text-muted-foreground' : 'text-muted-foreground/80'}`}>{achievement.description}</p>
                    {!achievement.achieved && <p className="text-xs text-muted-foreground/60">(Not yet achieved)</p>}
                </div>
            ))}
        </CardContent>
      </Card>

       <Card className="shadow-lg">
        <CardHeader>
            <CardTitle className="text-xl text-foreground flex items-center">
                <TrendingUp className="mr-2 h-6 w-6 text-primary" />
                Your Impact vs. Peers
            </CardTitle>
            <CardDescription>See how your sustainability efforts compare (mock data).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-center">
            <p className="text-lg text-muted-foreground">
                Your estimated monthly emissions are <span className="font-semibold text-primary">1.85 tCO₂e</span>.
            </p>
            <p className="text-md text-accent-foreground bg-accent/10 p-3 rounded-md">
                This is <span className="font-bold">15% lower</span> than the average for businesses of your size in your industry!
            </p>
            <p className="text-xs text-muted-foreground">Keep up the great work! Explore our Eco-Tips for more ideas.</p>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
            <CardTitle className="text-xl text-foreground flex items-center">
                <Lightbulb className="mr-2 h-6 w-6 text-primary" />
                Personalized Eco-Tips
            </CardTitle>
            <CardDescription>Recommendations to further reduce your environmental impact.</CardDescription>
        </CardHeader>
        <CardContent>
            <ul className="space-y-3">
                {mockEcoRecommendations.map((tip, index) => (
                    <li key={index} className="flex items-start gap-3 p-3 border-b border-dashed last:border-b-0">
                        <Leaf className="h-5 w-5 text-accent shrink-0 mt-1" />
                        <span className="text-sm text-muted-foreground">{tip}</span>
                    </li>
                ))}
            </ul>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
            <CardTitle className="text-xl text-foreground">Carbon Offset Preferences &amp; Projects</CardTitle>
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

    