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
  Grid,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Link
} from '@mui/material';
import { Edit as EditIcon, FileDownload as FileDownloadIcon } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { CarbonAccountingStandard, StandardCompliance } from '../../lib/carbon/models/department-project';
import { SustainabilityReportingService } from '../../lib/carbon/sustainability-reporting-service';
import { useAuth } from '../../hooks/useAuth';

interface StandardsComplianceProps {
  organizationId: string;
}

const StandardsCompliance: React.FC<StandardsComplianceProps> = ({ organizationId }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [standards, setStandards] = useState<StandardCompliance[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingStandard, setEditingStandard] = useState<StandardCompliance | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    standard: '' as CarbonAccountingStandard,
    compliant: false,
    verificationBody: '',
    verificationDate: null as Date | null,
    nextVerificationDate: null as Date | null,
    certificateUrl: '',
    notes: '',
  });

  const reportingService = new SustainabilityReportingService();

  useEffect(() => {
    if (organizationId) {
      loadStandards();
    }
  }, [organizationId]);

  const loadStandards = async () => {
    try {
      setLoading(true);
      const standardsList = await reportingService.getStandardsCompliance(organizationId);
      setStandards(standardsList);
      setError(null);
    } catch (err) {
      console.error('Error loading standards compliance:', err);
      setError('Failed to load standards compliance data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (standard?: StandardCompliance) => {
    if (standard) {
      const verificationDate = standard.lastVerificationDate instanceof Date ? 
        standard.lastVerificationDate : 
        standard.lastVerificationDate ? (standard.lastVerificationDate as any).toDate() : null;
      
      const nextVerificationDate = standard.nextVerificationDate instanceof Date ? 
        standard.nextVerificationDate : 
        standard.nextVerificationDate ? (standard.nextVerificationDate as any).toDate() : null;

      setEditingStandard(standard);
      setFormData({
        standard: standard.standard,
        compliant: standard.compliant,
        verificationBody: standard.verificationBody || '',
        verificationDate,
        nextVerificationDate,
        certificateUrl: standard.certificateUrl || '',
        notes: standard.notes || '',
      });
    } else {
      setEditingStandard(null);
      setFormData({
        standard: '' as CarbonAccountingStandard,
        compliant: false,
        verificationBody: '',
        verificationDate: null,
        nextVerificationDate: null,
        certificateUrl: '',
        notes: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingStandard(null);
    setError(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (e: React.ChangeEvent<{ name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name) {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleDateChange = (field: 'verificationDate' | 'nextVerificationDate', date: Date | null) => {
    setFormData((prev) => ({
      ...prev,
      [field]: date,
    }));
  };

  const handleSubmit = async () => {
    try {
      if (!formData.standard) {
        setError('Standard selection is required');
        return;
      }

      if (formData.compliant && !formData.verificationBody) {
        setError('Verification body is required for compliant standards');
        return;
      }

      await reportingService.setStandardCompliance(
        organizationId,
        formData.standard,
        formData.compliant,
        {
          verificationBody: formData.verificationBody || undefined,
          verificationDate: formData.verificationDate || undefined,
          nextVerificationDate: formData.nextVerificationDate || undefined,
          certificateUrl: formData.certificateUrl || undefined,
          notes: formData.notes || undefined,
        }
      );

      handleCloseDialog();
      loadStandards();
    } catch (err) {
      console.error('Error saving standard compliance:', err);
      setError('Failed to save standard compliance. Please try again.');
    }
  };

  // Helper function to format standard name
  const formatStandardName = (standard: CarbonAccountingStandard): string => {
    return standard
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Carbon Accounting Standards</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleOpenDialog()}
        >
          Add Standard
        </Button>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : standards.length === 0 ? (
        <Typography>
          No carbon accounting standards configured. Add your first standard to start tracking compliance.
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {standards.map((standard) => (
            <Grid item xs={12} md={6} key={standard.id}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        {formatStandardName(standard.standard)}
                      </Typography>
                      <Chip
                        label={standard.compliant ? 'Compliant' : 'Non-Compliant'}
                        color={standard.compliant ? 'success' : 'error'}
                        size="small"
                      />
                    </Box>
                    <IconButton onClick={() => handleOpenDialog(standard)}>
                      <EditIcon />
                    </IconButton>
                  </Box>

                  {standard.verificationBody && (
                    <Typography variant="body2" color="textSecondary" mt={2}>
                      Verified by: {standard.verificationBody}
                    </Typography>
                  )}

                  {standard.lastVerificationDate && (
                    <Typography variant="body2" color="textSecondary">
                      Last verified: {new Date(standard.lastVerificationDate as any).toLocaleDateString()}
                    </Typography>
                  )}

                  {standard.nextVerificationDate && (
                    <Typography variant="body2" color="textSecondary">
                      Next verification: {new Date(standard.nextVerificationDate as any).toLocaleDateString()}
                    </Typography>
                  )}

                  {standard.certificateUrl && (
                    <Box mt={2}>
                      <Link
                        href={standard.certificateUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        <FileDownloadIcon fontSize="small" />
                        View Certificate
                      </Link>
                    </Box>
                  )}

                  {standard.notes && (
                    <Typography variant="body2" color="textSecondary" mt={2}>
                      {standard.notes}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>
          {editingStandard ? 'Edit Standard Compliance' : 'Add Standard Compliance'}
        </DialogTitle>
        <DialogContent>
          <Box mt={1}>
            {error && (
              <Typography color="error" gutterBottom>
                {error}
              </Typography>
            )}

            <FormControl fullWidth margin="normal">
              <InputLabel>Standard</InputLabel>
              <Select
                label="Standard"
                name="standard"
                value={formData.standard}
                onChange={handleSelectChange}
                disabled={!!editingStandard}
              >
                {Object.values(CarbonAccountingStandard).map((standard) => (
                  <MenuItem key={standard} value={standard}>
                    {formatStandardName(standard)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal">
              <InputLabel>Compliance Status</InputLabel>
              <Select
                label="Compliance Status"
                name="compliant"
                value={formData.compliant}
                onChange={handleSelectChange}
              >
                <MenuItem value={true}>Compliant</MenuItem>
                <MenuItem value={false}>Non-Compliant</MenuItem>
              </Select>
            </FormControl>

            {formData.compliant && (
              <>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Verification Body"
                  name="verificationBody"
                  value={formData.verificationBody}
                  onChange={handleInputChange}
                  required
                />

                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <Box mt={2} mb={1}>
                    <DatePicker 
                      label="Verification Date"
                      value={formData.verificationDate}
                      onChange={(date) => handleDateChange('verificationDate', date)}
                      sx={{ width: '100%' }}
                    />
                  </Box>
                  
                  <Box mt={2}>
                    <DatePicker 
                      label="Next Verification Date"
                      value={formData.nextVerificationDate}
                      onChange={(date) => handleDateChange('nextVerificationDate', date)}
                      sx={{ width: '100%' }}
                    />
                  </Box>
                </LocalizationProvider>

                <TextField
                  fullWidth
                  margin="normal"
                  label="Certificate URL"
                  name="certificateUrl"
                  value={formData.certificateUrl}
                  onChange={handleInputChange}
                />
              </>
            )}

            <TextField
              fullWidth
              margin="normal"
              label="Notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} color="primary" variant="contained">
            {editingStandard ? 'Update' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StandardsCompliance;
