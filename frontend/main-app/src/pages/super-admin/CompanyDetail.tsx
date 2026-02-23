import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// ─── Types ────────────────────────────────────────────────────────────────────

interface DomainRecord {
    domain_name: string;
    is_verified: boolean;
}

interface PlanRecord {
    id: string;
    name: string;
    max_leads: number;
    storage_limit_mb: number;
}

interface BlueprintRecord {
    id: string;
    name: string;
}

interface CompanyRecord {
    id: string;
    name: string;
    db_name: string;
    status: 'active' | 'suspended';
    createdAt: string;
    plan: PlanRecord | null;
    domains: DomainRecord[];
    department: BlueprintRecord | null;
}

interface Metrics {
    total_leads: number;
    total_users: number;
    storage_bytes: number;
    storage_mb: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

import api from '../../api/axiosConfig';

const formatDate = (iso: string): string =>
    new Date(iso).toLocaleDateString('en-US', {
        weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
    });

const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${units[i]}`;
};

// ─── KPI Card ─────────────────────────────────────────────────────────────────

interface KpiCardProps {
    icon: string;
    label: string;
    value: string;
    sub?: string;
    limit?: string;
    pct?: number;           // 0-100 for progress bar
    colorClass: string;     // Tailwind gradient
    loading?: boolean;
}

const KpiCard: React.FC<KpiCardProps> = ({ icon, label, value, sub, limit, pct, colorClass, loading }) => (
    <div className={`relative overflow-hidden rounded-2xl border border-white/5 bg-gray-900 p-5`}>
        {/* Accent strip */}
        <div className={`absolute top-0 left-0 right-0 h-1 ${colorClass}`} />

        {loading ? (
            <div className="animate-pulse space-y-2 pt-2">
                <div className="h-4 w-16 bg-gray-800 rounded" />
                <div className="h-8 w-24 bg-gray-700 rounded" />
            </div>
        ) : (
            <>
                <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xl">{icon}</span>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{label}</p>
                </div>
                <p className="text-3xl font-extrabold text-white tracking-tight">{value}</p>
                {sub && <p className="text-xs text-gray-600 mt-0.5">{sub}</p>}
                {limit && <p className="text-xs text-gray-500 mt-1">Limit: {limit}</p>}
                {pct !== undefined && (
                    <div className="mt-2 w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                        <div
                            className={`h-1.5 rounded-full ${colorClass} transition-all duration-700`}
                            style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                    </div>
                )}
            </>
        )}
    </div>
);

// ─── Component ────────────────────────────────────────────────────────────────

const CompanyDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [company, setCompany] = useState<CompanyRecord | null>(null);
    const [metrics, setMetrics] = useState<Metrics | null>(null);
    const [loadingMain, setLoadingMain] = useState(true);
    const [loadingMetrics, setLoadingMetrics] = useState(true);
    const [toggling, setToggling] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const fetchData = useCallback(async () => {
        if (!id) return;
        setLoadingMain(true);
        setLoadingMetrics(true);
        setError('');

        try {
            const res = await api.get(`/companies/${id}/metrics`);
            const data = res.data;

            setCompany(data.company as CompanyRecord);
            setMetrics(data.metrics as Metrics);
            // Use partial data if available
            if (data.metrics) setMetrics(data.metrics as Metrics);
        } catch (err: any) {
            setError(err instanceof Error ? err.message : 'Network error.');
            // Demo fallback
            const demoCompany: CompanyRecord = {
                id: id!, name: 'Elite Real Estate', db_name: 'crm_elite_re', status: 'active',
                createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
                plan: { id: 'p1', name: 'Pro', max_leads: 5000, storage_limit_mb: 2048 },
                domains: [{ domain_name: 'elite-re.ihsolution.tech', is_verified: true }],
                department: { id: 'bp1', name: 'Real Estate Agency' },
            };
            setCompany(demoCompany);
            setMetrics({ total_leads: 284, total_users: 12, storage_bytes: 38 * 1024 * 1024, storage_mb: 38 });
        } finally {
            setLoadingMain(false);
            setLoadingMetrics(false);
        }
    }, [id]);

    useEffect(() => { fetchData(); }, [fetchData]);

    // ── Status Toggle ─────────────────────────────────────────────────────────

    const handleStatusToggle = async () => {
        if (!company || toggling) return;

        const targetStatus = company.status === 'active' ? 'suspended' : 'active';
        const confirmed = window.confirm(
            `${targetStatus === 'suspended' ? '⚠️ Suspend' : '✅ Activate'} tenant "${company.name}"?\n\nThis will ${targetStatus === 'suspended' ? 'prevent all users from logging in.' : 'restore full access.'}`
        );

        if (!confirmed) return;

        setToggling(true);
        setError('');
        setSuccessMsg('');

        try {
            await api.put(`/companies/${id}/status`, { status: targetStatus });
            setSuccessMsg(`Company status successfully updated to ${targetStatus}.`);
            await fetchData();
        } catch (err: any) {
            setError(err instanceof Error ? err.message : 'Failed to toggle status.');
        } finally {
            setToggling(false);
        }
    };

    const leadPct = company?.plan?.max_leads && metrics
        ? Math.round((metrics.total_leads / company.plan.max_leads) * 100)
        : 0;

    const storagePct = company?.plan?.storage_limit_mb && metrics
        ? Math.round((metrics.storage_mb / company.plan.storage_limit_mb) * 100)
        : 0;

    const isSuspended = company?.status === 'suspended';

    // ─────────────────────────────────────────────────────────────────────────
    //  RENDER
    // ─────────────────────────────────────────────────────────────────────────

    return (
        <div className="space-y-6">
            {/* Back button */}
            <button
                onClick={() => navigate('/super-admin/companies')}
                className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-white transition font-semibold"
            >
                ← Back to Company Directory
            </button>

            {/* Status messages */}
            {error && (
                <div className="bg-amber-900/30 border border-amber-800 text-amber-300 text-sm font-semibold rounded-xl px-4 py-3">
                    ⚠ {error}
                </div>
            )}
            {successMsg && (
                <div className="bg-emerald-900/30 border border-emerald-800 text-emerald-300 text-sm font-semibold rounded-xl px-4 py-3">
                    ✓ {successMsg}
                </div>
            )}

            {/* ── Header Card ── */}
            <div className={`relative overflow-hidden rounded-2xl border bg-gray-900 p-6
        ${isSuspended ? 'border-red-800/50' : 'border-white/5'}`}>

                {/* Suspended overlay strip */}
                {isSuspended && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 to-orange-600" />
                )}
                {!isSuspended && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500" />
                )}

                <div className="flex items-start justify-between gap-6 flex-wrap">
                    {/* Identity */}
                    <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-extrabold shadow-lg
              ${isSuspended ? 'bg-red-900/50' : 'bg-indigo-900/50'}`}>
                            {loadingMain ? '…' : company?.name?.[0]?.toUpperCase() ?? '?'}
                        </div>
                        <div>
                            {loadingMain ? (
                                <div className="space-y-2 animate-pulse">
                                    <div className="h-6 w-44 bg-gray-800 rounded" />
                                    <div className="h-3 w-32 bg-gray-800 rounded" />
                                </div>
                            ) : (
                                <>
                                    <h1 className="text-2xl font-extrabold text-white">{company?.name}</h1>
                                    <p className="text-xs font-mono text-gray-500 mt-0.5">{company?.db_name}</p>
                                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                        <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full border
                      ${isSuspended
                                                ? 'bg-red-900/40 text-red-400 border-red-800/50'
                                                : 'bg-emerald-900/40 text-emerald-400 border-emerald-800/50'}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${isSuspended ? 'bg-red-400' : 'bg-emerald-400 animate-pulse'}`} />
                                            {company?.status === 'active' ? 'Active' : 'Suspended'}
                                        </span>
                                        <span className="text-xs text-indigo-300 bg-indigo-900/40 border border-indigo-800/50 px-2 py-0.5 rounded-full font-bold">
                                            {company?.plan?.name ?? '—'} Plan
                                        </span>
                                        {company?.department?.name && (
                                            <span className="text-xs text-gray-400 bg-gray-800 border border-gray-700 px-2 py-0.5 rounded-full">
                                                {company.department.name}
                                            </span>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 items-start flex-wrap">
                        <button
                            onClick={fetchData}
                            disabled={loadingMetrics}
                            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 rounded-xl bg-gray-800 transition"
                        >
                            🔄 {loadingMetrics ? 'Refreshing…' : 'Refresh Metrics'}
                        </button>

                        <button
                            onClick={handleStatusToggle}
                            disabled={toggling || loadingMain}
                            className={`inline-flex items-center gap-1.5 px-5 py-2 text-xs font-extrabold rounded-xl transition shadow-lg disabled:opacity-60
                ${isSuspended
                                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 shadow-emerald-900/50'
                                    : 'bg-gradient-to-r from-red-600 to-orange-600 text-white hover:from-red-700 hover:to-orange-700 shadow-red-900/50'}`}
                        >
                            {toggling ? (
                                <>
                                    <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Updating…
                                </>
                            ) : isSuspended ? '✅ Activate Tenant' : '⛔ Suspend Tenant'}
                        </button>
                    </div>
                </div>

                {/* Meta row */}
                {!loadingMain && company && (
                    <div className="mt-5 pt-4 border-t border-white/5 flex items-center gap-6 flex-wrap text-xs text-gray-500">
                        <span>📅 Provisioned: <strong className="text-gray-400">{formatDate(company.createdAt)}</strong></span>
                        <span>🌐 Domains: <strong className="text-gray-400">{company.domains?.map((d) => d.domain_name).join(', ') || '—'}</strong></span>
                        <span>💾 Database: <strong className="font-mono text-gray-400">{company.db_name}</strong></span>
                    </div>
                )}
            </div>

            {/* ── KPI Cards ── */}
            <div>
                <h2 className="text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-3">📊 Live Tenant Metrics</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    <KpiCard
                        icon="👥"
                        label="Total Leads"
                        value={metrics ? metrics.total_leads.toLocaleString() : '—'}
                        sub="In tenant database"
                        limit={company?.plan?.max_leads ? company.plan.max_leads.toLocaleString() : undefined}
                        pct={leadPct}
                        colorClass="bg-gradient-to-r from-indigo-500 to-purple-500"
                        loading={loadingMetrics}
                    />
                    <KpiCard
                        icon="🧑‍💼"
                        label="Active Users"
                        value={metrics ? metrics.total_users.toLocaleString() : '—'}
                        sub="Staff accounts"
                        colorClass="bg-gradient-to-r from-blue-500 to-cyan-500"
                        loading={loadingMetrics}
                    />
                    <KpiCard
                        icon="💿"
                        label="Storage Used"
                        value={metrics ? `${metrics.storage_mb.toFixed(1)} MB` : '—'}
                        sub={metrics ? formatBytes(metrics.storage_bytes) : undefined}
                        limit={company?.plan?.storage_limit_mb ? `${company.plan.storage_limit_mb} MB` : undefined}
                        pct={storagePct}
                        colorClass="bg-gradient-to-r from-emerald-500 to-teal-500"
                        loading={loadingMetrics}
                    />
                    <KpiCard
                        icon="📋"
                        label="Plan"
                        value={company?.plan?.name ?? '—'}
                        sub={`Max ${company?.plan?.max_leads?.toLocaleString() ?? '?'} leads`}
                        colorClass="bg-gradient-to-r from-orange-500 to-rose-500"
                        loading={loadingMain}
                    />
                </div>

                {/* Usage warnings */}
                {!loadingMetrics && metrics && (
                    <>
                        {leadPct >= 90 && (
                            <div className="mt-3 bg-red-900/30 border border-red-800 text-red-300 text-xs font-semibold rounded-xl px-4 py-2.5">
                                🚨 Lead capacity at {leadPct}% — tenant approaching plan limit. Consider upgrading their plan.
                            </div>
                        )}
                        {storagePct >= 80 && (
                            <div className="mt-2 bg-amber-900/30 border border-amber-800 text-amber-300 text-xs font-semibold rounded-xl px-4 py-2.5">
                                ⚠ Storage at {storagePct}% — tenant nearing storage limit.
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* ── Plan Details ── */}
            {!loadingMain && company?.plan && (
                <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
                    <h2 className="text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-4">📦 Plan Details</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: 'Plan Name', value: company.plan.name },
                            { label: 'Max Leads', value: company.plan.max_leads.toLocaleString() },
                            { label: 'Storage Limit', value: `${company.plan.storage_limit_mb.toLocaleString()} MB` },
                            { label: 'Blueprint', value: company.department?.name ?? '—' },
                        ].map(({ label, value }) => (
                            <div key={label} className="bg-gray-800 rounded-xl p-4">
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">{label}</p>
                                <p className="font-extrabold text-white text-sm">{value}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Domain Records ── */}
            {!loadingMain && company?.domains && company.domains.length > 0 && (
                <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
                    <h2 className="text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-4">🌐 Domain Records</h2>
                    <div className="space-y-2">
                        {company.domains.map((d, i) => (
                            <div key={i} className="flex items-center justify-between px-4 py-2.5 bg-gray-800 rounded-xl">
                                <span className="text-sm font-mono text-gray-300">{d.domain_name}</span>
                                {d.is_verified
                                    ? <span className="text-xs text-blue-400 font-bold bg-blue-900/30 border border-blue-800/50 px-2 py-0.5 rounded-full">✓ Verified</span>
                                    : <span className="text-xs text-gray-500 font-bold bg-gray-700 px-2 py-0.5 rounded-full">Unverified</span>}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CompanyDetail;
