import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Tabs, Tab, Button, Divider, 
  List, ListItem, ListItemText, ListItemIcon, Switch, 
  Dialog, DialogTitle, DialogContent, DialogContentText,
  DialogActions, TextField, Alert, CircularProgress
} from '@mui/material';
import { 
  DownloadOutlined, DeleteOutlined, SettingsOutlined, 
  SecurityOutlined, HistoryOutlined, CheckCircleOutline,
  ErrorOutline
} from '@mui/icons-material';
import { ConsentType, ConsentStatus } from '@prisma/client';
import { useAuth } from '@/lib/firebase/auth-context';

/**
 * Privacy Center Component
 * A comprehensive UI for users to manage their privacy settings, export data,
 * and request data deletion in compliance with GDPR and CCPA.
 */
const PrivacyCenter: React.FC = () => {
  const { data: session } = useSession();
  const [tabValue, setTabValue] = useState(0);
  const [consents, setConsents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Data export states
  const [exportLoading, setExportLoading] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);
  
  // Data deletion states
  const [deletionDialogOpen, setDeletionDialogOpen] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState('');
  const [deletionLoading, setDeletionLoading] = useState(false);
  const [deletionError, setDeletionError] = useState<string | null>(null);
  const [deletionSuccess, setDeletionSuccess] = useState<string | null>(null);
  
  // Load user consents on component mount
  useEffect(() => {
    if (session) {
      loadUserConsents();
    }
  }, [session]);
  
  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Load user consents from API
  const loadUserConsents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/compliance/consent');
      
      if (!response.ok) {
        throw new Error('Failed to load consent settings');
      }
      
      const data = await response.json();
      setConsents(data);
    } catch (err) {
      setError('Failed to load your privacy settings. Please try again later.');
      console.error('Error loading consents:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Update a consent setting
  const updateConsent = async (type: ConsentType, status: ConsentStatus) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      const response = await fetch('/api/compliance/consent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type,
          status,
          source: 'privacy-center'
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update consent setting');
      }
      
      // Refresh consents
      await loadUserConsents();
      setSuccess('Your privacy settings have been updated successfully.');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      setError('Failed to update your privacy settings. Please try again later.');
      console.error('Error updating consent:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle consent toggle
  const handleConsentToggle = (type: ConsentType, currentStatus: ConsentStatus) => {
    const newStatus = currentStatus === 'GRANTED' ? 'DENIED' : 'GRANTED';
    updateConsent(type, newStatus as ConsentStatus);
  };
  
  // Request data export
  const handleDataExport = async () => {
    try {
      setExportLoading(true);
      setExportError(null);
      setExportSuccess(null);
      
      const response = await fetch('/api/compliance/data-export', {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error('Failed to initiate data export');
      }
      
      const data = await response.json();
      setExportSuccess('Your data export request has been received. You will be notified when it is ready for download.');
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setExportSuccess(null);
      }, 5000);
    } catch (err) {
      setExportError('Failed to initiate data export. Please try again later.');
      console.error('Error requesting data export:', err);
    } finally {
      setExportLoading(false);
    }
  };
  
  // Open data deletion dialog
  const openDeletionDialog = () => {
    setDeletionDialogOpen(true);
    setConfirmationCode('');
    setDeletionError(null);
  };
  
  // Close data deletion dialog
  const closeDeletionDialog = () => {
    setDeletionDialogOpen(false);
  };
  
  // Request data deletion
  const handleDataDeletion = async () => {
    try {
      setDeletionLoading(true);
      setDeletionError(null);
      
      if (confirmationCode !== 'DELETE-MY-DATA') {
        setDeletionError('Please enter the correct confirmation code: DELETE-MY-DATA');
        setDeletionLoading(false);
        return;
      }
      
      const response = await fetch('/api/compliance/data-deletion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          confirmationCode,
          retainRequiredData: true
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to process data deletion request');
      }
      
      const data = await response.json();
      setDeletionSuccess('Your data deletion request has been processed successfully.');
      closeDeletionDialog();
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setDeletionSuccess(null);
      }, 5000);
    } catch (err) {
      setDeletionError('Failed to process data deletion request. Please try again later.');
      console.error('Error requesting data deletion:', err);
    } finally {
      setDeletionLoading(false);
    }
  };
  
  // Get consent status for a specific type
  const getConsentStatus = (type: ConsentType) => {
    const consent = consents.find(c => c.type === type);
    return consent ? consent.status : 'DENIED';
  };
  
  // Render consent settings tab
  const renderConsentSettings = () => (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Consent Settings
      </Typography>
      
      <Typography variant="body2" color="text.secondary" paragraph>
        Manage how we use your data and what communications you receive from us.
      </Typography>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <List>
          <ListItem>
            <ListItemIcon>
              <SettingsOutlined />
            </ListItemIcon>
            <ListItemText 
              primary="Marketing Emails" 
              secondary="Receive emails about new features, promotions, and offers" 
            />
            <Switch 
              edge="end"
              checked={getConsentStatus('MARKETING_EMAIL') === 'GRANTED'}
              onChange={() => handleConsentToggle('MARKETING_EMAIL', getConsentStatus('MARKETING_EMAIL') as ConsentStatus)}
              disabled={loading}
            />
          </ListItem>
          
          <Divider />
          
          <ListItem>
            <ListItemIcon>
              <SettingsOutlined />
            </ListItemIcon>
            <ListItemText 
              primary="Marketing SMS" 
              secondary="Receive text messages about promotions and offers" 
            />
            <Switch 
              edge="end"
              checked={getConsentStatus('MARKETING_SMS') === 'GRANTED'}
              onChange={() => handleConsentToggle('MARKETING_SMS', getConsentStatus('MARKETING_SMS') as ConsentStatus)}
              disabled={loading}
            />
          </ListItem>
          
          <Divider />
          
          <ListItem>
            <ListItemIcon>
              <SettingsOutlined />
            </ListItemIcon>
            <ListItemText 
              primary="Analytics" 
              secondary="Allow us to collect anonymous usage data to improve our services" 
            />
            <Switch 
              edge="end"
              checked={getConsentStatus('ANALYTICS') === 'GRANTED'}
              onChange={() => handleConsentToggle('ANALYTICS', getConsentStatus('ANALYTICS') as ConsentStatus)}
              disabled={loading}
            />
          </ListItem>
          
          <Divider />
          
          <ListItem>
            <ListItemIcon>
              <SettingsOutlined />
            </ListItemIcon>
            <ListItemText 
              primary="Third-Party Sharing" 
              secondary="Allow us to share your data with trusted partners" 
            />
            <Switch 
              edge="end"
              checked={getConsentStatus('THIRD_PARTY_SHARING') === 'GRANTED'}
              onChange={() => handleConsentToggle('THIRD_PARTY_SHARING', getConsentStatus('THIRD_PARTY_SHARING') as ConsentStatus)}
              disabled={loading}
            />
          </ListItem>
          
          <Divider />
          
          <ListItem>
            <ListItemIcon>
              <SettingsOutlined />
            </ListItemIcon>
            <ListItemText 
              primary="Profiling" 
              secondary="Allow us to analyze your data to provide personalized services" 
            />
            <Switch 
              edge="end"
              checked={getConsentStatus('PROFILING') === 'GRANTED'}
              onChange={() => handleConsentToggle('PROFILING', getConsentStatus('PROFILING') as ConsentStatus)}
              disabled={loading}
            />
          </ListItem>
        </List>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mt: 2 }}>
          {success}
        </Alert>
      )}
    </Box>
  );
  
  // Render data management tab
  const renderDataManagement = () => (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Data Management
      </Typography>
      
      <Typography variant="body2" color="text.secondary" paragraph>
        Export or delete your personal data in accordance with data protection regulations.
      </Typography>
      
      <Paper elevation={0} variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="subtitle1">
              Export Your Data
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Download a copy of your personal data in a machine-readable format.
            </Typography>
          </Box>
          <Button 
            variant="outlined" 
            startIcon={<DownloadOutlined />}
            onClick={handleDataExport}
            disabled={exportLoading}
          >
            {exportLoading ? 'Processing...' : 'Request Export'}
          </Button>
        </Box>
        
        {exportError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {exportError}
          </Alert>
        )}
        
        {exportSuccess && (
          <Alert severity="success" sx={{ mt: 2 }}>
            {exportSuccess}
          </Alert>
        )}
      </Paper>
      
      <Paper elevation={0} variant="outlined" sx={{ p: 2, bgcolor: '#fff8f8' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="subtitle1" color="error">
              Delete Your Data
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Request deletion of your personal data. This action cannot be undone.
            </Typography>
          </Box>
          <Button 
            variant="outlined" 
            color="error" 
            startIcon={<DeleteOutlined />}
            onClick={openDeletionDialog}
          >
            Request Deletion
          </Button>
        </Box>
        
        {deletionSuccess && (
          <Alert severity="success" sx={{ mt: 2 }}>
            {deletionSuccess}
          </Alert>
        )}
      </Paper>
      
      {/* Data Deletion Confirmation Dialog */}
      <Dialog
        open={deletionDialogOpen}
        onClose={closeDeletionDialog}
        aria-labelledby="deletion-dialog-title"
      >
        <DialogTitle id="deletion-dialog-title" color="error">
          Request Data Deletion
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            This action will delete your personal data from our systems. Some data may be retained for legal or legitimate business purposes.
          </DialogContentText>
          <DialogContentText sx={{ mt: 2, fontWeight: 'bold' }}>
            This action cannot be undone. Are you sure you want to proceed?
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="confirmation-code"
            label="Type DELETE-MY-DATA to confirm"
            type="text"
            fullWidth
            variant="outlined"
            value={confirmationCode}
            onChange={(e) => setConfirmationCode(e.target.value)}
            sx={{ mt: 2 }}
            error={!!deletionError}
            helperText={deletionError}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeletionDialog} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={handleDataDeletion} 
            color="error" 
            disabled={confirmationCode !== 'DELETE-MY-DATA' || deletionLoading}
          >
            {deletionLoading ? 'Processing...' : 'Confirm Deletion'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
  
  // Render consent history tab
  const renderConsentHistory = () => (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Consent History
      </Typography>
      
      <Typography variant="body2" color="text.secondary" paragraph>
        View the history of your consent preferences and when they were changed.
      </Typography>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <List>
          {consents.map((consent) => (
            <React.Fragment key={consent.id}>
              <ListItem alignItems="flex-start">
                <ListItemIcon>
                  <HistoryOutlined />
                </ListItemIcon>
                <ListItemText
                  primary={formatConsentType(consent.type)}
                  secondary={
                    <React.Fragment>
                      <Typography component="span" variant="body2" color="text.primary">
                        Current Status: {formatConsentStatus(consent.status)}
                      </Typography>
                      <br />
                      <Typography component="span" variant="body2">
                        Last Updated: {new Date(consent.updatedAt).toLocaleString()}
                      </Typography>
                      <br />
                      <Typography component="span" variant="body2">
                        Consent History:
                      </Typography>
                      <List dense>
                        {consent.history.map((historyItem: any) => (
                          <ListItem key={historyItem.id} dense>
                            <ListItemIcon sx={{ minWidth: 30 }}>
                              {historyItem.status === 'GRANTED' ? 
                                <CheckCircleOutline fontSize="small" color="success" /> : 
                                <ErrorOutline fontSize="small" color="error" />
                              }
                            </ListItemIcon>
                            <ListItemText
                              primary={`${formatConsentStatus(historyItem.status)} on ${new Date(historyItem.createdAt).toLocaleString()}`}
                              secondary={`Source: ${historyItem.source}`}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </React.Fragment>
                  }
                />
              </ListItem>
              <Divider component="li" />
            </React.Fragment>
          ))}
        </List>
      )}
    </Box>
  );
  
  // Format consent type for display
  const formatConsentType = (type: string) => {
    return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());
  };
  
  // Format consent status for display
  const formatConsentStatus = (status: string) => {
    return status === 'GRANTED' ? 'Consented' : status === 'DENIED' ? 'Declined' : 'Withdrawn';
  };
  
  return (
    <Paper sx={{ p: 3, maxWidth: 800, mx: 'auto', my: 4 }}>
      <Typography variant="h5" component="h1" gutterBottom>
        Privacy Center
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        Manage your privacy settings, data preferences, and exercise your data rights.
      </Typography>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="privacy center tabs">
          <Tab label="Consent Settings" icon={<SettingsOutlined />} iconPosition="start" />
          <Tab label="Data Management" icon={<SecurityOutlined />} iconPosition="start" />
          <Tab label="Consent History" icon={<HistoryOutlined />} iconPosition="start" />
        </Tabs>
      </Box>
      
      {tabValue === 0 && renderConsentSettings()}
      {tabValue === 1 && renderDataManagement()}
      {tabValue === 2 && renderConsentHistory()}
    </Paper>
  );
};

export default PrivacyCenter;
