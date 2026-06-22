# LIAS — Laboratory Information and Administration System

Application web de gestion de laboratoire de recherche, composée d'un backend Spring Boot et d'un frontend Next.js, déployée sur AWS via une pipeline CI/CD complète.

## Architecture

```
Internet → ALB → EC2 (nginx → frontend :3000 / backend :8080) → RDS MySQL
                        ↑
                   ECR (images Docker)
```

| Composant | Technologie |
|-----------|-------------|
| Backend | Spring Boot 3, Java 17, JPA/Hibernate |
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Base de données | MySQL 8 (RDS db.t3.micro) |
| Infrastructure | AWS EC2 t3.micro, ALB, RDS, ECR, EIP |
| IaC | Terraform (state S3 + DynamoDB lock) |
| Config Management | Ansible |
| CI/CD | GitHub Actions (7 jobs) |

## Pipeline CI/CD

```
SAST → Build & Test → Docker Build & Scan → Terraform → Ansible Deploy → DAST → Notify
```

| Job | Outils |
|-----|--------|
| SAST | CodeQL, OWASP Dependency-Check, Semgrep |
| Build & Test | Maven (backend), npm (frontend), TypeScript |
| Docker | Build multi-stage, Trivy scan, push ECR |
| Terraform | Plan + Apply (OIDC, pas de clés statiques) |
| Ansible | Deploy via inventaire EC2 dynamique |
| DAST | OWASP ZAP Baseline + API Scan, Nuclei |
| Notify | Résumé GitHub Actions Summary |

## Structure du projet

```
LIAS-App/
├── backend/                  # Spring Boot API
│   └── src/main/java/com/lias/
├── frontend/                 # Next.js app
│   └── src/app/dashboard/
├── docker/
│   ├── backend/Dockerfile
│   └── frontend/Dockerfile
├── terraform/                # Infrastructure AWS
│   ├── main.tf
│   ├── ec2.tf
│   ├── rds.tf
│   ├── alb.tf
│   ├── ecr.tf               # Locals (ECR pré-existant)
│   └── iam_github_oidc.tf
├── ansible/
│   ├── ansible.cfg
│   ├── inventory/aws_ec2.yml # Inventaire dynamique
│   ├── playbooks/deploy.yml
│   └── roles/
│       ├── docker/
│       ├── security/
│       ├── app/
│       └── nginx/
└── .github/workflows/ci-cd.yml
```

## Déploiement

### Prérequis

- AWS CLI configuré avec les droits suffisants
- Terraform >= 1.5
- Ansible >= 2.13
- Docker

### Secrets GitHub requis

| Secret | Description |
|--------|-------------|
| `AWS_DEPLOY_ROLE_ARN` | ARN du rôle OIDC GitHub Actions |
| `AWS_KEY_PAIR_NAME` | Nom de la key pair EC2 |
| `ADMIN_IP` | IP autorisée pour SSH (format CIDR) |
| `DB_PASSWORD` | Mot de passe MySQL |
| `EC2_SSH_PRIVATE_KEY` | Contenu du fichier .pem |
| `JWT_SECRET` | Secret JWT (min 64 caractères) |

### Déploiement manuel

```bash
# Infrastructure
cd terraform
terraform init
terraform apply -var-file=terraform.tfvars

# Application
cd ansible
ansible-playbook playbooks/deploy.yml -i inventory/aws_ec2.yml
```

## Accès

| Ressource | Adresse |
|-----------|---------|
| Application | http://lias-alb-1877599950.eu-west-3.elb.amazonaws.com |
| EC2 (SSH) | `ssh -i lias-keypair.pem ec2-user@35.180.20.84` |
| API Health | `/actuator/health` |
| API Docs | `/v3/api-docs` |

## Sécurité

- Authentification AWS via OIDC (pas de clés statiques)
- Secrets gérés exclusivement via GitHub Secrets
- `terraform.tfvars` et `.pem` exclus du dépôt (`.gitignore`)
- Security groups restrictifs (SSH limité à l'IP admin)
- Images Docker scannées par Trivy avant déploiement
- DAST automatique post-déploiement (OWASP ZAP + Nuclei)
