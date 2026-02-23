# SaaS CRM System Blueprint

## Core Architecture
- **Type**: Multi-tenant SaaS CRM
- **Infrastructure Strategy**: 
  - Single Shared Backend & DB Infrastructure (No separate containers per tenant).
  - Dynamic Database Schema per Tenant (Single MySQL Container).
  - Bind Mount Approach: Collective `./data/mysql` for DB, unified `./data/tenants/{tenant}` for files (if needed).
  - Caddy for Secure Auto-SSL (`on_demand_tls`) per subdomain or custom domain.
- **Design Reference**: Follow UI/Layout and business flow concepts from `D:\Others\saas-canvas-main`

---

## 🏗 System Components

### 1. Super Admin Level (Master System)
The master tenant used to provision and manage individual company tenants.
- **Company Provisioning System**: Complete control over company generation.
- **Blue-Print Engine (Department Designer)**:
  - Powered by AI or manual configuration.
  - Designs Default Fields, Pipelines, and Roles tailored specific CRM types (e.g., Immigration Sales CRM, Real Estate Sales CRM).
- **Dynamic Form Engine**: For creating and loading the customized configurations.
- **Dynamic Dashboard Widgets Engine**: Generating analytics based on the CRM types.
- **Master Company Details**: Complete CRM detail management.
- *Additional capabilities to be analyzed and added.*

### 2. Admin Level (Company Level)
The default, foundational role for a managed company.
- **Default Role enforcement**: Specific to each company. Cannot be edited or deleted.
- **Authentication**: Strict update password approach.

### 3. Common CRM Features (Per Company)
Core components required for every CRM instance:
- **Dashboard**: Dynamic analytics overview.
- **Lead Management System**:
  - Pipelines, Views, APIs.
  - AI-based lead search and data filtering.
  - Extensive field management, Notes, Document requests & secure handlers.
- **Dynamic Forms**: Auto-adjusts based on assigned department types.
- **Finance Module**: Invoice Generation against Leads.
- **Support Module**: Tickets system.
- **Communications Hub**: Email Inbox, internal/external Chats.
- **Client Portals**:
  - Secure entry based on solid email verification per lead.
  - Dedicated client interaction space.
- **Access Control (Roles & Permissions)**: Highly granular per-field and per-module permission grids.
- **Configuration & Settings**: General settings and user presences.
- **Branding Engine**: Customization for company portals.
- **Real-Time Engine**: Socket connections & browser notifications.
- **Automations**:
  - AI-driven Automations.
  - Logic/Condition-based Automated Triggers.
- **Productivity**: Calendars.
- **Task Management**: Complex assignments (Task mapping, Lead mapping - AI needs to define this architecture).
- **Global Search**: Deep-indexing system layout across the platform.

---

## 🗺 Implementation Phases Strategy
*(Every phase must be implemented iteratively, accompanied by its own dedicated Git commit until 100% completion).*

- [ ] **Phase 1**: Initial Context and Layout Structuring
- [x] **Phase 2**: Infrastructure & Docker Compose (Bind Mounts, Caddy SSL routing setup)
- [x] **Phase 3**: Global Database Strategy & Tenant Isolation Models
- [ ] **Phase 4**: Super Admin Master Tenant Setup
- [ ] **Phase 5**: Blue-Print Engine & Department Designer Architecture
- [ ] **Phase 6**: Company Admin & Role Provisioning Backbone
- [ ] **Phase 7**: Dynamic Layout & Global Search Foundation
- [ ] **Phase 8**: Leads, Pipelines, & Field Engines
- [ ] **Phase 9**: Communications (Sockets, Emails, Chats) & Tasks
- [ ] **Phase 10**: Portals, Finance (Invoices), & Support (Tickets)
- [ ] **Phase 11**: AI Automations & Advanced Logic Triggers
