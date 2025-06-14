
"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart3, PieChart, TrendingUp, Users, FileText, BarChartHorizontalBig, Filter, CalendarDays, Download, Settings2, Leaf } from "lucide-react";
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar, PieChart as RechartsPieChart, Pie, Cell } from "recharts";
import { ChartContainer, ChartTooltipContent, ChartConfig } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { DatePickerWithRange } from "@/components/date-picker-with-range";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";


const mockRevenueData = [
  { month: "Jan", revenue: 4000, expenses: 2400 },
  { month: "Feb", revenue: 3000, expenses: 1398 },
  { month: "Mar", revenue: 2000, expenses: 9800 },
  { month: "Apr", revenue: 2780, expenses: 3908 },
  { month: "May", revenue: 1890, expenses: 4800 },
  { month: "Jun", revenue: 2390, expenses: 3800 },
];

const mockCarbonData = [
  { name: "Compute", value: 400, fill: "hsl(var(--chart-1))" },
  { name: "Storage", value: 300, fill: "hsl(var(--chart-2))"  },
  { name: "Networking", value: 300, fill: "hsl(var(--chart-3))"  },
  { name: "Other", value: 200, fill: "hsl(var(--chart-4))"  },
];

const mockInvoiceStatusData = [
  { status: "Paid", count: 125, fill: "hsl(var(--chart-1))"},
  { status: "Pending", count: 30, fill: "hsl(var(--chart-2))" },
  { status: "Overdue", count: 15, fill: "hsl(var(--chart-3))" },
];


const revenueChartConfig = {
  revenue: { label: "Revenue", color: "hsl(var(--chart-1))" },
  expenses: { label: "Expenses", color: "hsl(var(--chart-2))" },
} satisfies ChartConfig;

const carbonChartConfig = {
  value: { label: "tCO₂e" },
  Compute: { label: "Compute", color: "hsl(var(--chart-1))" },
  Storage: { label: "Storage", color: "hsl(var(--chart-2))" },
  Networking: { label: "Networking", color: "hsl(var(--chart-3))" },
  Other: { label: "Other", color: "hsl(var(--chart-4))" },
} satisfies ChartConfig;

const invoiceStatusChartConfig = {
  count: { label: "Invoices" },
  Paid: { label: "Paid", color: "hsl(var(--chart-1))" },
  Pending: { label: "Pending", color: "hsl(var(--chart-2))" },
  Overdue: { label: "Overdue", color: "hsl(var(--chart-3))" },
} satisfies ChartConfig;

const sustainabilityReportOptions = [
    { id: "emissions_overview", label: "Emissions Overview (Total & Net)" },
    { id: "offset_effectiveness", label: "Offset Effectiveness & Contribution History" },
    { id: "source_breakdown", label: "Emissions by Source (Compute, Storage, etc.)" },
    { id: "period_comparison", label: "Period-over-Period Emissions Comparison" },
    { id: "benchmark_comparison", label: "Comparison to Industry Benchmarks" },
    { id: "recommendations_impact", label: "Impact of Implemented Eco-Tips" },
];


export default function ReportsPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [selectedReportOptions, setSelectedReportOptions] = useState<string[]>(["emissions_overview", "source_breakdown"]);
  const { toast } = useToast();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleReportOptionChange = (optionId: string) => {
    setSelectedReportOptions(prev =>
      prev.includes(optionId)
        ? prev.filter(id => id !== optionId)
        : [...prev, optionId]
    );
  };

  const handleGenerateReport = () => {
    if (selectedReportOptions.length === 0) {
        toast({
            variant: "destructive",
            title: "No Options Selected",
            description: "Please select at least one data point for your report.",
        });
        return;
    }
    toast({
        title: "Report Generation Started (Simulated)",
        description: `Generating sustainability report with: ${selectedReportOptions.map(opt => sustainabilityReportOptions.find(o=>o.id === opt)?.label || opt).join(', ')}. This is a placeholder.`,
    });
  };

  if (!isMounted) {
    return (
      <div className="space-y-8">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-72" />
        </div>
        {/* Chart Cards Skeleton */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1,2,3].map(i => (
            <Card key={i} className="shadow-lg">
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-1" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-48 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        {/* Table Card Skeleton */}
         <Card className="shadow-lg">
          <CardHeader>
            <Skeleton className="h-6 w-1/2 mb-1" />
            <Skeleton className="h-4 w-3/4" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1,2,3,4].map(i => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          </CardContent>
        </Card>
        {/* Custom Report Generator Skeleton */}
        <Card className="shadow-lg">
            <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-1" />
                <Skeleton className="h-4 w-full" />
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <Skeleton className="h-5 w-1/4 mb-2" />
                    <Skeleton className="h-10 w-full md:w-2/3" /> {/* Date Picker Placeholder */}
                </div>
                <div>
                    <Skeleton className="h-5 w-1/3 mb-3" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[...Array(sustainabilityReportOptions.length)].map((_, i) => (
                            <div key={i} className="flex items-center space-x-2 p-2 rounded-md bg-muted/50">
                                <Skeleton className="h-4 w-4 rounded-sm" />
                                <Skeleton className="h-4 flex-1" />
                            </div>
                        ))}
                    </div>
                </div>
                <Skeleton className="h-10 w-full md:w-1/3 mt-3" /> {/* Button Placeholder */}
            </CardContent>
        </Card>
      </div>
    );
  }


  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center">
          <BarChartHorizontalBig className="mr-3 h-8 w-8 text-primary" />
          Reports &amp; Analytics
        </h1>
        <p className="text-muted-foreground">
          Detailed insights into your billing, carbon footprint, and more. (Placeholder data)
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-foreground flex items-center">
              <TrendingUp className="mr-2 h-5 w-5 text-primary" /> Revenue Overview
            </CardTitle>
            <CardDescription>Monthly revenue and expenses trend.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={revenueChartConfig} className="h-[250px] w-full">
              <BarChart data={mockRevenueData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} fontSize={12} unit="$" />
                <Tooltip content={<ChartTooltipContent indicator="dot" />} />
                <Legend />
                <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
                <Bar dataKey="expenses" fill="var(--color-expenses)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-foreground flex items-center">
              <PieChart className="mr-2 h-5 w-5 text-primary" /> Carbon Emissions by Source
            </CardTitle>
            <CardDescription>Breakdown of CO₂e by service type.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <ChartContainer config={carbonChartConfig} className="h-[250px] w-[300px]">
              <RechartsPieChart>
                <Tooltip content={<ChartTooltipContent nameKey="name" hideLabel />} />
                <Pie data={mockCarbonData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                   {mockCarbonData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                 <Legend iconType="circle" />
              </RechartsPieChart>
            </ChartContainer>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-foreground flex items-center">
              <FileText className="mr-2 h-5 w-5 text-primary" /> Invoice Status
            </CardTitle>
            <CardDescription>Overview of current invoice statuses.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
             <ChartContainer config={invoiceStatusChartConfig} className="h-[250px] w-[300px]">
              <RechartsPieChart>
                <Tooltip content={<ChartTooltipContent nameKey="status" hideLabel />} />
                <Pie data={mockInvoiceStatusData} dataKey="count" nameKey="status" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} label={({ status, percent }) => `${(percent * 100).toFixed(0)}%`}>
                   {mockInvoiceStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                 <Legend iconType="circle" />
              </RechartsPieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl text-foreground flex items-center">
            <Users className="mr-2 h-5 w-5 text-primary" /> Customer Churn Analysis (Mock)
          </CardTitle>
          <CardDescription>Simulated data for churn rate and contributing factors.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Segment</TableHead>
                <TableHead>Churn Rate</TableHead>
                <TableHead className="text-right">High-Risk Customers</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>New Customers (0-3 Mo)</TableCell>
                <TableCell className="text-destructive">12%</TableCell>
                <TableCell className="text-right">8</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Established (3-12 Mo)</TableCell>
                <TableCell>5%</TableCell>
                <TableCell className="text-right">12</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Long-Term (12+ Mo)</TableCell>
                <TableCell>2%</TableCell>
                <TableCell className="text-right">5</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
            <CardTitle className="text-xl text-foreground flex items-center">
                <Leaf className="mr-2 h-5 w-5 text-primary" /> Custom Sustainability Report
            </CardTitle>
            <CardDescription>Generate a detailed report on your sustainability metrics.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div>
                <Label htmlFor="report-date-range" className="text-base font-medium mb-2 block">
                    <CalendarDays className="mr-2 h-4 w-4 inline-block text-muted-foreground"/>
                    Report Date Range
                </Label>
                <DatePickerWithRange className="w-full md:w-auto" id="report-date-range" />
            </div>
            <Separator />
            <div>
                <Label className="text-base font-medium mb-3 block">
                    <Settings2 className="mr-2 h-4 w-4 inline-block text-muted-foreground"/>
                    Data Points to Include
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 rounded-md border p-4 bg-background">
                    {sustainabilityReportOptions.map(option => (
                        <div key={option.id} className="flex items-center space-x-2 hover:bg-muted/50 p-1.5 rounded-md transition-colors">
                            <Checkbox
                                id={`report-opt-${option.id}`}
                                checked={selectedReportOptions.includes(option.id)}
                                onCheckedChange={() => handleReportOptionChange(option.id)}
                            />
                            <Label htmlFor={`report-opt-${option.id}`} className="font-normal text-sm cursor-pointer flex-1">
                                {option.label}
                            </Label>
                        </div>
                    ))}
                </div>
            </div>
        </CardContent>
        <CardFooter>
            <Button onClick={handleGenerateReport} disabled={selectedReportOptions.length === 0}>
                <Download className="mr-2 h-4 w-4" /> Generate Report (Simulated)
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

    