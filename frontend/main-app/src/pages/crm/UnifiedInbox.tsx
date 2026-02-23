import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';



interface EmailRecord {
    id: string;
    lead_id: string;
    message_id: string;
    direction: 'INBOUND' | 'OUTBOUND';
    subject: string;
    body: string;
    received_at: string;
    createdAt: string;
    lead_first_name: string | null;
    lead_last_name: string | null;
    lead_email: string | null;
}

interface ImapConfig {
    imap_host: string;
    imap_port: number;
    imap_username: string;
    imap_password: string;
}

type FilterDirection = 'ALL' | 'INBOUND' | 'OUTBOUND';



const formatDate = (iso: string): string => {
    const d = new Date(iso);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
    if (diffDays === 0) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return d.toLocaleDateString([], { weekday: 'short' });
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

const getLeadName = (email: EmailRecord): string => {
    const name = [email.lead_first_name, email.lead_last_name].filter(Boolean).join(' ');
    return name || email.lead_email || 'Unknown Lead';
};

const DIRECTION_BADGE: Record<EmailRecord['direction'], string> = {
    INBOUND: 'bg-blue-100 text-blue-700',
    OUTBOUND: 'bg-purple-100 text-purple-700',
};



interface ImapModalProps {
    onClose: () => void;
}

const ImapSettingsModal: React.FC<ImapModalProps> = ({ onClose }) => {
    const [form, setForm] = useState<ImapConfig>({
        imap_host: '',
        imap_port: 993,
        imap_username: '',
        imap_password: '',
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        api.get('/inbox/imap-settings')
            .then((r) => {
                const s = r.data?.setting;
                if (s) setForm((prev) => ({ ...prev, ...s, imap_password: '' }));
            })
            .catch(() => { })
            .finally(() => setLoading(false));

        const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', onEsc);
        return () => window.removeEventListener('keydown', onEsc);
    }, [onClose]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSuccess(false);
        try {
            await api.post('/inbox/imap-settings', form);
            setSuccess(true);
        } catch (err) {
            setError('Failed to save IMAP settings.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-extrabold text-gray-900">⚙️ IMAP Configuration</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl font-bold">&times;</button>
                </div>
                {loading ? (
                    <div className="py-12 text-center text-gray-400 animate-pulse">Loading...</div>
                ) : (
                    <form onSubmit={handleSave} className="p-6 space-y-4">
                        <p className="text-xs text-gray-500 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
                            Configure your IMAP server to sync incoming emails. Credentials are stored securely in your tenant database.
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="col-span-2">
                                <label className="text-xs font-bold text-gray-600 uppercase tracking-wide block mb-1">IMAP Host *</label>
                                <input required type="text" value={form.imap_host}
                                    onChange={(e) => setForm({ ...form, imap_host: e.target.value })}
                                    placeholder="imap.yourprovider.com"
                                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-600 uppercase tracking-wide block mb-1">Port *</label>
                                <input required type="number" value={form.imap_port}
                                    onChange={(e) => setForm({ ...form, imap_port: Number(e.target.value) })}
                                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-600 uppercase tracking-wide block mb-1">Protocol</label>
                                <div className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-500 bg-gray-50">IMAP / SSL</div>
                            </div>
                            <div className="col-span-2">
                                <label className="text-xs font-bold text-gray-600 uppercase tracking-wide block mb-1">Email / Username *</label>
                                <input required type="email" value={form.imap_username}
                                    onChange={(e) => setForm({ ...form, imap_username: e.target.value })}
                                    placeholder="you@yourprovider.com"
                                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>
                            <div className="col-span-2">
                                <label className="text-xs font-bold text-gray-600 uppercase tracking-wide block mb-1">Password / App Password</label>
                                <input type="password" value={form.imap_password}
                                    onChange={(e) => setForm({ ...form, imap_password: e.target.value })}
                                    placeholder="Leave blank to keep existing password"
                                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>
                        </div>
                        {error && <p className="text-red-600 text-sm font-medium bg-red-50 rounded-lg px-3 py-2">{error}</p>}
                        {success && <p className="text-green-700 text-sm font-medium bg-green-50 rounded-lg px-3 py-2">✓ IMAP settings saved successfully.</p>}
                        <div className="flex gap-3 pt-1">
                            <button type="button" onClick={onClose}
                                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition">
                                Cancel
                            </button>
                            <button type="submit" disabled={saving}
                                className="flex-1 bg-blue-600 text-white font-bold py-2.5 rounded-xl hover:bg-blue-700 transition disabled:opacity-60">
                                {saving ? 'Saving…' : 'Save Settings'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};



interface ReplyPanelProps {
    email: EmailRecord;
    onClose: () => void;
}

const ReplyPanel: React.FC<ReplyPanelProps> = ({ email, onClose }) => {
    const [body, setBody] = useState('');
    const [subject, setSubject] = useState(`Re: ${email.subject}`);
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        setSending(true);
        try {
            
            await api.post(`/leads/${email.lead_id}/email`, { subject, body });
            setSent(true);
            setBody('');
            setTimeout(onClose, 1200);
        } catch (err) {
            console.error('Reply failed:', err);
        } finally {
            setSending(false);
        }
    };

    return (
        <form onSubmit={handleSend} className="border-t border-gray-100 mt-4 pt-4 space-y-3">
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-extrabold text-gray-700">↩ Reply to {getLeadName(email)}</h4>
                <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg font-bold">×</button>
            </div>
            <input
                type="text" value={subject} onChange={(e) => setSubject(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Subject"
            />
            <textarea
                required rows={4} value={body} onChange={(e) => setBody(e.target.value)}
                placeholder="Write your reply..."
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
            />
            {sent && <p className="text-green-600 text-xs font-semibold bg-green-50 px-3 py-2 rounded-lg">✓ Reply queued for delivery.</p>}
            <div className="flex gap-2">
                <button type="button" onClick={onClose}
                    className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm font-semibold hover:bg-gray-50 transition">
                    Cancel
                </button>
                <button type="submit" disabled={sending || !body.trim()}
                    className="flex-1 bg-blue-600 text-white font-bold py-2 rounded-lg text-sm hover:bg-blue-700 transition disabled:opacity-60">
                    {sending ? 'Sending…' : '✉️ Send Reply'}
                </button>
            </div>
        </form>
    );
};



const UnifiedInbox: React.FC = () => {
    const navigate = useNavigate();
    const [emails, setEmails] = useState<EmailRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<EmailRecord | null>(null);
    const [filter, setFilter] = useState<FilterDirection>('ALL');
    const [search, setSearch] = useState('');
    const [showImapModal, setShowImapModal] = useState(false);
    const [showReply, setShowReply] = useState(false);

    const loadEmails = useCallback(async () => {
        setLoading(true);
        const params = new URLSearchParams();
        if (filter !== 'ALL') params.set('direction', filter);
        try {
            const res = await api.get(`/inbox/emails?${params.toString()}`);
            setEmails(res.data?.emails ?? []);
        } catch {
            
            setEmails([
                { id: '1', lead_id: 'l1', message_id: 'msg1', direction: 'INBOUND', subject: 'Regarding my visa enquiry', body: 'Dear team,\n\nI wanted to follow up on my application. Could you please provide an update?\n\nBest regards,\nAlice', received_at: new Date(Date.now() - 3600000).toISOString(), createdAt: new Date().toISOString(), lead_first_name: 'Alice', lead_last_name: 'Johnson', lead_email: 'alice@example.com' },
                { id: '2', lead_id: 'l2', message_id: 'msg2', direction: 'OUTBOUND', subject: 'Welcome to our service', body: 'Hi Bob,\n\nThank you for reaching out. We are happy to assist you with your application.\n\nKind regards,\nThe Team', received_at: new Date(Date.now() - 86400000).toISOString(), createdAt: new Date().toISOString(), lead_first_name: 'Bob', lead_last_name: 'Smith', lead_email: 'bob@example.com' },
                { id: '3', lead_id: 'l3', message_id: 'msg3', direction: 'INBOUND', subject: 'Document submission', body: 'Hello,\n\nPlease find my documents attached as requested.\n\nThank you', received_at: new Date(Date.now() - 3 * 86400000).toISOString(), createdAt: new Date().toISOString(), lead_first_name: 'Carol', lead_last_name: 'Chen', lead_email: 'carol@example.com' },
            ]);
        } finally {
            setLoading(false);
        }
    }, [filter]);

    useEffect(() => { loadEmails(); }, [loadEmails]);

    
    const filtered = emails.filter((e) => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (
            e.subject?.toLowerCase().includes(q) ||
            getLeadName(e).toLowerCase().includes(q) ||
            e.lead_email?.toLowerCase().includes(q) ||
            e.body?.toLowerCase().includes(q)
        );
    });

    return (
        <div className="flex flex-col h-full">
            {}
            {showImapModal && <ImapSettingsModal onClose={() => setShowImapModal(false)} />}

            {}
            <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Unified Inbox</h1>
                    <p className="text-sm text-gray-500 mt-0.5">All inbound & outbound email activity — linked to leads</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowImapModal(true)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition"
                    >
                        ⚙️ IMAP Settings
                    </button>
                    <button
                        onClick={loadEmails}
                        className="px-4 py-2 text-sm font-semibold border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition"
                    >
                        🔄 Refresh
                    </button>
                </div>
            </div>

            {}
            <div className="flex-1 flex gap-4 min-h-0 overflow-hidden">

                {}
                <div className="w-full lg:w-96 flex-shrink-0 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
                    {}
                    <div className="p-3 border-b border-gray-100 space-y-2">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search emails or leads..."
                            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <div className="flex gap-1">
                            {(['ALL', 'INBOUND', 'OUTBOUND'] as FilterDirection[]).map((f) => (
                                <button
                                    key={f}
                                    onClick={() => { setFilter(f); setSelected(null); }}
                                    className={`flex-1 text-xs font-bold py-1.5 rounded-lg transition
                    ${filter === f ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                                >
                                    {f === 'ALL' ? 'All' : f === 'INBOUND' ? '📥 In' : '📤 Out'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {}
                    <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
                        {loading ? (
                            [...Array(5)].map((_, i) => (
                                <div key={i} className="px-4 py-4 space-y-2 animate-pulse">
                                    <div className="flex gap-2">
                                        <div className="w-20 h-3 bg-gray-200 rounded" />
                                        <div className="w-12 h-3 bg-gray-100 rounded ml-auto" />
                                    </div>
                                    <div className="w-full h-3 bg-gray-200 rounded" />
                                    <div className="w-3/4 h-2.5 bg-gray-100 rounded" />
                                </div>
                            ))
                        ) : filtered.length === 0 ? (
                            <div className="py-16 text-center text-gray-400 text-sm">
                                {search ? 'No emails match your search.' : 'No emails in this view.'}
                            </div>
                        ) : filtered.map((email) => {
                            const isSelected = selected?.id === email.id;
                            return (
                                <button
                                    key={email.id}
                                    onClick={() => { setSelected(email); setShowReply(false); }}
                                    className={`w-full text-left px-4 py-4 transition hover:bg-blue-50/40 ${isSelected ? 'bg-blue-50 border-l-2 border-blue-500' : ''}`}
                                >
                                    <div className="flex items-start justify-between gap-2 mb-1">
                                        <span className="text-sm font-extrabold text-gray-900 truncate">{getLeadName(email)}</span>
                                        <span className="text-xs text-gray-400 flex-shrink-0">{formatDate(email.received_at)}</span>
                                    </div>
                                    <p className="text-xs font-semibold text-gray-700 truncate mb-1">{email.subject}</p>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${DIRECTION_BADGE[email.direction]}`}>
                                            {email.direction === 'INBOUND' ? '📥 Received' : '📤 Sent'}
                                        </span>
                                        <span className="text-[11px] text-gray-400 truncate">{email.body?.slice(0, 40)}…</span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {}
                    <div className="px-4 py-2 border-t border-gray-100 text-xs text-gray-400 font-medium">
                        {filtered.length} email{filtered.length !== 1 ? 's' : ''}
                    </div>
                </div>

                {}
                <div className="hidden lg:flex flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm flex-col overflow-hidden">
                    {!selected ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400 space-y-3">
                            <div className="text-6xl">📭</div>
                            <p className="font-bold text-gray-500">Select an email to read</p>
                            <p className="text-sm text-gray-400 max-w-xs">Click any email in the left pane to view its full content here.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col h-full overflow-hidden">
                            {}
                            <div className="px-6 py-5 border-b border-gray-100 space-y-3">
                                <div className="flex items-start justify-between gap-3">
                                    <h2 className="font-extrabold text-gray-900 text-xl leading-tight">{selected.subject}</h2>
                                    <div className="flex gap-2 flex-shrink-0">
                                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${DIRECTION_BADGE[selected.direction]}`}>
                                            {selected.direction === 'INBOUND' ? '📥 Received' : '📤 Sent'}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between flex-wrap gap-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
                                            {(selected.lead_first_name?.[0] ?? 'L').toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-800">{getLeadName(selected)}</p>
                                            <p className="text-xs text-gray-400">{selected.lead_email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-400">{new Date(selected.received_at).toLocaleString()}</span>
                                        {selected.lead_id && (
                                            <button
                                                onClick={() => navigate(`/crm/leads/${selected.lead_id}`)}
                                                className="text-xs text-blue-600 hover:text-blue-800 font-semibold border border-blue-200 px-2.5 py-1 rounded-lg hover:bg-blue-50 transition"
                                            >
                                                View Lead →
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {}
                            <div className="flex-1 overflow-y-auto px-6 py-5">
                                <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                                    <pre className="text-sm text-gray-800 whitespace-pre-wrap font-sans leading-relaxed">
                                        {selected.body}
                                    </pre>
                                </div>
                            </div>

                            {}
                            <div className="px-6 py-4 border-t border-gray-100">
                                {!showReply ? (
                                    <button
                                        onClick={() => setShowReply(true)}
                                        disabled={selected.direction !== 'INBOUND'}
                                        title={selected.direction === 'OUTBOUND' ? 'Only inbound emails can be replied to' : undefined}
                                        className="inline-flex items-center gap-2 bg-blue-600 text-white font-bold px-5 py-2.5 rounded-xl hover:bg-blue-700 transition text-sm disabled:opacity-50"
                                    >
                                        ↩ Reply
                                    </button>
                                ) : (
                                    <ReplyPanel email={selected} onClose={() => setShowReply(false)} />
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UnifiedInbox;
