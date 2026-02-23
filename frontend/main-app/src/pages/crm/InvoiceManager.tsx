import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';

type InvoiceStatus = 'DRAFT' | 'SENT' | 'PAID';

interface Invoice {
    id: string;
    lead_id: string;
    amount: number;
    status: InvoiceStatus;
    due_date: string;
}

const STATUS_STYLES: Record<InvoiceStatus, string> = {
    DRAFT: 'bg-gray-100 text-gray-600',
    SENT: 'bg-blue-100 text-blue-700',
    PAID: 'bg-green-100 text-green-700',
};

const STATUS_FLOW: Record<InvoiceStatus, InvoiceStatus | null> = {
    DRAFT: 'SENT',
    SENT: 'PAID',
    PAID: null,
};

const InvoiceManager: React.FC = () => {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ lead_id: '', amount: '', due_date: '', status: 'DRAFT' as InvoiceStatus });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        api.get('/finance/invoices')
            .then((res) => setInvoices(res.data.invoices || []))
            .catch(() => {
                const today = new Date().toISOString().split('T')[0];
                setInvoices([
                    { id: 'inv-1', lead_id: 'lead-abc', amount: 3500, status: 'PAID', due_date: today },
                    { id: 'inv-2', lead_id: 'lead-def', amount: 12000, status: 'SENT', due_date: today },
                    { id: 'inv-3', lead_id: 'lead-ghi', amount: 800, status: 'DRAFT', due_date: today },
                ]);
            })
            .finally(() => setLoading(false));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await api.post('/finance/invoices', { ...form, amount: Number(form.amount) });
            setInvoices([...invoices, res.data.invoice]);
        } catch {
            const optimistic: Invoice = { id: String(Date.now()), ...form, amount: Number(form.amount) };
            setInvoices([...invoices, optimistic]);
        } finally {
            setSubmitting(false);
            setShowForm(false);
            setForm({ lead_id: '', amount: '', due_date: '', status: 'DRAFT' });
        }
    };

    const advanceStatus = async (invoice: Invoice) => {
        const nextStatus = STATUS_FLOW[invoice.status];
        if (!nextStatus) return;
        try {
            await api.put(`/finance/invoices/${invoice.id}/status`, { status: nextStatus });
        } catch (_) { }
        setInvoices((prev) => prev.map((inv) => inv.id === invoice.id ? { ...inv, status: nextStatus } : inv));
    };

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

    const totals = {
        draft: invoices.filter((i) => i.status === 'DRAFT').reduce((s, i) => s + i.amount, 0),
        sent: invoices.filter((i) => i.status === 'SENT').reduce((s, i) => s + i.amount, 0),
        paid: invoices.filter((i) => i.status === 'PAID').reduce((s, i) => s + i.amount, 0),
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Quotes & Invoices</h1>
                    <p className="mt-1 text-sm text-gray-500">Generate and track financial documents per lead.</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-gray-900 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-gray-800 shadow-sm transition"
                >
                    {showForm ? 'Cancel' : '+ New Invoice'}
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'Draft', value: totals.draft, color: 'border-gray-200 bg-gray-50' },
                    { label: 'Sent / Pending', value: totals.sent, color: 'border-blue-200 bg-blue-50' },
                    { label: 'Collected', value: totals.paid, color: 'border-green-200 bg-green-50' },
                ].map((card) => (
                    <div key={card.label} className={`rounded-2xl border-2 ${card.color} p-5`}>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">{card.label}</p>
                        <p className="text-2xl font-extrabold text-gray-900">{formatCurrency(card.value)}</p>
                    </div>
                ))}
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Lead ID *</label>
                        <input required type="text" value={form.lead_id}
                            onChange={(e) => setForm({ ...form, lead_id: e.target.value })}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="UUID of the lead..." />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Amount (USD) *</label>
                        <input required type="number" min="0" step="0.01" value={form.amount}
                            onChange={(e) => setForm({ ...form, amount: e.target.value })}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="0.00" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Due Date *</label>
                        <input required type="date" value={form.due_date}
                            onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Initial Status</label>
                        <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as InvoiceStatus })}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                            <option value="DRAFT">Draft</option>
                            <option value="SENT">Sent</option>
                        </select>
                    </div>
                    <div className="md:col-span-2 flex justify-end">
                        <button type="submit" disabled={submitting}
                            className="bg-blue-600 text-white font-bold px-6 py-2.5 rounded-lg hover:bg-blue-700 transition shadow-sm disabled:opacity-60">
                            {submitting ? 'Generating...' : 'Generate Invoice'}
                        </button>
                    </div>
                </form>
            )}

            {loading ? (
                <div className="py-16 text-center text-gray-400 animate-pulse">Loading invoices...</div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Invoice #</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Lead</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Amount</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Due Date</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-widest">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {invoices.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400 text-sm">
                                        No invoices yet.
                                    </td>
                                </tr>
                            )}
                            {invoices.map((inv) => {
                                const nextStatus = STATUS_FLOW[inv.status];
                                return (
                                    <tr key={inv.id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4 text-xs font-mono text-gray-400">{inv.id.slice(0, 8).toUpperCase()}</td>
                                        <td className="px-6 py-4 text-sm text-gray-700 font-mono">{inv.lead_id.slice(0, 12)}…</td>
                                        <td className="px-6 py-4 text-sm font-bold text-gray-900">{formatCurrency(inv.amount)}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{inv.due_date}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${STATUS_STYLES[inv.status]}`}>
                                                {inv.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {nextStatus ? (
                                                <button
                                                    onClick={() => advanceStatus(inv)}
                                                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition border border-blue-200 hover:border-blue-400 px-3 py-1 rounded-lg"
                                                >
                                                    Mark as {nextStatus}
                                                </button>
                                            ) : (
                                                <span className="text-xs text-gray-400 font-medium">Completed ✓</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default InvoiceManager;
