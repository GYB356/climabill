// Mock Material-UI components
import React from 'react';

// Create a mock component factory
const createMockComponent = (name) => {
  const Component = ({ children, ...props }) => {
    // Filter out props that shouldn't be passed to DOM elements
    const domProps = {};
    const allowedProps = ['id', 'className', 'style', 'role', 'aria-label', 'aria-labelledby', 'data-testid'];
    
    Object.keys(props).forEach(key => {
      if (allowedProps.includes(key) || key.startsWith('data-') || key.startsWith('aria-')) {
        domProps[key] = props[key];
      }
    });
    
    // Add the testid
    domProps['data-testid'] = `mui-${name.toLowerCase()}`;
    
    return React.createElement('div', domProps, children);
  };
  Component.displayName = name;
  return Component;
};

// Mock Material-UI components
// Mock Material-UI components with event handling
export const Button = ({ children, onClick, ...props }) => {
  const domProps = {};
  const allowedProps = ['id', 'className', 'style', 'role', 'aria-label', 'aria-labelledby', 'data-testid', 'disabled'];
  
  Object.keys(props).forEach(key => {
    if (allowedProps.includes(key) || key.startsWith('data-') || key.startsWith('aria-')) {
      domProps[key] = props[key];
    }
  });
  
  domProps['data-testid'] = 'mui-button';
  domProps.onClick = onClick;
  
  return React.createElement('button', domProps, children);
};
export const Card = createMockComponent('Card');
export const CardContent = createMockComponent('CardContent');
export const CardActions = createMockComponent('CardActions');
export const Typography = createMockComponent('Typography');

// Dialog needs special handling for the open prop
export const Dialog = ({ children, open = false, ...props }) => {
  if (!open) return null;
  
  const domProps = {};
  const allowedProps = ['id', 'className', 'style', 'role', 'aria-label', 'aria-labelledby', 'data-testid'];
  
  Object.keys(props).forEach(key => {
    if (allowedProps.includes(key) || key.startsWith('data-') || key.startsWith('aria-')) {
      domProps[key] = props[key];
    }
  });
  
  domProps['data-testid'] = 'mui-dialog';
  
  return React.createElement('div', domProps, children);
};

export const DialogTitle = createMockComponent('DialogTitle');
export const DialogContent = createMockComponent('DialogContent');
export const DialogActions = createMockComponent('DialogActions');
// Mock Material-UI components with proper form support
export const TextField = ({ label, value = '', onChange, ...props }) => {
  const domProps = {};
  const allowedProps = ['id', 'className', 'style', 'role', 'aria-label', 'aria-labelledby', 'data-testid', 'value', 'name', 'type'];
  
  Object.keys(props).forEach(key => {
    if (allowedProps.includes(key) || key.startsWith('data-') || key.startsWith('aria-')) {
      domProps[key] = props[key];
    }
  });
  
  domProps['data-testid'] = 'mui-textfield';
  
  // Create a labeled input
  return React.createElement('div', { 'data-testid': 'mui-textfield' }, [
    React.createElement('label', { key: 'label', htmlFor: props.name || 'input' }, label),
    React.createElement('input', { 
      key: 'input',
      id: props.name || 'input',
      ...domProps,
      value: value,
      onChange: onChange || (() => {}),
      'aria-label': label
    })
  ]);
};
export const Grid = createMockComponent('Grid');
export const CircularProgress = createMockComponent('CircularProgress');
export const FormControl = ({ children, ...props }) => {
  const domProps = {};
  const allowedProps = ['id', 'className', 'style', 'role', 'aria-label', 'aria-labelledby', 'data-testid'];
  
  Object.keys(props).forEach(key => {
    if (allowedProps.includes(key) || key.startsWith('data-') || key.startsWith('aria-')) {
      domProps[key] = props[key];
    }
  });
  
  domProps['data-testid'] = 'mui-formcontrol';
  
  return React.createElement('div', domProps, children);
};

export const InputLabel = ({ children, ...props }) => {
  const domProps = {};
  const allowedProps = ['id', 'className', 'style', 'role', 'aria-label', 'aria-labelledby', 'data-testid', 'htmlFor'];
  
  Object.keys(props).forEach(key => {
    if (allowedProps.includes(key) || key.startsWith('data-') || key.startsWith('aria-')) {
      domProps[key] = props[key];
    }
  });
  
  domProps['data-testid'] = 'mui-inputlabel';
  
  return React.createElement('label', domProps, children);
};
export const Select = ({ label, children, value = '', onChange, ...props }) => {
  const domProps = {};
  const allowedProps = ['id', 'className', 'style', 'role', 'aria-label', 'aria-labelledby', 'data-testid', 'value', 'name'];
  
  Object.keys(props).forEach(key => {
    if (allowedProps.includes(key) || key.startsWith('data-') || key.startsWith('aria-')) {
      domProps[key] = props[key];
    }
  });
  
  domProps['data-testid'] = 'mui-select';
  domProps['aria-label'] = label;
  domProps['value'] = value;
  domProps['onChange'] = onChange || (() => {});
  
  return React.createElement('label', { 'data-testid': 'mui-formcontrol' }, [
    React.createElement('label', { key: 'label', 'data-testid': 'mui-inputlabel' }, label),
    React.createElement('select', { key: 'select', ...domProps }, children)
  ]);
};
export const MenuItem = ({ children, value, ...props }) => {
  return React.createElement('option', { value, 'data-testid': 'mui-menuitem' }, children);
};
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

// Special handling for ListItemText to render primary and secondary content
export const ListItemText = ({ primary, secondary, children, ...props }) => {
  const domProps = {};
  const allowedProps = ['id', 'className', 'style', 'role', 'aria-label', 'aria-labelledby', 'data-testid'];
  
  Object.keys(props).forEach(key => {
    if (allowedProps.includes(key) || key.startsWith('data-') || key.startsWith('aria-')) {
      domProps[key] = props[key];
    }
  });
  
  domProps['data-testid'] = 'mui-listitemtext';
  
  return React.createElement('div', domProps, [
    primary && React.createElement('div', { key: 'primary', 'data-testid': 'mui-listitemtext-primary' }, primary),
    secondary && React.createElement('div', { key: 'secondary', 'data-testid': 'mui-listitemtext-secondary' }, secondary),
    children
  ].filter(Boolean));
};

export const ListItemIcon = createMockComponent('ListItemIcon');
export const Menu = createMockComponent('Menu');
export const Tooltip = createMockComponent('Tooltip');
export const Switch = createMockComponent('Switch');
export const FormControlLabel = createMockComponent('FormControlLabel');
export const Stack = createMockComponent('Stack');
export const InputAdornment = createMockComponent('InputAdornment');
export const Stepper = createMockComponent('Stepper');
export const Step = createMockComponent('Step');
export const StepLabel = createMockComponent('StepLabel');

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
  Stepper,
  Step,
  StepLabel,
};
