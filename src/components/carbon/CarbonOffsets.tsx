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
  Stack,
  Alert,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import {
  Add as AddIcon,
  FileDownload as FileDownloadIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { CarbonOffsetService } from '../../lib/carbon/carbon-offset-service';
import { CloverlyClient } from '../../lib/carbon/cloverly-client';
import { OffsetProjectType } from '../../lib/carbon/config';
import { useAuth } from '../../hooks/useAuth';

interface CarbonOffsetsProps {
  organizationId: string;
  departmentId?: string;
  projectId?: string;
  // Add these for testing:
  offsetService?: CarbonOffsetService;
  cloverlyClient?: CloverlyClient;
}

interface OffsetEstimate {
  cost: number;
  currency: string;
  carbonInKg: number;
  projectType: OffsetProjectType;
  projectName: string;
  projectLocation: string;
  projectDescription: string;
}

const CarbonOffsets: React.FC<CarbonOffsetsProps> = ({
  organizationId,
  departmentId,
  projectId,
  offsetService = new CarbonOffsetService(),
  cloverlyClient = new CloverlyClient()
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [offsets, setOffsets] = useState<any[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [formData, setFormData] = useState({
    carbonInKg: '',
    projectType: '' as OffsetProjectType,
    location: {
      country: '',
      state: '',
      postal_code: ''
    }
  });
  const [estimate, setEstimate] = useState<OffsetEstimate | null>(null);
  const [estimatedCost, setEstimatedCost] = useState<number | null>(null);
  const [carbonFootprint] = useState(5000); // Mock carbon footprint in kg
  const [currentlyOffset] = useState(30); // Mock currently offset amount in kg

  // Calculate estimated cost in real time
  useEffect(() => {
    if (formData.carbonInKg && !isNaN(Number(formData.carbonInKg))) {
      // Simple calculation: $15 per tonne
      const tonnes = Number(formData.carbonInKg);
      setEstimatedCost(tonnes * 15);
    } else {
      setEstimatedCost(null);
    }
  }, [formData.carbonInKg]);

  // Calculate offset percentage and recommendations
  const offsetPercentage = ((currentlyOffset / carbonFootprint) * 100).toFixed(1);
  const recommendedOffset = (carbonFootprint / 1000).toFixed(1); // Convert to tonnes

  useEffect(() => {
    if (organizationId) {
      loadOffsets();
    }
  }, [organizationId, departmentId, projectId]);

  const loadOffsets = async () => {
    try {
      setLoading(true);
      const offsetsList = await offsetService.carbonTrackingService.getCarbonOffsets(
        organizationId
      );
      setOffsets(offsetsList);
      setError(null);
    } catch (err) {
      console.error('Error loading carbon offsets:', err);
      setError('Failed to load offset history. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
    setActiveStep(0);
    setEstimate(null);
    setFormData({
      carbonInKg: '',
      projectType: '' as OffsetProjectType,
      location: {
        country: '',
        state: '',
        postal_code: ''
      }
    });
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setError(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      location: {
        ...prev.location,
        [name]: value,
      },
    }));
  };

  const handleProjectTypeChange = (e: React.ChangeEvent<{ name?: string; value: unknown }>) => {
    setFormData((prev) => ({
      ...prev,
      projectType: e.target.value as OffsetProjectType,
    }));
  };

  const handleGetEstimate = async () => {
    try {
      setProcessing(true);
      setError(null);

      if (!formData.carbonInKg || isNaN(Number(formData.carbonInKg))) {
        setError('Please enter a valid carbon amount');
        return;
      }

      const estimateResponse = await cloverlyClient.estimateOffset(
        Number(formData.carbonInKg),
        formData.projectType || undefined,
        formData.location
      );

      setEstimate({
        cost: estimateResponse.cost,
        currency: estimateResponse.currency,
        carbonInKg: estimateResponse.carbonInKg,
        projectType: formData.projectType || estimateResponse.projectType, // Use user selection first
        projectName: estimateResponse.projectName,
        projectLocation: estimateResponse.projectLocation,
        projectDescription: estimateResponse.projectDescription
      });

      setActiveStep(1);
    } catch (err) {
      console.error('Error getting offset estimate:', err);
      setError('Failed to get offset estimate. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handlePurchaseOffset = async () => {
    try {
      setProcessing(true);
      setError(null);

      if (!estimate) {
        setError('Please get an estimate first');
        return;
      }

      await offsetService.carbonTrackingService.purchaseCarbonOffset(
        {
          organizationId,
          amount: parseInt(formData.carbonInKg), // Keep as tonnes (no conversion needed)
          projectType: estimate.projectType, // This now contains the user's selection
          provider: 'Cloverly'
        }
      );

      // Show success message
      setError(null);
      setSuccessMessage('Carbon offset purchased successfully!');
      
      // Close dialog and reload offsets
      setTimeout(() => {
        setSuccessMessage(null);
        handleCloseDialog();
        loadOffsets();
      }, 2000);

      handleCloseDialog();
      loadOffsets();
    } catch (err) {
      console.error('Error purchasing offset:', err);
      setError('Failed to purchase offset. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const formatCarbon = (kg: number): string => {
    if (kg >= 1000) {
      return `${(kg / 1000).toFixed(0)} tonnes`;
    }
    return `${kg.toFixed(0)} kg`;
  };

  const formatCurrency = (amount: number, currency: string): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

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
        <Typography variant="h5">Carbon Offsets</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
        >
          Purchase Carbon Offsets
        </Button>
      </Box>

      {/* Carbon Footprint Recommendations */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Carbon Footprint Overview
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(3, 1fr)'
              },
              gap: 2
            }}
          >
            <Typography variant="body2" color="textSecondary">
              Carbon Footprint: {carbonFootprint.toLocaleString()} kg
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Currently Offset: {offsetPercentage}%
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Recommended Offset: {recommendedOffset} tonnes
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : offsets.length === 0 ? (
        <Typography>
          No carbon offsets found. Purchase your first offset to start compensating for your emissions.
        </Typography>
      ) : (
        <>
          <Typography variant="h6" gutterBottom>Offset History</Typography>
          <List>
          {offsets.map((offset) => (
            <ListItem key={offset.id}>
              <ListItemText
                primary={
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="subtitle1">
                      {formatCarbon(offset.carbonInKg)}
                    </Typography>
                    <Chip
                      label={offset.projectType}
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
                        Project: {offset.projectName}
                      </Typography>
                      <Typography variant="body2" component="div">
                        Location: {offset.projectLocation}
                      </Typography>
                      <Typography variant="body2" component="div">
                        Date: {formatDate(offset.purchaseDate)}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" component="div">
                        Cost: {formatCurrency(offset.cost, offset.currency)}
                      </Typography>
                      {offset.certificateUrl && (
                        <Button
                          variant="text"
                          size="small"
                          startIcon={<FileDownloadIcon />}
                          href={offset.certificateUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View Certificate
                        </Button>
                      )}
                    </Box>
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
        </>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="md">
        <DialogTitle>Purchase Carbon Offsets</DialogTitle>
        <DialogContent>
          <Box mt={1}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            {successMessage && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {successMessage}
              </Alert>
            )}

            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
              <Step>
                <StepLabel>Enter Details</StepLabel>
              </Step>
              <Step>
                <StepLabel>Review & Purchase</StepLabel>
              </Step>
            </Stepper>

            {activeStep === 0 ? (
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  label="Offset Amount (tonnes)"
                  name="carbonInKg"
                  type="number"
                  value={formData.carbonInKg}
                  onChange={handleInputChange}
                  required
                />
                {estimatedCost !== null && (
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    Estimated Cost: ${estimatedCost.toFixed(2)}
                  </Typography>
                )}

                <FormControl fullWidth>
                  <InputLabel>Project Type</InputLabel>
                  <Select
                    label="Project Type"
                    value={formData.projectType}
                    onChange={handleProjectTypeChange}
                  >
                    <MenuItem value="">Any Type</MenuItem>
                    {Object.values(OffsetProjectType).map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: '1fr',
                      sm: 'repeat(2, 1fr)'
                    },
                    gap: 2
                  }}
                >
                  <TextField
                    fullWidth
                    label="Country (Optional)"
                    name="country"
                    value={formData.location.country}
                    onChange={handleLocationChange}
                  />
                  <TextField
                    fullWidth
                    label="State (Optional)"
                    name="state"
                    value={formData.location.state}
                    onChange={handleLocationChange}
                  />
                </Box>

                <TextField
                  fullWidth
                  label="Postal Code (Optional)"
                  name="postal_code"
                  value={formData.location.postal_code}
                  onChange={handleLocationChange}
                />
              </Stack>
            ) : (
              estimate && (
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Offset Estimate
                    </Typography>

                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                          xs: '1fr',
                          sm: 'repeat(2, 1fr)'
                        },
                        gap: 2
                      }}
                    >
                      <Box>
                        <Typography variant="subtitle2" color="textSecondary">
                          Carbon Amount
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                          {formatCarbon(estimate.carbonInKg)}
                        </Typography>

                        <Typography variant="subtitle2" color="textSecondary">
                          Cost
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                          {formatCurrency(estimate.cost, estimate.currency)}
                        </Typography>

                        <Typography variant="subtitle2" color="textSecondary">
                          Project Type
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                          {estimate.projectType}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography variant="subtitle2" color="textSecondary">
                          Project Name
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                          {estimate.projectName}
                        </Typography>

                        <Typography variant="subtitle2" color="textSecondary">
                          Location
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                          {estimate.projectLocation}
                        </Typography>
                      </Box>
                    </Box>

                    <Box>
                      <Typography variant="subtitle2" color="textSecondary">
                        Project Description
                      </Typography>
                      <Typography variant="body1">
                        {estimate.projectDescription}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              )
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          {activeStep === 0 ? (
            <Button
              onClick={handleGetEstimate}
              color="primary"
              variant="contained"
              disabled={processing}
            >
              {processing ? (
                <>
                  <CircularProgress size={24} sx={{ mr: 1 }} />
                  Getting Estimate...
                </>
              ) : (
                'Get Estimate'
              )}
            </Button>
          ) : (
            <>
              <Button onClick={() => setActiveStep(0)}>Back</Button>
              <Button
                onClick={handlePurchaseOffset}
                color="primary"
                variant="contained"
                disabled={processing}
              >
                {processing ? (
                  <>
                    <CircularProgress size={24} sx={{ mr: 1 }} />
                    Processing...
                  </>
                ) : (
                  'Purchase'
                )}
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CarbonOffsets;
