import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Link,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  FileDownload as FileDownloadIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { SustainabilityReport } from '../../lib/carbon/models/department-project';
import { SustainabilityReportingService } from '../../lib/carbon/sustainability-reporting-service';
import { useAuth } from '../../hooks/useAuth';

interface SustainabilityReportsProps {
  organizationId: string;
  departmentId?: string;
  projectId?: string;
}

const SustainabilityReports: React.FC<SustainabilityReportsProps> = ({
  organizationId,
  departmentId,
  projectId
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<SustainabilityReport[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    reportType: 'monthly' as 'monthly' | 'quarterly' | 'annual' | 'custom',
    startDate: new Date(),
    endDate: new Date(),
  });

  const reportingService = new SustainabilityReportingService();

  useEffect(() => {
    if (organizationId) {
      loadReports();
    }
  }, [organizationId, departmentId, projectId]);

  const loadReports = async () => {
    try {
      setLoading(true);
      const reportsList = await reportingService.getReports(
        organizationId,
        undefined,
        departmentId,
        projectId,
        20
      );
      setReports(reportsList);
      setError(null);
    } catch (err) {
      console.error('Error loading sustainability reports:', err);
      setError('Failed to load reports. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = () => {
    // Set default dates based on report type
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1); // First day of current month
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0); // Last day of current month

    setFormData({
      reportType: 'monthly',
      startDate,
      endDate,
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setError(null);
  };

  const handleReportTypeChange = (e: React.ChangeEvent<{ name?: string; value: unknown }>) => {
    const reportType = e.target.value as 'monthly' | 'quarterly' | 'annual' | 'custom';
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    switch (reportType) {
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      
      case 'quarterly':
        const quarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), quarter * 3, 1);
        endDate = new Date(now.getFullYear(), (quarter + 1) * 3, 0);
        break;
      
      case 'annual':
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31);
        break;
      
      default:
        startDate = formData.startDate;
        endDate = formData.endDate;
    }

    setFormData({
      reportType,
      startDate,
      endDate,
    });
  };

  const handleDateChange = (field: 'startDate' | 'endDate', date: Date | null) => {
    if (date) {
      setFormData((prev) => ({
        ...prev,
        [field]: date,
      }));
    }
  };

  const handleGenerateReport = async () => {
    try {
      setGenerating(true);
      setError(null);

      if (!formData.startDate || !formData.endDate) {
        setError('Both start and end dates are required');
        return;
      }

      if (formData.startDate > formData.endDate) {
        setError('End date must be after start date');
        return;
      }

      const report = await reportingService.generateReport(
        organizationId,
        formData.reportType,
        formData.startDate,
        formData.endDate,
        departmentId,
        projectId
      );

      handleCloseDialog();
      loadReports();
    } catch (err) {
      console.error('Error generating report:', err);
      setError('Failed to generate report. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  // Helper function to format carbon values
  const formatCarbon = (kg: number): string => {
    if (kg >= 1000) {
      return `${(kg / 1000).toFixed(1)} tonnes CO₂e`;
    }
    return `${kg.toFixed(1)} kg CO₂e`;
  };

  // Helper function to format dates
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Sustainability Reports</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
        >
          Generate Report
        </Button>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : reports.length === 0 ? (
        <Typography>
          No sustainability reports found. Generate your first report to get started.
        </Typography>
      ) : (
        <List>
          {reports.map((report) => (
            <React.Fragment key={report.id}>
              <ListItem>
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="subtitle1">{report.name}</Typography>
                      <Chip
                        label={report.reportType}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </Box>
                  }
                  secondary={
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                          xs: '1fr',
                          sm: 'repeat(2, 1fr)'
                        },
                        gap: 2,
                        mt: 1
                      }}
                    >
                      <Box>
                        <Typography variant="body2" component="div">
                          Period: {formatDate(report.period.startDate as Date)} - {formatDate(report.period.endDate as Date)}
                        </Typography>
                        <Typography variant="body2" component="div">
                          Total Carbon: {formatCarbon(report.totalCarbonInKg)}
                        </Typography>
                        <Typography variant="body2" component="div">
                          Offset Carbon: {formatCarbon(report.offsetCarbonInKg)} ({report.offsetPercentage.toFixed(1)}%)
                        </Typography>
                      </Box>
                      <Box>
                        {report.reductionFromPreviousPeriod !== undefined && (
                          <Typography variant="body2" component="div">
                            Reduction: {formatCarbon(report.reductionFromPreviousPeriod)} ({report.reductionPercentage?.toFixed(1)}%)
                          </Typography>
                        )}
                        <Box mt={1}>
                          {report.standards.map((standard, index) => (
                            <Chip
                              key={index}
                              label={standard.name}
                              size="small"
                              color={standard.compliant ? 'success' : 'error'}
                              sx={{ mr: 0.5, mb: 0.5 }}
                            />
                          ))}
                        </Box>
                      </Box>
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  {report.reportUrl && (
                    <IconButton
                      edge="end"
                      component={Link}
                      href={report.reportUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FileDownloadIcon />
                    </IconButton>
                  )}
                </ListItemSecondaryAction>
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
        </List>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>Generate Sustainability Report</DialogTitle>
        <DialogContent>
          <Box mt={1}>
            {error && (
              <Typography color="error" gutterBottom>
                {error}
              </Typography>
            )}

            <FormControl fullWidth margin="normal">
              <InputLabel>Report Type</InputLabel>
              <Select
                label="Report Type"
                value={formData.reportType}
                onChange={handleReportTypeChange}
              >
                <MenuItem value="monthly">Monthly</MenuItem>
                <MenuItem value="quarterly">Quarterly</MenuItem>
                <MenuItem value="annual">Annual</MenuItem>
                <MenuItem value="custom">Custom Period</MenuItem>
              </Select>
            </FormControl>

            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Box mt={2} mb={1}>
                <DatePicker 
                  label="Start Date"
                  value={formData.startDate}
                  onChange={(date) => handleDateChange('startDate', date)}
                  disabled={formData.reportType !== 'custom'}
                  sx={{ width: '100%' }}
                />
              </Box>
              
              <Box mt={2}>
                <DatePicker 
                  label="End Date"
                  value={formData.endDate}
                  onChange={(date) => handleDateChange('endDate', date)}
                  disabled={formData.reportType !== 'custom'}
                  sx={{ width: '100%' }}
                />
              </Box>
            </LocalizationProvider>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleGenerateReport}
            color="primary"
            variant="contained"
            disabled={generating}
          >
            {generating ? (
              <>
                <CircularProgress size={24} sx={{ mr: 1 }} />
                Generating...
              </>
            ) : (
              'Generate Report'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SustainabilityReports;
