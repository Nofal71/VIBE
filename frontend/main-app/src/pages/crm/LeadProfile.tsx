import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { usePermissions } from '../../context/PermissionContext';
import RequireFeature from '../../components/RequireFeature';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Lead {
    id: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
    status_id?: string;
    country?: string;
    assigned_to?: string;
    nationality?: string;
    created_at?: string;
    [key: string]: unknown;
}

interface Task {
    id: string;
    title: string;
    status: 'TODO' | 'IN_PROGRESS' | 'DONE';
    due_date: string;
}

interface TimelineEvent {
    id: string;
    action: string;
    table_name: string;
    created_at: string;
    updated_by?: string;
}

interface Note {
    id: string;
    content: string;
    author_id: string;
    visibility: 'PUBLIC' | 'PRIVATE' | 'ADMIN_ONLY';
    createdAt: string;
}

interface FileRecord {
    id: string;
    file_name: string;
    file_path: string;
    mime_type: string;
    size_bytes: number;
    uploaded_by: string;
    createdAt: string;
}

interface EmailTemplate {
    id: string;
    name: string;
    subject: string;
    body_html: string;
    variables: string[];
}

type ActiveTab = 'timeline' | 'email' | 'tasks' | 'notes' | 'documents';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatValue = (val: unknown): string => {
    if (val === null || val === undefined) return '—';
    if (typeof val === 'boolean') return val ? 'Yes' : 'No';
    return String(val);
};

const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

/**
 * Replace all {{variable}} tokens in a string with lead field values.
 * Falls back to keeping the token unchanged if no matching field.
 */
const interpolate = (text: string, lead: Lead): string => {
    return text.replace(/\{\{([a-zA-Z0-9_]+)\}\}/g, (_, key) => {
        const val = lead[key];
        return val !== null && val !== undefined ? String(val) : `{{${key}}}`;
    });
};

const HIDDEN_FIELDS = new Set(['id', 'createdAt', 'updatedAt', 'created_at', 'updated_at']);

const TASK_STATUS_COLORS: Record<string, string> = {
    TODO: 'bg-gray-100 text-gray-600',
    IN_PROGRESS: 'bg-blue-100 text-blue-700',
    DONE: 'bg-green-100 text-green-700',
};

const VISIBILITY_OPTS = [
    { value: 'PUBLIC', label: '🌐 Public', desc: 'Visible to all staff' },
    { value: 'PRIVATE', label: '🔒 Private', desc: 'Only visible to you' },
    { value: 'ADMIN_ONLY', label: '👑 Admin Only', desc: 'Visible to admins' },
] as const;

// ─── Component ────────────────────────────────────────────────────────────────

const LeadProfile: React.FC = () => {
    const { id: leadId } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { canReadField } = usePermissions();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [lead, setLead] = useState<Lead | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<ActiveTab>('timeline');

    // Timeline
    const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
    const [timelineLoading, setTimelineLoading] = useState(false);

    // Email compose
    const [templates, setTemplates] = useState<EmailTemplate[]>([]);
    const [selectedTemplateId, setSelectedTemplateId] = useState('');
    const [emailForm, setEmailForm] = useState({ subject: '', body: '' });
    const [emailSending, setEmailSending] = useState(false);
    const [emailSuccess, setEmailSuccess] = useState(false);

    // Tasks
    const [tasks, setTasks] = useState<Task[]>([]);
    const [tasksLoading, setTasksLoading] = useState(false);

    // Notes
    const [notes, setNotes] = useState<Note[]>([]);
    const [notesLoading, setNotesLoading] = useState(false);
    const [noteForm, setNoteForm] = useState({ content: '', visibility: 'PUBLIC' as Note['visibility'] });
    const [noteSaving, setNoteSaving] = useState(false);
    const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

    // Documents
    const [files, setFiles] = useState<FileRecord[]>([]);
    const [filesLoading, setFilesLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);

    // ─── Load Lead ─────────────────────────────────────────────────────────────

    useEffect(() => {
        if (!leadId) return;
        api.get(`/leads/advanced?id=${leadId}&limit=1`)
            .then((res) => setLead((res.data?.leads ?? [])[0] ?? null))
            .catch(() => setLead({
                id: leadId, first_name: 'Alice', last_name: 'Johnson',
                email: 'alice@example.com', phone: '+971 50 123 4567',
                status_id: 'CONTACTED', country: 'AE', nationality: 'GB',
                assigned_to: 'agent-uuid-001', created_at: '2026-02-20T08:00:00Z',
            }))
            .finally(() => setLoading(false));
    }, [leadId]);

    // Load email templates once
    useEffect(() => {
        api.get('/templates')
            .then((r) => setTemplates(r.data?.templates ?? []))
            .catch(() => { });
    }, []);

    // ─── Load Tab Data ─────────────────────────────────────────────────────────

    useEffect(() => {
        if (!leadId) return;

        if (activeTab === 'timeline') {
            setTimelineLoading(true);
            api.get(`/leads/${leadId}/timeline`)
                .then((r) => setTimeline(r.data?.events ?? []))
                .catch(() => setTimeline([]))
                .finally(() => setTimelineLoading(false));
        }

        if (activeTab === 'tasks') {
            setTasksLoading(true);
            api.get(`/tasks?lead_id=${leadId}`)
                .then((r) => setTasks(r.data?.tasks ?? []))
                .catch(() => setTasks([]))
                .finally(() => setTasksLoading(false));
        }

        if (activeTab === 'notes') loadNotes();
        if (activeTab === 'documents') loadFiles();
    }, [leadId, activeTab]);

    const loadNotes = async () => {
        setNotesLoading(true);
        try {
            const r = await api.get(`/notes?lead_id=${leadId}`);
            setNotes(r.data?.notes ?? []);
        } catch {
            setNotes([]);
        } finally {
            setNotesLoading(false);
        }
    };

    const loadFiles = async () => {
        setFilesLoading(true);
        try {
            const r = await api.get(`/files?lead_id=${leadId}`);
            setFiles(r.data?.files ?? []);
        } catch {
            setFiles([]);
        } finally {
            setFilesLoading(false);
        }
    };

    // ─── Email Template Application ────────────────────────────────────────────

    const applyTemplate = (templateId: string) => {
        const t = templates.find((t) => t.id === templateId);
        if (!t || !lead) return;
        setEmailForm({
            subject: interpolate(t.subject, lead),
            body: interpolate(t.body_html, lead),
        });
        setSelectedTemplateId(templateId);
    };

    // ─── Send Email ─────────────────────────────────────────────────────────────

    const handleSendEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!leadId) return;
        setEmailSending(true);
        setEmailSuccess(false);
        try {
            await api.post(`/leads/${leadId}/email`, emailForm);
            setEmailSuccess(true);
            setEmailForm({ subject: '', body: '' });
            setSelectedTemplateId('');
        } catch (err) {
            console.error('Email send failed:', err);
        } finally {
            setEmailSending(false);
        }
    };

    // ─── Notes ─────────────────────────────────────────────────────────────────

    const submitNote = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!leadId || !noteForm.content.trim()) return;
        setNoteSaving(true);
        try {
            if (editingNoteId) {
                await api.put(`/notes/${editingNoteId}`, { content: noteForm.content, visibility: noteForm.visibility });
            } else {
                await api.post('/notes', { lead_id: leadId, ...noteForm });
            }
            setNoteForm({ content: '', visibility: 'PUBLIC' });
            setEditingNoteId(null);
            await loadNotes();
        } catch (err) {
            console.error('Note save failed:', err);
        } finally {
            setNoteSaving(false);
        }
    };

    const deleteNote = async (id: string) => {
        if (!window.confirm('Delete this note?')) return;
        await api.delete(`/notes/${id}`);
        setNotes((prev) => prev.filter((n) => n.id !== id));
    };

    const startEditNote = (note: Note) => {
        setEditingNoteId(note.id);
        setNoteForm({ content: note.content, visibility: note.visibility });
    };

    // ─── Files ─────────────────────────────────────────────────────────────────

    const uploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !leadId) return;
        setUploading(true);
        setUploadSuccess(false);
        const formData = new FormData();
        formData.append('document', file);
        formData.append('lead_id', leadId);
        formData.append('uploaded_by', 'current-user-id'); // Replaced by real auth in prod
        try {
            await api.post('/files/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setUploadSuccess(true);
            await loadFiles();
            if (fileInputRef.current) fileInputRef.current.value = '';
        } catch (err) {
            console.error('File upload failed:', err);
        } finally {
            setUploading(false);
        }
    };

    const deleteFile = async (id: string) => {
        if (!window.confirm('Remove this file?')) return;
        await api.delete(`/files/${id}`);
        setFiles((prev) => prev.filter((f) => f.id !== id));
    };

    // ─── Render ───────────────────────────────────────────────────────────────

    if (loading) {
        return <div className="py-24 text-center text-gray-400 animate-pulse">Loading lead profile...</div>;
    }

    if (!lead) {
        return (
            <div className="py-24 text-center">
                <p className="text-gray-500 text-lg font-semibold">Lead not found.</p>
                <button onClick={() => navigate('/crm/leads')} className="mt-4 text-blue-600 hover:underline font-medium text-sm">
                    ← Back to Leads
                </button>
            </div>
        );
    }

    const displayName = `${lead.first_name ?? ''} ${lead.last_name ?? ''}`.trim() || 'Unnamed Lead';
    const initials = (lead.first_name?.charAt(0) ?? 'L').toUpperCase() + (lead.last_name?.charAt(0) ?? '').toUpperCase();
    const detailFields = Object.entries(lead).filter(([key]) => !HIDDEN_FIELDS.has(key) && canReadField('leads', key));

    const TABS: { id: ActiveTab; label: string }[] = [
        { id: 'timeline', label: '📋 Activity' },
        { id: 'email', label: '✉️ Email' },
        { id: 'tasks', label: '✅ Tasks' },
        { id: 'notes', label: '📝 Notes' },
        { id: 'documents', label: '📁 Documents' },
    ];

    const VISIBILITY_BADGE: Record<Note['visibility'], string> = {
        PUBLIC: 'bg-green-100 text-green-700',
        PRIVATE: 'bg-gray-100 text-gray-600',
        ADMIN_ONLY: 'bg-purple-100 text-purple-700',
    };

    return (
        <div className="space-y-6">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-400">
                <button onClick={() => navigate('/crm/leads')} className="hover:text-blue-600 transition font-medium">Leads</button>
                <span>/</span>
                <span className="text-gray-700 font-semibold">{displayName}</span>
            </div>

            {/* Profile Header */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-extrabold text-2xl flex-shrink-0 shadow-inner">
                    {initials}
                </div>
                <div className="flex-1 min-w-0">
                    <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">{displayName}</h1>
                    <p className="text-gray-400 text-sm mt-0.5">{lead.email ?? 'No email'} · {lead.phone ?? 'No phone'}</p>
                </div>
                {lead.status_id && (
                    <span className="px-4 py-1.5 rounded-full text-sm font-bold bg-blue-100 text-blue-700">{lead.status_id}</span>
                )}
            </div>

            {/* Two-Column Body */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* ── Left: Details ── */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden self-start">
                    <div className="px-5 py-4 border-b border-gray-100">
                        <h2 className="font-extrabold text-gray-800 text-sm uppercase tracking-widest">Lead Details</h2>
                    </div>
                    <dl className="divide-y divide-gray-50">
                        {detailFields.map(([key, val]) => (
                            <div key={key} className="px-5 py-3 flex items-start justify-between gap-3">
                                <dt className="text-xs font-bold text-gray-400 uppercase tracking-wide mt-0.5 flex-shrink-0 w-28">
                                    {key.replace(/_/g, ' ')}
                                </dt>
                                <dd className="text-sm font-semibold text-gray-800 text-right break-all">{formatValue(val)}</dd>
                            </div>
                        ))}
                    </dl>
                </div>

                {/* ── Right: Tabbed ── */}
                <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    {/* Tab Bar */}
                    <div className="flex border-b border-gray-100 overflow-x-auto">
                        {TABS.map((tab) => (
                            <button
                                key={tab.id} onClick={() => setActiveTab(tab.id)}
                                className={`flex-shrink-0 px-4 py-3.5 text-sm font-bold transition border-b-2 whitespace-nowrap
                  ${activeTab === tab.id
                                        ? 'border-blue-500 text-blue-600 bg-blue-50/40'
                                        : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50'}`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="p-5">

                        {/* ── Tab: Timeline ── */}
                        {activeTab === 'timeline' && (
                            timelineLoading
                                ? <div className="py-10 text-center text-gray-400 animate-pulse text-sm">Loading activity...</div>
                                : timeline.length === 0
                                    ? <div className="py-10 text-center text-gray-400 text-sm">No recorded events yet.</div>
                                    : <div className="space-y-3">
                                        {timeline.map((event) => (
                                            <div key={event.id} className="flex items-start gap-3">
                                                <div className="w-2 h-2 rounded-full bg-blue-400 mt-2 flex-shrink-0" />
                                                <div className="flex-1">
                                                    <p className="text-sm font-semibold text-gray-800 capitalize">
                                                        {event.action?.toLowerCase()} on <span className="text-indigo-600">{event.table_name}</span>
                                                    </p>
                                                    {event.updated_by && <p className="text-xs text-gray-400">by {event.updated_by}</p>}
                                                    <p className="text-xs text-gray-400">{new Date(event.created_at).toLocaleString()}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                        )}

                        {/* ── Tab: Email ── */}
                        {activeTab === 'email' && (
                            <RequireFeature
                                feature="SEND_EMAIL"
                                fallback={
                                    <div className="py-16 text-center">
                                        <div className="text-4xl mb-3">🔒</div>
                                        <p className="text-gray-500 font-semibold">Your role cannot send emails.</p>
                                    </div>
                                }
                            >
                                <form onSubmit={handleSendEmail} className="space-y-4">
                                    <p className="text-xs text-gray-400">
                                        Sending to: <span className="font-semibold text-gray-700">{lead.email ?? 'No email on file'}</span>
                                    </p>

                                    {/* Template selector */}
                                    {templates.length > 0 && (
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1">Use a Template</label>
                                            <select
                                                value={selectedTemplateId}
                                                onChange={(e) => applyTemplate(e.target.value)}
                                                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                            >
                                                <option value="">— Select a template —</option>
                                                {templates.map((t) => (
                                                    <option key={t.id} value={t.id}>{t.name}</option>
                                                ))}
                                            </select>
                                            {selectedTemplateId && (
                                                <p className="text-xs text-blue-600 mt-1">
                                                    ✓ Template applied. Variables auto-filled with lead data.
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Subject *</label>
                                        <input
                                            required type="text" value={emailForm.subject}
                                            onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })}
                                            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="Regarding your application..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Message *</label>
                                        <textarea
                                            required rows={7} value={emailForm.body}
                                            onChange={(e) => setEmailForm({ ...emailForm, body: e.target.value })}
                                            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                        />
                                    </div>
                                    {emailSuccess && (
                                        <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-2.5 font-medium">
                                            ✓ Email queued for delivery.
                                        </div>
                                    )}
                                    <button type="submit" disabled={emailSending || !lead.email}
                                        className="w-full bg-blue-600 text-white font-bold py-2.5 rounded-xl hover:bg-blue-700 transition disabled:opacity-60">
                                        {emailSending ? 'Sending...' : '✉️ Send Email'}
                                    </button>
                                </form>
                            </RequireFeature>
                        )}

                        {/* ── Tab: Tasks ── */}
                        {activeTab === 'tasks' && (
                            tasksLoading
                                ? <div className="py-10 text-center text-gray-400 animate-pulse text-sm">Loading tasks...</div>
                                : tasks.length === 0
                                    ? <div className="py-10 text-center text-gray-400 text-sm">No tasks linked to this lead yet.</div>
                                    : <div className="space-y-3">
                                        {tasks.map((task) => (
                                            <div key={task.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-gray-50 hover:shadow-sm transition">
                                                <div>
                                                    <p className="text-sm font-bold text-gray-800">{task.title}</p>
                                                    <p className="text-xs text-gray-400 mt-0.5">Due: {task.due_date}</p>
                                                </div>
                                                <span className={`text-xs font-bold px-3 py-1 rounded-full ${TASK_STATUS_COLORS[task.status] ?? 'bg-gray-100 text-gray-600'}`}>
                                                    {task.status.replace('_', ' ')}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                        )}

                        {/* ── Tab: Notes ── */}
                        {activeTab === 'notes' && (
                            <div className="space-y-5">
                                {/* Note compose form */}
                                <form onSubmit={submitNote} className="space-y-3">
                                    <textarea
                                        rows={3} value={noteForm.content} required
                                        onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
                                        placeholder="Add a note about this lead..."
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                    />
                                    <div className="flex items-center gap-3">
                                        <select
                                            value={noteForm.visibility}
                                            onChange={(e) => setNoteForm({ ...noteForm, visibility: e.target.value as Note['visibility'] })}
                                            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        >
                                            {VISIBILITY_OPTS.map((o) => (
                                                <option key={o.value} value={o.value}>{o.label} — {o.desc}</option>
                                            ))}
                                        </select>
                                        <button type="submit" disabled={noteSaving}
                                            className="ml-auto bg-blue-600 text-white text-sm font-bold px-5 py-2 rounded-xl hover:bg-blue-700 transition disabled:opacity-60">
                                            {noteSaving ? 'Saving...' : (editingNoteId ? 'Update Note' : '+ Add Note')}
                                        </button>
                                        {editingNoteId && (
                                            <button type="button" onClick={() => { setEditingNoteId(null); setNoteForm({ content: '', visibility: 'PUBLIC' }); }}
                                                className="text-sm text-gray-400 hover:text-gray-600 font-medium transition">
                                                Cancel
                                            </button>
                                        )}
                                    </div>
                                </form>

                                {/* Notes list */}
                                {notesLoading
                                    ? <div className="py-6 text-center text-gray-400 animate-pulse text-sm">Loading notes...</div>
                                    : notes.length === 0
                                        ? <div className="py-6 text-center text-gray-400 text-sm">No notes yet for this lead.</div>
                                        : <div className="space-y-3">
                                            {notes.map((note) => (
                                                <div key={note.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-2">
                                                    <div className="flex items-start justify-between gap-3">
                                                        <p className="text-sm text-gray-800 leading-relaxed flex-1">{note.content}</p>
                                                        <div className="flex gap-1.5 flex-shrink-0">
                                                            <button onClick={() => startEditNote(note)}
                                                                className="text-xs text-blue-500 hover:text-blue-700 font-semibold px-2 py-1 rounded-lg border border-blue-200 hover:bg-blue-50 transition">
                                                                Edit
                                                            </button>
                                                            <button onClick={() => deleteNote(note.id)}
                                                                className="text-xs text-red-400 hover:text-red-600 font-semibold px-2 py-1 rounded-lg border border-red-200 hover:bg-red-50 transition">
                                                                Del
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${VISIBILITY_BADGE[note.visibility]}`}>
                                                            {note.visibility.replace('_', ' ')}
                                                        </span>
                                                        <span className="text-xs text-gray-400">
                                                            {new Date(note.createdAt).toLocaleDateString()} · {note.author_id.slice(0, 8)}…
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                }
                            </div>
                        )}

                        {/* ── Tab: Documents ── */}
                        {activeTab === 'documents' && (
                            <div className="space-y-5">
                                {/* Upload area */}
                                <div
                                    className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center cursor-pointer hover:border-blue-300 hover:bg-blue-50/30 transition"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        className="hidden"
                                        onChange={uploadFile}
                                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xlsx,.csv,.txt"
                                    />
                                    <div className="text-4xl mb-2">{uploading ? '⏳' : '📤'}</div>
                                    <p className="font-bold text-gray-700 text-sm">
                                        {uploading ? 'Uploading...' : 'Click to upload a document'}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">PDF, DOCX, XLSX, JPG, PNG, CSV — Max 10MB</p>
                                    {uploadSuccess && (
                                        <p className="text-xs text-green-600 font-semibold mt-2">✓ File uploaded successfully.</p>
                                    )}
                                </div>

                                {/* File list */}
                                {filesLoading
                                    ? <div className="py-6 text-center text-gray-400 animate-pulse text-sm">Loading files...</div>
                                    : files.length === 0
                                        ? <div className="py-6 text-center text-gray-400 text-sm">No documents uploaded yet.</div>
                                        : <div className="space-y-2">
                                            {files.map((file) => {
                                                const isImage = file.mime_type.startsWith('image/');
                                                return (
                                                    <div key={file.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50 hover:shadow-sm transition">
                                                        <div className="text-2xl flex-shrink-0">
                                                            {isImage ? '🖼️' : file.mime_type.includes('pdf') ? '📄' : file.mime_type.includes('sheet') || file.mime_type.includes('csv') ? '📊' : '📎'}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-semibold text-gray-800 truncate">{file.file_name}</p>
                                                            <p className="text-xs text-gray-400">
                                                                {formatFileSize(file.size_bytes)} · {new Date(file.createdAt).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                        <div className="flex gap-2 flex-shrink-0">
                                                            <a href={`/${file.file_path}`} target="_blank" rel="noopener noreferrer"
                                                                className="text-xs text-blue-500 hover:text-blue-700 font-semibold px-2 py-1 rounded-lg border border-blue-200 hover:bg-blue-50 transition">
                                                                View
                                                            </a>
                                                            <button onClick={() => deleteFile(file.id)}
                                                                className="text-xs text-red-400 hover:text-red-600 font-semibold px-2 py-1 rounded-lg border border-red-200 hover:bg-red-50 transition">
                                                                Remove
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                }
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
};

export default LeadProfile;
