# ClimaBill User Guide: Accounting Integrations

ClimaBill seamlessly integrates with popular accounting software to streamline your financial workflows. This guide explains how to set up and use these integrations.

## Table of Contents

1. [Available Integrations](#available-integrations)
2. [QuickBooks Integration](#quickbooks-integration)
   - [Connecting to QuickBooks](#connecting-to-quickbooks)
   - [Data Synchronization](#quickbooks-data-synchronization)
   - [Managing QuickBooks Settings](#managing-quickbooks-settings)
3. [Xero Integration](#xero-integration)
   - [Connecting to Xero](#connecting-to-xero)
   - [Data Synchronization](#xero-data-synchronization)
   - [Managing Xero Settings](#managing-xero-settings)
4. [Synchronization Settings](#synchronization-settings)
5. [Troubleshooting](#troubleshooting)

## Available Integrations

ClimaBill currently offers integrations with the following accounting platforms:

- **QuickBooks Online**: Sync customers, invoices, payments, and carbon data
- **Xero**: Sync customers, invoices, payments, and carbon data

Additional integrations are being developed and will be added in future updates.

## QuickBooks Integration

### Connecting to QuickBooks

To connect ClimaBill with your QuickBooks Online account:

1. Go to "Settings" > "Integrations"
2. Click "Connect" next to QuickBooks
3. Click "Authorize Connection"
4. You'll be redirected to QuickBooks to log in and authorize the connection
5. Grant permission for ClimaBill to access your QuickBooks data
6. After authorization, you'll be redirected back to ClimaBill
7. Configure your synchronization settings (see below)
8. Click "Save Settings"

![QuickBooks Connection](../images/quickbooks-connection.png)

### QuickBooks Data Synchronization

Once connected, ClimaBill can synchronize the following data with QuickBooks:

- **Customers**: Sync customer information between ClimaBill and QuickBooks
- **Invoices**: Push invoices created in ClimaBill to QuickBooks
- **Payments**: Sync payment records between systems
- **Products/Services**: Map ClimaBill items to QuickBooks products/services
- **Carbon Data**: Add carbon tracking information as custom fields in QuickBooks

### Managing QuickBooks Settings

To manage your QuickBooks integration settings:

1. Go to "Settings" > "Integrations" > "QuickBooks"
2. Configure the following options:
   - **Sync Direction**: One-way (ClimaBill to QuickBooks) or two-way synchronization
   - **Auto-Sync**: Enable/disable automatic synchronization
   - **Sync Frequency**: How often automatic synchronization should occur
   - **Data Mapping**: Map ClimaBill fields to QuickBooks fields
   - **Carbon Data**: Choose how carbon data should be represented in QuickBooks
3. Click "Save Settings"

To manually trigger synchronization:

1. Go to "Settings" > "Integrations" > "QuickBooks"
2. Click "Sync Now"
3. Select what data to synchronize
4. Click "Start Sync"

## Xero Integration

### Connecting to Xero

To connect ClimaBill with your Xero account:

1. Go to "Settings" > "Integrations"
2. Click "Connect" next to Xero
3. Click "Authorize Connection"
4. You'll be redirected to Xero to log in and authorize the connection
5. Grant permission for ClimaBill to access your Xero data
6. After authorization, you'll be redirected back to ClimaBill
7. Configure your synchronization settings (see below)
8. Click "Save Settings"

![Xero Connection](../images/xero-connection.png)

### Xero Data Synchronization

Once connected, ClimaBill can synchronize the following data with Xero:

- **Contacts**: Sync customer information between ClimaBill and Xero
- **Invoices**: Push invoices created in ClimaBill to Xero
- **Payments**: Sync payment records between systems
- **Items**: Map ClimaBill items to Xero inventory items
- **Carbon Data**: Add carbon tracking information as tracking categories in Xero

### Managing Xero Settings

To manage your Xero integration settings:

1. Go to "Settings" > "Integrations" > "Xero"
2. Configure the following options:
   - **Sync Direction**: One-way (ClimaBill to Xero) or two-way synchronization
   - **Auto-Sync**: Enable/disable automatic synchronization
   - **Sync Frequency**: How often automatic synchronization should occur
   - **Data Mapping**: Map ClimaBill fields to Xero fields
   - **Carbon Data**: Choose how carbon data should be represented in Xero
3. Click "Save Settings"

To manually trigger synchronization:

1. Go to "Settings" > "Integrations" > "Xero"
2. Click "Sync Now"
3. Select what data to synchronize
4. Click "Start Sync"

## Synchronization Settings

### General Synchronization Options

For all accounting integrations, you can configure:

- **Initial Sync**: Choose whether to import existing data from your accounting system
- **Conflict Resolution**: Determine how to handle conflicts when the same data is modified in both systems
- **Error Handling**: Configure notifications for synchronization errors
- **Sync History**: View logs of all synchronization activities

### Data Mapping

ClimaBill allows you to map fields between systems:

1. Go to "Settings" > "Integrations" > [Integration Name] > "Data Mapping"
2. For each entity type (customers, invoices, etc.), map ClimaBill fields to the corresponding fields in your accounting system
3. Configure special handling for:
   - Tax rates
   - Payment methods
   - Product/service categories
   - Carbon tracking data
4. Click "Save Mapping"

### Carbon Data Integration

ClimaBill's unique carbon tracking features can be integrated with your accounting software:

- **QuickBooks**: Carbon data can be added as custom fields or line item descriptions
- **Xero**: Carbon data can be added as tracking categories or line item descriptions

To configure carbon data integration:

1. Go to "Settings" > "Integrations" > [Integration Name] > "Carbon Data"
2. Choose how carbon data should be represented:
   - As custom fields/tracking categories
   - As line item descriptions
   - As separate line items
   - As notes/memos
3. Click "Save Settings"

## Troubleshooting

### Common Issues

**Connection Issues**
- Ensure your accounting software subscription is active
- Check that you've granted all required permissions
- Try disconnecting and reconnecting the integration

**Synchronization Errors**
- Check for field mapping issues (e.g., required fields not mapped)
- Verify that data formats are compatible
- Look for duplicate records that may be causing conflicts

**Missing Data**
- Confirm that your synchronization settings include the data types you expect
- Check if filters are excluding certain records
- Verify the sync direction settings

### Sync Logs

ClimaBill maintains detailed logs of all synchronization activities:

1. Go to "Settings" > "Integrations" > [Integration Name] > "Sync History"
2. View logs of all synchronization events
3. Filter logs by:
   - Date range
   - Status (success, warning, error)
   - Data type (customers, invoices, etc.)
4. Click on any log entry to view details

### Getting Help

If you encounter issues with your accounting integrations:

1. Check our [Knowledge Base](https://help.climabill.com/integrations) for common solutions
2. Contact our support team at integrations-support@climabill.com
3. Include the following information in your support request:
   - Integration name
   - Error messages or screenshots
   - Recent sync log entries
   - Steps to reproduce the issue

For additional help with accounting integrations, please contact our support team at integrations-support@climabill.com.
