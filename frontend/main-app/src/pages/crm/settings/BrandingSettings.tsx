import React, { useState, useEffect, useRef } from 'react';
import api from '../../../api/axiosConfig';



interface BrandingConfig {
    primary_color: string;
    logo_url: string;
    sidebar_theme: 'dark' | 'light';
}



const COLOR_PRESETS = [
    { label: 'Indigo', value: '#4F46E5' },
    { label: 'Blue', value: '#2563EB' },
    { label: 'Teal', value: '#0D9488' },
    { label: 'Emerald', value: '#059669' },
    { label: 'Rose', value: '#E11D48' },
    { label: 'Orange', value: '#EA580C' },
    { label: 'Slate', value: '#475569' },
    { label: 'Purple', value: '#7C3AED' },
];

type SidebarTheme = 'dark' | 'light';



const BrandingSettings: React.FC = () => {
    const [form, setForm] = useState<BrandingConfig>({
        primary_color: '#4F46E5',
        logo_url: '',
        sidebar_theme: 'dark',
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const importRef = useRef<HTMLInputElement>(null);

    

    useEffect(() => {
        api.get('/tenant/settings/branding')
            .then((res) => {
                const b = res.data?.branding;
                if (b) setForm({ primary_color: b.primary_color ?? '#4F46E5', logo_url: b.logo_url ?? '', sidebar_theme: b.sidebar_theme ?? 'dark' });
            })
            .catch(() => { }) 
            .finally(() => setLoading(false));
    }, []);

    

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setSuccess(false);
        setError('');
        try {
            await api.put('/tenant/settings/branding', form);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            setError('Failed to save branding settings. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    

    const exportTheme = () => {
        const blob = new Blob([JSON.stringify(form, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'crm_theme_template.json';
        a.click();
        URL.revokeObjectURL(url);
    };

    

    const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const parsed = JSON.parse(evt.target?.result as string) as Partial<BrandingConfig>;
                setForm((prev) => ({
                    primary_color: parsed.primary_color ?? prev.primary_color,
                    logo_url: parsed.logo_url ?? prev.logo_url,
                    sidebar_theme: (parsed.sidebar_theme === 'light' || parsed.sidebar_theme === 'dark')
                        ? parsed.sidebar_theme
                        : prev.sidebar_theme,
                }));
                setError('');
            } catch {
                setError('Invalid JSON file. Please upload a valid CRM theme template.');
            }
        };
        reader.readAsText(file);
        
        if (importRef.current) importRef.current.value = '';
    };

    

    if (loading) {
        return <div className="py-20 text-center text-gray-400 animate-pulse">Loading branding settings...</div>;
    }

    return (
        <div className="space-y-8 max-w-3xl">
            {}
            <div>
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Branding & Theme</h1>
                <p className="text-sm text-gray-500 mt-1">Customize your CRM's visual identity. Changes are scoped to this workspace.</p>
            </div>

            {}
            <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
                <div className="flex h-20">
                    {}
                    <div
                        className="w-24 h-full flex flex-col items-center justify-center gap-1.5 transition-colors duration-300"
                        style={{ backgroundColor: form.sidebar_theme === 'dark' ? '#111827' : '#ffffff', borderRight: `1px solid ${form.sidebar_theme === 'dark' ? '#1f2937' : '#e5e7eb'}` }}
                    >
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="w-12 h-2 rounded-full transition-colors duration-300"
                                style={{ backgroundColor: i === 0 ? form.primary_color : (form.sidebar_theme === 'dark' ? '#374151' : '#e5e7eb'), opacity: i === 0 ? 1 : 0.5 }} />
                        ))}
                    </div>
                    {}
                    <div className="flex-1 bg-gray-50 flex flex-col justify-center px-6 gap-2">
                        <div className="flex items-center gap-3">
                            {form.logo_url
                                ? <img src={form.logo_url} alt="logo" className="h-8 object-contain rounded" onError={(e) => (e.currentTarget.style.display = 'none')} />
                                : <div className="w-24 h-5 rounded-md" style={{ backgroundColor: form.primary_color }} />
                            }
                        </div>
                        <div className="flex gap-2">
                            <div className="h-5 w-24 rounded-md" style={{ backgroundColor: form.primary_color }} />
                            <div className="h-5 w-16 rounded-md bg-gray-200" />
                        </div>
                    </div>
                </div>
                <div className="px-4 py-2 bg-gray-100 text-xs text-center text-gray-500 font-medium">
                    Live Preview
                </div>
            </div>

            {}
            <form onSubmit={handleSave} className="space-y-6">

                {}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                    <h2 className="font-extrabold text-gray-800">Primary Color</h2>
                    <div className="flex items-center gap-4 flex-wrap">
                        {}
                        <label className="relative cursor-pointer group">
                            <input
                                type="color"
                                value={form.primary_color}
                                onChange={(e) => setForm({ ...form, primary_color: e.target.value })}
                                className="w-0 h-0 absolute opacity-0 pointer-events-none"
                                id="color-picker-input"
                            />
                            <label htmlFor="color-picker-input" className="cursor-pointer">
                                <div
                                    className="w-12 h-12 rounded-xl border-2 border-gray-200 shadow-inner transition group-hover:scale-105"
                                    style={{ backgroundColor: form.primary_color }}
                                />
                            </label>
                        </label>
                        <input
                            type="text"
                            value={form.primary_color}
                            onChange={(e) => {
                                const v = e.target.value;
                                if (/^#[0-9a-fA-F]{0,6}$/.test(v)) setForm({ ...form, primary_color: v });
                            }}
                            maxLength={7}
                            className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-mono w-32 focus:ring-2 focus:ring-blue-500 outline-none uppercase"
                            placeholder="#4F46E5"
                        />
                    </div>

                    {}
                    <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Presets</p>
                        <div className="flex flex-wrap gap-2">
                            {COLOR_PRESETS.map((p) => (
                                <button
                                    type="button"
                                    key={p.value}
                                    title={p.label}
                                    onClick={() => setForm({ ...form, primary_color: p.value })}
                                    className={`w-8 h-8 rounded-lg border-2 transition hover:scale-110 active:scale-95
                    ${form.primary_color === p.value ? 'border-gray-900 scale-110' : 'border-transparent'}`}
                                    style={{ backgroundColor: p.value }}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-3">
                    <h2 className="font-extrabold text-gray-800">Logo URL</h2>
                    <p className="text-xs text-gray-500">Enter a publicly accessible URL for your company logo. SVG or PNG recommended.</p>
                    <input
                        type="url"
                        value={form.logo_url}
                        onChange={(e) => setForm({ ...form, logo_url: e.target.value })}
                        placeholder="https://your-cdn.com/logo.svg"
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    {form.logo_url && (
                        <div className="mt-2 p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-3">
                            <img
                                src={form.logo_url}
                                alt="Logo preview"
                                className="max-h-10 max-w-[120px] object-contain"
                                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                            />
                            <span className="text-xs text-gray-400">Logo preview</span>
                        </div>
                    )}
                </div>

                {}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-3">
                    <h2 className="font-extrabold text-gray-800">Sidebar Theme</h2>
                    <div className="flex gap-3">
                        {(['dark', 'light'] as SidebarTheme[]).map((mode) => (
                            <button
                                key={mode}
                                type="button"
                                onClick={() => setForm({ ...form, sidebar_theme: mode })}
                                className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition
                  ${form.sidebar_theme === mode ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}
                            >
                                {}
                                <div className={`w-16 h-10 rounded-lg flex gap-1 p-1.5 ${mode === 'dark' ? 'bg-gray-900' : 'bg-white border border-gray-200'}`}>
                                    <div className="w-2 flex flex-col gap-0.5 justify-center">
                                        {[...Array(3)].map((_, i) => (
                                            <div key={i} className={`h-0.5 rounded ${mode === 'dark' ? 'bg-gray-600' : 'bg-gray-300'}`} />
                                        ))}
                                    </div>
                                    <div className={`flex-1 rounded ${mode === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`} />
                                </div>
                                <span className={`text-xs font-bold capitalize ${form.sidebar_theme === mode ? 'text-blue-700' : 'text-gray-600'}`}>
                                    {mode}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <h2 className="font-extrabold text-gray-800 mb-1">Theme Templates</h2>
                    <p className="text-xs text-gray-500 mb-4">
                        Export your current theme as a reusable JSON file, or import a template to apply it instantly.
                    </p>
                    <div className="flex flex-wrap gap-3">
                        <button
                            type="button"
                            onClick={exportTheme}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 text-sm font-bold text-gray-700 transition"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Export Theme Template
                        </button>

                        <button
                            type="button"
                            onClick={() => importRef.current?.click()}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 text-sm font-bold text-gray-700 transition"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l4-4m0 0l4 4m-4-4v12" />
                            </svg>
                            Import Theme Template
                        </button>
                        <input
                            ref={importRef}
                            type="file"
                            accept=".json"
                            onChange={handleImportFile}
                            className="hidden"
                        />
                    </div>
                </div>

                {}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-medium rounded-xl px-4 py-3">
                        ⚠️ {error}
                    </div>
                )}
                {success && (
                    <div className="bg-green-50 border border-green-200 text-green-700 text-sm font-medium rounded-xl px-4 py-3">
                        ✓ Branding settings saved successfully. Reload the app to apply changes everywhere.
                    </div>
                )}

                <button
                    type="submit"
                    disabled={saving}
                    className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-extrabold py-3 rounded-xl hover:from-indigo-700 hover:to-blue-700 transition shadow-lg shadow-indigo-200 disabled:opacity-60"
                >
                    {saving ? 'Saving Branding...' : '💾 Save Branding Settings'}
                </button>
            </form>
        </div>
    );
};

export default BrandingSettings;
