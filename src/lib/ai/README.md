# ClimaBill AI & Real-Time Analytics

This directory contains the implementation of ClimaBill's AI and real-time analytics components, which provide machine learning predictions, data processing, and visualization capabilities.

## Features

- **Churn Prediction**: ML model for predicting customer churn with probability scores and actionable insights.
- **Revenue Prediction**: Forecasting future revenue based on customer behavior and subscription data.
- **Customer Segmentation**: Automatically segment customers based on behavior patterns.
- **Real-Time Analytics Dashboard**: Live monitoring of key business metrics.
- **Data Warehouse Integration**: Connect to data warehouses for advanced analytics.

## Directory Structure

- `/ai`: AI services and machine learning models
  - `/churn-prediction.ts`: Service for predicting customer churn
  - `/sagemaker-client.ts`: Client for interacting with AWS SageMaker endpoints
  - `/config.ts`: Configuration for AI services
- `/analytics`: Analytics services and data processing
  - `/analytics-service.ts`: Service for processing analytics data
  - `/data-warehouse.ts`: Client for connecting to data warehouses

## API Routes

- `/api/ai/churn-prediction`: Endpoint for generating and retrieving churn predictions
- `/api/analytics/dashboard`: Endpoint for retrieving dashboard metrics
- `/api/analytics/time-series`: Endpoint for retrieving time series data for charts

## Environment Variables

The following environment variables need to be set in your `.env.local` file:

### AWS SageMaker Configuration
```
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
SAGEMAKER_ENDPOINT_NAME=your_endpoint_name

# Model endpoints
CHURN_MODEL_ENDPOINT=churn-prediction
REVENUE_MODEL_ENDPOINT=revenue-prediction
CUSTOMER_SEGMENTATION_MODEL_ENDPOINT=customer-segmentation
```

### Data Warehouse Configuration
```
DW_HOST=your_data_warehouse_host
DW_DATABASE=your_database_name
DW_USER=your_username
DW_PASSWORD=your_password
DW_PORT=5432
```

## Setup Instructions

1. Create an AWS account and set up SageMaker for model deployment.
2. Train and deploy the required machine learning models on SageMaker.
3. Set up a data warehouse (PostgreSQL, Redshift, Snowflake, etc.) for analytics data.
4. Configure the environment variables in your `.env.local` file.

## AWS SageMaker Setup

### Training and Deploying Models

1. Prepare your training data and upload it to an S3 bucket.
2. Create a SageMaker notebook instance for model development.
3. Train your models using SageMaker's built-in algorithms or custom containers.
4. Deploy the trained models as SageMaker endpoints.

Example Python code for deploying a model:

```python
import sagemaker
from sagemaker.sklearn.estimator import SKLearn

# Initialize SageMaker session
sagemaker_session = sagemaker.Session()
role = sagemaker.get_execution_role()

# Create an estimator
sklearn_estimator = SKLearn(
    entry_point='train.py',
    role=role,
    framework_version='0.23-1',
    instance_type='ml.m5.xlarge',
    instance_count=1
)

# Train the model
sklearn_estimator.fit({'train': s3_train_data})

# Deploy the model
predictor = sklearn_estimator.deploy(
    initial_instance_count=1,
    instance_type='ml.t2.medium'
)
```

## Data Warehouse Setup

1. Create a database in your preferred data warehouse solution.
2. Set up tables for storing analytics data.
3. Implement ETL processes to load data from your application into the data warehouse.

Example schema for analytics tables:

```sql
-- Customer activity table
CREATE TABLE customer_activity (
    id SERIAL PRIMARY KEY,
    customer_id VARCHAR(255) NOT NULL,
    activity_type VARCHAR(50) NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    metadata JSONB
);

-- Revenue metrics table
CREATE TABLE revenue_metrics (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    total_revenue DECIMAL(12,2) NOT NULL,
    recurring_revenue DECIMAL(12,2) NOT NULL,
    one_time_revenue DECIMAL(12,2) NOT NULL,
    plan_id VARCHAR(50),
    customer_count INTEGER
);

-- Customer metrics table
CREATE TABLE customer_metrics (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    total_customers INTEGER NOT NULL,
    active_customers INTEGER NOT NULL,
    new_customers INTEGER NOT NULL,
    churned_customers INTEGER NOT NULL
);
```

## Usage

### Generating Churn Predictions

```typescript
// Client-side
const response = await fetch('/api/ai/churn-prediction', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    customerId: 'customer-123',
  }),
});

const data = await response.json();
const prediction = data.prediction;
```

### Fetching Dashboard Metrics

```typescript
// Client-side
const response = await fetch('/api/analytics/dashboard?period=month');
const data = await response.json();
const metrics = data.metrics;
```

### Fetching Time Series Data

```typescript
// Client-side
const response = await fetch('/api/analytics/time-series?type=revenue&period=month');
const data = await response.json();
const timeSeriesData = data.data;
```

## Model Explanations

### Churn Prediction Model

The churn prediction model analyzes various customer behaviors and attributes to predict the likelihood of a customer canceling their subscription. Key factors include:

- Subscription length
- Payment history
- Support ticket frequency
- Feature usage patterns
- Login frequency
- Revenue history

The model outputs:
- Churn probability (0-1)
- Confidence level (high, medium, low)
- Top contributing factors
- Recommended actions

### Revenue Prediction Model

The revenue prediction model forecasts future revenue based on:

- Current subscription distribution
- Historical growth rates
- Seasonal patterns
- Churn predictions
- Upsell/cross-sell opportunities

## Real-Time Analytics

The real-time analytics dashboard provides insights into:

- Revenue metrics (total, recurring, one-time)
- Customer metrics (total, active, new, churn rate)
- Invoice metrics (total, paid, overdue)
- Time series trends
- Distribution breakdowns

Data is refreshed at configurable intervals to provide up-to-date information for business decision-making.
