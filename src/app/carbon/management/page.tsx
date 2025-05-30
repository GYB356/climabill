"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Paper,
  CircularProgress,
  Alert,
  AlertTitle
} from '@mui/material';
import { useAuth } from '../../../hooks/useAuth';
import DepartmentList from '../../../components/carbon/DepartmentList';
import ProjectList from '../../../components/carbon/ProjectList';
import CarbonGoalTracker from '../../../components/carbon/CarbonGoalTracker';
import StandardsCompliance from '../../../components/carbon/StandardsCompliance';
import SustainabilityReports from '../../../components/carbon/SustainabilityReports';
import CarbonAnalytics from '../../../components/carbon/CarbonAnalytics';
import CarbonOffsets from '../../../components/carbon/CarbonOffsets';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`carbon-tabpanel-${index}`}
      aria-labelledby={`carbon-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function CarbonManagementPage() {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      router.push('/login');
      return;
    }

    // In a real application, you might fetch the user's organization
    // For now, we'll use the user's ID as the organization ID
    setOrganizationId(user.uid);
    setLoading(false);
  }, [user, authLoading, router]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleDepartmentSelect = (departmentId: string | null) => {
    setSelectedDepartmentId(departmentId);
    setSelectedProjectId(null); // Reset project selection when department changes
  };

  const handleProjectSelect = (projectId: string | null) => {
    setSelectedProjectId(projectId);
  };

  if (loading || authLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">
          <AlertTitle>Error</AlertTitle>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Carbon Management
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        Manage your organization's carbon footprint, track emissions by department and project, 
        set reduction goals, and generate sustainability reports.
      </Typography>

      {/* Department and Project Selection */}
      <Paper sx={{ mb: 4, p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Scope Selection
        </Typography>
        
        <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={3}>
          <Box flex={1}>
            <Typography variant="subtitle2" gutterBottom>
              Department
            </Typography>
            <DepartmentList 
              organizationId={organizationId!}
              onSelectDepartment={handleDepartmentSelect}
              selectedDepartmentId={selectedDepartmentId}
              compactView={true}
            />
          </Box>
          
          <Box flex={1}>
            <Typography variant="subtitle2" gutterBottom>
              Project
            </Typography>
            <ProjectList 
              organizationId={organizationId!}
              departmentId={selectedDepartmentId}
              onSelectProject={handleProjectSelect}
              selectedProjectId={selectedProjectId}
              compactView={true}
            />
          </Box>
        </Box>
      </Paper>

      {/* Main Tabs */}
      <Paper sx={{ width: '100%' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          aria-label="carbon management tabs"
        >
          <Tab label="Analytics" />
          <Tab label="Goals" />
          <Tab label="Offsets" />
          <Tab label="Reports" />
          <Tab label="Standards" />
          <Tab label="Departments" />
          <Tab label="Projects" />
        </Tabs>

        {/* Analytics Tab */}
        <TabPanel value={tabValue} index={0}>
          <CarbonAnalytics 
            organizationId={organizationId!}
            departmentId={selectedDepartmentId || undefined}
            projectId={selectedProjectId || undefined}
          />
        </TabPanel>

        {/* Goals Tab */}
        <TabPanel value={tabValue} index={1}>
          <CarbonGoalTracker 
            organizationId={organizationId!}
            departmentId={selectedDepartmentId || undefined}
            projectId={selectedProjectId || undefined}
          />
        </TabPanel>

        {/* Offsets Tab */}
        <TabPanel value={tabValue} index={2}>
          <CarbonOffsets 
            organizationId={organizationId!}
            departmentId={selectedDepartmentId || undefined}
            projectId={selectedProjectId || undefined}
          />
        </TabPanel>

        {/* Reports Tab */}
        <TabPanel value={tabValue} index={3}>
          <SustainabilityReports 
            organizationId={organizationId!}
            departmentId={selectedDepartmentId || undefined}
            projectId={selectedProjectId || undefined}
          />
        </TabPanel>

        {/* Standards Tab */}
        <TabPanel value={tabValue} index={4}>
          <StandardsCompliance organizationId={organizationId!} />
        </TabPanel>

        {/* Departments Tab */}
        <TabPanel value={tabValue} index={5}>
          <DepartmentList 
            organizationId={organizationId!}
            onSelectDepartment={handleDepartmentSelect}
            selectedDepartmentId={selectedDepartmentId}
          />
        </TabPanel>

        {/* Projects Tab */}
        <TabPanel value={tabValue} index={6}>
          <ProjectList 
            organizationId={organizationId!}
            departmentId={selectedDepartmentId}
            onSelectProject={handleProjectSelect}
            selectedProjectId={selectedProjectId}
          />
        </TabPanel>
      </Paper>
    </Container>
  );
}
