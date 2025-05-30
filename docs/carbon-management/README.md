# ClimaBill Carbon Management

This documentation provides an overview of the carbon management features in ClimaBill, including how to use them and how they are implemented.

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [User Guide](#user-guide)
4. [Developer Guide](#developer-guide)
5. [API Reference](#api-reference)
6. [Testing](#testing)

## Overview

The ClimaBill carbon management system provides comprehensive tools for tracking, analyzing, and reducing carbon emissions. It enables organizations to:

- Track carbon emissions at the organization, department, and project levels
- Set and monitor carbon reduction goals
- Generate sustainability reports
- Manage compliance with carbon accounting standards
- Purchase carbon offsets to compensate for emissions

## Features

### Carbon Dashboard

The Carbon Dashboard provides a high-level overview of an organization's carbon footprint, including:

- Carbon footprint summary
- Emissions trends over time
- Carbon usage breakdown by source
- Offset recommendations
- Quick access to carbon management features

### Carbon Management

The Carbon Management page provides detailed tools for managing carbon emissions:

- **Departments & Projects**: Organize carbon tracking by department and project
- **Goals**: Set and track carbon reduction goals
- **Analytics**: Analyze carbon emissions with interactive charts
- **Offsets**: Purchase and track carbon offsets
- **Reports**: Generate sustainability reports
- **Standards**: Manage compliance with carbon accounting standards

### Granular Emissions Tracking

Track carbon emissions at different organizational levels:

- Organization-wide emissions
- Department-specific emissions
- Project-specific emissions

### Carbon Reduction Goals

Set and track carbon reduction goals with:

- Baseline and target carbon values
- Progress tracking
- Milestone management
- Status updates

### Sustainability Reporting

Generate comprehensive sustainability reports:

- Monthly, quarterly, annual, or custom period reports
- Carbon emissions and reductions
- Offset purchases
- Compliance with standards

### Standards Compliance

Manage compliance with carbon accounting standards:

- GHG Protocol
- ISO 14064
- CDP
- TCFD
- SBTi

### Carbon Offsets

Purchase and track carbon offsets:

- Multiple project types (renewable energy, forestry, etc.)
- Integration with offset providers
- Payment through multiple gateways
- Offset history tracking

## User Guide

### Accessing Carbon Features

1. Navigate to the Carbon section in the main navigation
2. Select the desired feature:
   - Dashboard: Overview of carbon footprint
   - Management: Detailed carbon management tools
   - Offset: Purchase carbon offsets

### Managing Departments and Projects

1. Go to Carbon Management > Departments/Projects
2. Create, edit, or delete departments and projects
3. Use the Scope Selection at the top of the page to filter data by department and project

### Setting Carbon Reduction Goals

1. Go to Carbon Management > Goals
2. Click "Add Goal" to create a new goal
3. Enter goal details:
   - Name and description
   - Baseline carbon value
   - Target reduction percentage
   - Start and target dates
4. Track progress on the Goals page

### Generating Sustainability Reports

1. Go to Carbon Management > Reports
2. Click "Generate Report"
3. Select report type (monthly, quarterly, annual, custom)
4. For custom reports, select start and end dates
5. Click "Generate Report"
6. View and download reports from the Reports page

### Managing Standards Compliance

1. Go to Carbon Management > Standards
2. Click "Add Standard" to add a new standard
3. Select the standard and compliance status
4. For compliant standards, enter verification details
5. Track compliance status on the Standards page

### Purchasing Carbon Offsets

1. Go to Carbon > Offset
2. Choose between recommended or custom offset amount
3. Select project type
4. Choose payment method
5. Complete purchase
6. Track offset history in Carbon Management > Offsets

## Developer Guide

### Architecture

The carbon management system follows a modular architecture:

- **Models**: Define data structures for carbon tracking
- **Services**: Implement business logic for carbon management
- **Components**: Provide UI for carbon features
- **API**: Enable data access and manipulation

### Key Files

#### Models

- `department-project.ts`: Defines interfaces for departments, projects, goals, reports, and standards

#### Services

- `department-project-service.ts`: Manages departments and projects
- `carbon-goals-service.ts`: Manages carbon reduction goals
- `carbon-tracking-service.ts`: Tracks carbon usage and emissions
- `carbon-offset-service.ts`: Manages carbon offset purchases
- `sustainability-reporting-service.ts`: Generates reports and manages standards compliance

#### Components

- `DepartmentList.tsx` & `ProjectList.tsx`: Manage departments and projects
- `CarbonGoalTracker.tsx` & `CarbonGoalCard.tsx`: Manage carbon reduction goals
- `StandardsCompliance.tsx`: Manages standards compliance
- `SustainabilityReports.tsx`: Generates and displays reports
- `CarbonAnalytics.tsx`: Displays carbon analytics
- `CarbonOffsets.tsx`: Manages carbon offset purchases

#### Pages

- `carbon/dashboard/page.tsx`: Carbon Dashboard page
- `carbon/management/page.tsx`: Carbon Management page
- `carbon/offset/page.tsx`: Carbon Offset purchase page

#### API

- `api/carbon/departments/route.ts`: API for departments
- `api/carbon/projects/route.ts`: API for projects
- `api/carbon/goals/route.ts`: API for goals
- `api/carbon/reports/route.ts`: API for reports
- `api/carbon/standards/route.ts`: API for standards compliance

### Implementation Details

#### Data Storage

Carbon data is stored in Firebase Firestore with the following collections:

- `departments`: Organization departments
- `projects`: Department projects
- `carbonReductionGoals`: Carbon reduction goals
- `carbonUsage`: Carbon usage records
- `carbonOffsets`: Carbon offset purchases
- `sustainabilityReports`: Sustainability reports
- `standardsCompliance`: Standards compliance records

#### Authentication and Authorization

All carbon management features require authentication. Authorization is enforced at both the API and service levels:

- Users can only access their own organization's data
- Organization administrators can access all data within their organization
- API endpoints validate user permissions before allowing operations

## API Reference

### Departments API

- `GET /api/carbon/departments`: List departments
- `POST /api/carbon/departments`: Create department
- `PUT /api/carbon/departments`: Update department
- `DELETE /api/carbon/departments`: Delete department

### Projects API

- `GET /api/carbon/projects`: List projects
- `POST /api/carbon/projects`: Create project
- `PUT /api/carbon/projects`: Update project
- `DELETE /api/carbon/projects`: Delete project

### Goals API

- `GET /api/carbon/goals`: List goals
- `GET /api/carbon/goals/[id]`: Get goal
- `POST /api/carbon/goals`: Create goal
- `PUT /api/carbon/goals/[id]`: Update goal
- `DELETE /api/carbon/goals/[id]`: Delete goal
- `GET /api/carbon/goals/[id]/progress`: Get goal progress

### Reports API

- `GET /api/carbon/reports`: List reports
- `GET /api/carbon/reports/[id]`: Get report
- `POST /api/carbon/reports`: Generate report
- `DELETE /api/carbon/reports/[id]`: Delete report

### Standards API

- `GET /api/carbon/standards`: List standards compliance
- `POST /api/carbon/standards`: Set standard compliance
- `DELETE /api/carbon/standards/[id]`: Delete standard compliance

## Testing

The carbon management system includes comprehensive tests:

### Service Tests

- `carbon-goals-service.test.ts`: Tests for goal management
- `sustainability-reporting-service.test.ts`: Tests for reporting and standards
- `department-project-service.test.ts`: Tests for department and project management

### Component Tests

- `CarbonGoalTracker.test.tsx`: Tests for goal tracking UI
- `StandardsCompliance.test.tsx`: Tests for standards compliance UI
- `SustainabilityReports.test.tsx`: Tests for reports UI
- `CarbonAnalytics.test.tsx`: Tests for analytics UI

### API Tests

- `departments.test.ts`: Tests for departments API
- `goals.test.ts`: Tests for goals API

To run the tests:

```bash
npm test
```

To run specific tests:

```bash
npm test -- carbon-goals-service
```
