import React, { useState } from 'react';



type Priority = 'INFO' | 'WARNING' | 'CRITICAL';

interface BroadcastResult {
    tenant: string;
    success: boolean;
    error?: string;
}

interface BroadcastResponse {
    delivered_to: number;
    failed: number;
    results: BroadcastResult[];
}



const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; bg: string; icon: string }> = {
    INFO: { label: 'Info', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200', icon: 'ℹ️' },
    WARNING: { label: 'Warning', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', icon: '⚠️' },
    CRITICAL: { label: 'Critical', color: 'text-red-700', bg: 'bg-red-50 border-red-200', icon: '🚨' },
};



const SystemBroadcasts: React.FC = () => {
    const [form, setForm] = useState({ title: '', message: '', priority: 'INFO' as Priority });
    const [sending, setSending] = useState(false);
    const [response, setResponse] = useState<BroadcastResponse | null>(null);
    const [error, setError] = useState('');
    const [showResults, setShowResults] = useState(false);

    const SUPER_ADMIN_API = '';

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.message.trim()) return;

        const confirmed = window.confirm(
            `📣 You are about to send a ${form.priority} broadcast to ALL active tenants.\n\nThis cannot be undone. Proceed?`
        );
        if (!confirmed) return;

        setSending(true);
        setError('');
        setResponse(null);
        setShowResults(false);

        try {
            const res = await fetch(`${SUPER_ADMIN_API}/api/broadcasts/send`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });

            if (!res.ok) {
                const data = await res.json();
                setError(data.error ?? 'Unknown server error.');
                return;
            }

            const data = await res.json() as BroadcastResponse;
            setResponse(data);
            setShowResults(true);
            setForm({ title: '', message: '', priority: 'INFO' });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Network error. Please try again.');
        } finally {
            setSending(false);
        }
    };

    const pc = PRIORITY_CONFIG[form.priority];

    return (
        <div className="min-h-screen bg-gray-950 text-white p-8 space-y-8">
            {}
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center text-2xl shadow-lg">
                    📣
                </div>
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight">System Broadcasts</h1>
                    <p className="text-gray-400 text-sm mt-0.5">
                        Send a notification to ALL active tenants simultaneously.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">

                {}
                <div className="xl:col-span-3 bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-800 flex items-center gap-3">
                        <span className="text-lg">✍️</span>
                        <h2 className="font-extrabold text-white">Compose Broadcast</h2>
                    </div>

                    <form onSubmit={handleSend} className="p-6 space-y-5">
                        {}
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Priority Level</label>
                            <div className="flex gap-3">
                                {(Object.keys(PRIORITY_CONFIG) as Priority[]).map((p) => {
                                    const cfg = PRIORITY_CONFIG[p];
                                    const isActive = form.priority === p;
                                    return (
                                        <button
                                            key={p}
                                            type="button"
                                            onClick={() => setForm({ ...form, priority: p })}
                                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 font-bold text-sm transition active:scale-95
                        ${isActive
                                                    ? 'border-white bg-white/10'
                                                    : 'border-gray-700 hover:border-gray-500 text-gray-400'}`}
                                        >
                                            <span>{cfg.icon}</span>
                                            {cfg.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {}
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Title (optional)</label>
                            <input
                                type="text"
                                value={form.title}
                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                                placeholder="e.g. Scheduled Maintenance Tonight"
                                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>

                        {}
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Message *</label>
                            <textarea
                                required
                                rows={5}
                                value={form.message}
                                onChange={(e) => setForm({ ...form, message: e.target.value })}
                                placeholder="Type the broadcast message here. All active tenants will see this notification immediately..."
                                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                            />
                            <p className="text-xs text-gray-500 mt-1 text-right">{form.message.length} characters</p>
                        </div>

                        {}
                        {form.message.trim() && (
                            <div className={`rounded-xl border px-4 py-3 ${pc.bg}`}>
                                <div className="flex items-center gap-2 mb-1">
                                    <span>{pc.icon}</span>
                                    <p className={`text-xs font-extrabold uppercase tracking-wider ${pc.color}`}>{pc.label} Broadcast</p>
                                </div>
                                <p className={`font-bold text-sm ${pc.color}`}>{form.title || 'Broadcast from System Admin'}</p>
                                <p className={`text-sm mt-0.5 ${pc.color} opacity-80`}>{form.message}</p>
                            </div>
                        )}

                        {error && (
                            <div className="bg-red-900/40 border border-red-700 text-red-300 text-sm font-medium rounded-xl px-4 py-3">
                                ⚠️ {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={sending || !form.message.trim()}
                            className="w-full bg-gradient-to-r from-red-600 to-orange-600 text-white font-extrabold py-3.5 rounded-xl hover:from-red-700 hover:to-orange-700 transition shadow-lg disabled:opacity-50 active:scale-[0.99]"
                        >
                            {sending ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Dispatching...
                                </span>
                            ) : '📣 Send to All Active Tenants'}
                        </button>
                    </form>
                </div>

                {}
                <div className="xl:col-span-2 space-y-4">
                    <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5 space-y-3">
                        <h3 className="font-extrabold text-white text-sm">⚡ How Broadcasts Work</h3>
                        <ul className="space-y-2 text-xs text-gray-400">
                            <li className="flex items-start gap-2"><span className="text-blue-400 mt-0.5">•</span>The broadcast is inserted as a <code className="text-blue-300 bg-gray-800 px-1 rounded">notifications</code> record in each tenant's database.</li>
                            <li className="flex items-start gap-2"><span className="text-blue-400 mt-0.5">•</span><code className="text-blue-300 bg-gray-800 px-1 rounded">user_id = NULL</code> and <code className="text-blue-300 bg-gray-800 px-1 rounded">role_id = NULL</code> mark it as a global notification visible to all users.</li>
                            <li className="flex items-start gap-2"><span className="text-blue-400 mt-0.5">•</span>Tenant failures are isolated — one unreachable DB will not stop delivery to others.</li>
                            <li className="flex items-start gap-2"><span className="text-amber-400 mt-0.5">⚠</span><strong className="text-white">This action cannot be undone.</strong> Use with care.</li>
                        </ul>
                    </div>

                    {}
                    <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5 space-y-2">
                        <h3 className="font-extrabold text-white text-sm mb-3">Priority Guide</h3>
                        {(Object.entries(PRIORITY_CONFIG) as [Priority, typeof PRIORITY_CONFIG[Priority]][]).map(([key, cfg]) => (
                            <div key={key} className={`flex items-center gap-3 rounded-lg border px-3 py-2 ${cfg.bg}`}>
                                <span>{cfg.icon}</span>
                                <div>
                                    <p className={`text-xs font-bold ${cfg.color}`}>{cfg.label}</p>
                                    <p className="text-xs text-gray-500">
                                        {key === 'INFO' && 'General announcements, feature updates.'}
                                        {key === 'WARNING' && 'Scheduled downtime, policy changes.'}
                                        {key === 'CRITICAL' && 'Security incidents or urgent action required.'}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {}
            {response && showResults && (
                <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="text-xl">📊</span>
                            <h2 className="font-extrabold text-white">Delivery Report</h2>
                        </div>
                        <div className="flex gap-4 text-sm">
                            <span className="text-green-400 font-bold">✓ {response.delivered_to} delivered</span>
                            {response.failed > 0 && <span className="text-red-400 font-bold">✗ {response.failed} failed</span>}
                        </div>
                    </div>
                    <div className="divide-y divide-gray-800 max-h-64 overflow-y-auto">
                        {response.results.map((r, i) => (
                            <div key={i} className="px-6 py-3 flex items-center justify-between">
                                <span className="text-sm font-semibold text-gray-300">{r.tenant}</span>
                                {r.success
                                    ? <span className="text-xs text-green-400 font-bold bg-green-900/30 px-2 py-0.5 rounded-full">✓ Delivered</span>
                                    : <span className="text-xs text-red-400 font-bold bg-red-900/30 px-2 py-0.5 rounded-full" title={r.error}>✗ Failed</span>}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SystemBroadcasts;
