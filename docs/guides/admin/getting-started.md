# ClimaBill Administrator Guide: Getting Started

Welcome to the ClimaBill Administrator Guide. This document provides system administrators with the information needed to set up, configure, and maintain the ClimaBill platform.

## Table of Contents

1. [Introduction](#introduction)
2. [System Requirements](#system-requirements)
3. [Installation](#installation)
4. [Initial Configuration](#initial-configuration)
5. [User Management](#user-management)
6. [Security Settings](#security-settings)
7. [System Monitoring](#system-monitoring)
8. [Backup and Recovery](#backup-and-recovery)
9. [Next Steps](#next-steps)

## Introduction

The ClimaBill platform is a comprehensive invoicing and carbon tracking solution that helps businesses manage their billing processes while monitoring and offsetting their carbon footprint. As an administrator, you'll be responsible for:

- Setting up and maintaining the ClimaBill environment
- Managing user accounts and permissions
- Configuring system settings and integrations
- Monitoring system performance and security
- Ensuring data integrity and compliance

This guide assumes you have basic knowledge of:
- Docker and containerization
- Kubernetes (if using the Kubernetes deployment)
- Cloud infrastructure (AWS or GCP)
- Database management (PostgreSQL)
- Web application security

## System Requirements

### Self-Hosted Deployment

For self-hosted deployments, ClimaBill requires:

**Minimum Requirements:**
- 2 CPU cores
- 4GB RAM
- 20GB storage
- PostgreSQL 13+
- Redis 6+
- Node.js 16+
- Docker 20+
- Kubernetes 1.21+ (for Kubernetes deployment)

**Recommended Requirements:**
- 4 CPU cores
- 8GB RAM
- 50GB SSD storage
- PostgreSQL 14+
- Redis 6.2+
- Node.js 18+
- Docker 23+
- Kubernetes 1.25+ (for Kubernetes deployment)

### Cloud Requirements

For AWS or GCP deployments, you'll need:

**AWS:**
- AWS account with administrative access
- VPC with public and private subnets
- RDS for PostgreSQL
- ElastiCache for Redis
- ECS or EKS for container orchestration
- S3 for file storage
- CloudWatch for monitoring

**GCP:**
- GCP account with administrative access
- VPC network with subnets
- Cloud SQL for PostgreSQL
- Memorystore for Redis
- GKE for container orchestration
- Cloud Storage for file storage
- Cloud Monitoring for system monitoring

## Installation

ClimaBill can be deployed in several ways:

### Docker Compose (Development/Testing)

1. Clone the ClimaBill repository:
   ```bash
   git clone https://github.com/climabill/climabill.git
   cd climabill
   ```

2. Configure environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. Start the application:
   ```bash
   docker-compose up -d
   ```

4. Access ClimaBill at http://localhost:3000

### Kubernetes Deployment (Production)

1. Clone the ClimaBill repository:
   ```bash
   git clone https://github.com/climabill/climabill.git
   cd climabill
   ```

2. Configure Kubernetes manifests:
   ```bash
   # Review and edit files in infrastructure/kubernetes/
   ```

3. Create namespace and deploy:
   ```bash
   kubectl apply -f infrastructure/kubernetes/namespace.yaml
   kubectl apply -f infrastructure/kubernetes/secrets.yaml
   kubectl apply -f infrastructure/kubernetes/postgres/
   kubectl apply -f infrastructure/kubernetes/redis/
   kubectl apply -f infrastructure/kubernetes/manifests/
   ```

4. Configure ingress and TLS:
   ```bash
   kubectl apply -f infrastructure/kubernetes/ingress.yaml
   ```

5. Verify deployment:
   ```bash
   kubectl get pods -n climabill
   ```

### Cloud Deployment

#### AWS Deployment

1. Configure AWS credentials:
   ```bash
   aws configure
   ```

2. Deploy using CloudFormation:
   ```bash
   cd infrastructure/aws
   aws cloudformation create-stack --stack-name climabill --template-body file://cloudformation.yaml --parameters file://parameters.json --capabilities CAPABILITY_IAM
   ```

#### GCP Deployment

1. Configure GCP credentials:
   ```bash
   gcloud auth login
   gcloud config set project YOUR_PROJECT_ID
   ```

2. Deploy using Terraform:
   ```bash
   cd infrastructure/terraform
   terraform init
   terraform apply
   ```

## Initial Configuration

After installation, you need to perform initial configuration:

1. Access the admin portal at https://your-domain.com/admin
2. Log in with the default admin credentials (change these immediately):
   - Username: `admin@climabill.com`
   - Password: `ChangeMe123!`

3. Complete the setup wizard:
   - Set your organization details
   - Configure email settings
   - Set up database connections
   - Configure external services (payment gateways, blockchain providers, etc.)

4. Change the default admin password:
   - Go to "Admin Settings" > "My Profile"
   - Click "Change Password"
   - Set a strong, unique password

## User Management

### Creating Admin Users

To create additional admin users:

1. Go to "Admin Settings" > "User Management"
2. Click "Add User"
3. Fill in the user details:
   - Email address
   - Name
   - Role (select "Administrator")
   - Department (optional)
4. Click "Create User"
5. The new admin will receive an email with instructions to set their password

### User Roles and Permissions

ClimaBill has the following built-in roles:

- **Super Admin**: Full access to all system settings and features
- **Administrator**: Access to most admin features except critical system settings
- **Manager**: Can manage users and view reports but cannot change system settings
- **User**: Regular user access (no admin capabilities)

To customize roles and permissions:

1. Go to "Admin Settings" > "Roles & Permissions"
2. Select a role to edit or click "Create Role"
3. Configure permissions for each feature category
4. Click "Save Changes"

## Security Settings

### Authentication Settings

Configure authentication settings:

1. Go to "Admin Settings" > "Security" > "Authentication"
2. Configure:
   - Password policy (minimum length, complexity, expiration)
   - Multi-factor authentication requirements
   - Session timeout settings
   - Login attempt limits
3. Click "Save Changes"

### API Access

Manage API access:

1. Go to "Admin Settings" > "Security" > "API Access"
2. Configure:
   - API key management
   - Rate limiting
   - IP restrictions
   - Webhook settings
3. Click "Save Changes"

### Data Encryption

Configure encryption settings:

1. Go to "Admin Settings" > "Security" > "Encryption"
2. Configure:
   - Database encryption settings
   - File encryption settings
   - Blockchain wallet encryption
3. Click "Save Changes"

## System Monitoring

### Health Dashboard

Monitor system health:

1. Go to "Admin Settings" > "System" > "Health Dashboard"
2. View:
   - Server status
   - Database performance
   - API response times
   - Error rates
   - Resource utilization

### Logs

Access system logs:

1. Go to "Admin Settings" > "System" > "Logs"
2. Filter logs by:
   - Date range
   - Log level
   - Component
   - User
3. Export logs for analysis

### Alerts

Configure system alerts:

1. Go to "Admin Settings" > "System" > "Alerts"
2. Set up alerts for:
   - Server downtime
   - High error rates
   - Database performance issues
   - Security events
3. Configure notification channels (email, SMS, Slack)

## Backup and Recovery

### Database Backups

Configure database backups:

1. Go to "Admin Settings" > "System" > "Backups"
2. Configure:
   - Backup schedule
   - Retention policy
   - Storage location
3. Click "Save Changes"

To manually create a backup:

1. Go to "Admin Settings" > "System" > "Backups"
2. Click "Create Backup Now"
3. Enter a description for the backup
4. Click "Start Backup"

### Disaster Recovery

In case of system failure:

1. Go to "Admin Settings" > "System" > "Disaster Recovery"
2. Select a recovery option:
   - Restore from backup
   - Failover to standby system
   - Rebuild from scratch
3. Follow the recovery wizard instructions

## Next Steps

After completing the initial setup, explore these additional administrator guides:

- [Advanced Configuration](./advanced-configuration.md)
- [Integration Management](./integration-management.md)
- [Compliance and Data Protection](./compliance.md)
- [Performance Optimization](./performance.md)
- [Troubleshooting](./troubleshooting.md)

For additional help, contact our support team at admin-support@climabill.com.
