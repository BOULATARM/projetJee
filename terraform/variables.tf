variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "eu-west-3"
}

variable "environment" {
  description = "Deployment environment"
  type        = string
  default     = "prod"
}

variable "app_name" {
  description = "Application name"
  type        = string
  default     = "lias"
}

# ── Network ──────────────────────────────────────────────────────────────────
variable "vpc_cidr" {
  type    = string
  default = "10.0.0.0/16"
}

variable "public_subnets" {
  type    = list(string)
  default = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "private_subnets" {
  type    = list(string)
  default = ["10.0.10.0/24", "10.0.11.0/24"]
}

variable "availability_zones" {
  type    = list(string)
  default = ["eu-west-3a", "eu-west-3b"]
}

# ── EC2 ───────────────────────────────────────────────────────────────────────
variable "ec2_instance_type" {
  type    = string
  default = "t3.micro"
}

variable "key_pair_name" {
  description = "Name of the existing AWS key pair for SSH access"
  type        = string
}

variable "my_ip" {
  description = "Your IP address for SSH access (CIDR, e.g. 1.2.3.4/32)"
  type        = string
}

# ── RDS ───────────────────────────────────────────────────────────────────────
variable "db_instance_class" {
  type    = string
  default = "db.t3.micro"
}

variable "db_name" {
  type    = string
  default = "ProjetJee"
}

variable "db_username" {
  type    = string
  default = "liasadmin"
}

variable "db_password" {
  description = "RDS master password (stored in Secrets Manager)"
  type        = string
  sensitive   = true
}

# ── Domain (optional) ────────────────────────────────────────────────────────
variable "domain_name" {
  description = "Optional Route53 domain (leave empty to use ALB DNS)"
  type        = string
  default     = ""
}
