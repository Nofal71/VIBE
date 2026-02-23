import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';


import MainLandingPage from './pages/landing/MainLandingPage';
import DepartmentLanding from './pages/landing/DepartmentLanding';
import AccountSuspended from './pages/landing/AccountSuspended';


import SuperAdminLayout from './components/SuperAdminLayout';
import RequireMasterAuth from './components/RequireMasterAuth';
import SuperAdminLogin from './pages/super-admin/SuperAdminLogin';
import ProvisioningDashboard from './pages/super-admin/ProvisioningDashboard';
import DepartmentEditor from './pages/super-admin/DepartmentEditor';
import SystemBroadcasts from './pages/super-admin/SystemBroadcasts';
import CompanyDirectory from './pages/super-admin/CompanyDirectory';
import CompanyDetail from './pages/super-admin/CompanyDetail';


import Dashboard from './pages/crm/Dashboard';
import LeadList from './pages/crm/LeadList';
import LeadProfile from './pages/crm/LeadProfile';
import UnifiedInbox from './pages/crm/UnifiedInbox';
import PipelineBoard from './pages/crm/PipelineBoard';
import TicketCenter from './pages/crm/TicketCenter';
import AuditLogView from './pages/crm/AuditLogView';
import StaffManagement from './pages/crm/StaffManagement';
import TaskManager from './pages/crm/TaskManager';
import CalendarView from './pages/crm/CalendarView';
import AccountManager from './pages/crm/AccountManager';
import InvoiceManager from './pages/crm/InvoiceManager';
import LeadExcelView from './pages/crm/LeadExcelView';
import GenericModuleView from './pages/crm/GenericModuleView';
import FieldBuilder from './pages/crm/settings/FieldBuilder';
import StageBuilder from './pages/crm/settings/StageBuilder';
import EmailTemplateBuilder from './pages/crm/settings/EmailTemplateBuilder';
import BrandingSettings from './pages/crm/settings/BrandingSettings';
import Preferences from './pages/crm/settings/Preferences';
import WebFormBuilder from './pages/crm/settings/WebFormBuilder';


import { Layout } from './components/Layout';
import { TenantProvider } from './context/TenantContext';
import { PermissionProvider } from './context/PermissionContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthGuard } from './components/AuthGuard';
import TenantLogin from './pages/crm/TenantLogin';
import ForceChangePassword from './pages/crm/ForceChangePassword';

export default function App() {
  const hostname = window.location.hostname;
  const isMainLanding = hostname === 'ihsolution.tech' || hostname === 'localhost';

  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {}
          <Route
            path="/"
            element={isMainLanding ? <MainLandingPage /> : <DepartmentLanding />}
          />

          {}
          <Route path="/suspended" element={<AccountSuspended />} />
          <Route path="/login" element={<TenantLogin />} />

          {}
          <Route path="/super-admin/login" element={<SuperAdminLogin />} />
          <Route path="/super-admin" element={<RequireMasterAuth><SuperAdminLayout /></RequireMasterAuth>}>
            {}
            <Route index element={<Navigate to="/super-admin/provision" replace />} />
            <Route path="provision" element={<ProvisioningDashboard />} />
            <Route path="blueprints" element={<DepartmentEditor />} />
            <Route path="broadcasts" element={<SystemBroadcasts />} />
            <Route path="companies" element={<CompanyDirectory />} />
            <Route path="companies/:id" element={<CompanyDetail />} />
          </Route>

          {}
          <Route
            path="/crm"
            element={
              <AuthGuard>
                <TenantProvider>
                  <PermissionProvider>
                    <Layout />
                  </PermissionProvider>
                </TenantProvider>
              </AuthGuard>
            }
          >
            <Route path="change-password" element={<ForceChangePassword />} />
            <Route index element={<Navigate to="/crm/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="leads" element={<LeadList />} />
            <Route path="leads/:id" element={<LeadProfile />} />
            <Route path="inbox" element={<UnifiedInbox />} />
            <Route path="pipeline" element={<PipelineBoard />} />
            <Route path="tickets" element={<TicketCenter />} />
            <Route path="audit-logs" element={<AuditLogView />} />
            <Route path="staff" element={<StaffManagement />} />
            <Route path="tasks" element={<TaskManager />} />
            <Route path="calendar" element={<CalendarView />} />
            <Route path="accounts" element={<AccountManager />} />
            <Route path="invoices" element={<InvoiceManager />} />
            <Route path="leads-excel" element={<LeadExcelView />} />
            <Route path="settings/fields" element={<FieldBuilder />} />
            <Route path="settings/stages" element={<StageBuilder />} />
            <Route path="settings/email-templates" element={<EmailTemplateBuilder />} />
            <Route path="settings/branding" element={<BrandingSettings />} />
            <Route path="settings/preferences" element={<Preferences />} />
            <Route path="settings/web-form" element={<WebFormBuilder />} />
            <Route path="modules/:tableName" element={<GenericModuleView />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
