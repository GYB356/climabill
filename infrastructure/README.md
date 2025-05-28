# ClimaBill Infrastructure

This directory contains all the infrastructure-as-code configurations for deploying, scaling, and managing the ClimaBill application across different environments.

## Overview

The ClimaBill infrastructure is designed for high availability, scalability, and security using modern cloud-native technologies:

- **Containerization**: Docker for application packaging
- **Orchestration**: Kubernetes for container orchestration
- **Service Mesh**: Istio for advanced traffic management and security
- **Databases**: PostgreSQL with high-availability using Patroni
- **Caching**: Redis in cluster mode for distributed caching
- **Secrets Management**: HashiCorp Vault for secure secrets handling
- **Monitoring**: Prometheus, Grafana, and ELK stack
- **Cloud Providers**: AWS and GCP support

## Directory Structure

```
infrastructure/
├── aws/                    # AWS-specific configurations
│   └── disaster-recovery.yaml  # Multi-region disaster recovery setup
├── kubernetes/             # Kubernetes manifests
│   ├── cluster-autoscaler/ # Kubernetes cluster autoscaling
│   ├── jobs/               # Kubernetes jobs (e.g., migrations)
│   ├── logging/            # ELK stack for centralized logging
│   ├── manifests/          # Core application manifests
│   ├── postgres/           # PostgreSQL HA configuration
│   ├── redis/              # Redis cluster configuration
│   ├── security/           # Security policies and Vault setup
│   └── service-mesh/       # Istio service mesh configuration
└── terraform/              # Terraform modules for cloud provisioning
    ├── dev/                # Development environment
    ├── staging/            # Staging environment
    └── prod/               # Production environment
```

## Getting Started

### Prerequisites

- Docker and Docker Compose
- kubectl (Kubernetes CLI)
- Terraform
- AWS CLI and/or Google Cloud SDK
- Helm

### Local Development

For local development, use Docker Compose:

```bash
cd /path/to/climabill
docker-compose up -d
```

This will start the application along with PostgreSQL, Redis, and other required services.

### Deployment

The infrastructure can be deployed using the CI/CD pipeline or manually:

#### Using CI/CD Pipeline

Push changes to the `main` branch or use the GitHub Actions workflow dispatch to trigger a deployment:

1. Go to GitHub Actions
2. Select the "Infrastructure Deployment" workflow
3. Click "Run workflow"
4. Select the target environment (dev, staging, prod)
5. Start the workflow

#### Manual Deployment

For manual deployment, follow these steps:

1. **Provision cloud infrastructure**:

```bash
cd infrastructure/terraform/[environment]
terraform init
terraform apply
```

2. **Configure kubectl**:

For AWS:
```bash
aws eks update-kubeconfig --name climabill-[environment] --region [region]
```

For GCP:
```bash
gcloud container clusters get-credentials climabill-[environment] --region [region]
```

3. **Deploy Kubernetes resources**:

```bash
cd infrastructure/kubernetes
kubectl apply -f namespace.yaml
kubectl apply -f security/secrets.yaml
kubectl apply -f postgres/postgres-ha.yaml
kubectl apply -f redis/redis-cluster.yaml
kubectl apply -f manifests/
```

## Scaling

### Horizontal Pod Autoscaling

The application uses Kubernetes Horizontal Pod Autoscaler (HPA) to automatically scale based on CPU and memory usage:

```bash
kubectl get hpa -n climabill
```

### Cluster Autoscaling

The Kubernetes cluster itself can scale using the cluster autoscaler:

```bash
kubectl get deployments -n kube-system cluster-autoscaler
```

## Monitoring

### Prometheus and Grafana

Access Grafana dashboards at:
- Development: https://grafana.dev.climabill.com
- Staging: https://grafana.staging.climabill.com
- Production: https://grafana.prod.climabill.com

Default dashboards include:
- Application Overview
- Node Performance
- PostgreSQL Metrics
- Redis Metrics

### ELK Stack

Access Kibana for log analysis at:
- Development: https://kibana.dev.climabill.com
- Staging: https://kibana.staging.climabill.com
- Production: https://kibana.prod.climabill.com

## Disaster Recovery

The disaster recovery setup includes:

1. **Database Backups**: Automated daily backups stored in S3/GCS
2. **Multi-Region Replication**: Database replicas in secondary regions
3. **Automated Failover**: Monitoring and automated promotion of replicas

To test the disaster recovery process:

```bash
cd infrastructure/scripts
./test-dr-failover.sh [environment]
```

## Security

### Secrets Management

Secrets are managed using HashiCorp Vault:

```bash
# Port forward to access Vault UI
kubectl port-forward svc/vault 8200:8200 -n climabill

# Access Vault UI at http://localhost:8200
```

### Network Policies

Kubernetes network policies restrict pod-to-pod communication:

```bash
kubectl get networkpolicies -n climabill
```

## Maintenance

### Database Migrations

Run database migrations using:

```bash
kubectl apply -f infrastructure/kubernetes/jobs/db-migrate.yaml
```

### Updating Certificates

TLS certificates are managed by cert-manager. To manually renew:

```bash
kubectl annotate certificate climabill-cert -n climabill cert-manager.io/renew=true
```

## Troubleshooting

### Common Issues

1. **Pod Crashes**: Check logs with `kubectl logs [pod-name] -n climabill`
2. **Database Connection Issues**: Verify secrets and network policies
3. **Service Mesh Problems**: Check Istio sidecars with `istioctl analyze -n climabill`

### Getting Help

For infrastructure issues, contact the DevOps team at devops@climabill.com or create an issue in the GitHub repository.
