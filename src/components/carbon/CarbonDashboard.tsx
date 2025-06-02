import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Loader2, AlertCircle, TrendingUp, TrendingDown, Leaf, DollarSign, 
  BarChart4, Activity, ListTodo, Download, Share2, Target, Zap,
  Factory, Car, Home, Plane, ShoppingCart, Calendar, Users, Award
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

// Mock data - replace with your actual service calls
const mockCarbonSummary = {
  totalCarbonInKg: 15420.5,
  offsetCarbonInKg: 8250.0,
  remainingCarbonInKg: 7170.5,
  offsetPercentage: 53.5,
  totalOffsetPurchases: 12,
  monthlyCarbonTrend: [
    { month: 'Jan', totalCarbonInKg: 1200, offsetCarbonInKg: 600 },
    { month: 'Feb', totalCarbonInKg: 1100, offsetCarbonInKg: 550 },
    { month: 'Mar', totalCarbonInKg: 1350, offsetCarbonInKg: 700 },
    { month: 'Apr', totalCarbonInKg: 1180, offsetCarbonInKg: 650 },
    { month: 'May', totalCarbonInKg: 1420, offsetCarbonInKg: 800 },
    { month: 'Jun', totalCarbonInKg: 1300, offsetCarbonInKg: 750 },
  ]
};

const mockEmissionsBreakdown = [
  { category: 'Transportation', amount: 4200, percentage: 27.2, icon: Car, color: '#ef4444' },
  { category: 'Energy', amount: 3800, percentage: 24.6, icon: Zap, color: '#f59e0b' },
  { category: 'Manufacturing', amount: 2900, percentage: 18.8, icon: Factory, color: '#8b5cf6' },
  { category: 'Travel', amount: 2100, percentage: 13.6, icon: Plane, color: '#06b6d4' },
  { category: 'Office', amount: 1520, percentage: 9.9, icon: Home, color: '#10b981' },
  { category: 'Supplies', amount: 900, percentage: 5.8, icon: ShoppingCart, color: '#f97316' },
];

const mockOffsetHistory = [
  { id: 1, date: '2024-05-15', project: 'Renewable Energy Project', amount: 500, cost: 12.50, status: 'completed' },
  { id: 2, date: '2024-04-28', project: 'Forest Conservation', amount: 750, cost: 18.75, status: 'completed' },
  { id: 3, date: '2024-03-20', project: 'Solar Farm Initiative', amount: 300, cost: 7.50, status: 'completed' },
  { id: 4, date: '2024-02-10', project: 'Methane Capture Program', amount: 600, cost: 15.00, status: 'completed' },
];

const mockGoals = [
  { id: 1, title: 'Reduce emissions by 25%', target: 25, current: 18, deadline: '2024-12-31', status: 'on-track' },
  { id: 2, title: 'Achieve carbon neutrality', target: 100, current: 53.5, deadline: '2025-06-30', status: 'at-risk' },
  { id: 3, title: 'Offset 10,000 kg CO2e', target: 10000, current: 8250, deadline: '2024-09-30', status: 'on-track' },
];

const mockInsights = [
  {
    type: 'reduction',
    title: 'Switch to renewable energy',
    impact: '12% reduction',
    description: 'Switching to renewable energy sources could reduce your carbon footprint by approximately 1,850 kg CO2e annually.',
    priority: 'high'
  },
  {
    type: 'efficiency',
    title: 'Optimize transportation routes',
    impact: '8% reduction',
    description: 'Route optimization and carpooling initiatives could save 1,236 kg CO2e per year.',
    priority: 'medium'
  },
  {
    type: 'offset',
    title: 'Invest in forest conservation',
    impact: 'Offset 2,000 kg',
    description: 'Supporting reforestation projects offers high-quality carbon credits at competitive rates.',
    priority: 'low'
  }
];

export default function CarbonDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [carbonSummary, setCarbonSummary] = useState(mockCarbonSummary);
  const [offsetRecommendation, setOffsetRecommendation] = useState({
    recommendedCarbonInKg: 1500,
    estimatedCostInUsd: 37.50
  });

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const formatNumber = (num, decimals = 2) => {
    return num.toLocaleString(undefined, { 
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  };

  const calculateTrend = () => {
    if (!carbonSummary || carbonSummary.monthlyCarbonTrend.length < 2) return null;
    const trend = carbonSummary.monthlyCarbonTrend;
    const currentMonth = trend[trend.length - 1];
    const previousMonth = trend[trend.length - 2];
    if (previousMonth.totalCarbonInKg === 0) return null;
    const percentChange = ((currentMonth.totalCarbonInKg - previousMonth.totalCarbonInKg) / previousMonth.totalCarbonInKg) * 100;
    return {
      value: Math.abs(percentChange).toFixed(1),
      isIncrease: percentChange > 0,
    };
  };

  const trend = calculateTrend();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading carbon data...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Carbon Dashboard</h1>
          <p className="text-muted-foreground">Track, analyze, and offset your carbon footprint</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            Share
          </Button>
          <Button className="flex items-center gap-2">
            <Leaf className="h-4 w-4" />
            Offset Now
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="overview" className="space-y-4" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="emissions">Emissions</TabsTrigger>
          <TabsTrigger value="offsets">Offsets</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Carbon Footprint</CardTitle>
                <BarChart4 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatNumber(carbonSummary.totalCarbonInKg)} kg
                </div>
                <p className="text-xs text-muted-foreground">CO₂ equivalent</p>
                {trend && (
                  <div className="flex items-center mt-2">
                    {trend.isIncrease ? (
                      <TrendingUp className="h-4 w-4 text-destructive mr-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-green-500 mr-1" />
                    )}
                    <span className={trend.isIncrease ? 'text-destructive text-xs' : 'text-green-500 text-xs'}>
                      {trend.value}% {trend.isIncrease ? 'increase' : 'decrease'} from last month
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Carbon Offset</CardTitle>
                <Leaf className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatNumber(carbonSummary.offsetCarbonInKg)} kg
                </div>
                <p className="text-xs text-muted-foreground">CO₂ offset through purchases</p>
                <div className="mt-2">
                  <Progress value={carbonSummary.offsetPercentage} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatNumber(carbonSummary.offsetPercentage, 1)}% offset
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Remaining Carbon</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatNumber(carbonSummary.remainingCarbonInKg)} kg
                </div>
                <p className="text-xs text-muted-foreground">CO₂ not yet offset</p>
                <Button variant="outline" size="sm" className="mt-2">
                  Offset Now
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Estimated Offset Cost</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${formatNumber(offsetRecommendation.estimatedCostInUsd, 2)}
                </div>
                <p className="text-xs text-muted-foreground">To offset remaining carbon</p>
                <p className="text-xs text-muted-foreground mt-1">Based on current market rates</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Carbon Emissions Trend</CardTitle>
                <CardDescription>Monthly carbon emissions over time</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={carbonSummary.monthlyCarbonTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="totalCarbonInKg" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} name="Total Emissions" />
                    <Area type="monotone" dataKey="offsetCarbonInKg" stackId="2" stroke="#10b981" fill="#10b981" fillOpacity={0.6} name="Offset Amount" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Emissions Breakdown</CardTitle>
                <CardDescription>Sources of carbon emissions</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={mockEmissionsBreakdown}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="amount"
                      label={({ category, percentage }) => `${category}: ${percentage}%`}
                    >
                      {mockEmissionsBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Emissions Tab */}
        <TabsContent value="emissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Emissions Analysis</CardTitle>
              <CardDescription>Comprehensive breakdown of your carbon emissions by category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockEmissionsBreakdown.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.category} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 rounded-full" style={{ backgroundColor: `${item.color}20` }}>
                          <Icon className="h-5 w-5" style={{ color: item.color }} />
                        </div>
                        <div>
                          <h3 className="font-medium">{item.category}</h3>
                          <p className="text-sm text-muted-foreground">{item.percentage}% of total emissions</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatNumber(item.amount)} kg</p>
                        <p className="text-xs text-muted-foreground mt-1">CO₂e</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Monthly Emissions Comparison</CardTitle>
              <CardDescription>Track emissions changes across categories</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={carbonSummary.monthlyCarbonTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="totalCarbonInKg" fill="#ef4444" name="Total Emissions" />
                  <Bar dataKey="offsetCarbonInKg" fill="#10b981" name="Offset Amount" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Offsets Tab */}
        <TabsContent value="offsets" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Offset Recommendation</CardTitle>
                <CardDescription>Personalized offset suggestions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h3 className="font-medium text-green-900">Recommended Offset</h3>
                    <p className="text-2xl font-bold text-green-900">
                      {formatNumber(offsetRecommendation.recommendedCarbonInKg)} kg CO₂e
                    </p>
                    <p className="text-sm text-green-700 mt-1">
                      Estimated cost: ${formatNumber(offsetRecommendation.estimatedCostInUsd)}
                    </p>
                  </div>
                  <Button className="w-full">Purchase Carbon Offsets</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Offset Portfolio</CardTitle>
                <CardDescription>Your impact across different projects</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Renewable Energy</span>
                    <span className="text-sm font-medium">35%</span>
                  </div>
                  <Progress value={35} className="h-2" />
                  
                  <div className="flex justify-between">
                    <span className="text-sm">Forest Conservation</span>
                    <span className="text-sm font-medium">28%</span>
                  </div>
                  <Progress value={28} className="h-2" />

                  <div className="flex justify-between">
                    <span className="text-sm">Methane Capture</span>
                    <span className="text-sm font-medium">22%</span>
                  </div>
                  <Progress value={22} className="h-2" />

                  <div className="flex justify-between">
                    <span className="text-sm">Other Projects</span>
                    <span className="text-sm font-medium">15%</span>
                  </div>
                  <Progress value={15} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Offset History</CardTitle>
              <CardDescription>Your past carbon offset purchases</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Date</th>
                      <th className="text-left p-2">Project</th>
                      <th className="text-left p-2">Amount</th>
                      <th className="text-left p-2">Cost</th>
                      <th className="text-left p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockOffsetHistory.map((offset) => (
                      <tr key={offset.id} className="border-b">
                        <td className="p-2">{new Date(offset.date).toLocaleDateString()}</td>
                        <td className="p-2">{offset.project}</td>
                        <td className="p-2">{offset.amount} kg CO₂e</td>
                        <td className="p-2">${offset.cost}</td>
                        <td className="p-2">
                          <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                            {offset.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Carbon Intensity</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0.34</div>
                <p className="text-xs text-muted-foreground">kg CO₂e per dollar revenue</p>
                <div className="flex items-center mt-2">
                  <TrendingDown className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-green-500 text-xs">12% improvement</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Offset Efficiency</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">87%</div>
                <p className="text-xs text-muted-foreground">Verified offset quality score</p>
                <Progress value={87} className="h-2 mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Peer Ranking</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Top 15%</div>
                <p className="text-xs text-muted-foreground">Among similar organizations</p>
                <p className="text-xs text-green-600 mt-1">Above average performance</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Advanced Analytics</CardTitle>
              <CardDescription>Deep dive into your carbon performance</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={carbonSummary.monthlyCarbonTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="totalCarbonInKg" stroke="#ef4444" strokeWidth={2} name="Total Emissions" />
                  <Line type="monotone" dataKey="offsetCarbonInKg" stroke="#10b981" strokeWidth={2} name="Offsets" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI-Powered Insights</CardTitle>
              <CardDescription>Personalized recommendations to reduce your carbon footprint</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockInsights.map((insight, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{insight.title}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        insight.priority === 'high' ? 'bg-red-100 text-red-800' :
                        insight.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {insight.priority} priority
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{insight.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-green-600">{insight.impact}</span>
                      <Button variant="outline" size="sm">Learn More</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Goals Tab */}
        <TabsContent value="goals" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Carbon Goals</h2>
            <Button>Add New Goal</Button>
          </div>
          <div className="grid gap-4">
            {mockGoals.map((goal) => (
              <Card key={goal.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{goal.title}</CardTitle>
                    <span className={`px-2 py-1 text-xs rounded-full ${goal.status === 'on-track' ? 'bg-green-100 text-green-800' : goal.status === 'at-risk' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                      {goal.status.replace('-', ' ')}
                    </span>
                  </div>
                  <CardDescription>Deadline: {new Date(goal.deadline).toLocaleDateString()}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{goal.current}{typeof goal.target === 'number' && goal.target < 100 ? '%' : ''} of {goal.target}{typeof goal.target === 'number' && goal.target < 100 ? '%' : ''}</span>
                    </div>
                    <Progress value={(goal.current / goal.target) * 100} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Generate Reports</CardTitle>
                  <CardDescription>Create detailed carbon footprint reports for stakeholders</CardDescription>
                </div>
                <Button className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Generate Report
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="p-4">
                  <h3 className="font-medium mb-2">Monthly Summary</h3>
                  <p className="text-sm text-muted-foreground mb-4">Comprehensive monthly carbon footprint analysis</p>
                  <Button variant="outline" size="sm">Download PDF</Button>
                </Card>
                <Card className="p-4">
                  <h3 className="font-medium mb-2">Offset Certificate</h3>
                  <p className="text-sm text-muted-foreground mb-4">Official certificate of your carbon offset purchases</p>
                  <Button variant="outline" size="sm">Download PDF</Button>
                </Card>
                <Card className="p-4">
                  <h3 className="font-medium mb-2">ESG Report</h3>
                  <p className="text-sm text-muted-foreground mb-4">Environmental, Social, and Governance report</p>
                  <Button variant="outline" size="sm">Download PDF</Button>
                </Card>
                <Card className="p-4">
                  <h3 className="font-medium mb-2">Audit Trail</h3>
                  <p className="text-sm text-muted-foreground mb-4">Detailed log of all carbon tracking activities</p>
                  <Button variant="outline" size="sm">Download CSV</Button>
                </Card>
                <Card className="p-4">
                  <h3 className="font-medium mb-2">Benchmark Report</h3>
                  <p className="text-sm text-muted-foreground mb-4">Compare your performance against industry peers</p>
                  <Button variant="outline" size="sm">Download PDF</Button>
                </Card>
                <Card className="p-4">
                  <h3 className="font-medium mb-2">Custom Report</h3>
                  <p className="text-sm text-muted-foreground mb-4">Create a custom report with selected metrics</p>
                  <Button variant="outline" size="sm">Configure & Download</Button>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 