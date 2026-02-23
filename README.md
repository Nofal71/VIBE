# ⚡ IHSolution.tech — Enterprise Multi-Tenant SaaS CRM

> A fully Dockerized, microservice-driven, multi-tenant CRM platform built over 25 development phases.  
> **Industry-specific blueprints. Gemini AI generation. DFA state machines. Granular RBAC. Zero-config local development.**

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Technology Stack](#2-technology-stack)
3. [Local Development Guide](#3-local-development-guide)
4. [Environment Variables Reference](#4-environment-variables-reference)
5. [Production Deployment Guide](#5-production-deployment-guide)
6. [DNS Configuration](#6-dns-configuration)
7. [Super Admin Portal](#7-super-admin-portal)
8. [Tenant CRM Access](#8-tenant-crm-access)
9. [Key Platform Features](#9-key-platform-features)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Architecture Overview

```
                        ┌─────────────────────────────────────┐
                        │          Caddy Gateway (80/443)      │
                        │   TLS Termination · Path Routing     │
                        └──────────────┬──────────────────────┘
                                       │
          ┌────────────────────────────┼────────────────────────────┐
          │                            │                            │
   ┌──────▼──────┐             ┌───────▼──────┐            ┌───────▼──────┐
   │ main-frontend│             │department-   │            │  api.*        │
   │  :3000       │             │  landing     │            │  (microsvcs) │
   │ (Super Admin │             │  :3001       │            └──────────────┘
   │  + Landing)  │             │ (Tenant CRM) │
   └─────────────┘             └──────────────┘
```

### Microservices

| Service | Port | Responsibility |
|---------|------|---------------|
| `super-admin-service` | 4000 | Company provisioning, AI blueprint generation, fleet command |
| `iam-service` | 4004 | Authentication (JWT), RBAC, field-level locks, tenant status gate |
| `crm-core-service` | 4001 | Leads, deals, tasks, analytics, web-form capture, tenant settings |
| `file-service` | 4002 | File upload, attachment management, storage metrics |
| `email-service` | 4003 | IMAP inbox sync, email sending via Brevo (SMTP), unified inbox |
| `ticket-service` | 4005 | Ticket management, conversation threads |
| `automations-service` | — | DFA state machine pipelines, workflow triggers |
| `audit-service` | — | Audit log ingestion via Redis event bus |

### Infrastructure

| Component | Image | Purpose |
|-----------|-------|---------|
| **Caddy** | `caddy:2-alpine` | Reverse proxy, automatic TLS (Let's Encrypt), wildcard routing |
| **MySQL** | `mysql:8` | Master DB (platform) + dynamic per-tenant databases |
| **Redis** | `redis:7-alpine` | Event bus (`AUDIT_LOG_EVENT`, `DEAL_STATE_UPDATE_REQUESTED`) |

### Data Flow

```
Browser Request
  └─► Caddy Gateway
        ├─► *.ihsolution.tech  →  department-landing  (Tenant CRM React App)
        ├─► ihsolution.tech    →  main-frontend        (Landing + Super Admin)
        └─► api.ihsolution.tech/api/<path>
              ├─► /auth/*       →  iam-service
              ├─► /leads/*      →  crm-core-service
              ├─► /files/*      →  file-service
              ├─► /blueprints/* →  super-admin-service
              └─► ...
```

---

## 2. Technology Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 + Vite + TypeScript + Tailwind CSS |
| **Backend (×8)** | Node.js 20 + Express + TypeScript + Sequelize ORM |
| **Database** | MySQL 8 (Master DB + per-tenant dynamic DBs) |
| **Cache/Bus** | Redis 7 (pub/sub event bus) |
| **Gateway** | Caddy v2 (automatic HTTPS, wildcard certs) |
| **AI** | Google Gemini 2.5 Flash (`generativelanguage.googleapis.com`) |
| **Email** | Brevo (SMTP + transactional), IMAP tunnelling |
| **Containers** | Docker + Docker Compose v3.8 |

---

## 3. Local Development Guide

### Prerequisites

- **Docker Desktop** installed and running
- **Git** installed
- No `hosts` file edits required — browsers natively resolve `*.localhost` to `127.0.0.1` per [RFC 6761](https://datatracker.ietf.org/doc/html/rfc6761#section-6.3)

### Quick Start (3 commands)

```bash
# 1. Clone the repository
git clone https://github.com/your-org/ihsolution-crm.git
cd ihsolution-crm

# 2. Create your local environment file
cp .env.example .env
# Edit .env and set your GEMINI_API_KEY (see Section 4)

# 3. Start the entire platform
docker-compose up --build -d
```

That's it. The platform is now running.

### Local Access URLs

| URL | Description |
|-----|-------------|
| `http://localhost` | Main landing page + Super Admin portal |
| `http://localhost/super-admin/provision` | Provision new tenants |
| `http://localhost/super-admin/companies` | Company fleet dashboard |
| `http://localhost/super-admin/blueprints` | AI Blueprint Engine |
| `http://[company-subdomain].localhost` | Tenant CRM (e.g. `http://demo.localhost`) |
| `http://api.localhost/api/companies` | API gateway (direct test) |

> **How `.localhost` subdomains work without a hosts file:**  
> The `*.localhost` wildcard is a standard reserved TLD. All major browsers (Chrome, Firefox, Edge, Safari) automatically route `*.localhost` to `127.0.0.1`. Caddy is configured with a `*.localhost` block that receives these requests and routes them to the `department-landing` container serving the tenant React app.

### Viewing Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f super-admin-service
docker-compose logs -f crm-core-service
docker-compose logs -f caddy-gateway
```

### Stopping the Platform

```bash
docker-compose down           # Stop containers, keep volumes (data preserved)
docker-compose down -v        # Stop containers AND delete all data volumes (clean slate)
```

### Running Database Seed (optional demo data)

Set `RUN_SEED=true` in your `.env` file before starting. The seed populates the master DB with demo companies, plans, and a full year of lead data for the "Elite Real Estate" tenant.

```bash
# After editing .env, restart the affected services:
docker-compose restart super-admin-service crm-core-service
```

---

## 4. Environment Variables Reference

Copy `.env.example` to `.env` and fill in the values below.

```env
# ── MySQL ─────────────────────────────────────────────────────────────────────
MYSQL_ROOT_PASSWORD=your_secure_root_password
MYSQL_USER=admin
MYSQL_PASSWORD=your_secure_password
MYSQL_DATABASE=saas_master_db

# ── Database connection (used by microservices) ───────────────────────────────
DB_HOST=mysql-master          # Docker service name (do not change for Docker)
DB_PORT=3306
DB_USER=admin                 # Must match MYSQL_USER above
DB_PASSWORD=your_secure_password
DB_NAME=saas_master_db

# ── Redis ─────────────────────────────────────────────────────────────────────
REDIS_URL=redis://redis-broker:6379

# ── Security ──────────────────────────────────────────────────────────────────
JWT_SECRET=CHANGE_THIS_TO_A_LONG_RANDOM_STRING_MINIMUM_32_CHARS

# ── External APIs ─────────────────────────────────────────────────────────────
GEMINI_API_KEY=your_google_gemini_api_key   # Required for AI blueprint generation
                                             # Get at: https://aistudio.google.com/apikey
BREVO_API_KEY=your_brevo_api_key            # Required for transactional email sending

# ── Seeding ───────────────────────────────────────────────────────────────────
RUN_SEED=false   # Set to 'true' on first run to load demo data

# ── Frontend ──────────────────────────────────────────────────────────────────
# Vite build-time fallback only — runtime env detection handles local vs prod
VITE_API_BASE_URL=https://api.ihsolution.tech
```

> ⚠️ **Security:** Never commit your real `.env` file to source control. The `.gitignore` excludes it by default. Use `.env.example` as the committed reference.

---

## 5. Production Deployment Guide

### Step 1 — Provision a Server

Rent a VPS from any provider (DigitalOcean, Hetzner, Vultr, Linode). Minimum spec:

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| CPU | 2 vCPU | 4 vCPU |
| RAM | 4 GB | 8 GB |
| Storage | 40 GB SSD | 100 GB SSD |
| OS | Ubuntu 22.04 LTS | Ubuntu 22.04 LTS |

### Step 2 — SSH into Your Server

```bash
ssh root@YOUR_SERVER_IP
# Example: ssh root@50.671.12.34
```

### Step 3 — Install Docker & Docker Compose

```bash
# Update apt
apt-get update && apt-get upgrade -y

# Install Docker (official install script)
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Verify installations
docker --version
docker compose version
```

### Step 4 — Clone the Repository

```bash
cd /opt
git clone https://github.com/your-org/ihsolution-crm.git crm
cd crm
```

### Step 5 — Configure Environment

```bash
# Create the production .env from the example template
cp .env.example .env

# Open with nano (or vim)
nano .env
```

Fill in all values, paying particular attention to:

```env
# CRITICAL — use strong, unique values in production:
MYSQL_ROOT_PASSWORD=GENERATE_WITH_openssl_rand_-hex_32
MYSQL_PASSWORD=GENERATE_WITH_openssl_rand_-hex_32
JWT_SECRET=GENERATE_WITH_openssl_rand_-hex_64

# Required external API keys:
GEMINI_API_KEY=your_key_from_aistudio_google_com
BREVO_API_KEY=your_key_from_brevo_com

# Only enable seed on first deploy:
RUN_SEED=true
```

Generate strong secrets:
```bash
openssl rand -hex 32   # Use output for passwords
openssl rand -hex 64   # Use output for JWT_SECRET
```

### Step 6 — Set Up SSL Email in Caddyfile

Edit `Caddyfile` and ensure the global email is correct for TLS cert registration:

```bash
nano Caddyfile
# Verify: email admin@ihsolution.tech
```

### Step 7 — Build and Launch

```bash
# Build all Docker images and start in detached mode
docker compose up --build -d

# Verify all containers are running
docker compose ps
```

Expected output — all services should show `Up (healthy)` or `Up`:
```
NAME                    STATUS
mysql-master            Up (healthy)
redis-broker            Up (healthy)
super-admin-service     Up
iam-service             Up
crm-core-service        Up
file-service            Up
email-service           Up
ticket-service          Up
automations-service     Up
audit-service           Up
main-frontend           Up
caddy-gateway           Up
```

### Step 8 — Disable Seed After First Run

```bash
# Edit .env and set:
nano .env
# RUN_SEED=false

# Restart affected services to pick up the change:
docker compose restart super-admin-service crm-core-service
```

### Updating the Platform (CI/CD-style)

```bash
cd /opt/crm
git pull origin main
docker compose up --build -d
```

Caddy has zero-downtime config reloading — old certificates continue serving during the build phase.

---

## 6. DNS Configuration

Point your domain's DNS records to the server IP **before** starting Caddy in production. Caddy will automatically attempt ACME (Let's Encrypt) certificate issuance once traffic reaches it.

### Required A Records

Log into your domain registrar's DNS panel (Cloudflare, GoDaddy, Namecheap, etc.) and add:

| Record Type | Host / Name | Value | TTL |
|-------------|-------------|-------|-----|
| `A` | `@` (root) | `YOUR_SERVER_IP` | 3600 |
| `A` | `*` (wildcard) | `YOUR_SERVER_IP` | 3600 |
| `A` | `api` | `YOUR_SERVER_IP` | 3600 |
| `A` | `www` | `YOUR_SERVER_IP` | 3600 |

> **Example (ihsolution.tech):**
> ```
> ihsolution.tech         →  50.671.12.34
> *.ihsolution.tech       →  50.671.12.34
> api.ihsolution.tech     →  50.671.12.34
> www.ihsolution.tech     →  50.671.12.34
> ```

### Cloudflare Notes

If using Cloudflare:
- Set proxy status to **DNS only** (grey cloud) initially for ACME validation.
- After Caddy has obtained certs (check `docker compose logs caddy-gateway`), you may enable the orange cloud for DDoS protection. Set SSL/TLS mode to **Full (Strict)**.
- The `*` wildcard record requires Cloudflare's **Advanced Certificate Manager** add-on if you want Cloudflare to proxy wildcard subdomains.

### Verify DNS Propagation

```bash
# Check from server
dig ihsolution.tech
dig api.ihsolution.tech
nslookup demo.ihsolution.tech

# Check from external tool
curl -I https://ihsolution.tech
```

---

## 7. Super Admin Portal

The Super Admin portal is the master control plane for the entire SaaS.

| Feature | URL | Description |
|---------|-----|-------------|
| **Provisioning** | `/super-admin/provision` | Create new tenant companies with automated DB setup |
| **Company Directory** | `/super-admin/companies` | All tenants with live metrics |
| **Tenant Intelligence** | `/super-admin/companies/:id` | KPIs, storage metrics, status control per tenant |
| **Blueprint Engine** | `/super-admin/blueprints` | AI-powered + template department builder |
| **System Broadcasts** | `/super-admin/broadcasts` | Push global notifications to all tenants |

### Default Super Admin Access

> Configure during provisioning — no hardcoded default credentials exist for security.

### AI Blueprint Generation

Requires `GEMINI_API_KEY` in `.env`. The AI is prompted to return a structured JSON `DepartmentBlueprint` object for any industry:

```
Example prompt: "Build a CRM for a Dental Clinic in Dubai"
Generated: name, schema_json (tables + columns), default_roles_json, 
           ui_config_json (branding), default_stages_json (pipeline stages)
```

---

## 8. Tenant CRM Access

Each provisioned company gets its own subdomain and isolated database.

### URL Structure

| Environment | URL Pattern | Example |
|------------|-------------|---------|
| **Production** | `https://[subdomain].ihsolution.tech` | `https://demo.ihsolution.tech` |
| **Local** | `http://[subdomain].localhost` | `http://demo.localhost` |

The `x-tenant-id` header is automatically extracted from the subdomain by `axiosConfig.ts` at runtime — no configuration needed.

### Tenant Isolation

Each tenant's data is stored in a **dedicated MySQL database** (`crm_[slug]`). The `TenantConnectionManager` maintains pooled connections per tenant, keyed by tenant ID. There is no cross-tenant data access.

---

## 9. Key Platform Features

### Phase Summary

| Phase | Feature |
|-------|---------|
| 1-5 | Core microservice scaffold, Docker setup, MySQL/Redis |
| 6-10 | IAM service, JWT auth, RBAC, permission seeding |
| 11-15 | CRM core: leads, pipeline, audit, DFA automations |
| 16-20 | Unified inbox (IMAP), file service, ticket center, analytics |
| 21 | Gemini AI blueprint generation |
| 22 | Department editor with template library |
| 23 | Super Admin fleet command, tenant intelligence dashboard |
| 24 | Gateway lockout (tenant suspension), Web-to-Lead capture |
| 25 | Environment configuration, Caddy gateway, this README |

### Gateway Lockout (Phase 24)

When a Super Admin suspends a tenant via `PATCH /api/companies/:id/status`:
1. Sequelize updates `Company.status = 'suspended'` in Master DB
2. `tenantStatusMiddleware` in IAM service detects it on the next request (30s cache TTL)
3. Returns `403 ACCOUNT_SUSPENDED`
4. Frontend interceptor catches it, clears JWT, and hard-redirects to `/suspended`

### Web-to-Lead Capture (Phase 24)

Public endpoint: `POST https://api.ihsolution.tech/api/web-forms/submit/:tenantId`
- No authentication required
- Rate limited: 20 submissions per 60 seconds per tenant
- Fields validated against `SHOW COLUMNS FROM leads` — prevents schema injection
- Creates audit trail via `applyGlobalHooks` with actor `'System - Web Form'`
- Tenant admins control which fields appear via the Web Form Builder UI

---

## 10. Troubleshooting

### Container Won't Start

```bash
# Check logs for the failing container
docker compose logs [service-name]

# Common issues:
# MySQL not ready → other services fail to connect on boot
# Solution: health checks are configured; services will retry. Wait 30s.
docker compose ps   # Check if mysql-master shows (healthy)
```

### Caddy Not Issuing TLS Certificates

```bash
docker compose logs caddy-gateway | grep -i "error\|cert\|acme"

# Common causes:
# 1. DNS not propagated yet → wait and retry (nslookup your domain)
# 2. Port 80 blocked on server → check firewall: ufw allow 80 && ufw allow 443
# 3. ACME rate limit hit → wait 1 hour (Let's Encrypt: 5 certs/domain/hour)
```

### `.localhost` Subdomains Not Resolving (Local Dev)

- **Chrome/Edge/Firefox**: Work natively — `*.localhost` is loopback by spec.
- **Safari on macOS**: May require adding entries to `/etc/hosts`:
  ```
  127.0.0.1  demo.localhost
  127.0.0.1  elite-re.localhost
  ```
- **Windows WSL2**: Works natively.

### MySQL Connection Refused

```bash
# Check MySQL is healthy
docker compose ps mysql-master

# Connect directly to test
docker exec -it mysql-master mysql -u admin -p
# Enter MYSQL_PASSWORD from .env when prompted
```

### Gemini AI Returns Empty Blueprint

- Verify `GEMINI_API_KEY` is correctly set in `.env`
- Ensure the key has the **Generative Language API** enabled in Google Cloud Console
- Check `super-admin-service` logs:
  ```bash
  docker compose logs super-admin-service | grep -i "gemini\|ai\|blueprint"
  ```

### Resetting to Clean State

```bash
# Stop all containers and delete ALL volumes (DATA WILL BE LOST)
docker compose down -v

# Remove built images to force full rebuild
docker rmi $(docker images 'ihsolution*' -q)

# Fresh start
docker compose up --build -d
```

---

## License

© 2026 IHSolution.tech. All rights reserved.  
Built with ❤️ across 25 phases of enterprise software architecture.

---

*For support, contact: [support@ihsolution.tech](mailto:support@ihsolution.tech)*
