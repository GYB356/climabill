import React from 'react';

// Create a mock component factory that returns a proper React component
const createMockComponent = (name) => {
  const Component = (props) => {
    return React.createElement('span', {
      'data-testid': `mui-icon-${name.toLowerCase()}`,
      ...props,
    }, props.children || name);
  };
  Component.displayName = name;
  return Component;
};

// Common icons used in the application
export const Add = createMockComponent('Add');

const FileDownload = createMockComponent('FileDownload');
export { FileDownload };

const Info = createMockComponent('Info');
export { Info };
export const Edit = createMockComponent('Edit');
export const Delete = createMockComponent('Delete');
export const TrendingUp = createMockComponent('TrendingUp');
export const TrendingDown = createMockComponent('TrendingDown');
export const BarChart = createMockComponent('BarChart');
export const PieChart = createMockComponent('PieChart');
export const LineChart = createMockComponent('LineChart');
export const Save = createMockComponent('Save');
export const Cancel = createMockComponent('Cancel');
export const Close = createMockComponent('Close');
export const Check = createMockComponent('Check');
export const Error = createMockComponent('Error');
export const Warning = createMockComponent('Warning');
export const Settings = createMockComponent('Settings');
export const Dashboard = createMockComponent('Dashboard');
export const Person = createMockComponent('Person');
export const Business = createMockComponent('Business');
export const CalendarToday = createMockComponent('CalendarToday');
export const DateRange = createMockComponent('DateRange');
export const Description = createMockComponent('Description');
export const Download = createMockComponent('Download');
export const Upload = createMockComponent('Upload');
export const FilterList = createMockComponent('FilterList');
export const Search = createMockComponent('Search');
export const Refresh = createMockComponent('Refresh');
export const MoreVert = createMockComponent('MoreVert');
export const Menu = createMockComponent('Menu');
export const ChevronLeft = createMockComponent('ChevronLeft');
export const ChevronRight = createMockComponent('ChevronRight');
export const ExpandMore = createMockComponent('ExpandMore');
export const ExpandLess = createMockComponent('ExpandLess');
export const ArrowBack = createMockComponent('ArrowBack');
export const ArrowForward = createMockComponent('ArrowForward');
export const ArrowUpward = createMockComponent('ArrowUpward');
export const ArrowDownward = createMockComponent('ArrowDownward');

// Export default for components that use default export
export default {
  Add,
  Edit,
  Delete,
  TrendingUp,
  TrendingDown,
  BarChart,
  PieChart,
  LineChart,
  Save,
  Cancel,
  Close,
  Check,
  Error,
  Warning,
  Info,
  FileDownload,
  Settings,
  Dashboard,
  Person,
  Business,
  CalendarToday,
  DateRange,
  Description,
  Download,
  Upload,
  FilterList,
  Search,
  Refresh,
  MoreVert,
  Menu,
  ChevronLeft,
  ChevronRight,
  ExpandMore,
  ExpandLess,
  ArrowBack,
  ArrowForward,
  ArrowUpward,
  ArrowDownward,
};
