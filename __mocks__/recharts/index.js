// Mock recharts components
import React from 'react';

// Create a mock component factory
const createMockComponent = (name) => {
  const Component = ({ children, ...props }) => {
    return React.createElement('div', {
      'data-testid': `recharts-${name.toLowerCase()}`,
      ...props,
    }, children);
  };
  Component.displayName = name;
  return Component;
};

// Mock recharts components
export const ResponsiveContainer = createMockComponent('ResponsiveContainer');
export const LineChart = createMockComponent('LineChart');
export const BarChart = createMockComponent('BarChart');
export const PieChart = createMockComponent('PieChart');
export const Line = createMockComponent('Line');
export const Bar = createMockComponent('Bar');
export const Pie = createMockComponent('Pie');
export const XAxis = createMockComponent('XAxis');
export const YAxis = createMockComponent('YAxis');
export const CartesianGrid = createMockComponent('CartesianGrid');
export const Tooltip = createMockComponent('Tooltip');
export const Legend = createMockComponent('Legend');
export const Cell = createMockComponent('Cell');
export const Area = createMockComponent('Area');
export const AreaChart = createMockComponent('AreaChart');
export const ComposedChart = createMockComponent('ComposedChart');
export const Scatter = createMockComponent('Scatter');
export const ScatterChart = createMockComponent('ScatterChart');
export const RadarChart = createMockComponent('RadarChart');
export const Radar = createMockComponent('Radar');
export const PolarGrid = createMockComponent('PolarGrid');
export const PolarAngleAxis = createMockComponent('PolarAngleAxis');
export const PolarRadiusAxis = createMockComponent('PolarRadiusAxis');
export const ReferenceLine = createMockComponent('ReferenceLine');
export const ReferenceArea = createMockComponent('ReferenceArea');
export const ReferenceDot = createMockComponent('ReferenceDot');
export const Label = createMockComponent('Label');
export const LabelList = createMockComponent('LabelList');

// Export default for components that use default export
export default {
  ResponsiveContainer,
  LineChart,
  BarChart,
  PieChart,
  Line,
  Bar,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  Area,
  AreaChart,
  ComposedChart,
  Scatter,
  ScatterChart,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ReferenceLine,
  ReferenceArea,
  ReferenceDot,
  Label,
  LabelList,
};
