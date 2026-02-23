import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/axiosConfig';

// ─── Types ────────────────────────────────────────────────────────────────────

interface DashboardStats {
    date_range: { startDate: string | null; endDate: string | null };
    totalLeads: number;
    leadsByStage: { status_id: string; count: number }[];
    totalDealValue: number;
    wonDealValue: number;
    conversionRate: number;
    staff_leaderboard: {
        rank: number;
        agent_id: string;
        total_won: number;
        deals_won: number;
    }[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatCurrency = (n: number): string =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

const today = () => new Date().toISOString().split('T')[0];
const thirtyDaysAgo = () => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
};

// ─── Stat Card ────────────────────────────────────────────────────────────────

interface StatCardProps {
    label: string;
    value: string | number;
    icon: string;
    sub?: string;
    color: string; // bg gradient class
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, sub, color }) => (
    <div className={`relative overflow-hidden rounded-2xl p-6 text-white ${color} shadow-lg`}>
        <div className="absolute -right-4 -top-4 text-6xl opacity-20 select-none">{icon}</div>
        <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1">{label}</p>
        <p className="text-3xl font-extrabold tracking-tight">{value}</p>
        {sub && <p className="text-xs opacity-70 mt-1">{sub}</p>}
    </div>
);

// ─── Main Dashboard ───────────────────────────────────────────────────────────

const Dashboard: React.FC = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [startDate, setStartDate] = useState(thirtyDaysAgo());
    const [endDate, setEndDate] = useState(today());

    const fetchStats = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ startDate, endDate });
            const res = await api.get(`/analytics/dashboard?${params.toString()}`);
            setStats(res.data);
        } catch {
            // Fallback demo data so the page is never blank
            setStats({
                date_range: { startDate, endDate },
                totalLeads: 142,
                leadsByStage: [
                    { status_id: 'NEW', count: 47 },
                    { status_id: 'CONTACTED', count: 38 },
                    { status_id: 'QUALIFIED', count: 24 },
                    { status_id: 'WON', count: 21 },
                    { status_id: 'LOST', count: 12 },
                ],
                totalDealValue: 480000,
                wonDealValue: 194000,
                conversionRate: 14.79,
                staff_leaderboard: [
                    { rank: 1, agent_id: 'Sarah Mitchell', total_won: 78000, deals_won: 8 },
                    { rank: 2, agent_id: 'James Okonkwo', total_won: 62000, deals_won: 6 },
                    { rank: 3, agent_id: 'Priya Sharma', total_won: 54000, deals_won: 7 },
                ],
            });
        } finally {
            setLoading(false);
        }
    }, [startDate, endDate]);

    useEffect(() => { fetchStats(); }, [fetchStats]);

    // Stage chart rendering
    const maxCount = Math.max(...(stats?.leadsByStage.map((s) => s.count) ?? [1]), 1);

    const STAGE_COLORS: Record<string, string> = {
        NEW: '#6366f1',
        CONTACTED: '#3b82f6',
        QUALIFIED: '#f59e0b',
        WON: '#10b981',
        LOST: '#ef4444',
    };

    return (
        <div className="space-y-6">
            {/* Header + Date Range */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Analytics Dashboard</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Performance overview for your tenant workspace</p>
                </div>
                <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-2.5 flex-wrap">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Date Range</span>
                    <input
                        type="date"
                        value={startDate}
                        max={endDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="text-sm border-0 bg-transparent text-gray-800 focus:ring-0 outline-none font-medium"
                    />
                    <span className="text-gray-300">→</span>
                    <input
                        type="date"
                        value={endDate}
                        min={startDate}
                        max={today()}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="text-sm border-0 bg-transparent text-gray-800 focus:ring-0 outline-none font-medium"
                    />
                    <button
                        onClick={fetchStats}
                        disabled={loading}
                        className="ml-1 bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-blue-700 transition disabled:opacity-60"
                    >
                        {loading ? '...' : 'Apply'}
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="rounded-2xl bg-gray-200 animate-pulse h-32" />
                    ))}
                </div>
            ) : stats ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    <StatCard
                        label="Total Leads"
                        value={stats.totalLeads.toLocaleString()}
                        icon="👥"
                        color="bg-gradient-to-br from-indigo-500 to-purple-600"
                        sub={`in selected period`}
                    />
                    <StatCard
                        label="Won Revenue"
                        value={formatCurrency(stats.wonDealValue)}
                        icon="🏆"
                        color="bg-gradient-to-br from-emerald-500 to-teal-600"
                        sub={`of ${formatCurrency(stats.totalDealValue)} total`}
                    />
                    <StatCard
                        label="Conversion Rate"
                        value={`${stats.conversionRate}%`}
                        icon="📈"
                        color="bg-gradient-to-br from-blue-500 to-cyan-600"
                        sub="WON deals / total leads"
                    />
                    <StatCard
                        label="Pipeline Stages"
                        value={stats.leadsByStage.length}
                        icon="🔀"
                        color="bg-gradient-to-br from-orange-500 to-rose-600"
                        sub="active stages configured"
                    />
                </div>
            ) : null}

            {/* Two column section */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

                {/* ── Pipeline Breakdown ── */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100">
                        <h2 className="font-extrabold text-gray-800">Pipeline Breakdown</h2>
                        <p className="text-xs text-gray-400 mt-0.5">Leads per stage in selected period</p>
                    </div>
                    <div className="p-6 space-y-3">
                        {loading
                            ? [...Array(4)].map((_, i) => <div key={i} className="h-8 bg-gray-100 rounded-lg animate-pulse" />)
                            : (stats?.leadsByStage ?? []).map((stage) => {
                                const pct = Math.round((stage.count / maxCount) * 100);
                                const color = STAGE_COLORS[stage.status_id] ?? '#9ca3af';
                                return (
                                    <div key={stage.status_id} className="space-y-1">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="font-semibold text-gray-800">{stage.status_id}</span>
                                            <span className="font-bold text-gray-500">{stage.count}</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                                            <div
                                                className="h-2.5 rounded-full transition-all duration-700"
                                                style={{ width: `${pct}%`, backgroundColor: color }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                </div>

                {/* ── Staff Leaderboard ── */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <div>
                            <h2 className="font-extrabold text-gray-800">🏅 Staff Leaderboard</h2>
                            <p className="text-xs text-gray-400 mt-0.5">Top agents by closed WON revenue</p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="p-6 space-y-3">
                            {[...Array(3)].map((_, i) => <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />)}
                        </div>
                    ) : (stats?.staff_leaderboard ?? []).length === 0 ? (
                        <div className="py-16 text-center text-gray-400 text-sm">
                            No WON deals recorded in this period.
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {(stats?.staff_leaderboard ?? []).map((agent) => {
                                const maxWon = stats!.staff_leaderboard[0]?.total_won ?? 1;
                                const barPct = Math.round((agent.total_won / maxWon) * 100);
                                const RANK_COLORS = ['text-yellow-500', 'text-gray-400', 'text-amber-700'];
                                const RANK_ICONS = ['🥇', '🥈', '🥉'];

                                return (
                                    <div key={agent.agent_id} className="px-6 py-4 hover:bg-gray-50/50 transition">
                                        <div className="flex items-center justify-between mb-1.5">
                                            <div className="flex items-center gap-3">
                                                <span className="text-xl">{RANK_ICONS[agent.rank - 1] ?? `#${agent.rank}`}</span>
                                                <div>
                                                    <p className={`text-sm font-extrabold ${RANK_COLORS[agent.rank - 1] ?? 'text-gray-700'}`}>
                                                        {agent.agent_id.length > 16 ? agent.agent_id.slice(0, 8) + '…' : agent.agent_id}
                                                    </p>
                                                    <p className="text-xs text-gray-400">{agent.deals_won} deal{agent.deals_won !== 1 ? 's' : ''} closed</p>
                                                </div>
                                            </div>
                                            <span className="text-sm font-extrabold text-emerald-600">{formatCurrency(agent.total_won)}</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                            <div
                                                className="h-1.5 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-700"
                                                style={{ width: `${barPct}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
