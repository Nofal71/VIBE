# Implementation Plan: SaaS CRM Fixes & Local Deployment

## Problem Statement
The current SaaS CRM has critical architectural gaps:
1.  **Database Resolution Mismatch**: CRM Core cannot find tenant databases because it uses subdomains as DB names instead of UUID-based names stored in the master DB.
2.  **Missing Frontend Login**: No login page for regular tenant users.
3.  **Security Gaps**: CRM routes are not protected by authentication guards.
4.  **Hardcoded Configuration**: Domain detection is hardcoded to `ihsolution.tech`.

## Proposed Solution

### Phase 1: Backend Fixes (CRM Core Service)
- **Master Database Sync**: Introduce a connection to `saas_master_db` within `crm-core-service`.
- **Tenant Resolver Logic**: Update `TenantConnectionManager` to:
    1. Query the `companies` and `domains` tables in the master DB using the subdomain.
    2. Retrieve the actual `db_name` (e.g., `tenant_abc123`).
    3. Initialize the Sequelize connection to that specific database.

### Phase 2: IAM Service Updates
- Ensure `authRoutes.ts` allows tenant-specific login logic (it currently queries the `User` table in the master DB, which is correct since all users are in the master DB with a `tenant_id`).

### Phase 3: Frontend Enhancements
- **Auth Guard Component**: Create a higher-order component or wrapper to protect `/crm/*` routes.
- **Tenant Login Page**: 
    - Create `TenantLogin.tsx` that automatically detects the subdomain.
    - Submit credentials to the global IAM login endpoint.
- **Improved Environment Detection**: Refactor `axiosConfig.ts` to use environment variables for base domains.

### Phase 4: Local Build & Verification (NPM)
- Run `npm install` and `npm run build` in:
    - `services/iam-service`
    - `services/crm-core-service`
    - `services/super-admin`
    - `frontend/main-app`
- Resolve any TypeScript or dependency issues.
- Cleanup `node_modules`.

### Phase 5: Docker Deployment
- Update `docker-compose.yml` if needed.
- Run `docker-compose up -d --build`.
- Verify the full flow: Provisioning → DNS/Host mockup → Login → CRM Dashboard.

## Detailed Tasks

### Backend (CRM Core)
- [ ] Create `src/config/MasterDatabase.ts`.
- [ ] Update `src/config/TenantConnectionManager.ts` to use the lookup logic.
- [ ] Add missing models `Company` and `Domain` to `crm-core-service` for the lookup.

### Frontend
- [ ] Create `src/components/AuthGuard.tsx`.
- [ ] Create `src/pages/crm/TenantLogin.tsx`.
- [ ] Update `src/App.tsx` routing structure.
- [ ] Update `src/api/axiosConfig.ts` for dynamic domain handling.

### DevOps
- [ ] Verfiy `docker-compose.yml` networking.
- [ ] Cleanup script for `node_modules`.
