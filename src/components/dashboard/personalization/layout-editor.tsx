'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { X, Move, Maximize2, Minimize2, Trash2 } from 'lucide-react';

interface LayoutEditorProps {
  layout: any[];
  widgets: any[];
  onLayoutChange: (layout: any[]) => void;
  onRemoveWidget: (widgetId: string) => void;
}

export function LayoutEditor({ layout, widgets, onLayoutChange, onRemoveWidget }: LayoutEditorProps) {
  const [activeView, setActiveView] = useState('grid');
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null);
  const [currentLayout, setCurrentLayout] = useState<any[]>(layout || []);

  // Initialize layout if not provided
  useEffect(() => {
    if (!layout || layout.length === 0) {
      // Create initial layout based on widgets
      const initialLayout = widgets.map((widget, index) => ({
        id: widget.id,
        x: (index % 3) * 4,
        y: Math.floor(index / 3) * 4,
        width: widget.size === 'small' ? 4 : widget.size === 'medium' ? 6 : 12,
        height: widget.size === 'small' ? 4 : widget.size === 'medium' ? 6 : 8
      }));
      
      setCurrentLayout(initialLayout);
      onLayoutChange(initialLayout);
    } else {
      setCurrentLayout(layout);
    }
  }, [widgets, layout, onLayoutChange]);

  // Handle widget removal
  const handleRemoveWidget = (widgetId: string) => {
    // Remove widget from layout
    const updatedLayout = currentLayout.filter(item => item.id !== widgetId);
    setCurrentLayout(updatedLayout);
    onLayoutChange(updatedLayout);
    
    // Call parent remove function
    onRemoveWidget(widgetId);
  };

  // Handle widget resize
  const handleResizeWidget = (widgetId: string, size: 'small' | 'medium' | 'large') => {
    // Update widget size in layout
    const updatedLayout = currentLayout.map(item => {
      if (item.id === widgetId) {
        return {
          ...item,
          width: size === 'small' ? 4 : size === 'medium' ? 6 : 12,
          height: size === 'small' ? 4 : size === 'medium' ? 6 : 8
        };
      }
      return item;
    });
    
    setCurrentLayout(updatedLayout);
    onLayoutChange(updatedLayout);
  };

  // Get widget details by ID
  const getWidgetById = (widgetId: string) => {
    return widgets.find(widget => widget.id === widgetId);
  };

  // Render grid view
  const renderGridView = () => {
    // Create a 12x12 grid for layout visualization
    const grid = Array(12).fill(0).map(() => Array(12).fill(null));
    
    // Place widgets on the grid
    currentLayout.forEach(item => {
      const widget = getWidgetById(item.id);
      if (widget) {
        for (let y = item.y; y < item.y + item.height && y < 12; y++) {
          for (let x = item.x; x < item.x + item.width && x < 12; x++) {
            if (y >= 0 && x >= 0) {
              grid[y][x] = item.id;
            }
          }
        }
      }
    });
    
    return (
      <div className="border rounded-md p-4 bg-muted/20">
        <div className="grid grid-cols-12 gap-1">
          {grid.map((row, rowIndex) => (
            row.map((cell, colIndex) => {
              const isOccupied = cell !== null;
              const isWidgetStart = isOccupied && 
                currentLayout.some(item => item.id === cell && item.x === colIndex && item.y === rowIndex);
              
              let content = null;
              if (isWidgetStart) {
                const layoutItem = currentLayout.find(item => item.id === cell);
                const widget = getWidgetById(cell);
                
                if (widget && layoutItem) {
                  content = (
                    <div 
                      className="bg-primary/10 border border-primary/30 rounded-md p-2 text-xs font-medium"
                      style={{
                        gridColumn: `span ${layoutItem.width}`,
                        gridRow: `span ${layoutItem.height}`
                      }}
                    >
                      {widget.name}
                    </div>
                  );
                }
              }
              
              return isWidgetStart ? (
                <div 
                  key={`${rowIndex}-${colIndex}`}
                  className="col-span-1 row-span-1"
                  style={{
                    gridColumn: `span ${currentLayout.find(item => item.id === cell)?.width || 1}`,
                    gridRow: `span ${currentLayout.find(item => item.id === cell)?.height || 1}`
                  }}
                >
                  {content}
                </div>
              ) : isOccupied ? null : (
                <div 
                  key={`${rowIndex}-${colIndex}`}
                  className="bg-muted h-8 rounded-sm"
                />
              );
            })
          ))}
        </div>
      </div>
    );
  };

  // Render list view
  const renderListView = () => {
    return (
      <div className="space-y-4">
        {widgets.map(widget => {
          const layoutItem = currentLayout.find(item => item.id === widget.id);
          const Icon = widget.icon;
          
          return (
            <Card key={widget.id} className="border border-border">
              <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between space-y-0">
                <div className="flex items-center space-x-2">
                  {Icon && <Icon className="h-5 w-5 text-primary" />}
                  <CardTitle className="text-base">{widget.name}</CardTitle>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs">
                    {widget.size.charAt(0).toUpperCase() + widget.size.slice(1)}
                  </Badge>
                  <Button variant="ghost" size="icon" onClick={() => handleRemoveWidget(widget.id)}>
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-1">
                <CardDescription>{widget.description}</CardDescription>
              </CardContent>
              <CardFooter className="p-4 pt-0 flex justify-between">
                <div className="flex items-center text-xs text-muted-foreground">
                  <Move className="h-4 w-4 mr-1" />
                  Position: {layoutItem ? `(${layoutItem.x}, ${layoutItem.y})` : 'Not placed'}
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleResizeWidget(widget.id, 'small')}
                    disabled={widget.size === 'small'}
                  >
                    <Minimize2 className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleResizeWidget(widget.id, 'medium')}
                    disabled={widget.size === 'medium'}
                  >
                    <Move className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleResizeWidget(widget.id, 'large')}
                    disabled={widget.size === 'large'}
                  >
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          );
        })}
        
        {widgets.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">
            <p>No widgets added yet. Add widgets from the "Add Widgets" tab.</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4 h-full flex flex-col">
      <Tabs value={activeView} onValueChange={setActiveView} className="w-[400px]">
        <TabsList>
          <TabsTrigger value="grid">Grid View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
        </TabsList>
      </Tabs>

      <ScrollArea className="flex-1">
        <div className="p-1">
          {activeView === 'grid' ? renderGridView() : renderListView()}
        </div>
      </ScrollArea>
      
      <div className="text-xs text-muted-foreground">
        <p>Note: In a production environment, this would be an interactive drag-and-drop interface for arranging widgets.</p>
      </div>
    </div>
  );
}
