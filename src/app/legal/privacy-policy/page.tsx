import React from 'react';
import { Typography, Container, Box, Breadcrumbs, Link, Divider, Paper } from '@mui/material';
import NextLink from 'next/link';

/**
 * Privacy Policy Page
 * Comprehensive privacy policy compliant with GDPR and CCPA requirements
 */
export default function PrivacyPolicyPage() {
  const lastUpdated = 'May 28, 2025';
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <Link component={NextLink} href="/" underline="hover" color="inherit">
          Home
        </Link>
        <Link component={NextLink} href="/legal" underline="hover" color="inherit">
          Legal
        </Link>
        <Typography color="text.primary">Privacy Policy</Typography>
      </Breadcrumbs>
      
      <Paper elevation={0} sx={{ p: 4, border: '1px solid #e0e0e0' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Privacy Policy
        </Typography>
        
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Last Updated: {lastUpdated}
        </Typography>
        
        <Divider sx={{ my: 3 }} />
        
        <Box sx={{ mb: 4 }}>
          <Typography variant="body1" paragraph>
            ClimaBill ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service.
          </Typography>
          
          <Typography variant="body1" paragraph>
            Please read this Privacy Policy carefully. By accessing or using our service, you acknowledge that you have read, understood, and agree to be bound by all the terms of this Privacy Policy. If you do not agree with our policies and practices, please do not use our service.
          </Typography>
        </Box>
        
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            1. Information We Collect
          </Typography>
          
          <Typography variant="h6" gutterBottom>
            1.1 Personal Data
          </Typography>
          
          <Typography variant="body1" paragraph>
            We may collect personal information that you voluntarily provide to us when you register for our service, express an interest in obtaining information about us or our products and services, or otherwise contact us. The personal information we collect may include:
          </Typography>
          
          <ul>
            <li>
              <Typography variant="body1" paragraph>
                Contact information (such as name, email address, mailing address, and phone number)
              </Typography>
            </li>
            <li>
              <Typography variant="body1" paragraph>
                Account credentials (such as usernames, passwords, and security questions)
              </Typography>
            </li>
            <li>
              <Typography variant="body1" paragraph>
                Business information (such as company name, business address, and tax information)
              </Typography>
            </li>
            <li>
              <Typography variant="body1" paragraph>
                Financial information (such as payment method details and billing information)
              </Typography>
            </li>
            <li>
              <Typography variant="body1" paragraph>
                Profile information (such as profile pictures, preferences, and settings)
              </Typography>
            </li>
            <li>
              <Typography variant="body1" paragraph>
                User-generated content (such as invoices, customer data, and carbon usage information)
              </Typography>
            </li>
          </ul>
          
          <Typography variant="h6" gutterBottom>
            1.2 Automatically Collected Information
          </Typography>
          
          <Typography variant="body1" paragraph>
            When you access or use our service, we may automatically collect certain information, including:
          </Typography>
          
          <ul>
            <li>
              <Typography variant="body1" paragraph>
                Device information (such as your IP address, browser type, operating system, and device identifiers)
              </Typography>
            </li>
            <li>
              <Typography variant="body1" paragraph>
                Usage information (such as pages visited, features used, and time spent on the service)
              </Typography>
            </li>
            <li>
              <Typography variant="body1" paragraph>
                Location information (such as general location based on IP address)
              </Typography>
            </li>
            <li>
              <Typography variant="body1" paragraph>
                Log data (such as access times, hardware and software information, and referring/exit pages)
              </Typography>
            </li>
          </ul>
          
          <Typography variant="h6" gutterBottom>
            1.3 Cookies and Similar Technologies
          </Typography>
          
          <Typography variant="body1" paragraph>
            We use cookies and similar tracking technologies to collect and store information about your interactions with our service. You can control cookies through your browser settings and other tools. For more information, please see our Cookie Policy.
          </Typography>
        </Box>
        
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            2. How We Use Your Information
          </Typography>
          
          <Typography variant="body1" paragraph>
            We may use the information we collect for various purposes, including:
          </Typography>
          
          <ul>
            <li>
              <Typography variant="body1" paragraph>
                <strong>Providing and maintaining our service:</strong> To deliver the features and functionality of our service, process transactions, and manage your account.
              </Typography>
            </li>
            <li>
              <Typography variant="body1" paragraph>
                <strong>Improving our service:</strong> To understand how users interact with our service, identify areas for improvement, and develop new features.
              </Typography>
            </li>
            <li>
              <Typography variant="body1" paragraph>
                <strong>Communicating with you:</strong> To respond to your inquiries, provide customer support, and send important notices and updates.
              </Typography>
            </li>
            <li>
              <Typography variant="body1" paragraph>
                <strong>Marketing and promotions:</strong> To send you promotional materials and information about our products and services, subject to your marketing preferences.
              </Typography>
            </li>
            <li>
              <Typography variant="body1" paragraph>
                <strong>Analytics and research:</strong> To conduct data analysis, identify usage trends, and gather demographic information.
              </Typography>
            </li>
            <li>
              <Typography variant="body1" paragraph>
                <strong>Security and fraud prevention:</strong> To detect, prevent, and address technical issues, fraud, and illegal activities.
              </Typography>
            </li>
            <li>
              <Typography variant="body1" paragraph>
                <strong>Legal compliance:</strong> To comply with applicable laws, regulations, and legal processes.
              </Typography>
            </li>
          </ul>
        </Box>
        
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            3. Legal Basis for Processing (GDPR)
          </Typography>
          
          <Typography variant="body1" paragraph>
            If you are located in the European Economic Area (EEA), we will only process your personal data when we have a legal basis to do so. The legal bases we rely on include:
          </Typography>
          
          <ul>
            <li>
              <Typography variant="body1" paragraph>
                <strong>Consent:</strong> Where you have given us explicit consent to process your personal data for specific purposes.
              </Typography>
            </li>
            <li>
              <Typography variant="body1" paragraph>
                <strong>Contract:</strong> Where processing is necessary for the performance of a contract with you or to take steps at your request before entering into a contract.
              </Typography>
            </li>
            <li>
              <Typography variant="body1" paragraph>
                <strong>Legal obligation:</strong> Where processing is necessary for compliance with a legal obligation to which we are subject.
              </Typography>
            </li>
            <li>
              <Typography variant="body1" paragraph>
                <strong>Legitimate interests:</strong> Where processing is necessary for our legitimate interests or the legitimate interests of a third party, provided those interests are not overridden by your rights and interests.
              </Typography>
            </li>
          </ul>
        </Box>
        
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            4. How We Share Your Information
          </Typography>
          
          <Typography variant="body1" paragraph>
            We may share your information with third parties in the following circumstances:
          </Typography>
          
          <ul>
            <li>
              <Typography variant="body1" paragraph>
                <strong>Service providers:</strong> We may share your information with third-party vendors, service providers, contractors, or agents who perform services for us or on our behalf.
              </Typography>
            </li>
            <li>
              <Typography variant="body1" paragraph>
                <strong>Business transfers:</strong> We may share or transfer your information in connection with, or during negotiations of, any merger, sale of company assets, financing, or acquisition of all or a portion of our business to another company.
              </Typography>
            </li>
            <li>
              <Typography variant="body1" paragraph>
                <strong>With your consent:</strong> We may disclose your information for any other purpose with your consent.
              </Typography>
            </li>
            <li>
              <Typography variant="body1" paragraph>
                <strong>Legal requirements:</strong> We may disclose your information where required to do so by law or in response to valid requests by public authorities.
              </Typography>
            </li>
            <li>
              <Typography variant="body1" paragraph>
                <strong>Protection of rights:</strong> We may disclose your information to protect our rights, privacy, safety, or property, and that of our customers or others.
              </Typography>
            </li>
          </ul>
        </Box>
        
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            5. Data Retention
          </Typography>
          
          <Typography variant="body1" paragraph>
            We will retain your personal information only for as long as necessary to fulfill the purposes for which it was collected, including for the purposes of satisfying any legal, accounting, or reporting requirements. To determine the appropriate retention period, we consider the amount, nature, and sensitivity of the personal data, the potential risk of harm from unauthorized use or disclosure, the purposes for which we process the data, and applicable legal requirements.
          </Typography>
          
          <Typography variant="body1" paragraph>
            In some circumstances, we may anonymize your personal information so that it can no longer be associated with you, in which case we may use such information without further notice to you.
          </Typography>
        </Box>
        
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            6. Data Security
          </Typography>
          
          <Typography variant="body1" paragraph>
            We have implemented appropriate technical and organizational measures to protect the security of your personal information. However, please be aware that no method of transmission over the internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your personal information, we cannot guarantee its absolute security.
          </Typography>
        </Box>
        
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            7. Your Data Protection Rights
          </Typography>
          
          <Typography variant="h6" gutterBottom>
            7.1 GDPR Rights (European Economic Area)
          </Typography>
          
          <Typography variant="body1" paragraph>
            If you are located in the European Economic Area (EEA), you have certain data protection rights under the General Data Protection Regulation (GDPR). These rights include:
          </Typography>
          
          <ul>
            <li>
              <Typography variant="body1" paragraph>
                <strong>Right to access:</strong> You have the right to request copies of your personal data.
              </Typography>
            </li>
            <li>
              <Typography variant="body1" paragraph>
                <strong>Right to rectification:</strong> You have the right to request that we correct any information you believe is inaccurate or complete information you believe is incomplete.
              </Typography>
            </li>
            <li>
              <Typography variant="body1" paragraph>
                <strong>Right to erasure:</strong> You have the right to request that we erase your personal data, under certain conditions.
              </Typography>
            </li>
            <li>
              <Typography variant="body1" paragraph>
                <strong>Right to restrict processing:</strong> You have the right to request that we restrict the processing of your personal data, under certain conditions.
              </Typography>
            </li>
            <li>
              <Typography variant="body1" paragraph>
                <strong>Right to object to processing:</strong> You have the right to object to our processing of your personal data, under certain conditions.
              </Typography>
            </li>
            <li>
              <Typography variant="body1" paragraph>
                <strong>Right to data portability:</strong> You have the right to request that we transfer the data we have collected to another organization, or directly to you, under certain conditions.
              </Typography>
            </li>
          </ul>
          
          <Typography variant="h6" gutterBottom>
            7.2 CCPA Rights (California)
          </Typography>
          
          <Typography variant="body1" paragraph>
            If you are a California resident, you have certain data protection rights under the California Consumer Privacy Act (CCPA). These rights include:
          </Typography>
          
          <ul>
            <li>
              <Typography variant="body1" paragraph>
                <strong>Right to know:</strong> You have the right to request information about the categories and specific pieces of personal information we have collected about you, the categories of sources from which we collected the information, the purposes for collecting the information, the categories of third parties with whom we have shared the information, and the categories of personal information that we have sold or disclosed for a business purpose.
              </Typography>
            </li>
            <li>
              <Typography variant="body1" paragraph>
                <strong>Right to delete:</strong> You have the right to request that we delete personal information we have collected from you, subject to certain exceptions.
              </Typography>
            </li>
            <li>
              <Typography variant="body1" paragraph>
                <strong>Right to opt-out:</strong> You have the right to opt-out of the sale of your personal information to third parties.
              </Typography>
            </li>
            <li>
              <Typography variant="body1" paragraph>
                <strong>Right to non-discrimination:</strong> You have the right not to be discriminated against for exercising your CCPA rights.
              </Typography>
            </li>
          </ul>
          
          <Typography variant="h6" gutterBottom>
            7.3 Exercising Your Rights
          </Typography>
          
          <Typography variant="body1" paragraph>
            To exercise your data protection rights, please visit our <Link component={NextLink} href="/privacy-center" color="primary">Privacy Center</Link> or contact us using the information provided in the "Contact Us" section below. We will respond to your request within the timeframe required by applicable law.
          </Typography>
        </Box>
        
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            8. International Data Transfers
          </Typography>
          
          <Typography variant="body1" paragraph>
            Your information may be transferred to, and maintained on, computers located outside of your state, province, country, or other governmental jurisdiction where the data protection laws may differ from those in your jurisdiction. If you are located outside the United States and choose to provide information to us, please note that we transfer the data to the United States and process it there.
          </Typography>
          
          <Typography variant="body1" paragraph>
            When we transfer personal data from the European Economic Area, United Kingdom, or Switzerland to the United States or other countries which have not been deemed to provide an adequate level of protection under applicable data protection law, we rely on one or more of the following legal mechanisms: Standard Contractual Clauses, consent of the individual, or necessity for the performance of a contract.
          </Typography>
        </Box>
        
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            9. Children's Privacy
          </Typography>
          
          <Typography variant="body1" paragraph>
            Our service is not directed to anyone under the age of 18. We do not knowingly collect personal information from anyone under the age of 18. If you are a parent or guardian and you are aware that your child has provided us with personal information, please contact us. If we become aware that we have collected personal information from children without verification of parental consent, we take steps to remove that information from our servers.
          </Typography>
        </Box>
        
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            10. Changes to This Privacy Policy
          </Typography>
          
          <Typography variant="body1" paragraph>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date at the top of this Privacy Policy. You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
          </Typography>
        </Box>
        
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            11. Contact Us
          </Typography>
          
          <Typography variant="body1" paragraph>
            If you have any questions about this Privacy Policy, please contact us:
          </Typography>
          
          <ul>
            <li>
              <Typography variant="body1" paragraph>
                By email: privacy@climabill.com
              </Typography>
            </li>
            <li>
              <Typography variant="body1" paragraph>
                By mail: ClimaBill, Inc., 123 Green Street, San Francisco, CA 94111, United States
              </Typography>
            </li>
          </ul>
          
          <Typography variant="body1" paragraph>
            For data protection inquiries, you can also contact our Data Protection Officer at dpo@climabill.com.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}
