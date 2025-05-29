'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart2, 
  FileText, 
  ShoppingCart, 
  Activity,
  Zap,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  AlertTriangle
} from 'lucide-react';

interface MobileDashboardProps {
  organizationId: string;
  userName: string;
}

export function MobileDashboard({ organizationId, userName }: MobileDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');

  // Get time of day greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">{getGreeting()}, {userName}</h1>
        <p className="text-muted-foreground">
          Here's what's happening with your environmental impact today.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-3 h-auto">
          <TabsTrigger value="overview" className="py-2">Overview</TabsTrigger>
          <TabsTrigger value="insights" className="py-2">Insights</TabsTrigger>
          <TabsTrigger value="actions" className="py-2">Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Key metrics cards */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="p-3">
                <CardTitle className="text-sm">Carbon Emissions</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="text-2xl font-bold">24.5t</div>
                <div className="flex items-center text-xs text-green-600">
                  <TrendingDown className="mr-1 h-3 w-3" />
                  <span>12% vs. last month</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="p-3">
                <CardTitle className="text-sm">Energy Usage</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="text-2xl font-bold">1,245kWh</div>
                <div className="flex items-center text-xs text-red-600">
                  <TrendingUp className="mr-1 h-3 w-3" />
                  <span>8% vs. last month</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick access cards */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Quick Access</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <Link href="/carbon/marketplace">
                <Card className="h-full">
                  <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                    <ShoppingCart className="h-8 w-8 mb-2 text-primary" />
                    <span className="text-sm font-medium">Carbon Marketplace</span>
                  </CardContent>
                </Card>
              </Link>
              
              <Link href="/analytics/benchmarking">
                <Card className="h-full">
                  <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                    <Activity className="h-8 w-8 mb-2 text-primary" />
                    <span className="text-sm font-medium">Benchmarking</span>
                  </CardContent>
                </Card>
              </Link>
              
              <Link href="/compliance-reporting">
                <Card className="h-full">
                  <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                    <FileText className="h-8 w-8 mb-2 text-primary" />
                    <span className="text-sm font-medium">Compliance Reports</span>
                  </CardContent>
                </Card>
              </Link>
              
              <Link href="/analytics/enhanced">
                <Card className="h-full">
                  <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                    <Zap className="h-8 w-8 mb-2 text-primary" />
                    <span className="text-sm font-medium">Enhanced Analytics</span>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>

          {/* Recent activity */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Recent Activity</h2>
              <Button variant="ghost" size="sm" className="text-xs">
                View all
                <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </div>
            
            <div className="space-y-3">
              <Card>
                <CardContent className="p-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Carbon Credit Purchase</p>
                      <p className="text-xs text-muted-foreground">10 credits purchased</p>
                    </div>
                    <Badge variant="outline">Today</Badge>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Report Generated</p>
                      <p className="text-xs text-muted-foreground">GHG Protocol Q2 Report</p>
                    </div>
                    <Badge variant="outline">Yesterday</Badge>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Data Updated</p>
                      <p className="text-xs text-muted-foreground">Energy consumption data imported</p>
                    </div>
                    <Badge variant="outline">3 days ago</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Key Insights</h2>
            
            <div className="space-y-3">
              <Card>
                <CardContent className="p-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-full bg-yellow-100 text-yellow-800">
                      <AlertTriangle className="h-4 w-4" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Energy usage spike detected</p>
                      <p className="text-xs text-muted-foreground">
                        Unusual increase in energy consumption at your main office location.
                      </p>
                      <Button variant="link" size="sm" className="h-auto p-0 text-xs">
                        View details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-full bg-green-100 text-green-800">
                      <TrendingDown className="h-4 w-4" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Carbon reduction goal on track</p>
                      <p className="text-xs text-muted-foreground">
                        You're 68% of the way to your annual carbon reduction target.
                      </p>
                      <Button variant="link" size="sm" className="h-auto p-0 text-xs">
                        View details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-full bg-blue-100 text-blue-800">
                      <BarChart2 className="h-4 w-4" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Benchmarking update</p>
                      <p className="text-xs text-muted-foreground">
                        Your company is now in the top 25% of performers in your industry.
                      </p>
                      <Button variant="link" size="sm" className="h-auto p-0 text-xs">
                        View details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="actions" className="space-y-4">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Recommended Actions</h2>
            
            <div className="space-y-3">
              <Card>
                <CardContent className="p-3">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Purchase carbon credits</p>
                    <p className="text-xs text-muted-foreground">
                      Offset your remaining emissions for this quarter by purchasing verified carbon credits.
                    </p>
                    <Button size="sm" className="w-full">
                      Go to Marketplace
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-3">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Generate compliance report</p>
                    <p className="text-xs text-muted-foreground">
                      Your quarterly GHG Protocol report is due in 5 days.
                    </p>
                    <Button size="sm" className="w-full">
                      Generate Report
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-3">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Investigate energy usage</p>
                    <p className="text-xs text-muted-foreground">
                      Review the recent energy usage spike at your main office location.
                    </p>
                    <Button size="sm" className="w-full">
                      View Analytics
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-3">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Update data sharing preferences</p>
                    <p className="text-xs text-muted-foreground">
                      Enabling anonymous data sharing can improve your benchmarking insights.
                    </p>
                    <Button size="sm" className="w-full">
                      Update Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
