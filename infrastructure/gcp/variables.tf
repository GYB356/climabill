variable "project_id" {
  description = "The GCP project ID"
  type        = string
}

variable "project_name" {
  description = "The name of the project"
  type        = string
  default     = "climabill"
}

variable "region" {
  description = "The GCP region to deploy resources"
  type        = string
  default     = "us-central1"
}

variable "zone" {
  description = "The GCP zone to deploy resources"
  type        = string
  default     = "us-central1-a"
}

variable "environment" {
  description = "The environment (dev, staging, production)"
  type        = string
  default     = "dev"
  validation {
    condition     = contains(["dev", "staging", "production"], var.environment)
    error_message = "The environment must be one of: dev, staging, production."
  }
}

variable "domain" {
  description = "The domain name for the application"
  type        = string
  default     = "climabill.com"
}

variable "db_name" {
  description = "The name of the database"
  type        = string
  default     = "climabill"
}

variable "db_user" {
  description = "The database user"
  type        = string
  default     = "climabill"
}

variable "db_password" {
  description = "The database password"
  type        = string
  sensitive   = true
}
