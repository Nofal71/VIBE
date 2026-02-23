import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';

// ─── Navigation items ─────────────────────────────────────────────────────────

interface NavItem {
    to: string;
    icon: string;
    label: string;
}

const NAV_ITEMS: NavItem[] = [
    { to: '/super-admin/provision', icon: '🚀', label: 'Provisioning' },
    { to: '/super-admin/companies', icon: '🏢', label: 'Company Directory' },
    { to: '/super-admin/blueprints', icon: '🏗️', label: 'Blueprint Engine' },
    { to: '/super-admin/broadcasts', icon: '📣', label: 'System Broadcasts' },
];

// ─── Component ────────────────────────────────────────────────────────────────

const SuperAdminLayout: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex overflow-hidden">

            {/* ── Sidebar ── */}
            <aside className="w-64 flex-shrink-0 flex flex-col bg-slate-900 border-r border-slate-800">

                {/* Brand */}
                <div className="px-5 py-6 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-lg shadow-lg">
                            ⚡
                        </div>
                        <div>
                            <p className="text-white font-extrabold text-sm tracking-tight leading-tight">Super Admin</p>
                            <p className="text-gray-500 text-[10px] font-medium uppercase tracking-widest">Fleet Command</p>
                        </div>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
                    <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest px-2 mb-2">Navigation</p>
                    {NAV_ITEMS.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition group
                 ${isActive
                                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/20'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'}`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <span className={`text-lg transition ${isActive ? '' : 'grayscale opacity-60 group-hover:opacity-100 group-hover:grayscale-0'}`}>
                                        {item.icon}
                                    </span>
                                    {item.label}
                                    {isActive && (
                                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400" />
                                    )}
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* Footer */}
                <div className="px-4 py-4 border-t border-white/5 space-y-2">
                    <button
                        onClick={() => navigate('/')}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-gray-500 hover:text-white hover:bg-white/5 transition"
                    >
                        <span>🌐</span>
                        Back to Landing
                    </button>
                    <div className="flex items-center gap-2 px-2">
                        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                        <span className="text-[10px] text-gray-600 font-medium">Master DB Connected</span>
                    </div>
                </div>
            </aside>

            {/* ── Main Content ── */}
            <main className="flex-1 overflow-y-auto bg-slate-950">
                {/* Top bar */}
                <div className="sticky top-0 z-10 flex items-center justify-between px-8 py-3.5 bg-gray-950/90 backdrop-blur border-b border-white/5">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="font-bold text-gray-400">Super Admin</span>
                        <span>/</span>
                        <span id="page-breadcrumb" className="text-gray-300">Dashboard</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold text-amber-400 bg-amber-900/30 border border-amber-800/50 px-2.5 py-1 rounded-full uppercase tracking-widest">
                            ⚡ System Access
                        </span>
                    </div>
                </div>

                {/* Outlet (pages render here) */}
                <div className="p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default SuperAdminLayout;
