import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { DashboardCustomizer } from '@/components/dashboard/personalization/dashboard-customizer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart2, LineChart, PieChart, Activity, Zap, FileText, ShoppingCart, Settings, RefreshCcw } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Personalized Dashboard | ClimaBill',
  description: 'Your personalized ClimaBill dashboard',
};

// Mock function to get user dashboard settings
async function getUserDashboard(userId: string) {
  // In a real implementation, this would fetch from the database
  return {
    id: 'dashboard-1',
    name: 'My Dashboard',
    isDefault: true,
    refreshInterval: 0,
    autoRefresh: false,
    dateRange: 'last30days',
    theme: 'default',
    widgets: [
      {
        id: 'total-emissions',
        name: 'Total Carbon Emissions',
        description: 'Shows your total carbon emissions over time',
        category: 'emissions',
        icon: BarChart2,
        size: 'medium',
        position: { x: 0, y: 0, width: 6, height: 6 }
      },
      {
        id: 'emissions-by-source',
        name: 'Emissions by Source',
        description: 'Breakdown of carbon emissions by source',
        category: 'emissions',
        icon: PieChart,
        size: 'medium',
        position: { x: 6, y: 0, width: 6, height: 6 }
      },
      {
        id: 'energy-consumption',
        name: 'Energy Consumption',
        description: 'Total energy consumption over time',
        category: 'energy',
        icon: Zap,
        size: 'medium',
        position: { x: 0, y: 6, width: 6, height: 6 }
      },
      {
        id: 'carbon-credits',
        name: 'Carbon Credits',
        description: 'Overview of your carbon credit portfolio',
        category: 'marketplace',
        icon: ShoppingCart,
        size: 'medium',
        position: { x: 6, y: 6, width: 6, height: 6 }
      }
    ]
  };
}

export default async function PersonalizedDashboardPage() {
  // Get session
  const session = await getServerSession(authOptions);
  
  // Redirect if not authenticated
  if (!session || !session.user) {
    redirect('/login');
  }

  // Get user ID
  const userId = session.user.id || '';

  // Get user dashboard settings
  const dashboard = await getUserDashboard(userId);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{dashboard.name}</h1>
          <p className="text-muted-foreground">Your personalized dashboard</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </Button>
          <DashboardCustomizer 
            userId={userId} 
            dashboardId={dashboard.id}
          />
        </div>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="saved-views">Saved Views</TabsTrigger>
        </TabsList>
        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid grid-cols-12 gap-4">
            {dashboard.widgets.map((widget) => {
              const Icon = widget.icon;
              
              return (
                <Card 
                  key={widget.id} 
                  className="col-span-12 md:col-span-6"
                  style={{
                    gridColumn: `span ${widget.position.width}`,
                    gridRow: `span ${widget.position.height}`
                  }}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <Icon className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg">{widget.name}</CardTitle>
                      </div>
                      <Button variant="ghost" size="icon">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                    <CardDescription>{widget.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[200px] flex items-center justify-center bg-muted/20 rounded-md">
                      <p className="text-muted-foreground">Widget visualization would appear here</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
        <TabsContent value="saved-views">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Emissions Overview</CardTitle>
                <CardDescription>Last updated: 2 hours ago</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[100px] flex items-center justify-center bg-muted/20 rounded-md">
                  <Activity className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Energy Analysis</CardTitle>
                <CardDescription>Last updated: 1 day ago</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[100px] flex items-center justify-center bg-muted/20 rounded-md">
                  <Zap className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Compliance Status</CardTitle>
                <CardDescription>Last updated: 3 days ago</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[100px] flex items-center justify-center bg-muted/20 rounded-md">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
