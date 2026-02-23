import React, { useState, useEffect } from 'react';
import api from '../../../api/axiosConfig';



interface EmailTemplate {
    id: string;
    name: string;
    subject: string;
    body_html: string;
    variables: string[];
}


const COMMON_VARIABLES = [
    { key: 'first_name', label: 'First Name' },
    { key: 'last_name', label: 'Last Name' },
    { key: 'email', label: 'Email Address' },
    { key: 'company', label: 'Company Name' },
    { key: 'phone', label: 'Phone Number' },
    { key: 'country', label: 'Country' },
    { key: 'status_id', label: 'Lead Status' },
    { key: 'assigned_to', label: 'Assigned Agent' },
];

const EMPTY_FORM = {
    name: '',
    subject: '',
    body_html: '',
};



const EmailTemplateBuilder: React.FC = () => {
    const [templates, setTemplates] = useState<EmailTemplate[]>([]);
    const [form, setForm] = useState(EMPTY_FORM);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);

    

    useEffect(() => {
        loadTemplates();
    }, []);

    const loadTemplates = async () => {
        setLoading(true);
        try {
            const res = await api.get('/templates');
            setTemplates(res.data?.templates ?? []);
        } catch {
            setTemplates([]);
        } finally {
            setLoading(false);
        }
    };

    

    const injectVariable = (varKey: string) => {
        const tag = `{{${varKey}}}`;
        setForm((prev) => ({ ...prev, body_html: prev.body_html + tag }));
    };

    const injectIntoSubject = (varKey: string) => {
        const tag = `{{${varKey}}}`;
        setForm((prev) => ({ ...prev, subject: prev.subject + tag }));
    };

    

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setSuccess(false);
        try {
            if (editingId) {
                await api.put(`/templates/${editingId}`, form);
            } else {
                await api.post('/templates', form);
            }
            setSuccess(true);
            setForm(EMPTY_FORM);
            setEditingId(null);
            await loadTemplates();
        } catch (err) {
            console.error('Failed to save template:', err);
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (t: EmailTemplate) => {
        setEditingId(t.id);
        setForm({ name: t.name, subject: t.subject, body_html: t.body_html });
        setSuccess(false);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Delete this template?')) return;
        await api.delete(`/templates/${id}`);
        setTemplates((prev) => prev.filter((t) => t.id !== id));
    };

    const handleCancel = () => {
        setEditingId(null);
        setForm(EMPTY_FORM);
        setSuccess(false);
    };

    

    return (
        <div className="space-y-8">
            {}
            <div>
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Email Template Builder</h1>
                <p className="text-sm text-gray-500 mt-1">Create reusable email templates with dynamic variable injection.</p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">

                {}
                <div className="xl:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <h2 className="font-extrabold text-gray-800">
                            {editingId ? '✏️ Edit Template' : '➕ New Template'}
                        </h2>
                        {editingId && (
                            <button onClick={handleCancel} className="text-sm text-gray-400 hover:text-gray-600 transition font-medium">
                                Cancel
                            </button>
                        )}
                    </div>

                    <form onSubmit={handleSave} className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Template Name *</label>
                            <input
                                required type="text" value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                placeholder="e.g. Follow-Up Email"
                                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Subject Line *</label>
                            <div className="flex gap-2">
                                <input
                                    required type="text" value={form.subject}
                                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                                    placeholder="Hello {{first_name}}, regarding your enquiry..."
                                    className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                                <div className="relative group">
                                    <button
                                        type="button"
                                        className="px-3 py-2.5 border border-gray-200 rounded-xl text-xs text-gray-500 hover:bg-gray-50 transition whitespace-nowrap"
                                    >
                                        + Variable
                                    </button>
                                    <div className="absolute right-0 top-full mt-1 z-20 hidden group-hover:block w-44 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden">
                                        {COMMON_VARIABLES.map((v) => (
                                            <button
                                                key={v.key} type="button"
                                                onClick={() => injectIntoSubject(v.key)}
                                                className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition"
                                            >
                                                <span className="font-mono text-blue-600">{`{{${v.key}}}`}</span>
                                                <span className="ml-1 text-gray-400">— {v.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Email Body *</label>
                            <textarea
                                required rows={10} value={form.body_html}
                                onChange={(e) => setForm({ ...form, body_html: e.target.value })}
                                placeholder={`Dear {{first_name}},\n\nThank you for your interest. We wanted to follow up on your enquiry.\n\nBest regards,\n{{assigned_to}}`}
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-mono focus:ring-2 focus:ring-blue-500 outline-none resize-y"
                            />
                            <p className="text-xs text-gray-400 mt-1">
                                Use <span className="font-mono text-blue-600">{'{{variable_name}}'}</span> syntax. Variables are replaced with actual lead data when sending.
                            </p>
                        </div>

                        {success && (
                            <div className="bg-green-50 border border-green-200 text-green-700 text-sm font-medium rounded-xl px-4 py-3">
                                ✓ Template saved successfully.
                            </div>
                        )}

                        <button
                            type="submit" disabled={saving}
                            className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition disabled:opacity-60"
                        >
                            {saving ? 'Saving...' : (editingId ? 'Update Template' : 'Save Template')}
                        </button>
                    </form>
                </div>

                {}
                <div className="xl:col-span-2 space-y-4">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-100">
                            <h3 className="font-extrabold text-gray-800 text-sm">🔧 Available Variables</h3>
                            <p className="text-xs text-gray-400 mt-0.5">Click to inject into the body</p>
                        </div>
                        <div className="p-4 grid grid-cols-1 gap-2">
                            {COMMON_VARIABLES.map((v) => (
                                <button
                                    key={v.key} type="button"
                                    onClick={() => injectVariable(v.key)}
                                    className="flex items-center justify-between px-4 py-2.5 rounded-xl border border-gray-100 bg-gray-50 hover:bg-blue-50 hover:border-blue-200 transition group"
                                >
                                    <span className="font-mono text-sm text-blue-600 group-hover:text-blue-700">
                                        {`{{${v.key}}}`}
                                    </span>
                                    <span className="text-xs text-gray-400 group-hover:text-blue-500">{v.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {}
                    {form.body_html && (
                        <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4">
                            <p className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-2">Detected Variables</p>
                            <div className="flex flex-wrap gap-2">
                                {[...new Set((form.body_html + ' ' + form.subject).match(/\{\{([a-zA-Z0-9_]+)\}\}/g) ?? [])]
                                    .map((v) => (
                                        <span key={v} className="text-xs font-mono bg-indigo-100 text-indigo-700 px-2 py-1 rounded-lg">
                                            {v}
                                        </span>
                                    ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="font-extrabold text-gray-800">Saved Templates</h2>
                </div>
                {loading ? (
                    <div className="py-10 text-center text-gray-400 animate-pulse text-sm">Loading templates...</div>
                ) : templates.length === 0 ? (
                    <div className="py-10 text-center text-gray-400 text-sm">No templates yet. Create your first one above.</div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {templates.map((t) => (
                            <div key={t.id} className="px-6 py-4 flex items-start justify-between gap-4 hover:bg-gray-50/50 transition">
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-gray-900 text-sm">{t.name}</p>
                                    <p className="text-xs text-gray-500 mt-0.5 truncate">{t.subject}</p>
                                    {t.variables.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {t.variables.map((v) => (
                                                <span key={v} className="text-xs font-mono bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md">
                                                    {`{{${v}}}`}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-2 flex-shrink-0">
                                    <button
                                        onClick={() => handleEdit(t)}
                                        className="text-sm text-blue-600 hover:text-blue-800 font-semibold transition px-3 py-1.5 rounded-lg border border-blue-200 hover:bg-blue-50"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(t.id)}
                                        className="text-sm text-red-500 hover:text-red-700 font-semibold transition px-3 py-1.5 rounded-lg border border-red-200 hover:bg-red-50"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmailTemplateBuilder;
