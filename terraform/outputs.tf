output "alb_dns_name" {
  description = "Public URL of the Application Load Balancer"
  value       = "http://${aws_lb.main.dns_name}"
}

output "app_public_ip" {
  description = "Elastic IP of the EC2 app server"
  value       = aws_eip.app.public_ip
}

output "ecr_backend_url" {
  description = "ECR repository URL for the backend image"
  value       = local.ecr_backend_url
}

output "ecr_frontend_url" {
  description = "ECR repository URL for the frontend image"
  value       = local.ecr_frontend_url
}

output "rds_endpoint" {
  description = "RDS MySQL endpoint (internal)"
  value       = aws_db_instance.mysql.endpoint
  sensitive   = true
}
