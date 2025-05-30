import React, { useState, useRef, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement,
  RadialLinearScale
} from 'chart.js';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import { useTranslation } from 'next-i18next';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement,
  RadialLinearScale
);

// Chart type definitions
export type ChartType = 'line' | 'bar' | 'pie' | 'doughnut';

// Dataset structure
export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string;
  fill?: boolean;
  tension?: number;
  borderWidth?: number;
  hoverOffset?: number;
}

// Chart options structure
export interface ChartOptions {
  responsive?: boolean;
  maintainAspectRatio?: boolean;
  plugins?: {
    title?: {
      display?: boolean;
      text?: string;
      font?: {
        size?: number;
        weight?: string;
      };
    };
    legend?: {
      display?: boolean;
      position?: 'top' | 'bottom' | 'left' | 'right';
    };
    tooltip?: {
      enabled?: boolean;
      mode?: 'index' | 'point' | 'nearest' | 'dataset';
      intersect?: boolean;
    };
  };
  scales?: {
    x?: {
      title?: {
        display?: boolean;
        text?: string;
      };
      grid?: {
        display?: boolean;
      };
    };
    y?: {
      title?: {
        display?: boolean;
        text?: string;
      };
      grid?: {
        display?: boolean;
      };
      beginAtZero?: boolean;
      ticks?: {
        callback?: (value: number) => string;
      };
    };
  };
  animation?: {
    duration?: number;
  };
}

// Component props
interface EnhancedChartProps {
  type: ChartType;
  labels: string[];
  datasets: ChartDataset[];
  options?: ChartOptions;
  height?: number;
  width?: number;
  className?: string;
  timeRanges?: string[];
  showControls?: boolean;
  allowTypeChange?: boolean;
  onTimeRangeChange?: (range: string) => void;
  dataFormatter?: (value: number) => string;
  colorPalette?: string[];
}

/**
 * Enhanced, interactive chart component for data visualization
 * Supports multiple chart types, time range selection, and customization
 */
const EnhancedChart: React.FC<EnhancedChartProps> = ({
  type: initialType,
  labels,
  datasets,
  options = {},
  height,
  width,
  className = '',
  timeRanges = [],
  showControls = true,
  allowTypeChange = true,
  onTimeRangeChange,
  dataFormatter,
  colorPalette = ['#10b981', '#3b82f6', '#f97316', '#8b5cf6', '#ec4899', '#f43f5e', '#84cc16', '#06b6d4']
}) => {
  const { t } = useTranslation('common');
  const [chartType, setChartType] = useState<ChartType>(initialType);
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>(timeRanges.length > 0 ? timeRanges[0] : '');
  const [hoveredDataset, setHoveredDataset] = useState<number | null>(null);
  const chartRef = useRef<ChartJS | null>(null);

  // Apply color palette to datasets if not specified
  const processedDatasets = datasets.map((dataset, index) => {
    const color = colorPalette[index % colorPalette.length];
    return {
      ...dataset,
      backgroundColor: dataset.backgroundColor || (chartType === 'line' ? `${color}20` : color),
      borderColor: dataset.borderColor || color,
      fill: dataset.fill !== undefined ? dataset.fill : chartType === 'line',
      tension: dataset.tension || 0.4,
      borderWidth: dataset.borderWidth || 2,
      hoverOffset: dataset.hoverOffset || 4
    };
  });

  // Apply data formatter to y-axis if provided
  const chartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 750
    },
    ...options,
    scales: chartType === 'pie' || chartType === 'doughnut' ? undefined : {
      ...(options.scales || {}),
      y: {
        ...(options.scales?.y || {}),
        beginAtZero: true,
        ticks: {
          ...(options.scales?.y?.ticks || {}),
          callback: dataFormatter 
            ? (value) => dataFormatter(value)
            : options.scales?.y?.ticks?.callback
        }
      }
    }
  };

  // Build chart data
  const chartData = {
    labels,
    datasets: processedDatasets.map((dataset, index) => ({
      ...dataset,
      // Highlight hovered dataset
      borderWidth: hoveredDataset === index ? 3 : dataset.borderWidth,
      borderColor: hoveredDataset === index ? 
        (typeof dataset.borderColor === 'string' ? dataset.borderColor : colorPalette[index % colorPalette.length]) : 
        dataset.borderColor,
    }))
  };

  // Handle time range change
  const handleTimeRangeChange = (range: string) => {
    setSelectedTimeRange(range);
    if (onTimeRangeChange) {
      onTimeRangeChange(range);
    }
  };

  // Handle chart type change
  const handleChartTypeChange = (newType: ChartType) => {
    setChartType(newType);
  };

  // Handle dataset hover
  const handleLegendHover = (index: number | null) => {
    setHoveredDataset(index);
  };

  // Render appropriate chart type
  const renderChart = () => {
    const commonProps = {
      ref: (ref: any) => { 
        if (ref) chartRef.current = ref.current; 
      },
      options: chartOptions,
      data: chartData,
      height,
      width
    };

    switch (chartType) {
      case 'bar':
        return <Bar {...commonProps} />;
      case 'pie':
        return <Pie {...commonProps} />;
      case 'doughnut':
        return <Doughnut {...commonProps} />;
      case 'line':
      default:
        return <Line {...commonProps} />;
    }
  };

  // Download chart as image
  const downloadChart = () => {
    if (chartRef.current) {
      const link = document.createElement('a');
      link.download = 'chart.png';
      link.href = chartRef.current.toBase64Image();
      link.click();
    }
  };

  return (
    <div className={`flex flex-col ${className}`}>
      {showControls && (
        <div className="flex flex-wrap items-center justify-between mb-4 gap-2">
          {timeRanges.length > 0 && (
            <div className="flex space-x-1">
              {timeRanges.map((range) => (
                <button
                  key={range}
                  onClick={() => handleTimeRangeChange(range)}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    selectedTimeRange === range
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {t(`time.${range.toLowerCase().replace(/\s+/g, '')}`)}
                </button>
              ))}
            </div>
          )}
          
          {allowTypeChange && (
            <div className="flex space-x-1">
              {(['line', 'bar', 'pie', 'doughnut'] as ChartType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => handleChartTypeChange(type)}
                  className={`px-3 py-1 text-sm rounded-md capitalize transition-colors ${
                    chartType === type
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {type}
                </button>
              ))}
              <button
                onClick={downloadChart}
                className="px-3 py-1 text-sm rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                title={t('buttons.download')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </button>
            </div>
          )}
        </div>
      )}
      
      <div className="relative" style={{ height: height || 300 }}>
        {renderChart()}
      </div>
      
      {/* Custom interactive legend */}
      <div className="flex flex-wrap justify-center mt-4 gap-2">
        {processedDatasets.map((dataset, index) => (
          <div
            key={dataset.label}
            className="flex items-center px-2 py-1 rounded-md hover:bg-gray-100 cursor-pointer"
            onMouseEnter={() => handleLegendHover(index)}
            onMouseLeave={() => handleLegendHover(null)}
          >
            <div
              className="w-3 h-3 rounded-full mr-2"
              style={{
                backgroundColor: typeof dataset.backgroundColor === 'string' 
                  ? dataset.backgroundColor 
                  : Array.isArray(dataset.backgroundColor) 
                    ? dataset.backgroundColor[0] 
                    : colorPalette[index % colorPalette.length]
              }}
            />
            <span className="text-sm font-medium">{dataset.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EnhancedChart;
