# OIDC provider so GitHub Actions can assume AWS roles without static credentials
resource "aws_iam_openid_connect_provider" "github" {
  url             = "https://token.actions.githubusercontent.com"
  client_id_list  = ["sts.amazonaws.com"]
  thumbprint_list = ["6938fd4d98bab03faadb97b34396831e3780aea1"]
}

# Deploy role assumed by GitHub Actions
resource "aws_iam_role" "github_actions_deploy" {
  name = "${var.app_name}-github-actions-deploy"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        Federated = aws_iam_openid_connect_provider.github.arn
      }
      Action = "sts:AssumeRoleWithWebIdentity"
      Condition = {
        StringEquals = {
          "token.actions.githubusercontent.com:aud" = "sts.amazonaws.com"
        }
        StringLike = {
          # Replace GITHUB_USERNAME/REPO_NAME with your actual repo
          "token.actions.githubusercontent.com:sub" = "repo:BOULATARM/projetJee:*"
        }
      }
    }]
  })
}

resource "aws_iam_role_policy" "github_deploy_policy" {
  name = "lias-deploy-policy"
  role = aws_iam_role.github_actions_deploy.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "ECR"
        Effect = "Allow"
        Action = [
          "ecr:GetAuthorizationToken",
          "ecr:BatchCheckLayerAvailability",
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchGetImage",
          "ecr:InitiateLayerUpload",
          "ecr:UploadLayerPart",
          "ecr:CompleteLayerUpload",
          "ecr:PutImage"
        ]
        Resource = "*"
      },
      {
        Sid    = "EC2Describe"
        Effect = "Allow"
        Action = [
          "ec2:Describe*",
          "ec2:List*"
        ]
        Resource = "*"
      },
      {
        Sid    = "Terraform"
        Effect = "Allow"
        Action = [
          "s3:GetObject", "s3:PutObject", "s3:DeleteObject", "s3:ListBucket",
          "dynamodb:GetItem", "dynamodb:PutItem", "dynamodb:DeleteItem",
          "ec2:*", "rds:*", "elasticloadbalancing:*",
          "iam:*", "s3:*"
        ]
        Resource = "*"
      }
    ]
  })
}

output "github_actions_role_arn" {
  description = "ARN to set as AWS_DEPLOY_ROLE_ARN secret in GitHub"
  value       = aws_iam_role.github_actions_deploy.arn
}
