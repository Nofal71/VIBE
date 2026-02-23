import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTenantContext } from '../context/TenantContext';

export const Sidebar: React.FC = () => {
  const { uiConfig, schemaJson, loading, companyName } = useTenantContext();

  const isLight = uiConfig.sidebar_theme === 'light';

  const bgColor = isLight ? 'bg-white text-gray-800' : 'bg-gray-900 text-white';
  const borderColor = isLight ? 'border-gray-200' : 'border-gray-700';
  const headingColor = isLight ? 'text-gray-500' : 'text-gray-400';

  // Hover & Active States mapping to primary color
  // Since we can't use arbitrary arbitrary Tailwind classes dynamically safely without runtime compiler,
  // we can use inline styles for the strict primary color requirements, and standard utility classes for structure.

  const tables = schemaJson.tables || [];
  const industryModules = tables.map((t: any) => ({ name: t.name, url: `/crm/modules/${t.name}` }));

  if (loading) {
    return <div className={`w-64 flex flex-col h-full min-h-screen ${bgColor} border-r ${borderColor} p-6`}><div className="animate-pulse bg-gray-300 h-8 w-32 rounded"></div></div>;
  }

  return (
    <div className={`w-64 flex flex-col h-full min-h-screen border-r ${borderColor} ${bgColor}`}>
      <div className={`p-6 border-b ${borderColor} flex items-center justify-center min-h-[5rem]`}>
        {uiConfig.logo_url ? (
          <img src={uiConfig.logo_url} alt={companyName} className="max-h-12 object-contain" />
        ) : (
          <div className="text-2xl font-bold tracking-wider" style={{ color: uiConfig.primary_color || 'inherit' }}>
            {companyName}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <p className={`text-xs uppercase tracking-wider mb-2 ${headingColor}`}>Common Modules</p>
          <ul className="space-y-1">
            <NavItem to="/crm" end label="Dashboard" uiConfig={uiConfig} isLight={isLight} />
            <NavItem to="/crm/leads" label="Leads" uiConfig={uiConfig} isLight={isLight} />
            <NavItem to="/crm/inbox" label="Unified Inbox" uiConfig={uiConfig} isLight={isLight} />
            <NavItem to="/crm/pipeline" label="Sales Pipeline" uiConfig={uiConfig} isLight={isLight} />
            <NavItem to="/crm/tasks" label="Task Manager" uiConfig={uiConfig} isLight={isLight} />
            <NavItem to="/crm/calendar" label="Calendar" uiConfig={uiConfig} isLight={isLight} />
            <NavItem to="/crm/accounts" label="B2B Accounts" uiConfig={uiConfig} isLight={isLight} />
            <NavItem to="/crm/invoices" label="Invoices" uiConfig={uiConfig} isLight={isLight} />
            <NavItem to="/crm/leads-excel" label="Excel View" uiConfig={uiConfig} isLight={isLight} />
            <NavItem to="/crm/settings/fields" label="Field Builder" uiConfig={uiConfig} isLight={isLight} />
            <NavItem to="/crm/settings/stages" label="Stage Builder" uiConfig={uiConfig} isLight={isLight} />
            <NavItem to="/crm/settings/email-templates" label="Email Templates" uiConfig={uiConfig} isLight={isLight} />
            <NavItem to="/crm/settings/branding" label="Branding & Theme" uiConfig={uiConfig} isLight={isLight} />
            <NavItem to="/crm/settings/preferences" label="Preferences" uiConfig={uiConfig} isLight={isLight} />
            <NavItem to="/crm/tickets" label="Support Tickets" uiConfig={uiConfig} isLight={isLight} />
            <NavItem to="/crm/staff" label="Staff & Permissions" uiConfig={uiConfig} isLight={isLight} />
            <NavItem to="/crm/audit-logs" label="Audit Logs" uiConfig={uiConfig} isLight={isLight} />
          </ul>
        </div>

        {industryModules.length > 0 && (
          <div className={`p-4 border-t ${borderColor}`}>
            <p className={`text-xs uppercase tracking-wider mb-2 ${headingColor}`}>Industry Modules</p>
            <ul className="space-y-1">
              {industryModules.map((mod: any) => (
                <NavItem key={mod.name} to={mod.url} label={mod.name.replace('_', ' ')} uiConfig={uiConfig} isLight={isLight} />
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className={`p-4 border-t ${borderColor}`}>
        <button className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded transition shadow-sm">
          Log Out
        </button>
      </div>
    </div>
  );
};

const NavItem: React.FC<{ to: string, end?: boolean, label: string, uiConfig: any, isLight: boolean }> = ({ to, end, label, uiConfig, isLight }) => {
  const activeStyle = {
    backgroundColor: uiConfig.primary_color ? `${uiConfig.primary_color}1A` : (isLight ? '#EBF8FF' : '#374151'),
    color: uiConfig.primary_color || (isLight ? '#2B6CB0' : '#60A5FA'),
    fontWeight: 'bold'
  };

  const hoverClass = isLight ? 'hover:bg-gray-100' : 'hover:bg-gray-800';

  return (
    <li>
      <NavLink
        to={to}
        end={end}
        className={({ isActive }) => `block px-4 py-2 rounded capitalize transition-colors duration-150 ${!isActive && hoverClass}`}
        style={({ isActive }) => (isActive ? activeStyle : {})}
      >
        {label}
      </NavLink>
    </li>
  );
}
