'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { WidgetGallery } from './widget-gallery';
import { LayoutEditor } from './layout-editor';
import { Settings, Palette, LayoutGrid, Plus, Save, Loader2 } from 'lucide-react';
import { CSRF_COOKIE_NAME, CSRF_HEADER_NAME, generateCsrfToken } from '@/lib/auth/csrf';

interface DashboardCustomizerProps {
  userId: string;
  dashboardId?: string;
  onSave?: () => void;
}

export function DashboardCustomizer({ userId, dashboardId, onSave }: DashboardCustomizerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('widgets');
  const [isSaving, setIsSaving] = useState(false);
  const [dashboardSettings, setDashboardSettings] = useState({
    name: 'My Dashboard',
    isDefault: true,
    refreshInterval: '0',
    autoRefresh: false,
    dateRange: 'last30days',
    layout: [] as any[],
    widgets: [] as any[],
    theme: 'default'
  });

  // Handle saving dashboard changes
  const handleSaveDashboard = async () => {
    try {
      setIsSaving(true);
      // Get CSRF token from cookie
      let csrfToken = document.cookie.split('; ').find(row => row.startsWith(CSRF_COOKIE_NAME + '='))?.split('=')[1];
      if (!csrfToken) {
        csrfToken = generateCsrfToken();
        document.cookie = `${CSRF_COOKIE_NAME}=${csrfToken}; path=/; SameSite=Lax`;
      }
      // Call API to save dashboard settings
      const response = await fetch('/api/dashboard/personalization', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          [CSRF_HEADER_NAME]: csrfToken || '',
        },
        body: JSON.stringify({
          userId,
          dashboardId,
          settings: dashboardSettings
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save dashboard settings');
      }

      // Show success message
      toast({
        title: 'Dashboard saved',
        description: 'Your dashboard settings have been saved successfully.',
      });

      // Close dialog
      setIsOpen(false);

      // Call onSave callback if provided
      if (onSave) {
        onSave();
      }
    } catch (error) {
      console.error('Error saving dashboard:', error);
      toast({
        title: 'Error',
        description: 'Failed to save dashboard settings. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle adding a widget
  const handleAddWidget = (widget: any) => {
    setDashboardSettings(prev => ({
      ...prev,
      widgets: [...prev.widgets, widget]
    }));
  };

  // Handle removing a widget
  const handleRemoveWidget = (widgetId: string) => {
    setDashboardSettings(prev => ({
      ...prev,
      widgets: prev.widgets.filter(w => w.id !== widgetId)
    }));
  };

  // Handle updating layout
  const handleLayoutUpdate = (layout: any[]) => {
    setDashboardSettings(prev => ({
      ...prev,
      layout
    }));
  };

  // Handle input change
  const handleInputChange = (field: string, value: any) => {
    setDashboardSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings className="h-4 w-4" />
          Customize Dashboard
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Customize Your Dashboard</DialogTitle>
          <DialogDescription>
            Add widgets, rearrange your layout, and customize your dashboard experience.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col mt-4">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="widgets" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span>Add Widgets</span>
            </TabsTrigger>
            <TabsTrigger value="layout" className="flex items-center gap-2">
              <LayoutGrid className="h-4 w-4" />
              <span>Layout</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              <span>Settings</span>
            </TabsTrigger>
          </TabsList>
          
          <div className="flex-1 overflow-auto mt-4">
            <TabsContent value="widgets" className="h-full">
              <WidgetGallery onAddWidget={handleAddWidget} selectedWidgets={dashboardSettings.widgets} />
            </TabsContent>
            
            <TabsContent value="layout" className="h-full">
              <LayoutEditor 
                layout={dashboardSettings.layout} 
                widgets={dashboardSettings.widgets}
                onLayoutChange={handleLayoutUpdate}
                onRemoveWidget={handleRemoveWidget}
              />
            </TabsContent>
            
            <TabsContent value="settings" className="h-full">
              <div className="space-y-6 p-1">
                <div className="space-y-2">
                  <Label htmlFor="dashboard-name">Dashboard Name</Label>
                  <Input 
                    id="dashboard-name" 
                    value={dashboardSettings.name} 
                    onChange={(e) => handleInputChange('name', e.target.value)} 
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="default-dashboard" 
                    checked={dashboardSettings.isDefault}
                    onCheckedChange={(checked) => handleInputChange('isDefault', checked)}
                  />
                  <Label htmlFor="default-dashboard">Set as default dashboard</Label>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Data Settings</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="date-range">Default Date Range</Label>
                    <Select 
                      value={dashboardSettings.dateRange} 
                      onValueChange={(value) => handleInputChange('dateRange', value)}
                    >
                      <SelectTrigger id="date-range">
                        <SelectValue placeholder="Select date range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="yesterday">Yesterday</SelectItem>
                        <SelectItem value="last7days">Last 7 Days</SelectItem>
                        <SelectItem value="last30days">Last 30 Days</SelectItem>
                        <SelectItem value="thisMonth">This Month</SelectItem>
                        <SelectItem value="lastMonth">Last Month</SelectItem>
                        <SelectItem value="thisQuarter">This Quarter</SelectItem>
                        <SelectItem value="lastQuarter">Last Quarter</SelectItem>
                        <SelectItem value="thisYear">This Year</SelectItem>
                        <SelectItem value="lastYear">Last Year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="refresh-interval">Refresh Interval</Label>
                    <Select 
                      value={dashboardSettings.refreshInterval} 
                      onValueChange={(value) => handleInputChange('refreshInterval', value)}
                    >
                      <SelectTrigger id="refresh-interval">
                        <SelectValue placeholder="Select refresh interval" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Never</SelectItem>
                        <SelectItem value="60">Every minute</SelectItem>
                        <SelectItem value="300">Every 5 minutes</SelectItem>
                        <SelectItem value="900">Every 15 minutes</SelectItem>
                        <SelectItem value="1800">Every 30 minutes</SelectItem>
                        <SelectItem value="3600">Every hour</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="auto-refresh" 
                      checked={dashboardSettings.autoRefresh}
                      onCheckedChange={(checked) => handleInputChange('autoRefresh', checked)}
                    />
                    <Label htmlFor="auto-refresh">Auto-refresh when tab is visible</Label>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="theme">Dashboard Theme</Label>
                  <Select 
                    value={dashboardSettings.theme} 
                    onValueChange={(value) => handleInputChange('theme', value)}
                  >
                    <SelectTrigger id="theme">
                      <SelectValue placeholder="Select theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default</SelectItem>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="green">Green</SelectItem>
                      <SelectItem value="blue">Blue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
        
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSaveDashboard} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Dashboard
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
