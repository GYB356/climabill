output "kubernetes_cluster_name" {
  description = "GKE Cluster Name"
  value       = google_container_cluster.primary.name
}

output "kubernetes_cluster_host" {
  description = "GKE Cluster Host"
  value       = google_container_cluster.primary.endpoint
  sensitive   = true
}

output "database_instance_name" {
  description = "Cloud SQL instance name"
  value       = google_sql_database_instance.postgres.name
}

output "database_connection_name" {
  description = "Cloud SQL connection name"
  value       = google_sql_database_instance.postgres.connection_name
}

output "database_private_ip" {
  description = "Cloud SQL private IP address"
  value       = google_sql_database_instance.postgres.private_ip_address
}

output "redis_instance_host" {
  description = "Redis instance host"
  value       = google_redis_instance.cache.host
}

output "redis_instance_port" {
  description = "Redis instance port"
  value       = google_redis_instance.cache.port
}

output "static_ip_address" {
  description = "Static IP address for the load balancer"
  value       = google_compute_address.static_ip.address
}

output "artifact_registry_repository" {
  description = "Artifact Registry repository URL"
  value       = "${google_artifact_registry_repository.docker_repo.location}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.docker_repo.repository_id}"
}

output "static_assets_bucket" {
  description = "Cloud Storage bucket for static assets"
  value       = google_storage_bucket.static_assets.name
}

output "gke_service_account" {
  description = "GKE Service Account email"
  value       = google_service_account.gke_sa.email
}
