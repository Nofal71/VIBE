import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../../api/axiosConfig';

const ForceChangePassword: React.FC = () => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [status, setStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error', message?: string }>({ type: 'idle' });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setStatus({ type: 'error', message: "Passwords do not match." });
            return;
        }

        if (newPassword.length < 8) {
            setStatus({ type: 'error', message: "Password must be at least 8 characters long." });
            return;
        }

        setStatus({ type: 'loading' });
        try {
            await api.post('/auth/change-password', { new_password: newPassword });
            setStatus({ type: 'success', message: "Password updated successfully! Redirecting..." });

            setTimeout(() => {
                window.location.href = '/crm/dashboard';
            }, 1500);
        } catch (error: any) {
            console.error('Password change error', error);
            setStatus({ type: 'error', message: error.response?.data?.error || "Failed to change password." });
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4 relative overflow-hidden">
            {}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none mix-blend-screen" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none mix-blend-screen" />
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] pointer-events-none mix-blend-overlay" />

            {}
            <div className="relative z-10 w-full max-w-md bg-zinc-900/80 backdrop-blur-2xl border border-white/10 p-10 rounded-3xl shadow-2xl">

                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-gradient-to-tr from-amber-500 to-orange-500 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-xl shadow-orange-500/20">
                        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2 font-display">Update Password</h1>
                    <p className="text-zinc-400 text-sm">Please set a new secure password to continue.</p>
                </div>

                {status.message && (
                    <div className={`p-4 mb-6 rounded-2xl border text-sm font-medium ${status.type === 'success'
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                            : 'bg-red-500/10 border-red-500/20 text-red-400'
                        }`}>
                        {status.type === 'error' && <span className="mr-2">⚠</span>}
                        {status.type === 'success' && <span className="mr-2">✓</span>}
                        {status.message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">New Password</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            className="w-full bg-zinc-950/50 border border-zinc-800 text-white px-5 py-3.5 rounded-2xl focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all placeholder-zinc-700"
                            placeholder="••••••••"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Confirm Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className="w-full bg-zinc-950/50 border border-zinc-800 text-white px-5 py-3.5 rounded-2xl focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all placeholder-zinc-700"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={status.type === 'loading'}
                        className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center transition-all hover:scale-[1.02] active:scale-[0.98] mt-8 shadow-lg shadow-orange-500/20 disabled:opacity-50 disabled:hover:scale-100"
                    >
                        {status.type === 'loading' ? (
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                            </svg>
                        ) : 'Secure My Account'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ForceChangePassword;
