terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 4.0"
    }
    google-beta = {
      source  = "hashicorp/google-beta"
      version = "~> 4.0"
    }
  }
  backend "gcs" {
    # This will be filled in during deployment
    # bucket = "climabill-terraform-state"
    # prefix = "terraform/state"
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
  zone    = var.zone
}

provider "google-beta" {
  project = var.project_id
  region  = var.region
  zone    = var.zone
}

# Enable required APIs
resource "google_project_service" "services" {
  for_each = toset([
    "compute.googleapis.com",
    "container.googleapis.com",
    "cloudbuild.googleapis.com",
    "cloudresourcemanager.googleapis.com",
    "iam.googleapis.com",
    "servicenetworking.googleapis.com",
    "sqladmin.googleapis.com",
    "redis.googleapis.com",
    "secretmanager.googleapis.com",
    "artifactregistry.googleapis.com",
    "monitoring.googleapis.com",
    "logging.googleapis.com",
    "cloudtrace.googleapis.com"
  ])
  project = var.project_id
  service = each.key

  disable_dependent_services = true
  disable_on_destroy         = false
}

# VPC Network
resource "google_compute_network" "vpc" {
  name                    = "${var.project_name}-${var.environment}-vpc"
  auto_create_subnetworks = false
  depends_on              = [google_project_service.services["compute.googleapis.com"]]
}

# Subnets
resource "google_compute_subnetwork" "subnet" {
  name          = "${var.project_name}-${var.environment}-subnet"
  ip_cidr_range = "10.0.0.0/16"
  region        = var.region
  network       = google_compute_network.vpc.id

  secondary_ip_range {
    range_name    = "pods"
    ip_cidr_range = "10.1.0.0/16"
  }

  secondary_ip_range {
    range_name    = "services"
    ip_cidr_range = "10.2.0.0/16"
  }

  private_ip_google_access = true
}

# Router for NAT gateway
resource "google_compute_router" "router" {
  name    = "${var.project_name}-${var.environment}-router"
  region  = var.region
  network = google_compute_network.vpc.id
}

# NAT gateway
resource "google_compute_router_nat" "nat" {
  name                               = "${var.project_name}-${var.environment}-nat"
  router                             = google_compute_router.router.name
  region                             = var.region
  nat_ip_allocate_option             = "AUTO_ONLY"
  source_subnetwork_ip_ranges_to_nat = "ALL_SUBNETWORKS_ALL_IP_RANGES"

  log_config {
    enable = true
    filter = "ERRORS_ONLY"
  }
}

# GKE Cluster
resource "google_container_cluster" "primary" {
  name     = "${var.project_name}-${var.environment}-cluster"
  location = var.region

  # We can't create a cluster with no node pool defined, but we want to only use
  # separately managed node pools. So we create the smallest possible default
  # node pool and immediately delete it.
  remove_default_node_pool = true
  initial_node_count       = 1

  network    = google_compute_network.vpc.id
  subnetwork = google_compute_subnetwork.subnet.id

  ip_allocation_policy {
    cluster_secondary_range_name  = "pods"
    services_secondary_range_name = "services"
  }

  private_cluster_config {
    enable_private_nodes    = true
    enable_private_endpoint = false
    master_ipv4_cidr_block  = "172.16.0.0/28"
  }

  master_authorized_networks_config {
    cidr_blocks {
      cidr_block   = "0.0.0.0/0"
      display_name = "All"
    }
  }

  workload_identity_config {
    workload_pool = "${var.project_id}.svc.id.goog"
  }

  depends_on = [
    google_project_service.services["container.googleapis.com"],
    google_compute_subnetwork.subnet
  ]
}

# GKE Node Pool
resource "google_container_node_pool" "primary_nodes" {
  name       = "${var.project_name}-${var.environment}-node-pool"
  location   = var.region
  cluster    = google_container_cluster.primary.name
  node_count = var.environment == "production" ? 3 : 1

  node_config {
    machine_type = var.environment == "production" ? "e2-standard-4" : "e2-standard-2"
    disk_size_gb = 100
    disk_type    = "pd-standard"

    # Google recommends custom service accounts with minimal permissions
    service_account = google_service_account.gke_sa.email
    oauth_scopes = [
      "https://www.googleapis.com/auth/cloud-platform"
    ]

    labels = {
      env = var.environment
    }

    workload_metadata_config {
      mode = "GKE_METADATA"
    }
  }

  autoscaling {
    min_node_count = 1
    max_node_count = var.environment == "production" ? 10 : 3
  }

  management {
    auto_repair  = true
    auto_upgrade = true
  }

  depends_on = [
    google_container_cluster.primary
  ]
}

# Service Account for GKE nodes
resource "google_service_account" "gke_sa" {
  account_id   = "${var.project_name}-${var.environment}-gke-sa"
  display_name = "GKE Service Account for ${var.project_name} ${var.environment}"
  depends_on   = [google_project_service.services["iam.googleapis.com"]]
}

# Grant required roles to the GKE service account
resource "google_project_iam_member" "gke_sa_roles" {
  for_each = toset([
    "roles/logging.logWriter",
    "roles/monitoring.metricWriter",
    "roles/monitoring.viewer",
    "roles/storage.objectViewer",
    "roles/artifactregistry.reader"
  ])
  project = var.project_id
  role    = each.key
  member  = "serviceAccount:${google_service_account.gke_sa.email}"
}

# Cloud SQL Database
resource "google_compute_global_address" "private_ip_address" {
  name          = "${var.project_name}-${var.environment}-db-ip"
  purpose       = "VPC_PEERING"
  address_type  = "INTERNAL"
  prefix_length = 16
  network       = google_compute_network.vpc.id
  depends_on    = [google_project_service.services["servicenetworking.googleapis.com"]]
}

resource "google_service_networking_connection" "private_vpc_connection" {
  network                 = google_compute_network.vpc.id
  service                 = "servicenetworking.googleapis.com"
  reserved_peering_ranges = [google_compute_global_address.private_ip_address.name]
  depends_on              = [google_project_service.services["servicenetworking.googleapis.com"]]
}

resource "google_sql_database_instance" "postgres" {
  name             = "${var.project_name}-${var.environment}-db"
  database_version = "POSTGRES_14"
  region           = var.region

  settings {
    tier              = var.environment == "production" ? "db-custom-4-15360" : "db-custom-2-7680"
    availability_type = var.environment == "production" ? "REGIONAL" : "ZONAL"

    backup_configuration {
      enabled            = true
      binary_log_enabled = false
      start_time         = "02:00"
      location           = var.region
      point_in_time_recovery_enabled = var.environment == "production" ? true : false
    }

    ip_configuration {
      ipv4_enabled    = false
      private_network = google_compute_network.vpc.id
    }

    insights_config {
      query_insights_enabled  = true
      query_string_length     = 1024
      record_application_tags = true
      record_client_address   = false
    }
  }

  deletion_protection = var.environment == "production" ? true : false

  depends_on = [
    google_service_networking_connection.private_vpc_connection,
    google_project_service.services["sqladmin.googleapis.com"]
  ]
}

resource "google_sql_database" "database" {
  name     = var.db_name
  instance = google_sql_database_instance.postgres.name
}

resource "google_sql_user" "user" {
  name     = var.db_user
  instance = google_sql_database_instance.postgres.name
  password = var.db_password
}

# Redis Cache
resource "google_redis_instance" "cache" {
  name           = "${var.project_name}-${var.environment}-redis"
  tier           = "STANDARD_HA"
  memory_size_gb = var.environment == "production" ? 4 : 1
  region         = var.region
  
  authorized_network = google_compute_network.vpc.id
  connect_mode       = "PRIVATE_SERVICE_ACCESS"

  redis_version     = "REDIS_6_X"
  display_name      = "${var.project_name} ${var.environment} Redis"
  
  depends_on = [
    google_project_service.services["redis.googleapis.com"],
    google_service_networking_connection.private_vpc_connection
  ]
}

# Artifact Registry for Docker images
resource "google_artifact_registry_repository" "docker_repo" {
  location      = var.region
  repository_id = "${var.project_name}-${var.environment}-repo"
  format        = "DOCKER"
  description   = "Docker repository for ${var.project_name} ${var.environment}"
  
  depends_on = [google_project_service.services["artifactregistry.googleapis.com"]]
}

# Secret Manager for sensitive data
resource "google_secret_manager_secret" "db_password" {
  secret_id = "${var.project_name}-${var.environment}-db-password"
  
  replication {
    automatic = true
  }
  
  depends_on = [google_project_service.services["secretmanager.googleapis.com"]]
}

resource "google_secret_manager_secret_version" "db_password_version" {
  secret      = google_secret_manager_secret.db_password.id
  secret_data = var.db_password
}

# Allow GKE service account to access secrets
resource "google_secret_manager_secret_iam_member" "gke_sa_secret_access" {
  secret_id = google_secret_manager_secret.db_password.id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.gke_sa.email}"
}

# Cloud Storage bucket for static assets
resource "google_storage_bucket" "static_assets" {
  name          = "${var.project_id}-${var.environment}-static-assets"
  location      = var.region
  force_destroy = var.environment != "production"
  
  uniform_bucket_level_access = true
  
  website {
    main_page_suffix = "index.html"
    not_found_page   = "404.html"
  }
  
  cors {
    origin          = ["https://${var.domain}"]
    method          = ["GET", "HEAD", "OPTIONS"]
    response_header = ["*"]
    max_age_seconds = 3600
  }
}

# Load Balancer for GKE
resource "google_compute_address" "static_ip" {
  name = "${var.project_name}-${var.environment}-ip"
}

# Cloud Monitoring Dashboard
resource "google_monitoring_dashboard" "dashboard" {
  dashboard_json = <<EOF
{
  "displayName": "${var.project_name} ${var.environment} Dashboard",
  "gridLayout": {
    "widgets": [
      {
        "title": "CPU Usage",
        "xyChart": {
          "dataSets": [
            {
              "timeSeriesQuery": {
                "timeSeriesFilter": {
                  "filter": "resource.type=\"k8s_container\" AND resource.labels.cluster_name=\"${google_container_cluster.primary.name}\" AND metric.type=\"kubernetes.io/container/cpu/core_usage_time\"",
                  "aggregation": {
                    "alignmentPeriod": "60s",
                    "perSeriesAligner": "ALIGN_RATE"
                  }
                }
              }
            }
          ]
        }
      },
      {
        "title": "Memory Usage",
        "xyChart": {
          "dataSets": [
            {
              "timeSeriesQuery": {
                "timeSeriesFilter": {
                  "filter": "resource.type=\"k8s_container\" AND resource.labels.cluster_name=\"${google_container_cluster.primary.name}\" AND metric.type=\"kubernetes.io/container/memory/used_bytes\"",
                  "aggregation": {
                    "alignmentPeriod": "60s",
                    "perSeriesAligner": "ALIGN_MEAN"
                  }
                }
              }
            }
          ]
        }
      }
    ]
  }
}
EOF

  depends_on = [
    google_project_service.services["monitoring.googleapis.com"],
    google_container_cluster.primary
  ]
}
