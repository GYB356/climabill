// Mock Material-UI components
import React from 'react';

// Create a mock component factory
const createMockComponent = (name) => {
  const Component = ({ children, ...props }) => {
    return React.createElement('div', {
      'data-testid': `mui-${name.toLowerCase()}`,
      ...props,
    }, children);
  };
  Component.displayName = name;
  return Component;
};

// Mock Material-UI components
export const Button = createMockComponent('Button');
export const Card = createMockComponent('Card');
export const CardContent = createMockComponent('CardContent');
export const CardActions = createMockComponent('CardActions');
export const Typography = createMockComponent('Typography');
export const Dialog = createMockComponent('Dialog');
export const DialogTitle = createMockComponent('DialogTitle');
export const DialogContent = createMockComponent('DialogContent');
export const DialogActions = createMockComponent('DialogActions');
export const TextField = createMockComponent('TextField');
export const Grid = createMockComponent('Grid');
export const CircularProgress = createMockComponent('CircularProgress');
export const FormControl = createMockComponent('FormControl');
export const InputLabel = createMockComponent('InputLabel');
export const Select = createMockComponent('Select');
export const MenuItem = createMockComponent('MenuItem');
export const Paper = createMockComponent('Paper');
export const Table = createMockComponent('Table');
export const TableBody = createMockComponent('TableBody');
export const TableCell = createMockComponent('TableCell');
export const TableContainer = createMockComponent('TableContainer');
export const TableHead = createMockComponent('TableHead');
export const TableRow = createMockComponent('TableRow');
export const Chip = createMockComponent('Chip');
export const IconButton = createMockComponent('IconButton');
export const Box = createMockComponent('Box');
export const Container = createMockComponent('Container');
export const Tabs = createMockComponent('Tabs');
export const Tab = createMockComponent('Tab');
export const Alert = createMockComponent('Alert');
export const Snackbar = createMockComponent('Snackbar');
export const LinearProgress = createMockComponent('LinearProgress');
export const Divider = createMockComponent('Divider');
export const List = createMockComponent('List');
export const ListItem = createMockComponent('ListItem');
export const ListItemText = createMockComponent('ListItemText');
export const ListItemIcon = createMockComponent('ListItemIcon');
export const Menu = createMockComponent('Menu');
export const Tooltip = createMockComponent('Tooltip');
export const Switch = createMockComponent('Switch');
export const FormControlLabel = createMockComponent('FormControlLabel');
export const Stack = createMockComponent('Stack');
export const InputAdornment = createMockComponent('InputAdornment');

// Mock hooks
export const useTheme = jest.fn().mockReturnValue({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
    error: { main: '#f44336' },
    warning: { main: '#ff9800' },
    info: { main: '#2196f3' },
    success: { main: '#4caf50' },
    text: { primary: 'rgba(0, 0, 0, 0.87)', secondary: 'rgba(0, 0, 0, 0.54)' },
    background: { paper: '#fff', default: '#fafafa' },
  },
  spacing: (factor) => `${8 * factor}px`,
  breakpoints: {
    up: jest.fn().mockReturnValue('@media (min-width:600px)'),
    down: jest.fn().mockReturnValue('@media (max-width:600px)'),
    between: jest.fn().mockReturnValue('@media (min-width:600px) and (max-width:960px)'),
  },
});

// Export default for components that use default export
export default {
  Button,
  Card,
  CardContent,
  CardActions,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Box,
  Container,
  Tabs,
  Tab,
  Alert,
  Snackbar,
  LinearProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Menu,
  Tooltip,
  Switch,
  FormControlLabel,
  Stack,
  InputAdornment,
};
