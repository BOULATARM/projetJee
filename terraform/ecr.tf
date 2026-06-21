# ECR repositories already exist (created during initial bootstrap).
# Managed as locals to avoid requiring ECR permissions on the deploy role.
locals {
  ecr_backend_url  = "${data.aws_caller_identity.current.account_id}.dkr.ecr.${var.aws_region}.amazonaws.com/${var.app_name}/backend"
  ecr_frontend_url = "${data.aws_caller_identity.current.account_id}.dkr.ecr.${var.aws_region}.amazonaws.com/${var.app_name}/frontend"
}
