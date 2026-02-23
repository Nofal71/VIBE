import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';

interface Account {
    id: string;
    name: string;
    industry: string;
    website: string;
}

const AccountManager: React.FC = () => {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ name: '', industry: '', website: '' });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        api.get('/finance/accounts')
            .then((res) => setAccounts(res.data.accounts || []))
            .catch(() => {
                setAccounts([
                    { id: 'acc-1', name: 'Zenith Corp', industry: 'Real Estate', website: 'https://zenithcorp.com' },
                    { id: 'acc-2', name: 'Meridian Legal', industry: 'Immigration', website: 'https://meridianlegal.io' },
                    { id: 'acc-3', name: 'Atlas Properties', industry: 'Real Estate', website: 'https://atlas.ae' },
                ]);
            })
            .finally(() => setLoading(false));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await api.post('/finance/accounts', form);
            setAccounts([...accounts, res.data.account]);
        } catch {
            const optimistic: Account = { id: String(Date.now()), ...form };
            setAccounts([...accounts, optimistic]);
        } finally {
            setSubmitting(false);
            setShowForm(false);
            setForm({ name: '', industry: '', website: '' });
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Delete this account?')) return;
        try {
            await api.delete(`/finance/accounts/${id}`);
        } catch (_) { }
        setAccounts((prev) => prev.filter((a) => a.id !== id));
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">B2B Accounts</h1>
                    <p className="mt-1 text-sm text-gray-500">Manage company-level accounts and link leads to organisations.</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-gray-900 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-gray-800 shadow-sm transition"
                >
                    {showForm ? 'Cancel' : '+ New Account'}
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Company Name *</label>
                        <input
                            required type="text" value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="e.g. Zenith Corp"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Industry</label>
                        <input
                            type="text" value={form.industry}
                            onChange={(e) => setForm({ ...form, industry: e.target.value })}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="e.g. Real Estate"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Website</label>
                        <input
                            type="url" value={form.website}
                            onChange={(e) => setForm({ ...form, website: e.target.value })}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="https://..."
                        />
                    </div>
                    <div className="md:col-span-3 flex justify-end">
                        <button
                            type="submit" disabled={submitting}
                            className="bg-blue-600 text-white font-bold px-6 py-2.5 rounded-lg hover:bg-blue-700 transition shadow-sm disabled:opacity-60"
                        >
                            {submitting ? 'Saving...' : 'Create Account'}
                        </button>
                    </div>
                </form>
            )}

            {loading ? (
                <div className="py-16 text-center text-gray-400 animate-pulse">Loading accounts...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {accounts.length === 0 && (
                        <div className="col-span-3 py-16 text-center text-gray-400">
                            No accounts yet. Create your first B2B account above.
                        </div>
                    )}
                    {accounts.map((acc) => (
                        <div key={acc.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition relative group">
                            <div className="flex items-start justify-between mb-3">
                                <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-extrabold text-xl">
                                    {acc.name.charAt(0).toUpperCase()}
                                </div>
                                <button
                                    onClick={() => handleDelete(acc.id)}
                                    className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition text-lg font-bold"
                                >
                                    &times;
                                </button>
                            </div>
                            <h3 className="font-extrabold text-gray-900 text-lg">{acc.name}</h3>
                            {acc.industry && (
                                <span className="inline-block mt-1 mb-2 text-xs font-semibold bg-indigo-50 text-indigo-600 px-2.5 py-0.5 rounded-full">
                                    {acc.industry}
                                </span>
                            )}
                            {acc.website && (
                                <a
                                    href={acc.website} target="_blank" rel="noopener noreferrer"
                                    className="block text-sm text-blue-500 hover:underline truncate"
                                >
                                    {acc.website}
                                </a>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AccountManager;
