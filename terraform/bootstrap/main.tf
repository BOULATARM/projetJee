# Run ONCE before the main terraform to create the S3 + DynamoDB backend
# cd terraform/bootstrap && terraform init && terraform apply

provider "aws" {
  region = "eu-west-3"
}

resource "aws_s3_bucket" "tfstate" {
  bucket        = "lias-terraform-state"
  force_destroy = false
  tags          = { Name = "lias-terraform-state", ManagedBy = "bootstrap" }
}

resource "aws_s3_bucket_versioning" "tfstate" {
  bucket = aws_s3_bucket.tfstate.id
  versioning_configuration { status = "Enabled" }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "tfstate" {
  bucket = aws_s3_bucket.tfstate.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "tfstate" {
  bucket                  = aws_s3_bucket.tfstate.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_dynamodb_table" "tflock" {
  name         = "lias-terraform-lock"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "LockID"
  attribute {
    name = "LockID"
    type = "S"
  }
  tags = { Name = "lias-terraform-lock", ManagedBy = "bootstrap" }
}
