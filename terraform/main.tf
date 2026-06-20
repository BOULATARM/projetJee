terraform {
  required_version = ">= 1.6"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Remote state in S3 – bucket + table are created separately once
  backend "s3" {
    bucket         = "lias-terraform-state"
    key            = "prod/terraform.tfstate"
    region         = "eu-west-3"
    encrypt        = true
    dynamodb_table = "lias-terraform-lock"
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "LIAS"
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}
