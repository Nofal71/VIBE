# Project Analysis: IH Solution SaaS CRM

## 1. Services & API Architecture
The project follows a **Microservices Architecture** with a **Multi-Tenant (Shared Process, Isolated Database)** strategy.

| Service Name | Port | Description | Key API Endpoints |
| :--- | :--- | :--- | :--- |
| **IAM Service** | 4004 | Identity & Access Management | `/auth/login`, `/auth/me`, `/iam/field-locks`, `/iam/feature-permissions` |
| **Super Admin** | 4000 | Core provisioning engine | `/provision`, `/companies`, `/blueprints`, `/tenant/config` |
| **CRM Core** | 4001 | Main business logic hub | `/api/leads`, `/api/deals/:id/transition`, `/api/analytics/dashboard`, `/api/finance/invoices`, `/api/web-forms` |
| **Email Service** | 4003 | Email & Unified Inbox | `/api/inbox/sync`, `/api/inbox/send`, `/api/inbox/settings` |
| **File Service** | 4002 | File/Document storage | `/api/files/upload`, `/api/files/:id/download` |
| **Ticket Service**| 4005 | Support Ticket management | `/api/tickets/create`, `/api/tickets/:id/reply`, `/api/tickets/list` |
| **Automations** | - | Background Event Bus | (Internal Redis Channels: `DEAL_STATE_UPDATE_REQUESTED`, `STATE_CHANGED`) |
| **Audit Service** | - | System-wide Audit Logging | `/api/audit/logs` |
| **Main Frontend** | 3000 | React Application | - |
| **Caddy Gateway** | 80/443| Reverse Proxy | - |

---

## 2. Business Logic & CRM Working

### Multi-Tenancy Strategy
The system uses a **Multi-Database approach**. Every time a company is "provisioned":
1. A unique database is created (e.g., `tenant_7a8b...`).
2. The schema is generated dynamically using a **Blueprint JSON**.
3. A "Blueprint" defines different modules (e.g., Real Estate has "Properties", Immigration has "Visas").

### State Machine & Automation
The CRM does not use simple "Status" fields. It uses a **State Machine** pattern:
- When a Deal moves from "New" to "Qualified", a request is pushed to **Redis**.
- The `automations-service` validates the transition and triggers side effects like sending welcome emails or creating tasks.

### Schema Agnostic Generic Modules
The `GenericModuleView.tsx` in the frontend can render any table defined in the blueprint. This allows the system to support any industry without changing frontend code.

---

## 3. Issues & Bugs Identified (Strict Analysis)

### 🔴 Critical Bugs
1. **Missing Tenant Login Page**: The frontend lacks a dedicated login page for regular CRM users. While `SuperAdminLogin.tsx` exists, there is no route or UI for a staff member of a company to log in via their subdomain.
2. **Database Connection Mismatch**: 
   - `Super Admin` provisions databases with names like `tenant_<uuid>`.
   - `CRM Core Service` fetches `x-tenant-id` from the HTTP header (passed as the subdomain, e.g., `demo`).
   - `TenantConnectionManager` tries to connect to a DB named `demo`. **It will fail to find the database.** 
   - *Fix required*: The CRM Core service must look up the actual `db_name` from the master database using the `subdomain`.
3. **No Authentication Guards on CRM Routes**: The `App.tsx` file defines CRM routes (e.g., `/crm/dashboard`) without any auth checking middleware. An unauthenticated user can see the dashboard UI (though APIs will return 401).

### 🟡 Functional Issues
4. **Subdomain-to-Tenant Mapping**: The `axiosConfig.ts` extracts the tenant ID from the hostname. However, if the user is on `localhost`, it defaults to `public`. Local development requires manual host file entries for subdomains to work.
5. **Incomplete Error Handling in Contexts**: `TenantContext.tsx` and `PermissionContext.tsx` log warnings on failure but "fail open" or show empty states without directing the user to a login or error page.
6. **Hardcoded Domain Detection**: `axiosConfig.ts` has `ihsolution.tech` hardcoded. Moving to a different domain requires manual code changes in multiple files.

---

## 4. Local Deployment (Local Docker)

### Prerequisites
- Docker & Docker Desktop (Windows)
- An entry in your `C:\Windows\System32\drivers\etc\hosts` file:
  ```text
  127.0.0.1  localhost
  127.0.0.1  demo.localhost
  ```

### Steps to Deploy
1. **Prepare Environment**:
   - Copy `.env.example` to `.env`.
   - Ensure `MYSQL_ROOT_PASSWORD` and `REDIS_HOST` are set.
2. **Run Architecture**:
   ```bash
   docker-compose up -d --build
   ```
3. **Initialize Master DB**:
   The `mysql-master` container will automatically run scripts in `./init-db` on the first boot.
4. **Access Portals**:
   - **Landing Page**: [http://localhost](http://localhost)
   - **Super Admin**: [http://localhost/super-admin/login](http://localhost/super-admin/login)
   - **Tenant CRM**: [http://demo.localhost/crm](http://demo.localhost/crm)

### Important Note
Do NOT run `npm install` or `npm run dev` on your machine. The Docker Compose file is configured to build all images (Dockerfiles) and orchestrate the networking via the `crm_network`.
