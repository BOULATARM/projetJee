# ECR repositories already exist (created during initial bootstrap).
# Managed as locals to avoid requiring ecr:DescribeRepositories on the deploy role.
locals {
  ecr_backend_url  = "${data.aws_caller_identity.current.account_id}.dkr.ecr.${var.aws_region}.amazonaws.com/${var.app_name}/backend"
  ecr_frontend_url = "${data.aws_caller_identity.current.account_id}.dkr.ecr.${var.aws_region}.amazonaws.com/${var.app_name}/frontend"
}

# Keep lifecycle policies managed by Terraform
resource "aws_ecr_lifecycle_policy" "backend" {
  repository = "${var.app_name}/backend"
  policy = jsonencode({
    rules = [{
      rulePriority = 1
      description  = "Keep last 10 images"
      selection = {
        tagStatus   = "any"
        countType   = "imageCountMoreThan"
        countNumber = 10
      }
      action = { type = "expire" }
    }]
  })
}

resource "aws_ecr_lifecycle_policy" "frontend" {
  repository = "${var.app_name}/frontend"
  policy = jsonencode({
    rules = [{
      rulePriority = 1
      description  = "Keep last 10 images"
      selection = {
        tagStatus   = "any"
        countType   = "imageCountMoreThan"
        countNumber = 10
      }
      action = { type = "expire" }
    }]
  })
}
