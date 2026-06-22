# LIAS — Laboratory Information and Administration System

Application web complète de gestion de laboratoire de recherche, composée d'un backend Spring Boot (API REST + JWT) et d'un frontend Next.js 14, déployée sur AWS via une pipeline CI/CD automatisée avec sécurité intégrée de bout en bout.

---

## Architecture globale

```
Internet → ALB → EC2 (nginx → frontend :3000 / backend :8080) → RDS MySQL
                        ↑
                   ECR (images Docker multi-stage)
```

| Composant | Technologie | Détails |
|-----------|-------------|---------|
| Backend | Spring Boot 3.2, Java 17 | JPA/Hibernate, MapStruct, Lombok, OpenPDF |
| Frontend | Next.js 14, TypeScript | Tailwind CSS, Zustand, React Query, Recharts |
| Base de données | MySQL 8.0 (RDS db.t3.micro) | 20 Go, chiffrement, deletion protection |
| Infrastructure | AWS EC2 t3.micro, ALB, RDS, ECR, VPC | eu-west-3 (Paris) |
| IaC | Terraform >= 1.5 | State S3 + DynamoDB lock |
| Config Management | Ansible 2.13+ | Rôles : docker, security, app, nginx |
| CI/CD | GitHub Actions (7 jobs) | OIDC, pas de clés statiques |

---

## Pipeline CI/CD

```
SAST → Build & Test → Docker Build & Scan → Terraform → Ansible Deploy → DAST → Notify
```

| Job | Outils | Condition d'échec |
|-----|--------|-------------------|
| SAST | CodeQL (Java + TS), OWASP Dep-Check, Semgrep | CVE CVSS ≥ 8 |
| Build & Test | Maven `verify`, npm ci, lint, Next.js build | Échec build ou lint |
| Docker | Build multi-stage, Trivy scan, push ECR | Vulnérabilité critique |
| Terraform | Plan + Apply (OIDC) | Erreur Terraform |
| Ansible | Inventaire EC2 dynamique, deploy.yml | Échec playbook |
| DAST | OWASP ZAP Baseline + API Scan, Nuclei | XSS, SQLi, injection code |
| Notify | Résumé GitHub Actions Summary | — |

**Déclencheurs :** push sur `main`, pull requests vers `main`. Contrôle de concurrence actif.

---

## Structure du projet

```
LIAS-App/
├── backend/                          # Spring Boot API REST
│   └── src/main/java/com/lias/
│       ├── config/                   # SecurityConfig, CORS, JWT
│       ├── controller/               # 24 contrôleurs REST
│       ├── entity/                   # 30 entités JPA
│       ├── repository/               # Spring Data JPA repositories
│       ├── service/                  # Couche métier
│       ├── dto/                      # DTOs + MapStruct mappers
│       └── security/                 # JwtAuthenticationFilter, ReadOnlyFilter
├── frontend/                         # Next.js 14 (App Router)
│   └── src/
│       ├── app/
│       │   ├── (public)/             # Pages publiques (landing, membres, équipes…)
│       │   ├── auth/login/           # Page de connexion
│       │   └── dashboard/            # 30+ pages du tableau de bord
│       ├── components/               # Header, Sidebar, composants UI
│       ├── services/                 # Clients API (17 services)
│       ├── store/authStore.ts        # État auth Zustand
│       ├── lib/api.ts                # Axios + intercepteur JWT
│       ├── lib/normalize.ts          # Helper toArray()
│       └── types/index.ts            # Types TypeScript
├── docker/
│   ├── backend/Dockerfile            # Multi-stage Maven → JRE 17 Alpine
│   └── frontend/Dockerfile           # Multi-stage npm → Next.js standalone
├── docker-compose.yml                # db (MySQL) + backend + frontend
├── terraform/                        # Infrastructure AWS
│   ├── main.tf                       # Provider, backend S3
│   ├── variables.tf / outputs.tf
│   ├── vpc.tf                        # VPC, subnets, IGW, NAT, routes
│   ├── ec2.tf                        # EC2, IAM role, EIP, user-data
│   ├── rds.tf                        # RDS MySQL 8.0
│   ├── alb.tf                        # Application Load Balancer
│   ├── security_groups.tf            # SG : EC2, RDS, ALB
│   ├── ecr.tf                        # ECR backend & frontend
│   ├── iam_github_oidc.tf            # OIDC GitHub Actions
│   └── bootstrap/main.tf             # S3 bucket + DynamoDB lock (init unique)
├── ansible/
│   ├── ansible.cfg
│   ├── inventory/aws_ec2.yml         # Inventaire dynamique AWS
│   ├── playbooks/deploy.yml
│   └── roles/
│       ├── docker/                   # Installation Docker + Compose
│       ├── security/                 # Hardening kernel, fail2ban, auditd, SSH
│       ├── app/                      # ECR pull, docker-compose, health check
│       └── nginx/                    # Reverse proxy + TLS
├── .github/workflows/ci-cd.yml       # Pipeline CI/CD complète
└── .zap/rules.tsv                    # Règles OWASP ZAP (FAIL/WARN/IGNORE)
```

---

## Backend — API REST

### Contrôleurs (24)

| Contrôleur | Route | Rôle |
|------------|-------|------|
| AuthController | `/api/v1/auth` | Login, utilisateur courant |
| MembreController | `/api/v1/membres` | CRUD membres |
| EquipeController | `/api/v1/equipes` | Gestion équipes de recherche |
| EvenementController | `/api/v1/evenements` | Événements & conférences |
| ReunionController | `/api/v1/reunions` | Réunions |
| ProcesVerbalController | `/api/v1/pv` | Procès-verbaux |
| PublicationController | `/api/v1/publications` | Publications scientifiques |
| DocumentController | `/api/v1/documents` | Documents internes |
| ConventionController | `/api/v1/conventions` | Conventions & partenariats |
| MandatController | `/api/v1/mandats` | Mandats de direction |
| MaterielController | `/api/v1/materiels` | Inventaire matériel |
| DemandeAdhesionController | `/api/v1/demandes-adhesion` | Candidatures membres |
| DemandeDocumentController | `/api/v1/demandes-document` | Demandes de documents |
| DemandeMaterielController | `/api/v1/demandes-materiel` | Demandes de matériel |
| DemandeParticipationController | `/api/v1/participations` | Participations événements |
| RapportController | `/api/v1/rapports` | Rapports annuels |
| StatistiquesController | `/api/v1/stats` | Statistiques & analytics |
| SearchController | `/api/v1/search` | Recherche globale |
| LaboratoireController | `/api/v1/laboratoire` | Configuration du labo |
| MessageController | `/api/v1/messages` | Messagerie interne |
| NotificationController | `/api/v1/notifications` | Notifications |
| AdminCompteController | `/api/v1/admin/comptes` | Gestion comptes (admin) |
| RoleController | `/api/v1/roles` | Rôles RBAC |
| AuditLogController | `/api/v1/audit-logs` | Journal d'audit |

### Entités JPA (30)

Personnel & organisation : `Membre`, `Equipe`, `EquipeHistorique`, `Laboratoire`, `Mandat`, `RoleMembre`, `AffiliationMembre`

Événements & réunions : `Evenement`, `OrganisateurEvenement`, `ParticipationEvenement`, `Reunion`, `ParticipantReunion`, `ProcesVerbal`

Documentation : `Document`, `Publication`, `AuteurPublication`, `RapportAnnuel`, `Convention`, `ActiviteConvention`

Demandes : `DemandeAdhesion`, `DemandeDocument`, `DemandeMateriel`, `DemandeParticipation`

Inventaire : `Materiel`, `DistributionMateriel`, `MaterielHistorique`

Communication & audit : `Message`, `MessageType`, `Notification`, `AuditLog`

### Sécurité

- **Authentification :** JWT stateless, filtre `JwtAuthenticationFilter`, expiration 24h
- **Autorisation RBAC :** `ROLE_ADMIN`, `ROLE_DIRECTEUR`, `ROLE_VICE_DIRECTEUR`, `ROLE_CHEF_EQUIPE`, `ROLE_MEMBER`, `ROLE_DOCTORANT`
- **Endpoints publics (sans auth) :** `/actuator/health`, `/api/v1/auth/login`, GET membres/publications/événements, POST demandes-adhesion
- **CORS** configuré, **CSRF** désactivé (API stateless)
- **Upload fichiers :** 10 Mo max, servis depuis `/uploads/**`

---

## Frontend — Next.js 14

### Pages publiques (`/app/(public)/`)

| Route | Contenu |
|-------|---------|
| `/` | Landing page du laboratoire |
| `/membres` | Liste des membres (public) |
| `/membres/[id]` | Profil membre (public) |
| `/equipes` | Équipes de recherche |
| `/equipes/[id]` | Détail équipe |
| `/evenements` | Événements & conférences |
| `/publications` | Publications scientifiques |
| `/adhesion` | Formulaire de candidature |

### Tableau de bord (`/app/dashboard/`)

Membres, équipes, événements, réunions (+PV, participants), demandes (adhésion, matériel, document), documents, matériel, conventions, mandats, publications, rapport annuel, messagerie, notifications, statistiques, calendrier, recherche globale, audit-logs, configuration laboratoire, gestion comptes admin, profil utilisateur.

### Architecture frontend

| Fichier | Rôle |
|---------|------|
| `lib/api.ts` | Instance Axios avec intercepteur JWT |
| `lib/normalize.ts` | `toArray()` — normalise réponses API |
| `store/authStore.ts` | État d'authentification (Zustand) |
| `hooks/useAuth.ts` | Hook React auth |
| `types/index.ts` | Types TypeScript partagés |
| `services/*.service.ts` | 17 services clients API |

**Librairies clés :** React Query (server state), React Hook Form + Zod (formulaires), Recharts (graphiques), react-dropzone (upload), date-fns (dates), Lucide (icônes).

---

## Infrastructure AWS (Terraform)

**Région :** eu-west-3 (Paris)

| Ressource | Configuration |
|-----------|---------------|
| VPC | 10.0.0.0/16, subnets public/privé sur 2 AZ |
| EC2 | t3.micro, Amazon Linux 2023, EBS 30 Go chiffré, EIP |
| RDS | MySQL 8.0, db.t3.micro, 20 Go chiffré, Multi-AZ optionnel |
| ALB | Application Load Balancer, target groups frontend/backend |
| ECR | Repos backend & frontend |
| IAM | OIDC GitHub Actions, rôle EC2 |
| State | S3 bucket + DynamoDB lock (bootstrap séparé) |

---

## Déploiement

### Prérequis locaux

- AWS CLI configuré
- Terraform >= 1.5
- Ansible >= 2.13
- Docker

### Secrets GitHub requis

| Secret | Description |
|--------|-------------|
| `AWS_DEPLOY_ROLE_ARN` | ARN du rôle OIDC GitHub Actions |
| `AWS_KEY_PAIR_NAME` | Nom de la key pair EC2 |
| `ADMIN_IP` | IP admin SSH (format CIDR) |
| `DB_PASSWORD` | Mot de passe MySQL |
| `EC2_SSH_PRIVATE_KEY` | Contenu du fichier `.pem` |
| `JWT_SECRET` | Secret JWT (min 64 caractères) |

### Déploiement manuel

```bash
# 1. Bootstrap (une seule fois — crée le bucket S3 et la table DynamoDB)
cd terraform/bootstrap
terraform init && terraform apply

# 2. Infrastructure
cd ../terraform
terraform init
terraform apply -var-file=terraform.tfvars

# 3. Application
cd ../ansible
ansible-playbook playbooks/deploy.yml -i inventory/aws_ec2.yml
```

### Développement local (Docker Compose)

```bash
# Démarrer tous les services
docker compose up -d

# Logs
docker compose logs -f backend
docker compose logs -f frontend
```

| Service | URL locale |
|---------|-----------|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8080/api/v1 |
| Swagger/API Docs | http://localhost:8080/v3/api-docs |
| Health Check | http://localhost:8080/actuator/health |

---

## Sécurité

### Shift-left (avant déploiement)

| Outil | Cible | Seuil d'échec |
|-------|-------|---------------|
| CodeQL | Java + TypeScript | Tout finding |
| OWASP Dependency-Check | Maven + npm | CVSS ≥ 8 |
| Semgrep | Backend + Frontend | Tout finding |
| Trivy | Images Docker | Vulnérabilité critique |

### Hardening serveur (Ansible)

- Paramètres kernel sysctl : TCP SYN cookies, ASLR, rp_filter
- fail2ban : max 5 tentatives SSH, ban 1 heure
- auditd : journalisation de conformité
- SSH : authentification par clé uniquement, pas de root login, pas de X11

### DAST post-déploiement

- **OWASP ZAP :** scan baseline + scan API (OpenAPI)
- **Nuclei :** scan de vulnérabilités
- **Règles ZAP (`.zap/rules.tsv`) :** FAIL sur XSS réfléchi/persistant, injection SQL, injection de code, absence CSRF ; WARN sur headers de cache, disclosure timestamps

### Authentification AWS

- OIDC uniquement — aucune clé statique AWS dans GitHub Secrets
- `terraform.tfvars` et fichiers `.pem` exclus du dépôt (`.gitignore`)

---

## Accès production

| Ressource | Adresse |
|-----------|---------|
| Application | http://lias-alb-1877599950.eu-west-3.elb.amazonaws.com |
| EC2 SSH | `ssh -i lias-keypair.pem ec2-user@35.180.20.84` |
| API Health | `/actuator/health` |
| API Docs | `/v3/api-docs` |
