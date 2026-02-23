import React, { useState, useEffect } from 'react';
import api from '../../../api/axiosConfig';

type FieldType = 'TEXT' | 'NUMBER' | 'DATE' | 'COUNTRY' | 'TEXTAREA' | 'BOOLEAN';

interface TenantField {
    field_name: string;
    field_type: FieldType;
    is_filterable: boolean;
    is_compulsory: boolean;
    requires_lock: boolean;
    section_name: string;
    order_index: number;
}

const FIELD_TYPES: { value: FieldType; label: string; badge: string }[] = [
    { value: 'TEXT', label: 'Short Text', badge: 'Aa' },
    { value: 'TEXTAREA', label: 'Long Text', badge: '¶' },
    { value: 'NUMBER', label: 'Number / Float', badge: '#' },
    { value: 'DATE', label: 'Date', badge: '📅' },
    { value: 'COUNTRY', label: 'Country / Flag', badge: '🌍' },
    { value: 'BOOLEAN', label: 'Yes / No Toggle', badge: '◉' },
];

const SECTIONS = ['Personal Info', 'Contact Details', 'Financial', 'Legal', 'Custom'];

const FieldBuilder: React.FC = () => {
    const [fields, setFields] = useState<TenantField[]>([]);
    const [saving, setSaving] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [form, setForm] = useState({
        name: '',
        type: 'TEXT' as FieldType,
        is_filterable: false,
        is_compulsory: false,
        requires_lock: false,
        section_name: 'Personal Info',
        order_index: 99,
    });

    useEffect(() => {
        api.get('/tenant/settings/fields')
            .then((res) => setFields(res.data.fields || []))
            .catch(() => {
                setFields([
                    { field_name: 'passport_number', field_type: 'TEXT', is_filterable: false, is_compulsory: true, requires_lock: true, section_name: 'Legal', order_index: 10 },
                    { field_name: 'annual_income', field_type: 'NUMBER', is_filterable: true, is_compulsory: false, requires_lock: true, section_name: 'Financial', order_index: 20 },
                ]);
            });
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim()) return;
        setSaving(true);
        setSuccessMsg('');
        try {
            await api.post('/tenant/settings/fields', form);
            setFields((prev) => [...prev, { ...form, field_name: form.name.toLowerCase().replace(/\s+/g, '_') }] as TenantField[]);
            setSuccessMsg(`Field "${form.name}" added successfully!`);
            setForm({ name: '', type: 'TEXT', is_filterable: false, is_compulsory: false, requires_lock: false, section_name: 'Personal Info', order_index: 99 });
        } catch (err) {
            console.error('Failed to add field:', err);
        } finally {
            setSaving(false);
        }
    };

    const fieldTypeInfo = FIELD_TYPES.find((t) => t.value === form.type)!;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Field Builder</h1>
                <p className="text-sm text-gray-500 mt-1">Add custom fields to the Leads schema for your tenant.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {}
                <form onSubmit={handleSubmit} className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5 self-start">
                    <h2 className="font-extrabold text-gray-800 text-lg">Add New Field</h2>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Field Name *</label>
                        <input
                            required type="text" value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="e.g. passport_number"
                        />
                        {form.name && (
                            <p className="text-xs text-gray-400 mt-1">Column: <code className="font-mono bg-gray-100 px-1 rounded">{form.name.toLowerCase().replace(/\s+/g, '_')}</code></p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Field Type *</label>
                        <div className="grid grid-cols-2 gap-2">
                            {FIELD_TYPES.map((ft) => (
                                <button
                                    key={ft.value} type="button"
                                    onClick={() => setForm({ ...form, type: ft.value })}
                                    className={`flex items-center gap-2 border rounded-xl px-3 py-2.5 text-sm font-semibold transition
                    ${form.type === ft.value
                                            ? 'border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-200'
                                            : 'border-gray-200 text-gray-600 hover:border-blue-300 hover:bg-blue-50/40'
                                        }`}
                                >
                                    <span className="text-lg leading-none">{ft.badge}</span>
                                    <span className="text-xs">{ft.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Assign to Section</label>
                        <select
                            value={form.section_name}
                            onChange={(e) => setForm({ ...form, section_name: e.target.value })}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            {SECTIONS.map((s) => (<option key={s} value={s}>{s}</option>))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Display Order</label>
                        <input
                            type="number" min={1} max={999} value={form.order_index}
                            onChange={(e) => setForm({ ...form, order_index: Number(e.target.value) })}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>

                    {}
                    <div className="space-y-3 pt-2 border-t border-gray-100">
                        {[
                            { key: 'is_compulsory' as const, label: 'Make Compulsory', desc: 'Form will require this field' },
                            { key: 'is_filterable' as const, label: 'Show in Filters', desc: 'Appears in filter sidebar' },
                            { key: 'requires_lock' as const, label: 'Requires Permission Lock', desc: 'Protected by field-level security' },
                        ].map(({ key, label, desc }) => (
                            <label key={key} className="flex items-start gap-3 cursor-pointer group">
                                <input
                                    type="checkbox" checked={form[key]}
                                    onChange={(e) => setForm({ ...form, [key]: e.target.checked })}
                                    className="mt-0.5 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <div>
                                    <span className="text-sm font-semibold text-gray-700">{label}</span>
                                    <p className="text-xs text-gray-400">{desc}</p>
                                </div>
                            </label>
                        ))}
                    </div>

                    {successMsg && (
                        <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-2.5 font-medium">
                            ✓ {successMsg}
                        </div>
                    )}

                    <button
                        type="submit" disabled={saving}
                        className="w-full bg-gray-900 text-white font-bold py-2.5 rounded-xl hover:bg-gray-700 transition disabled:opacity-60"
                    >
                        {saving ? 'Adding Field...' : '+ Add Custom Field'}
                    </button>
                </form>

                {}
                <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden self-start">
                    <div className="px-6 py-4 border-b border-gray-100">
                        <h2 className="font-extrabold text-gray-800">Deployed Fields ({fields.length})</h2>
                    </div>
                    {fields.length === 0 ? (
                        <div className="py-16 text-center text-gray-400 text-sm">No custom fields yet.</div>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-50">
                            <thead className="bg-gray-50">
                                <tr>
                                    {['Column', 'Type', 'Section', 'Filterable', 'Required', 'Locked'].map((h) => (
                                        <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {fields.map((f) => (
                                    <tr key={f.field_name} className="hover:bg-gray-50 transition">
                                        <td className="px-4 py-3 text-sm font-mono text-gray-800">{f.field_name}</td>
                                        <td className="px-4 py-3">
                                            <span className="text-xs bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-full">{f.field_type}</span>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-500">{f.section_name}</td>
                                        <td className="px-4 py-3 text-center">{f.is_filterable ? '✓' : '—'}</td>
                                        <td className="px-4 py-3 text-center">{f.is_compulsory ? '✓' : '—'}</td>
                                        <td className="px-4 py-3 text-center">{f.requires_lock ? '🔒' : '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FieldBuilder;
