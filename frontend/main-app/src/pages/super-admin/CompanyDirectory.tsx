import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// ─── Types ────────────────────────────────────────────────────────────────────

interface DomainRecord {
    id: string;
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

import api from '../../api/axiosConfig';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (iso: string): string =>
    new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const getPrimaryDomain = (domains: DomainRecord[]): string => {
    if (!domains || domains.length === 0) return '—';
    const verified = domains.find((d) => d.is_verified);
    return (verified ?? domains[0]).domain_name;
};

// ─── Status Badge ─────────────────────────────────────────────────────────────

const StatusBadge: React.FC<{ status: 'active' | 'suspended' }> = ({ status }) => (
    <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full
    ${status === 'active'
            ? 'bg-emerald-900/40 text-emerald-400 border border-emerald-800/50'
            : 'bg-red-900/40 text-red-400 border border-red-800/50'}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${status === 'active' ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
        {status === 'active' ? 'Active' : 'Suspended'}
    </span>
);

// ─── Component ────────────────────────────────────────────────────────────────

const CompanyDirectory: React.FC = () => {
    const navigate = useNavigate();
    const [companies, setCompanies] = useState<CompanyRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'suspended'>('all');

    useEffect(() => {
        const load = async () => {
            try {
                const res = await api.get('/companies');
                setCompanies(res.data.companies ?? []);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Network error');
                setCompanies([]);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    // Client-side filtering
    const filtered = companies.filter((c) => {
        const matchSearch = !search ||
            c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.db_name.toLowerCase().includes(search.toLowerCase()) ||
            getPrimaryDomain(c.domains).toLowerCase().includes(search.toLowerCase());
        const matchStatus = filterStatus === 'all' || c.status === filterStatus;
        return matchSearch && matchStatus;
    });

    const totalActive = companies.filter((c) => c.status === 'active').length;
    const totalSuspended = companies.filter((c) => c.status === 'suspended').length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight">Company Directory</h1>
                    <p className="text-gray-500 text-sm mt-1">All provisioned tenants on the master database.</p>
                </div>
                {/* KPI pills */}
                <div className="flex gap-3">
                    <div className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5 text-center min-w-[80px]">
                        <p className="text-2xl font-extrabold text-white">{companies.length}</p>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Total</p>
                    </div>
                    <div className="bg-emerald-900/30 border border-emerald-800/50 rounded-xl px-4 py-2.5 text-center min-w-[80px]">
                        <p className="text-2xl font-extrabold text-emerald-400">{totalActive}</p>
                        <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Active</p>
                    </div>
                    <div className="bg-red-900/30 border border-red-800/50 rounded-xl px-4 py-2.5 text-center min-w-[80px]">
                        <p className="text-2xl font-extrabold text-red-400">{totalSuspended}</p>
                        <p className="text-[10px] text-red-600 font-bold uppercase tracking-wider">Suspended</p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3 flex-wrap">
                <div className="relative flex-1 min-w-[200px]">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">🔍</span>
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search company name, domain, database..."
                        className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-gray-200 placeholder-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                </div>
                <div className="flex rounded-xl overflow-hidden border border-gray-800">
                    {(['all', 'active', 'suspended'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilterStatus(f)}
                            className={`px-4 py-2.5 text-xs font-bold capitalize transition
                ${filterStatus === f
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-gray-900 text-gray-500 hover:text-gray-300 hover:bg-gray-800'}`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="bg-amber-900/30 border border-amber-800 text-amber-300 text-xs font-semibold rounded-xl px-4 py-3">
                    ⚠ Using demo data — {error}
                </div>
            )}

            {/* Table */}
            <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
                {/* Table header */}
                <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr_100px] gap-4 px-6 py-3 border-b border-gray-800 bg-gray-800/40">
                    {['Company', 'Domain', 'Plan', 'Industry / Blueprint', 'Status', ''].map((h) => (
                        <span key={h} className="text-[10px] font-extrabold text-gray-500 uppercase tracking-widest">{h}</span>
                    ))}
                </div>

                {/* Rows */}
                {loading ? (
                    [...Array(5)].map((_, i) => (
                        <div key={i} className="grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr_100px] gap-4 px-6 py-4 border-b border-gray-800/50 animate-pulse">
                            {[...Array(6)].map((__, j) => (
                                <div key={j} className="h-4 bg-gray-800 rounded" />
                            ))}
                        </div>
                    ))
                ) : filtered.length === 0 ? (
                    <div className="py-16 text-center text-gray-600 text-sm">
                        {search || filterStatus !== 'all' ? 'No companies match your filters.' : 'No companies provisioned yet.'}
                    </div>
                ) : (
                    filtered.map((company, i) => (
                        <div
                            key={company.id}
                            className={`grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr_100px] gap-4 items-center px-6 py-4 border-b border-gray-800/50 hover:bg-gray-800/30 transition group
                ${i === filtered.length - 1 ? 'border-b-0' : ''}`}
                        >
                            {/* Company Name + DB */}
                            <div className="min-w-0">
                                <p className="font-extrabold text-white text-sm truncate">{company.name}</p>
                                <p className="text-[11px] text-gray-600 font-mono truncate mt-0.5">{company.db_name}</p>
                            </div>

                            {/* Domain */}
                            <div className="min-w-0">
                                <p className="text-xs text-gray-300 truncate">{getPrimaryDomain(company.domains)}</p>
                                {company.domains?.some((d) => d.is_verified) && (
                                    <span className="text-[10px] text-blue-400 font-bold">✓ Verified</span>
                                )}
                            </div>

                            {/* Plan */}
                            <div>
                                <span className="text-xs font-bold text-indigo-300 bg-indigo-900/40 border border-indigo-800/50 px-2 py-0.5 rounded-full">
                                    {company.plan?.name ?? '—'}
                                </span>
                            </div>

                            {/* Blueprint */}
                            <div>
                                <p className="text-xs text-gray-400 truncate">{company.department?.name ?? '—'}</p>
                            </div>

                            {/* Status */}
                            <div>
                                <StatusBadge status={company.status} />
                            </div>

                            {/* Action */}
                            <div>
                                <button
                                    onClick={() => navigate(`/super-admin/companies/${company.id}`)}
                                    className="text-xs font-bold text-indigo-400 hover:text-white border border-indigo-800/50 hover:border-indigo-500 px-3 py-1.5 rounded-lg bg-indigo-900/20 hover:bg-indigo-600/30 transition"
                                >
                                    View →
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {filtered.length > 0 && !loading && (
                <p className="text-xs text-gray-600 text-right">
                    Showing {filtered.length} of {companies.length} tenant{companies.length !== 1 ? 's' : ''}
                </p>
            )}
        </div>
    );
};

export default CompanyDirectory;
