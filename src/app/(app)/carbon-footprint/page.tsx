"use client"; // This page uses client-side state for the chart

import { useState, useEffect } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip as RechartsTooltip } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Info, Leaf, Cloud, BarChart3 } from "lucide-react";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const initialChartData = [
  { month: "Jan", emissions: 0, offset: 0 },
  { month: "Feb", emissions: 0, offset: 0 },
  { month: "Mar", emissions: 0, offset: 0 },
  { month: "Apr", emissions: 0, offset: 0 },
  { month: "May", emissions: 0, offset: 0 },
  { month: "Jun", emissions: 0, offset: 0 },
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

export default function CarbonFootprintPage() {
  const [chartData, setChartData] = useState(initialChartData);
  const [timeframe, setTimeframe] = useState("6m");
  const [enableRealtime, setEnableRealtime] = useState(true);

  useEffect(() => {
    // Simulate data fetching or calculation
    const generateData = () => {
      const months = timeframe === "12m" 
        ? ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        : ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
      
      return months.map(month => ({
        month,
        emissions: parseFloat((Math.random() * 5 + 1).toFixed(2)), // 1 to 6 tCO₂e
        offset: parseFloat((Math.random() * 2).toFixed(2)),      // 0 to 2 tCO₂e
      }));
    };
    setChartData(generateData());
  }, [timeframe]);

  const totalEmissions = chartData.reduce((sum, item) => sum + item.emissions, 0);
  const totalOffset = chartData.reduce((sum, item) => sum + item.offset, 0);

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
            <Info className="h-4 w-4 text-muted-foreground float-right" />
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
          <CardTitle className="text-xl text-foreground">Carbon Offset Preferences</CardTitle>
          <CardDescription>Manage your contributions to carbon offset projects.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg bg-background">
            <div>
              <Label htmlFor="auto-offset" className="text-base font-medium">Automatic Carbon Offset</Label>
              <p className="text-sm text-muted-foreground">Enable to automatically offset a percentage of your emissions.</p>
            </div>
            <Switch id="auto-offset" />
          </div>
          <div className="flex items-center justify-between p-4 border rounded-lg bg-background">
            <div>
              <Label htmlFor="one-time-offset" className="text-base font-medium">One-time Offset Contribution</Label>
              <p className="text-sm text-muted-foreground">Make an additional contribution to offset projects.</p>
            </div>
            <Button variant="outline">Contribute Now</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
