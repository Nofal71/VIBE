import React, { useState, useEffect, useCallback } from 'react';
import api from '../../../api/axiosConfig';

// ─── Types ────────────────────────────────────────────────────────────────────

interface TenantField {
    field_name: string;
    field_type: string;
    is_compulsory: number;
    section_name: string;
    order_index: number;
    web_form_visible?: number;
}

type SnippetFormat = 'iframe' | 'html';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const GATEWAY = 'https://api.ihsolution.tech/core';

const toLabel = (snake: string): string =>
    snake.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

const inputTypeFor = (fieldType: string): string => {
    switch (fieldType.toUpperCase()) {
        case 'NUMBER': return 'number';
        case 'DATE': return 'date';
        case 'BOOLEAN': return 'checkbox';
        default: return 'text';
    }
};

// ─── Snippet Generators ───────────────────────────────────────────────────────

const generateIframeSnippet = (tenantId: string): string =>
    `<iframe
  src="${GATEWAY}/web-forms/embed/${tenantId}"
  width="100%"
  height="600"
  frameborder="0"
  allow="clipboard-write"
  title="Contact Form">
</iframe>`;

const generateHtmlSnippet = (tenantId: string, fields: TenantField[]): string => {
    const visibleFields = fields.filter((f) => f.web_form_visible !== 0);
    const inputsHtml = visibleFields.map((f) => `
  <div style="margin-bottom:16px;">
    <label style="display:block;font-weight:600;margin-bottom:4px;">${toLabel(f.field_name)}${f.is_compulsory ? ' *' : ''}</label>
    <input
      type="${inputTypeFor(f.field_type)}"
      name="${f.field_name}"
      ${f.is_compulsory ? 'required' : ''}
      style="width:100%;padding:10px;border:1px solid #d1d5db;border-radius:8px;font-size:14px;"
    />
  </div>`).join('');

    return `<!-- CRM Web-to-Lead Form | Tenant: ${tenantId} -->
<form id="crm-lead-form" style="font-family:Inter,sans-serif;max-width:480px;">
  ${inputsHtml}
  <button type="submit"
    style="background:#4f46e5;color:#fff;padding:12px 28px;border:none;border-radius:8px;font-weight:700;cursor:pointer;width:100%;">
    Submit Enquiry
  </button>
  <p id="crm-form-msg" style="margin-top:12px;font-size:13px;display:none;"></p>
</form>

<script>
(function () {
  const ENDPOINT = '${GATEWAY}/api/web-forms/submit/${tenantId}';
  document.getElementById('crm-lead-form').addEventListener('submit', async function (e) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(this).entries());
    const msg  = document.getElementById('crm-form-msg');
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      msg.style.display = 'block';
      if (res.ok) {
        msg.style.color = '#16a34a';
        msg.textContent = json.message || 'Thank you! We will be in touch shortly.';
        this.reset();
      } else {
        msg.style.color = '#dc2626';
        msg.textContent = json.error || 'Submission failed. Please try again.';
      }
    } catch (err) {
      msg.style.display  = 'block';
      msg.style.color    = '#dc2626';
      msg.textContent    = 'Network error. Please try again.';
    }
  });
})();
</script>`;
};

// ─── Live Preview Component ───────────────────────────────────────────────────

const LivePreview: React.FC<{ fields: TenantField[]; tenantId: string }> = ({ fields, tenantId }) => {
    const [submitted, setSubmitted] = useState(false);
    const [values, setValues] = useState<Record<string, string>>({});
    const visible = fields.filter((f) => f.web_form_visible !== 0);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 4000);
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-7 max-w-md">
            {/* Form header */}
            <div className="mb-5">
                <div className="w-8 h-1.5 rounded bg-indigo-500 mb-2" />
                <h3 className="font-extrabold text-gray-800 text-lg">Get in Touch</h3>
                <p className="text-gray-500 text-xs mt-0.5">Fill in the form and we'll be in touch.</p>
            </div>

            {submitted ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                    <p className="text-2xl mb-1">✅</p>
                    <p className="font-bold text-green-700 text-sm">Thank you! We will be in touch shortly.</p>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-3">
                    {visible.map((f) => (
                        <div key={f.field_name}>
                            <label className="block text-xs font-bold text-gray-600 mb-1">
                                {toLabel(f.field_name)}{f.is_compulsory ? <span className="text-red-500 ml-0.5">*</span> : null}
                            </label>
                            <input
                                type={inputTypeFor(f.field_type)}
                                required={!!f.is_compulsory}
                                value={values[f.field_name] ?? ''}
                                onChange={(e) => setValues((v) => ({ ...v, [f.field_name]: e.target.value }))}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:ring-2 focus:ring-indigo-400 outline-none"
                                placeholder={toLabel(f.field_name)}
                            />
                        </div>
                    ))}
                    <button
                        type="submit"
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold py-2.5 rounded-xl transition text-sm mt-2"
                    >
                        Submit Enquiry →
                    </button>
                    <p className="text-[10px] text-gray-400 text-center">Powered by CRM Platform</p>
                </form>
            )}
        </div>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const WebFormBuilder: React.FC = () => {
    const [fields, setFields] = useState<TenantField[]>([]);
    const [loading, setLoading] = useState(true);
    const [toggling, setToggling] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [snippetFormat, setSnippetFormat] = useState<SnippetFormat>('html');
    const [error, setError] = useState('');

    // Derive tenantId from localStorage (set by auth flow)
    const tenantId = localStorage.getItem('x-tenant-id') ?? 'TENANT_ID';

    const loadFields = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/tenant/settings/fields');
            const rawFields: TenantField[] = res.data?.fields ?? [];

            // Add default visibility if missing
            setFields(rawFields.map((f) => ({
                ...f,
                web_form_visible: f.web_form_visible ?? 1,
            })));
        } catch (err) {
            setError('Failed to load fields. Using demo data.');
            setFields([
                { field_name: 'first_name', field_type: 'TEXT', is_compulsory: 1, section_name: 'Contact', order_index: 1, web_form_visible: 1 },
                { field_name: 'last_name', field_type: 'TEXT', is_compulsory: 1, section_name: 'Contact', order_index: 2, web_form_visible: 1 },
                { field_name: 'email', field_type: 'TEXT', is_compulsory: 0, section_name: 'Contact', order_index: 3, web_form_visible: 1 },
                { field_name: 'phone', field_type: 'TEXT', is_compulsory: 0, section_name: 'Contact', order_index: 4, web_form_visible: 1 },
                { field_name: 'nationality', field_type: 'TEXT', is_compulsory: 0, section_name: 'Details', order_index: 5, web_form_visible: 0 },
            ]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadFields(); }, [loadFields]);

    // Toggle field visibility
    const toggleVisibility = async (fieldName: string, currentVisible: number) => {
        const newVisible = currentVisible === 1 ? 0 : 1;
        setToggling(fieldName);
        // Optimistic update
        setFields((prev) =>
            prev.map((f) => f.field_name === fieldName ? { ...f, web_form_visible: newVisible } : f)
        );
        try {
            await api.put(`/web-forms/visibility/${tenantId}`, {
                field_name: fieldName,
                visible: newVisible === 1,
            });
        } catch {
            // Revert on failure
            setFields((prev) =>
                prev.map((f) => f.field_name === fieldName ? { ...f, web_form_visible: currentVisible } : f)
            );
        } finally {
            setToggling(null);
        }
    };

    // Snippet
    const snippet = snippetFormat === 'iframe'
        ? generateIframeSnippet(tenantId)
        : generateHtmlSnippet(tenantId, fields);

    const copySnippet = async () => {
        try {
            await navigator.clipboard.writeText(snippet);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        } catch {
            // fallback: select textarea
        }
    };

    const visibleCount = fields.filter((f) => f.web_form_visible !== 0).length;

    // ─────────────────────────────────────────────────────────────────────────
    //  RENDER
    // ─────────────────────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen bg-gray-950 text-gray-100 pb-20">
            {/* ── Page Header ── */}
            <div className="bg-gradient-to-r from-indigo-900/60 via-blue-900/40 to-gray-950 border-b border-white/10 px-8 py-9">
                <div className="max-w-7xl mx-auto flex items-start gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-2xl shadow-xl flex-shrink-0">
                        📋
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold text-white">Web-to-Lead Form Builder</h1>
                        <p className="text-gray-400 text-sm mt-1 max-w-2xl">
                            Configure which fields appear on your public lead capture form, then copy the embed code into any website.
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 xl:grid-cols-[1fr_460px] gap-8 items-start">

                {/* LEFT — Field Selector + Code Generator */}
                <div className="space-y-6">

                    {error && (
                        <div className="bg-amber-900/30 border border-amber-800 text-amber-300 text-xs font-semibold rounded-xl px-4 py-3">
                            ⚠ {error}
                        </div>
                    )}

                    {/* ── Field Visibility Panel ── */}
                    <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800 bg-gray-800/40">
                            <div>
                                <h2 className="font-extrabold text-white">Field Visibility</h2>
                                <p className="text-xs text-gray-500 mt-0.5">Toggle which fields appear on the public form.</p>
                            </div>
                            <div className="text-xs font-bold text-indigo-300 bg-indigo-900/40 border border-indigo-800/50 px-3 py-1 rounded-full">
                                {visibleCount} / {fields.length} visible
                            </div>
                        </div>

                        {loading ? (
                            <div className="p-5 space-y-3">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="flex items-center gap-3 animate-pulse">
                                        <div className="w-10 h-6 bg-gray-800 rounded-full" />
                                        <div className="h-4 flex-1 bg-gray-800 rounded" />
                                        <div className="h-4 w-16 bg-gray-800 rounded" />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-800">
                                {fields.map((field) => {
                                    const isVisible = field.web_form_visible !== 0;
                                    const isCore = ['first_name', 'last_name'].includes(field.field_name);

                                    return (
                                        <div key={field.field_name}
                                            className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-800/30 transition group">
                                            {/* Toggle */}
                                            <button
                                                type="button"
                                                onClick={() => !isCore && toggleVisibility(field.field_name, field.web_form_visible ?? 1)}
                                                disabled={isCore || toggling === field.field_name}
                                                title={isCore ? 'Required field — cannot hide' : (isVisible ? 'Hide from form' : 'Show on form')}
                                                className={`relative w-10 h-5 rounded-full transition flex-shrink-0
                          ${isVisible ? 'bg-indigo-500' : 'bg-gray-700'}
                          ${isCore ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:opacity-90'}
                          ${toggling === field.field_name ? 'animate-pulse' : ''}`}
                                            >
                                                <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform
                          ${isVisible ? 'translate-x-5' : 'translate-x-0.5'}`} />
                                            </button>

                                            {/* Field info */}
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm font-bold truncate ${isVisible ? 'text-white' : 'text-gray-500'}`}>
                                                    {toLabel(field.field_name)}
                                                    {field.is_compulsory ? <span className="text-red-400 ml-1 text-[10px]">required</span> : null}
                                                    {isCore ? <span className="text-gray-600 ml-1 text-[10px]">core</span> : null}
                                                </p>
                                                <p className="text-[11px] text-gray-600">{field.section_name} · {field.field_type}</p>
                                            </div>

                                            {/* Status chip */}
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0
                        ${isVisible
                                                    ? 'text-emerald-400 bg-emerald-900/30 border-emerald-800/50'
                                                    : 'text-gray-600 bg-gray-800 border-gray-700'}`}>
                                                {isVisible ? 'Visible' : 'Hidden'}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* ── Code Snippet Generator ── */}
                    <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800 bg-gray-800/40">
                            <div>
                                <h2 className="font-extrabold text-white">Embed Code</h2>
                                <p className="text-xs text-gray-500 mt-0.5">Copy and paste into any HTML page.</p>
                            </div>
                            {/* Format toggle */}
                            <div className="flex rounded-xl overflow-hidden border border-gray-700">
                                {(['html', 'iframe'] as SnippetFormat[]).map((fmt) => (
                                    <button
                                        key={fmt}
                                        onClick={() => setSnippetFormat(fmt)}
                                        className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition
                      ${snippetFormat === fmt ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-500 hover:text-gray-300'}`}
                                    >
                                        {fmt}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Endpoint display */}
                        <div className="px-5 py-3 bg-gray-800/20 border-b border-gray-800">
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Submission Endpoint</p>
                            <code className="text-xs text-emerald-400 font-mono break-all">
                                POST {GATEWAY}/api/web-forms/submit/{tenantId}
                            </code>
                        </div>

                        {/* Snippet */}
                        <div className="relative">
                            <textarea
                                readOnly
                                value={snippet}
                                rows={14}
                                className="w-full bg-gray-950 font-mono text-xs text-green-300 px-5 py-4 resize-none focus:outline-none leading-relaxed"
                                spellCheck={false}
                            />
                            <button
                                onClick={copySnippet}
                                className={`absolute top-3 right-3 text-xs font-bold px-3 py-1.5 rounded-lg transition border
                  ${copied
                                        ? 'bg-emerald-900/50 text-emerald-400 border-emerald-800'
                                        : 'bg-gray-800 text-gray-400 border-gray-700 hover:text-white hover:border-gray-500'}`}
                            >
                                {copied ? '✓ Copied!' : '📋 Copy'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* RIGHT — Live Preview */}
                <div className="xl:sticky xl:top-24 space-y-4">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Live Preview</p>
                    </div>

                    {!loading && (
                        <LivePreview fields={fields} tenantId={tenantId} />
                    )}

                    {loading && (
                        <div className="bg-white rounded-2xl border border-gray-200 p-7 space-y-3 animate-pulse max-w-md">
                            <div className="h-3 w-16 bg-gray-200 rounded" />
                            <div className="h-6 w-32 bg-gray-200 rounded" />
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="space-y-1.5">
                                    <div className="h-3 w-20 bg-gray-200 rounded" />
                                    <div className="h-9 w-full bg-gray-100 rounded-lg" />
                                </div>
                            ))}
                            <div className="h-10 bg-indigo-100 rounded-xl" />
                        </div>
                    )}

                    {/* Usage stats */}
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 space-y-2.5">
                        <p className="text-[10px] font-extrabold text-gray-600 uppercase tracking-widest">Form Summary</p>
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500">Total fields</span>
                            <span className="font-bold text-white">{fields.length}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500">Visible on form</span>
                            <span className="font-bold text-emerald-400">{visibleCount}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500">Required fields</span>
                            <span className="font-bold text-indigo-400">
                                {fields.filter((f) => f.is_compulsory && f.web_form_visible !== 0).length}
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500">Tenant ID</span>
                            <code className="font-mono text-blue-400 text-[11px] truncate max-w-[130px]">{tenantId}</code>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WebFormBuilder;
