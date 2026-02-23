import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';

const SuperAdminLogin: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const res = await api.post('/auth/login', { email, password }, { headers: { 'x-tenant-id': 'public' } });
            const token = res.data.token || res.data.access_token;
            if (token) {
                localStorage.setItem('jwt_token', token);
                window.location.href = '/super-admin/provision';
            } else {
                setError('Login failed: Invalid response from server');
            }
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to login. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 selection:bg-indigo-500/30">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900/20 via-transparent to-purple-900/20 pointer-events-none"></div>

            <div className="relative z-10 w-full max-w-lg bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-2xl overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

                <h1 className="text-3xl font-extrabold text-white text-center mb-2 tracking-tight">Super Admin</h1>
                <p className="text-gray-400 text-sm text-center mb-8">Access the master provisioning portal.</p>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-4 rounded-xl mb-6">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1" htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-gray-950/50 border border-white/10 text-white px-5 py-3.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition placeholder-gray-600"
                            placeholder="admin@ihsolution.tech"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1" htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-gray-950/50 border border-white/10 text-white px-5 py-3.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition placeholder-gray-600"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full relative group mt-8"
                    >
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-30 group-hover:opacity-100 transition duration-500"></div>
                        <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center transition hover:scale-[1.02] active:scale-[0.98]">
                            {loading ? (
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                                </svg>
                            ) : (
                                "Enter System"
                            )}
                        </div>
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-gray-500 text-xs flex items-center justify-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Secured Portal — Authorized access only
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SuperAdminLogin;
