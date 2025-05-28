import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Dialog, DialogContent, DialogTitle, DialogActions, 
  FormGroup, FormControlLabel, Checkbox, Typography, Box, Tabs, Tab, Link } from '@mui/material';
import { CookieCategory } from '@/lib/compliance/types';

interface CookieConsentBannerProps {
  privacyPolicyUrl: string;
  cookiePolicyUrl: string;
}

/**
 * Cookie Consent Banner Component for GDPR/CCPA compliance
 * This component displays a cookie consent banner to users on their first visit
 * and allows them to manage their cookie preferences.
 */
const CookieConsentBanner: React.FC<CookieConsentBannerProps> = ({
  privacyPolicyUrl,
  cookiePolicyUrl
}) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [preferences, setPreferences] = useState({
    necessary: true, // Always required
    preferences: false,
    analytics: false,
    marketing: false
  });
  
  // Check if user has already set cookie preferences
  useEffect(() => {
    const consentGiven = localStorage.getItem('cookieConsent');
    if (!consentGiven) {
      setOpen(true);
    }
  }, []);
  
  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Handle checkbox changes
  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPreferences({
      ...preferences,
      [event.target.name]: event.target.checked
    });
  };
  
  // Accept all cookies
  const handleAcceptAll = async () => {
    const allConsent = {
      necessary: true,
      preferences: true,
      analytics: true,
      marketing: true
    };
    
    await saveCookiePreferences(allConsent);
    setOpen(false);
  };
  
  // Save selected preferences
  const handleSavePreferences = async () => {
    await saveCookiePreferences(preferences);
    setOpen(false);
  };
  
  // Accept only necessary cookies
  const handleAcceptNecessary = async () => {
    const necessaryOnly = {
      necessary: true,
      preferences: false,
      analytics: false,
      marketing: false
    };
    
    await saveCookiePreferences(necessaryOnly);
    setOpen(false);
  };
  
  // Save cookie preferences to backend and localStorage
  const saveCookiePreferences = async (prefs: Record<string, boolean>) => {
    try {
      // Save to localStorage
      localStorage.setItem('cookieConsent', 'true');
      localStorage.setItem('cookiePreferences', JSON.stringify(prefs));
      
      // Save to backend if user is logged in
      const sessionId = localStorage.getItem('sessionId') || `session-${Date.now()}`;
      if (!localStorage.getItem('sessionId')) {
        localStorage.setItem('sessionId', sessionId);
      }
      
      // Send to backend
      await fetch('/api/compliance/cookie-consent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sessionId,
          ...prefs,
          source: 'web'
        })
      });
      
      // Apply cookie settings
      applyCookieSettings(prefs);
    } catch (error) {
      console.error('Error saving cookie preferences:', error);
    }
  };
  
  // Apply cookie settings based on preferences
  const applyCookieSettings = (prefs: Record<string, boolean>) => {
    // This function would implement the actual cookie management
    // For example, enabling/disabling Google Analytics, etc.
    
    // Example: Google Analytics
    if (prefs.analytics) {
      // Enable Google Analytics
      window.gtag?.('consent', 'update', {
        analytics_storage: 'granted'
      });
    } else {
      // Disable Google Analytics
      window.gtag?.('consent', 'update', {
        analytics_storage: 'denied'
      });
    }
    
    // Example: Marketing cookies
    if (prefs.marketing) {
      // Enable marketing cookies
    } else {
      // Disable marketing cookies
    }
  };
  
  // Open cookie preferences dialog
  const openPreferences = () => {
    // Load saved preferences if available
    const savedPrefs = localStorage.getItem('cookiePreferences');
    if (savedPrefs) {
      setPreferences(JSON.parse(savedPrefs));
    }
    
    setOpen(true);
  };
  
  // Render cookie information tab
  const renderCookieInfo = () => (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Cookie Information
      </Typography>
      
      <Typography variant="subtitle1" gutterBottom>
        Necessary Cookies
      </Typography>
      <Typography variant="body2" paragraph>
        These cookies are essential for the website to function properly. They enable core functionality such as security, network management, and account access. You cannot disable these cookies.
      </Typography>
      
      <Typography variant="subtitle1" gutterBottom>
        Preference Cookies
      </Typography>
      <Typography variant="body2" paragraph>
        These cookies allow the website to remember choices you make and provide enhanced, personalized features. They may be set by us or by third-party providers whose services we have added to our pages.
      </Typography>
      
      <Typography variant="subtitle1" gutterBottom>
        Analytics Cookies
      </Typography>
      <Typography variant="body2" paragraph>
        These cookies collect information about how you use our website, which pages you visited and which links you clicked on. All of the data is anonymized and cannot be used to identify you.
      </Typography>
      
      <Typography variant="subtitle1" gutterBottom>
        Marketing Cookies
      </Typography>
      <Typography variant="body2" paragraph>
        These cookies track your online activity to help advertisers deliver more relevant advertising or to limit how many times you see an ad. These cookies can share that information with other organizations or advertisers.
      </Typography>
    </Box>
  );
  
  // Render cookie settings tab
  const renderCookieSettings = () => (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Cookie Settings
      </Typography>
      
      <FormGroup>
        <FormControlLabel
          control={
            <Checkbox
              checked={preferences.necessary}
              name="necessary"
              disabled // Necessary cookies cannot be disabled
            />
          }
          label="Necessary Cookies (Required)"
        />
        
        <FormControlLabel
          control={
            <Checkbox
              checked={preferences.preferences}
              onChange={handleCheckboxChange}
              name="preferences"
            />
          }
          label="Preference Cookies"
        />
        
        <FormControlLabel
          control={
            <Checkbox
              checked={preferences.analytics}
              onChange={handleCheckboxChange}
              name="analytics"
            />
          }
          label="Analytics Cookies"
        />
        
        <FormControlLabel
          control={
            <Checkbox
              checked={preferences.marketing}
              onChange={handleCheckboxChange}
              name="marketing"
            />
          }
          label="Marketing Cookies"
        />
      </FormGroup>
    </Box>
  );
  
  return (
    <>
      {/* Cookie Preferences Button - Always available in footer */}
      <Button 
        variant="text" 
        size="small" 
        onClick={openPreferences}
        sx={{ textTransform: 'none' }}
      >
        Cookie Preferences
      </Button>
      
      {/* Cookie Consent Dialog */}
      <Dialog
        open={open}
        maxWidth="md"
        fullWidth
        aria-labelledby="cookie-consent-dialog-title"
      >
        <DialogTitle id="cookie-consent-dialog-title">
          Cookie Preferences
        </DialogTitle>
        
        <DialogContent dividers>
          <Typography variant="body1" paragraph>
            We use cookies to enhance your experience on our website. By continuing to browse, you agree to our use of cookies. 
            You can learn more about how we use cookies in our{' '}
            <Link href={cookiePolicyUrl} target="_blank" rel="noopener">
              Cookie Policy
            </Link>{' '}
            and{' '}
            <Link href={privacyPolicyUrl} target="_blank" rel="noopener">
              Privacy Policy
            </Link>.
          </Typography>
          
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="cookie consent tabs">
              <Tab label="Cookie Information" />
              <Tab label="Cookie Settings" />
            </Tabs>
          </Box>
          
          {tabValue === 0 ? renderCookieInfo() : renderCookieSettings()}
        </DialogContent>
        
        <DialogActions sx={{ p: 2, flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', justifyContent: 'space-between' }}>
          <Button 
            onClick={handleAcceptNecessary} 
            color="primary"
            sx={{ mb: { xs: 1, sm: 0 }, order: { xs: 3, sm: 1 } }}
          >
            Accept Necessary Only
          </Button>
          
          <Box sx={{ display: 'flex', gap: 2, order: { xs: 2, sm: 2 } }}>
            <Button 
              onClick={handleSavePreferences} 
              variant="outlined" 
              color="primary"
            >
              Save Preferences
            </Button>
            
            <Button 
              onClick={handleAcceptAll} 
              variant="contained" 
              color="primary"
            >
              Accept All
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CookieConsentBanner;
