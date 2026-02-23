import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';

const ProvisioningDashboard: React.FC = () => {
    const [formData, setFormData] = useState({
        company_name: '',
        domain: '',
        plan_id: '',
        department_id: '',
    });

    const [domainType, setDomainType] = useState<'subdomain' | 'custom'>('subdomain');
    const [status, setStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error', message?: string, credentials?: { email: string; password: string; } }>({ type: 'idle' });
    const [blueprints, setBlueprints] = useState<any[]>([]);

    useEffect(() => {
        const fetchBlueprints = async () => {
            try {
                const res = await api.get('/blueprints');
                setBlueprints(res.data.blueprints || res.data || []);
            } catch (error) {
                console.error("Failed to fetch blueprints:", error);
            }
        };
        fetchBlueprints();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus({ type: 'loading' });

        try {
            const finalDomain = domainType === 'subdomain' ? `${formData.domain}.ihsolution.tech` : formData.domain;
            const payload = { ...formData, domain: finalDomain };
            const response = await api.post('/provision', payload);
            setStatus({
                type: 'success',
                message: `Company Provisioned successfully: ${response.data.company.db_name}`,
                credentials: { email: response.data.adminEmail, password: response.data.tempPassword }
            });
            setFormData({ company_name: '', domain: '', plan_id: '', department_id: '' });
            setDomainType('subdomain');
        } catch (error: any) {
            console.error('Provisioning Error', error);
            setStatus({ type: 'error', message: error.response?.data?.error || 'Failed to provision company' });
        }
    };

    return (
        <div className="max-w-3xl mx-auto mt-10 p-8 bg-slate-900 border border-slate-800 shadow-2xl rounded-2xl">
            <h2 className="text-2xl font-bold mb-6 text-white tracking-tight">Super Admin Provisioning</h2>

            {status.message && (
                <div className={`p-4 mb-6 rounded-xl border ${status.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                    {status.message}
                </div>
            )}

            {status.credentials && (
                <div className="mb-6 bg-slate-800 border-l-4 border-indigo-500 p-6 rounded-r-xl shadow-lg">
                    <h3 className="text-lg font-bold text-white mb-4">First-Time Login Credentials</h3>
                    <p className="text-sm text-slate-300 mb-4">Please copy these credentials safely. The password will need to be changed upon first login.</p>
                    <div className="space-y-3">
                        <div className="flex bg-slate-900 rounded p-3 justify-between items-center border border-slate-700">
                            <span className="text-xs text-gray-400 font-bold w-20">Email:</span>
                            <span className="text-sm font-mono text-green-400 flex-1 ml-2">{status.credentials.email}</span>
                        </div>
                        <div className="flex bg-slate-900 rounded p-3 justify-between items-center border border-slate-700">
                            <span className="text-xs text-gray-400 font-bold w-20">Password:</span>
                            <span className="text-sm font-mono text-amber-400 flex-1 ml-2">{status.credentials.password}</span>
                        </div>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Company Name</label>
                    <input
                        type="text"
                        name="company_name"
                        value={formData.company_name}
                        onChange={handleChange}
                        required
                        className="w-full bg-slate-950/50 border border-slate-700 text-white px-5 py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition placeholder-slate-600"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">Domain Configuration</label>
                    <div className="flex gap-4 mb-4">
                        <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition ${domainType === 'subdomain' ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300' : 'bg-slate-950/50 border-slate-800 text-slate-500 hover:bg-slate-900'}`}>
                            <input type="radio" name="domainType" value="subdomain" checked={domainType === 'subdomain'} onChange={() => setDomainType('subdomain')} className="hidden" />
                            <span className="text-sm font-bold">Use Subdomain</span>
                        </label>
                        <label className={`flex-1 flex flex-col items-center justify-center gap-0.5 p-3 rounded-xl border cursor-pointer transition ${domainType === 'custom' ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300' : 'bg-slate-950/50 border-slate-800 text-slate-500 hover:bg-slate-900'}`}>
                            <input type="radio" name="domainType" value="custom" checked={domainType === 'custom'} onChange={() => setDomainType('custom')} className="hidden" />
                            <span className="text-sm font-bold">Custom Domain</span>
                            <span className="text-[9px] font-black uppercase tracking-wider text-amber-500/80 bg-amber-500/10 px-2 py-0.5 rounded">Pro/Enterprise Plan Required</span>
                        </label>
                    </div>

                    <div className="flex bg-slate-950/50 border border-slate-700 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition">
                        <input
                            type="text"
                            name="domain"
                            value={formData.domain}
                            onChange={handleChange}
                            placeholder={domainType === 'subdomain' ? "e.g. elite" : "e.g. www.elite.com"}
                            required
                            className="flex-1 bg-transparent text-white px-5 py-3.5 focus:outline-none placeholder-slate-600 min-w-0"
                        />
                        {domainType === 'subdomain' && (
                            <div className="flex items-center px-4 bg-slate-900 border-l border-slate-700 text-slate-400 text-sm font-mono select-none">
                                .ihsolution.tech
                            </div>
                        )}
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Plan</label>
                    <select
                        name="plan_id"
                        value={formData.plan_id}
                        onChange={handleChange}
                        required
                        className="w-full bg-slate-950/50 border border-slate-700 text-white px-5 py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    >
                        <option value="">Select a Plan...</option>
                        <option value="uuid-starter-plan">Starter (uuid-starter-plan)</option>
                        <option value="uuid-pro-plan">Pro (uuid-pro-plan)</option>
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Department Blueprint</label>
                    <select
                        name="department_id"
                        value={formData.department_id}
                        onChange={handleChange}
                        required
                        className="w-full bg-slate-950/50 border border-slate-700 text-white px-5 py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    >
                        <option value="">Select a Blueprint...</option>
                        {blueprints.map(bp => (
                            <option key={bp.id} value={bp.id}>{bp.name}</option>
                        ))}
                    </select>
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={status.type === 'loading'}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 rounded-xl flex items-center justify-center transition hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none"
                    >
                        {status.type === 'loading' ? (
                            <div className="flex items-center gap-2">
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                                </svg>
                                Provisioning...
                            </div>
                        ) : 'Provision Tenant Database'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProvisioningDashboard;
