'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart2, 
  LineChart, 
  PieChart, 
  Activity, 
  Zap, 
  FileText, 
  ShoppingCart, 
  Search, 
  Plus, 
  Check,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Calendar,
  Map,
  Droplets,
  Trash2
} from 'lucide-react';

interface WidgetGalleryProps {
  onAddWidget: (widget: any) => void;
  selectedWidgets: any[];
}

export function WidgetGallery({ onAddWidget, selectedWidgets }: WidgetGalleryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  // Widget categories
  const categories = [
    { id: 'all', name: 'All Widgets' },
    { id: 'emissions', name: 'Carbon Emissions' },
    { id: 'energy', name: 'Energy' },
    { id: 'water', name: 'Water' },
    { id: 'waste', name: 'Waste' },
    { id: 'financial', name: 'Financial' },
    { id: 'marketplace', name: 'Carbon Marketplace' },
    { id: 'benchmarking', name: 'Benchmarking' },
    { id: 'reporting', name: 'Reporting' }
  ];

  // Widget definitions
  const allWidgets = [
    {
      id: 'total-emissions',
      name: 'Total Carbon Emissions',
      description: 'Shows your total carbon emissions over time',
      category: 'emissions',
      icon: BarChart2,
      size: 'medium'
    },
    {
      id: 'emissions-by-source',
      name: 'Emissions by Source',
      description: 'Breakdown of carbon emissions by source',
      category: 'emissions',
      icon: PieChart,
      size: 'medium'
    },
    {
      id: 'emissions-trend',
      name: 'Emissions Trend',
      description: 'Carbon emissions trend over time',
      category: 'emissions',
      icon: LineChart,
      size: 'large'
    },
    {
      id: 'energy-consumption',
      name: 'Energy Consumption',
      description: 'Total energy consumption over time',
      category: 'energy',
      icon: Zap,
      size: 'medium'
    },
    {
      id: 'energy-by-source',
      name: 'Energy by Source',
      description: 'Breakdown of energy consumption by source',
      category: 'energy',
      icon: PieChart,
      size: 'medium'
    },
    {
      id: 'energy-intensity',
      name: 'Energy Intensity',
      description: 'Energy consumption per unit of output',
      category: 'energy',
      icon: Activity,
      size: 'small'
    },
    {
      id: 'water-usage',
      name: 'Water Usage',
      description: 'Total water usage over time',
      category: 'water',
      icon: Droplets,
      size: 'medium'
    },
    {
      id: 'water-by-facility',
      name: 'Water by Facility',
      description: 'Breakdown of water usage by facility',
      category: 'water',
      icon: Map,
      size: 'medium'
    },
    {
      id: 'waste-generated',
      name: 'Waste Generated',
      description: 'Total waste generated over time',
      category: 'waste',
      icon: Trash2,
      size: 'medium'
    },
    {
      id: 'waste-by-type',
      name: 'Waste by Type',
      description: 'Breakdown of waste by type',
      category: 'waste',
      icon: PieChart,
      size: 'medium'
    },
    {
      id: 'carbon-cost',
      name: 'Carbon Cost',
      description: 'Financial impact of carbon emissions',
      category: 'financial',
      icon: TrendingUp,
      size: 'small'
    },
    {
      id: 'carbon-savings',
      name: 'Carbon Savings',
      description: 'Financial savings from carbon reduction initiatives',
      category: 'financial',
      icon: TrendingDown,
      size: 'small'
    },
    {
      id: 'carbon-credits',
      name: 'Carbon Credits',
      description: 'Overview of your carbon credit portfolio',
      category: 'marketplace',
      icon: ShoppingCart,
      size: 'medium'
    },
    {
      id: 'marketplace-opportunities',
      name: 'Marketplace Opportunities',
      description: 'Available carbon credit opportunities',
      category: 'marketplace',
      icon: ShoppingCart,
      size: 'medium'
    },
    {
      id: 'industry-comparison',
      name: 'Industry Comparison',
      description: 'How your emissions compare to industry benchmarks',
      category: 'benchmarking',
      icon: BarChart2,
      size: 'large'
    },
    {
      id: 'peer-comparison',
      name: 'Peer Comparison',
      description: 'How your emissions compare to similar organizations',
      category: 'benchmarking',
      icon: Activity,
      size: 'medium'
    },
    {
      id: 'upcoming-reports',
      name: 'Upcoming Reports',
      description: 'Calendar of upcoming compliance reports',
      category: 'reporting',
      icon: Calendar,
      size: 'small'
    },
    {
      id: 'reporting-status',
      name: 'Reporting Status',
      description: 'Status of your compliance reporting',
      category: 'reporting',
      icon: FileText,
      size: 'medium'
    },
    {
      id: 'data-quality-alerts',
      name: 'Data Quality Alerts',
      description: 'Alerts for data quality issues',
      category: 'reporting',
      icon: AlertTriangle,
      size: 'small'
    }
  ];

  // Filter widgets based on search query and category
  const filteredWidgets = allWidgets.filter(widget => {
    const matchesSearch = widget.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          widget.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || widget.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Check if a widget is already selected
  const isWidgetSelected = (widgetId: string) => {
    return selectedWidgets.some(widget => widget.id === widgetId);
  };

  // Handle adding a widget
  const handleAddWidget = (widget: any) => {
    if (!isWidgetSelected(widget.id)) {
      onAddWidget({
        ...widget,
        position: {
          x: 0,
          y: 0,
          width: widget.size === 'small' ? 4 : widget.size === 'medium' ? 6 : 12,
          height: widget.size === 'small' ? 4 : widget.size === 'medium' ? 6 : 8
        }
      });
    }
  };

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search widgets..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
      </div>

      <Tabs value={activeCategory} onValueChange={setActiveCategory} className="flex-1 flex flex-col">
        <ScrollArea className="w-full whitespace-nowrap">
          <TabsList className="w-max">
            {categories.map(category => (
              <TabsTrigger key={category.id} value={category.id}>
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </ScrollArea>

        <ScrollArea className="flex-1 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-1">
            {filteredWidgets.map(widget => {
              const Icon = widget.icon;
              const isSelected = isWidgetSelected(widget.id);
              
              return (
                <Card 
                  key={widget.id} 
                  className={`cursor-pointer transition-colors ${
                    isSelected ? 'border-primary bg-primary/5' : ''
                  }`}
                >
                  <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between space-y-0">
                    <div className="flex items-center space-x-2">
                      <Icon className="h-5 w-5 text-primary" />
                      <CardTitle className="text-base">{widget.name}</CardTitle>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {widget.size.charAt(0).toUpperCase() + widget.size.slice(1)}
                    </Badge>
                  </CardHeader>
                  <CardContent className="p-4 pt-1">
                    <CardDescription>{widget.description}</CardDescription>
                  </CardContent>
                  <CardFooter className="p-4 pt-0 flex justify-end">
                    <Button 
                      variant={isSelected ? "secondary" : "outline"} 
                      size="sm"
                      onClick={() => handleAddWidget(widget)}
                      disabled={isSelected}
                    >
                      {isSelected ? (
                        <>
                          <Check className="mr-1 h-4 w-4" />
                          Added
                        </>
                      ) : (
                        <>
                          <Plus className="mr-1 h-4 w-4" />
                          Add Widget
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
            
            {filteredWidgets.length === 0 && (
              <div className="col-span-2 py-12 text-center text-muted-foreground">
                <p>No widgets found matching your search criteria.</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </Tabs>
    </div>
  );
}
