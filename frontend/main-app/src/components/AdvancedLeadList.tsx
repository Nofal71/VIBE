import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import RequireFeature from './RequireFeature';



interface Lead {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    status_id?: string;
    country?: string;
    assigned_to?: string;
    [key: string]: unknown;
}

interface TenantField {
    field_name: string;
    field_type: 'TEXT' | 'NUMBER' | 'DATE' | 'COUNTRY' | 'BOOLEAN';
    is_filterable: boolean;
    section_name: string;
}

interface StaffMember {
    id: string;
    email: string;
    role_name: string;
}

interface Stage {
    name: string;
    color: string;
}



const COUNTRIES = [
    'AE', 'US', 'UK', 'CA', 'AU', 'IN', 'PK', 'EG', 'SA', 'NG', 'DE', 'FR', 'SG',
] as const;

type NoteVisibility = 'PUBLIC' | 'PRIVATE' | 'ADMIN_ONLY';



interface QuickNoteModalProps {
    lead: Lead;
    onClose: () => void;
    onSaved: () => void;
}

const QuickNoteModal: React.FC<QuickNoteModalProps> = ({ lead, onClose, onSaved }) => {
    const [content, setContent] = useState('');
    const [visibility, setVisibility] = useState<NoteVisibility>('PUBLIC');
    const [saving, setSaving] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        textareaRef.current?.focus();
        const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;
        setSaving(true);
        try {
            await api.post('/notes', { lead_id: lead.id, content, visibility });
            onSaved();
            onClose();
        } catch (err) {
            console.error('Quick note failed:', err);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

            {}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <h3 className="font-extrabold text-gray-900">📝 Quick Note</h3>
                        <p className="text-xs text-gray-400 mt-0.5">
                            For: <span className="font-semibold text-gray-700">{lead.first_name} {lead.last_name}</span>
                        </p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl font-bold leading-none transition">&times;</button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <textarea
                        ref={textareaRef}
                        required rows={4} value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Type your note here..."
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                    />

                    <div className="flex items-center gap-3">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide flex-shrink-0">Visibility</label>
                        <select
                            value={visibility}
                            onChange={(e) => setVisibility(e.target.value as NoteVisibility)}
                            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            <option value="PUBLIC">🌐 Public — visible to all staff</option>
                            <option value="PRIVATE">🔒 Private — only visible to you</option>
                            <option value="ADMIN_ONLY">👑 Admin Only</option>
                        </select>
                    </div>

                    <div className="flex gap-3">
                        <button type="button" onClick={onClose}
                            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition">
                            Cancel
                        </button>
                        <button type="submit" disabled={saving || !content.trim()}
                            className="flex-1 bg-blue-600 text-white font-bold py-2.5 rounded-xl hover:bg-blue-700 transition disabled:opacity-60">
                            {saving ? 'Saving...' : 'Save Note'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};



const AdvancedLeadList: React.FC = () => {
    const navigate = useNavigate();
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterFields, setFilterFields] = useState<TenantField[]>([]);
    const [stages, setStages] = useState<Stage[]>([]);
    const [staff, setStaff] = useState<StaffMember[]>([]);

    
    const [selected, setSelected] = useState<Set<string>>(new Set());

    
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});

    
    const [bulkAction, setBulkAction] = useState<'assign' | 'stage' | null>(null);
    const [bulkTarget, setBulkTarget] = useState('');
    const [bulkProcessing, setBulkProcessing] = useState(false);

    
    const [quickNoteLead, setQuickNoteLead] = useState<Lead | null>(null);

    
    const [updatingStage, setUpdatingStage] = useState<string | null>(null);

    

    const fetchLeads = useCallback(async (filters: Record<string, string> = {}) => {
        try {
            const params = new URLSearchParams({ limit: '100', ...filters });
            const res = await api.get(`/leads/advanced?${params.toString()}`);
            setLeads(res.data.leads ?? []);
        } catch {
            setLeads([
                { id: 'l-1', first_name: 'Alice', last_name: 'Johnson', email: 'alice@example.com', status_id: 'NEW', country: 'US', assigned_to: 's-1' },
                { id: 'l-2', first_name: 'Bob', last_name: 'Smith', email: 'bob@example.com', status_id: 'CONTACTED', country: 'AE', assigned_to: 's-2' },
                { id: 'l-3', first_name: 'Carol', last_name: 'Al-Rashid', email: 'carol@example.com', status_id: 'WON', country: 'SA', assigned_to: 's-1' },
                { id: 'l-4', first_name: 'David', last_name: 'Chen', email: 'david@example.com', status_id: 'NEW', country: 'SG', assigned_to: 's-3' },
            ]);
        }
    }, []);

    useEffect(() => {
        const load = async () => {
            try {
                const [fieldsRes, stagesRes, staffRes] = await Promise.allSettled([
                    api.get('/tenant/settings/fields'),
                    api.get('/tenant/settings/stages'),
                    api.get('/iam/users'),
                ]);

                if (fieldsRes.status === 'fulfilled') {
                    setFilterFields((fieldsRes.value.data?.fields ?? []).filter((f: TenantField) => f.is_filterable));
                }
                if (stagesRes.status === 'fulfilled') {
                    setStages(stagesRes.value.data?.stages ?? []);
                }
                if (staffRes.status === 'fulfilled') {
                    setStaff(staffRes.value.data?.users ?? []);
                }
            } catch (_) { }

            await fetchLeads();
            setLoading(false);
        };
        load();
    }, [fetchLeads]);

    

    const allSelected = leads.length > 0 && selected.size === leads.length;

    const toggleAll = () => {
        setSelected(allSelected ? new Set() : new Set(leads.map((l) => l.id)));
    };

    const toggleOne = (id: string) => {
        setSelected((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    

    const applyFilters = async () => {
        const clean: Record<string, string> = {};
        for (const [k, v] of Object.entries(activeFilters)) {
            if (v.trim()) clean[k] = v.trim();
        }
        await fetchLeads(clean);
        setSidebarOpen(false);
        setSelected(new Set());
    };

    const clearFilters = async () => {
        setActiveFilters({});
        await fetchLeads({});
        setSidebarOpen(false);
        setSelected(new Set());
    };

    

    const executeBulk = async () => {
        if (!bulkAction || !bulkTarget || selected.size === 0) return;
        setBulkProcessing(true);
        const lead_ids = Array.from(selected);
        try {
            if (bulkAction === 'assign') {
                await api.post('/leads/bulk-assign', { lead_ids, assigned_to: bulkTarget });
                setLeads((prev) => prev.map((l) => selected.has(l.id) ? { ...l, assigned_to: bulkTarget } : l));
            } else if (bulkAction === 'stage') {
                await api.post('/leads/bulk-assign', { lead_ids, status_id: bulkTarget });
                setLeads((prev) => prev.map((l) => selected.has(l.id) ? { ...l, status_id: bulkTarget } : l));
            }
            setSelected(new Set()); setBulkAction(null); setBulkTarget('');
        } catch (err) {
            console.error('[AdvancedLeadList] Bulk action failed:', err);
        } finally {
            setBulkProcessing(false);
        }
    };

    const executeBulkDelete = async () => {
        if (selected.size === 0) return;
        if (!window.confirm(`Delete ${selected.size} selected lead(s)? This cannot be undone.`)) return;
        setBulkProcessing(true);
        try {
            await api.post('/leads/bulk-delete', { lead_ids: Array.from(selected) });
            setLeads((prev) => prev.filter((l) => !selected.has(l.id)));
            setSelected(new Set());
        } catch (err) {
            console.error('[AdvancedLeadList] Bulk delete failed:', err);
        } finally {
            setBulkProcessing(false);
        }
    };

    

    const handleQuickStageChange = async (leadId: string, newStage: string) => {
        setUpdatingStage(leadId);
        try {
            await api.post('/leads/bulk-assign', { lead_ids: [leadId], status_id: newStage });
            setLeads((prev) => prev.map((l) => l.id === leadId ? { ...l, status_id: newStage } : l));
        } catch (err) {
            console.error('[AdvancedLeadList] Quick stage change failed:', err);
        } finally {
            setUpdatingStage(null);
        }
    };

    

    const getStageColor = (statusId?: string): string => {
        const stage = stages.find((s) => s.name.toLowerCase() === statusId?.toLowerCase());
        return stage?.color ?? '#9ca3af';
    };

    const renderFilterInput = (field: TenantField) => {
        const value = activeFilters[field.field_name] ?? '';
        const onChange = (v: string) => setActiveFilters((prev) => ({ ...prev, [field.field_name]: v }));

        if (field.field_type === 'COUNTRY') {
            return (
                <select value={value} onChange={(e) => onChange(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                    <option value="">Any Country</option>
                    {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
            );
        }
        if (field.field_type === 'BOOLEAN') {
            return (
                <select value={value} onChange={(e) => onChange(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                    <option value="">Any</option>
                    <option value="1">Yes</option>
                    <option value="0">No</option>
                </select>
            );
        }
        if (field.field_type === 'DATE') {
            return <input type="date" value={value} onChange={(e) => onChange(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />;
        }
        return <input type={field.field_type === 'NUMBER' ? 'number' : 'text'} value={value}
            placeholder={`Filter by ${field.field_name}`} onChange={(e) => onChange(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />;
    };

    

    return (
        <div className="flex h-full gap-0 relative">
            {}
            {quickNoteLead && (
                <QuickNoteModal
                    lead={quickNoteLead}
                    onClose={() => setQuickNoteLead(null)}
                    onSaved={() => { }} 
                />
            )}

            {}
            <aside className={`fixed lg:relative top-0 left-0 h-full z-40 bg-white border-r border-gray-100 shadow-xl lg:shadow-none transition-all duration-300
          ${sidebarOpen ? 'w-72 translate-x-0' : 'w-0 -translate-x-full lg:translate-x-0 lg:w-0 overflow-hidden'}`}>
                {sidebarOpen && (
                    <div className="w-72 p-5 space-y-5 overflow-y-auto h-full">
                        <div className="flex items-center justify-between">
                            <h3 className="font-extrabold text-gray-900">Filters</h3>
                            <button onClick={() => setSidebarOpen(false)} className="text-gray-400 hover:text-gray-700 text-xl font-bold">&times;</button>
                        </div>

                        {}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Status</label>
                            <select value={activeFilters['status_id'] ?? ''}
                                onChange={(e) => setActiveFilters((p) => ({ ...p, status_id: e.target.value }))}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                                <option value="">Any Status</option>
                                {stages.map((s) => <option key={s.name} value={s.name}>{s.name}</option>)}
                            </select>
                        </div>

                        {}
                        {filterFields.map((field) => (
                            <div key={field.field_name}>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                                    {field.field_name.replace(/_/g, ' ')}
                                </label>
                                {renderFilterInput(field)}
                            </div>
                        ))}

                        <div className="flex gap-2 pt-2">
                            <button onClick={applyFilters}
                                className="flex-1 bg-blue-600 text-white text-sm font-bold py-2 rounded-lg hover:bg-blue-700 transition">
                                Apply
                            </button>
                            <button onClick={clearFilters}
                                className="flex-1 bg-gray-100 text-gray-700 text-sm font-bold py-2 rounded-lg hover:bg-gray-200 transition">
                                Clear
                            </button>
                        </div>
                    </div>
                )}
            </aside>

            {}
            <div className="flex-1 min-w-0 space-y-4">
                {}
                <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Leads</h1>
                        <span className="text-xs bg-gray-100 text-gray-500 px-3 py-1 rounded-full font-semibold">
                            {leads.length} records
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <RequireFeature feature="USE_FILTERS">
                            <button
                                onClick={() => setSidebarOpen((p) => !p)}
                                className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg border transition
                  ${Object.values(activeFilters).some((v) => v)
                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'}`}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                </svg>
                                {Object.values(activeFilters).filter(Boolean).length > 0
                                    ? `Filters (${Object.values(activeFilters).filter(Boolean).length})`
                                    : 'Filter'}
                            </button>
                        </RequireFeature>
                    </div>
                </div>

                {}
                {selected.size > 0 && (
                    <div className="sticky top-4 z-30 bg-gray-900 text-white rounded-2xl px-5 py-3 flex items-center justify-between shadow-xl">
                        <span className="font-bold text-sm">{selected.size} lead{selected.size > 1 ? 's' : ''} selected</span>
                        <div className="flex items-center gap-3">
                            <RequireFeature feature="BULK_DELETE">
                                <button onClick={executeBulkDelete} disabled={bulkProcessing}
                                    className="text-red-400 hover:text-red-300 font-semibold text-sm px-3 py-1.5 rounded-lg border border-red-400/30 hover:border-red-400 transition disabled:opacity-50">
                                    Delete Selected
                                </button>
                            </RequireFeature>

                            {}
                            <div className="flex items-center gap-1">
                                <select
                                    value={bulkAction === 'assign' ? bulkTarget : ''}
                                    onChange={(e) => { setBulkAction('assign'); setBulkTarget(e.target.value); }}
                                    className="text-sm bg-gray-800 text-white border border-gray-600 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-blue-400 outline-none"
                                >
                                    <option value="">Assign to...</option>
                                    {staff.map((s) => <option key={s.id} value={s.id}>{s.email}</option>)}
                                </select>
                            </div>

                            {}
                            <div className="flex items-center gap-1">
                                <select
                                    value={bulkAction === 'stage' ? bulkTarget : ''}
                                    onChange={(e) => { setBulkAction('stage'); setBulkTarget(e.target.value); }}
                                    className="text-sm bg-gray-800 text-white border border-gray-600 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-blue-400 outline-none"
                                >
                                    <option value="">Change Stage...</option>
                                    {stages.map((s) => <option key={s.name} value={s.name}>{s.name}</option>)}
                                </select>
                            </div>

                            {bulkAction && bulkTarget && (
                                <button onClick={executeBulk} disabled={bulkProcessing}
                                    className="bg-blue-500 hover:bg-blue-400 text-white font-bold px-4 py-1.5 rounded-lg text-sm transition disabled:opacity-50">
                                    {bulkProcessing ? 'Applying...' : 'Apply'}
                                </button>
                            )}

                            <button onClick={() => { setSelected(new Set()); setBulkAction(null); setBulkTarget(''); }}
                                className="text-gray-400 hover:text-white transition text-lg font-bold px-2">
                                &times;
                            </button>
                        </div>
                    </div>
                )}

                {}
                {loading ? (
                    <div className="py-20 text-center text-gray-400 animate-pulse">Loading leads...</div>
                ) : (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-100">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-4 w-10">
                                            <input type="checkbox" checked={allSelected} onChange={toggleAll}
                                                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                        </th>
                                        {['Name', 'Email', 'Phone', 'Status', 'Country', 'Assigned', 'Quick Actions'].map((h) => (
                                            <th key={h} className="px-4 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {leads.length === 0 && (
                                        <tr>
                                            <td colSpan={8} className="px-4 py-16 text-center text-gray-400 text-sm">
                                                No leads match your filters.
                                            </td>
                                        </tr>
                                    )}
                                    {leads.map((lead) => {
                                        const isSelected = selected.has(lead.id);
                                        const stageColor = getStageColor(lead.status_id);
                                        const isChangingStage = updatingStage === lead.id;

                                        return (
                                            <tr
                                                key={lead.id}
                                                className={`hover:bg-blue-50/30 transition ${isSelected ? 'bg-blue-50 ring-1 ring-inset ring-blue-200' : ''}`}
                                            >
                                                {}
                                                <td className="px-4 py-3">
                                                    <input type="checkbox" checked={isSelected} onChange={() => toggleOne(lead.id)}
                                                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                                </td>

                                                {}
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm flex-shrink-0">
                                                            {String(lead.first_name ?? '?').charAt(0).toUpperCase()}
                                                        </div>
                                                        <button
                                                            onClick={() => navigate(`/crm/leads/${lead.id}`)}
                                                            className="text-sm font-semibold text-gray-900 hover:text-blue-600 transition text-left"
                                                        >
                                                            {lead.first_name} {lead.last_name}
                                                        </button>
                                                    </div>
                                                </td>

                                                {}
                                                <td className="px-4 py-3 text-sm text-gray-600">{lead.email}</td>

                                                {}
                                                <td className="px-4 py-3 text-sm text-gray-500">{lead.phone ?? '—'}</td>

                                                {}
                                                <td className="px-4 py-3">
                                                    {lead.status_id
                                                        ? <span className="px-2.5 py-0.5 rounded-full text-xs font-bold text-white" style={{ backgroundColor: stageColor }}>
                                                            {lead.status_id}
                                                        </span>
                                                        : '—'}
                                                </td>

                                                {}
                                                <td className="px-4 py-3 text-sm text-gray-500">{lead.country ?? '—'}</td>

                                                {}
                                                <td className="px-4 py-3 text-xs text-gray-400 font-mono">
                                                    {lead.assigned_to ? String(lead.assigned_to).slice(0, 8) + '…' : '—'}
                                                </td>

                                                {}
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        {}
                                                        {stages.length > 0 && (
                                                            <div className="relative">
                                                                {isChangingStage && (
                                                                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-ping" />
                                                                )}
                                                                <select
                                                                    value={lead.status_id ?? ''}
                                                                    disabled={isChangingStage}
                                                                    onChange={(e) => handleQuickStageChange(lead.id, e.target.value)}
                                                                    title="Change Stage"
                                                                    className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer hover:border-blue-300 transition disabled:opacity-60 max-w-[120px]"
                                                                    style={{ borderLeftColor: stageColor, borderLeftWidth: 3 }}
                                                                >
                                                                    <option value="">Stage...</option>
                                                                    {stages.map((s) => (
                                                                        <option key={s.name} value={s.name}>{s.name}</option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                        )}

                                                        {}
                                                        <button
                                                            onClick={() => setQuickNoteLead(lead)}
                                                            title="Add a quick note"
                                                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition text-xs font-semibold">
                                                            📝
                                                        </button>

                                                        {}
                                                        <button
                                                            onClick={() => navigate(`/crm/leads/${lead.id}`)}
                                                            title="Open lead profile"
                                                            className="flex items-center gap-1 px-2 py-1.5 rounded-lg border border-gray-200 text-gray-400 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50 transition text-xs">
                                                            →
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdvancedLeadList;
