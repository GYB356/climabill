/**
 * Types for the Enhanced Analytics feature
 */

export enum AnalyticsTimeFrame {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  QUARTER = 'quarter',
  YEAR = 'year',
  CUSTOM = 'custom'
}

export enum AnalyticsDimension {
  EMISSIONS_SOURCE = 'emissionsSource',
  DEPARTMENT = 'department',
  LOCATION = 'location',
  PROJECT = 'project',
  SUPPLIER = 'supplier',
  CUSTOMER = 'customer',
  PRODUCT = 'product',
  SERVICE = 'service'
}

export enum AnalyticsMetric {
  CARBON_EMISSIONS = 'carbonEmissions',
  ENERGY_CONSUMPTION = 'energyConsumption',
  WATER_USAGE = 'waterUsage',
  WASTE_GENERATED = 'wasteGenerated',
  COST = 'cost',
  REVENUE = 'revenue',
  CARBON_INTENSITY = 'carbonIntensity',
  ENERGY_INTENSITY = 'energyIntensity',
  WATER_INTENSITY = 'waterIntensity',
  WASTE_INTENSITY = 'wasteIntensity'
}

export enum AnalyticsVisualizationType {
  BAR_CHART = 'barChart',
  LINE_CHART = 'lineChart',
  PIE_CHART = 'pieChart',
  AREA_CHART = 'areaChart',
  SCATTER_PLOT = 'scatterPlot',
  HEAT_MAP = 'heatMap',
  TREE_MAP = 'treeMap',
  SANKEY_DIAGRAM = 'sankeyDiagram',
  TABLE = 'table'
}

export enum AnomalyDetectionMethod {
  STATISTICAL = 'statistical',
  MACHINE_LEARNING = 'machineLearning',
  RULE_BASED = 'ruleBased'
}

export enum ForecastMethod {
  LINEAR_REGRESSION = 'linearRegression',
  EXPONENTIAL_SMOOTHING = 'exponentialSmoothing',
  ARIMA = 'arima',
  PROPHET = 'prophet',
  MACHINE_LEARNING = 'machineLearning'
}

export interface AnalyticsFilter {
  field: string;
  operator: 'equals' | 'notEquals' | 'greaterThan' | 'lessThan' | 'contains' | 'in' | 'between';
  value: any;
}

export interface AnalyticsQuery {
  organizationId: string;
  metrics: AnalyticsMetric[];
  dimensions?: AnalyticsDimension[];
  filters?: AnalyticsFilter[];
  timeFrame: AnalyticsTimeFrame;
  period?: {
    startDate: Date;
    endDate: Date;
  };
  granularity?: 'day' | 'week' | 'month' | 'quarter' | 'year';
  limit?: number;
  sortBy?: {
    field: string;
    direction: 'asc' | 'desc';
  };
}

export interface AnalyticsResult {
  query: AnalyticsQuery;
  data: any[];
  metadata: {
    totalCount: number;
    aggregations?: {
      [key: string]: number;
    };
  };
}

export interface TimeSeriesDataPoint {
  timestamp: Date;
  value: number;
  dimension?: string;
}

export interface TimeSeriesData {
  metric: AnalyticsMetric;
  points: TimeSeriesDataPoint[];
}

export interface DimensionalDataPoint {
  dimension: string;
  value: number;
  secondaryValue?: number;
}

export interface DimensionalData {
  metric: AnalyticsMetric;
  points: DimensionalDataPoint[];
}

export interface Anomaly {
  timestamp: Date;
  metric: AnalyticsMetric;
  dimension?: string;
  expectedValue: number;
  actualValue: number;
  deviationPercentage: number;
  severity: 'low' | 'medium' | 'high';
  explanation?: string;
}

export interface AnomalyDetectionConfig {
  method: AnomalyDetectionMethod;
  sensitivityLevel: number; // 0-1, where 1 is most sensitive
  metrics: AnalyticsMetric[];
  dimensions?: AnalyticsDimension[];
  minDeviation: number; // Minimum deviation percentage to be considered an anomaly
}

export interface AnomalyDetectionResult {
  anomalies: Anomaly[];
  metadata: {
    configUsed: AnomalyDetectionConfig;
    detectionDate: Date;
  };
}

export interface ForecastDataPoint {
  timestamp: Date;
  value: number;
  lowerBound?: number;
  upperBound?: number;
  dimension?: string;
}

export interface ForecastData {
  metric: AnalyticsMetric;
  points: ForecastDataPoint[];
  metadata: {
    method: ForecastMethod;
    accuracy: number; // 0-1, where 1 is perfect accuracy
    trainPeriod: {
      startDate: Date;
      endDate: Date;
    };
    forecastPeriod: {
      startDate: Date;
      endDate: Date;
    };
  };
}

export interface ForecastConfig {
  method: ForecastMethod;
  metric: AnalyticsMetric;
  dimension?: AnalyticsDimension;
  trainPeriod: {
    startDate: Date;
    endDate: Date;
  };
  forecastPeriod: {
    startDate: Date;
    endDate: Date;
  };
  granularity: 'day' | 'week' | 'month' | 'quarter' | 'year';
  includeConfidenceIntervals?: boolean;
}

export interface CorrelationResult {
  metric1: AnalyticsMetric;
  metric2: AnalyticsMetric;
  correlationCoefficient: number; // -1 to 1
  pValue: number;
  sampleSize: number;
  period: {
    startDate: Date;
    endDate: Date;
  };
}

export interface InsightType {
  id: string;
  name: string;
  description: string;
  category: 'trend' | 'anomaly' | 'correlation' | 'forecast' | 'recommendation';
  severity: 'info' | 'low' | 'medium' | 'high';
}

export interface Insight {
  type: InsightType;
  title: string;
  description: string;
  metrics: AnalyticsMetric[];
  dimensions?: AnalyticsDimension[];
  timestamp: Date;
  data?: any;
  relatedInsights?: string[]; // IDs of related insights
  actions?: {
    label: string;
    url: string;
  }[];
}

export interface DashboardWidget {
  id: string;
  title: string;
  description?: string;
  type: AnalyticsVisualizationType;
  query: AnalyticsQuery;
  size: 'small' | 'medium' | 'large';
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  settings?: any;
}

export interface Dashboard {
  id: string;
  name: string;
  description?: string;
  widgets: DashboardWidget[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  isDefault?: boolean;
  tags?: string[];
}

export interface SavedAnalyticsQuery {
  id: string;
  name: string;
  description?: string;
  query: AnalyticsQuery;
  visualization: AnalyticsVisualizationType;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  tags?: string[];
}
