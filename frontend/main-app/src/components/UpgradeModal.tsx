import React, { useEffect } from 'react';
import { usePlanLimits } from '../context/PlanLimitContext';



interface PlanCard {
    name: string;
    price: string;
    period: string;
    highlight: boolean;
    features: string[];
}

const PLANS: PlanCard[] = [
    {
        name: 'Growth',
        price: '$49',
        period: '/month',
        highlight: false,
        features: [
            '5,000 Leads',
            '10 Team Members',
            'Email Templates',
            'Pipeline Stages',
            'File Uploads (5 GB)',
        ],
    },
    {
        name: 'Pro',
        price: '$99',
        period: '/month',
        highlight: true,
        features: [
            'Unlimited Leads',
            '50 Team Members',
            'Email Templates + Sequences',
            'Custom Stages & Fields',
            'File Uploads (50 GB)',
            'Priority Support',
            'Advanced Analytics',
        ],
    },
    {
        name: 'Enterprise',
        price: 'Custom',
        period: '',
        highlight: false,
        features: [
            'Unlimited Everything',
            'Dedicated Account Manager',
            'Custom Integrations',
            'SLA 99.99% Uptime',
            'On-Premise Option',
        ],
    },
];



const UpgradeModal: React.FC = () => {
    const { showUpgradeModal, setShowUpgradeModal, limitReason, planLimits } = usePlanLimits();

    
    useEffect(() => {
        if (showUpgradeModal) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [showUpgradeModal]);

    
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setShowUpgradeModal(false);
        };
        if (showUpgradeModal) window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [showUpgradeModal, setShowUpgradeModal]);

    if (!showUpgradeModal) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
            {}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-md"
                onClick={() => setShowUpgradeModal(false)}
            />

            {}
            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl mx-4 overflow-hidden max-h-[90vh] overflow-y-auto">

                {}
                <div className="relative bg-gradient-to-br from-indigo-600 via-blue-600 to-purple-700 px-8 py-10 text-white text-center overflow-hidden">
                    {}
                    <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/10 rounded-full" />
                    <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-white/10 rounded-full" />

                    <button
                        onClick={() => setShowUpgradeModal(false)}
                        className="absolute top-4 right-4 text-white/70 hover:text-white text-3xl font-bold leading-none transition"
                    >
                        &times;
                    </button>

                    <div className="relative">
                        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-4 py-1.5 rounded-full mb-4 uppercase tracking-widest">
                            🚀 Plan Limit Reached
                        </div>
                        <h2 className="text-3xl font-extrabold tracking-tight mb-3">
                            You've Reached Your Plan's Capacity
                        </h2>
                        <p className="text-white/80 text-sm max-w-xl mx-auto leading-relaxed">
                            {limitReason || 'You have reached the limit of your current plan. Upgrade to unlock unlimited access and premium features.'}
                        </p>

                        {}
                        {Object.keys(planLimits).length > 0 && (
                            <div className="mt-6 inline-flex flex-wrap gap-4 justify-center">
                                {planLimits.max_leads !== undefined && (
                                    <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 text-sm">
                                        <span className="font-bold">{planLimits.max_leads?.toLocaleString()}</span>
                                        <span className="text-white/70 ml-1">lead limit</span>
                                    </div>
                                )}
                                {planLimits.max_users !== undefined && (
                                    <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 text-sm">
                                        <span className="font-bold">{planLimits.max_users}</span>
                                        <span className="text-white/70 ml-1">user limit</span>
                                    </div>
                                )}
                                {planLimits.max_file_storage_mb !== undefined && (
                                    <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 text-sm">
                                        <span className="font-bold">{Math.round((planLimits.max_file_storage_mb ?? 0) / 1024)} GB</span>
                                        <span className="text-white/70 ml-1">storage</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {}
                <div className="p-8">
                    <p className="text-center text-sm text-gray-500 font-medium mb-6">
                        Choose a plan that fits your team's growth
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {PLANS.map((plan) => (
                            <div
                                key={plan.name}
                                className={`relative rounded-2xl border-2 p-6 flex flex-col transition hover:shadow-lg
                  ${plan.highlight
                                        ? 'border-blue-500 shadow-blue-100 shadow-xl bg-blue-50'
                                        : 'border-gray-200 bg-white'}`}
                            >
                                {plan.highlight && (
                                    <div className="absolute -top-3 left-0 right-0 flex justify-center">
                                        <span className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs font-extrabold px-4 py-1 rounded-full uppercase tracking-widest shadow-md">
                                            Most Popular
                                        </span>
                                    </div>
                                )}

                                <div className="mb-4 mt-2">
                                    <h3 className={`font-extrabold text-lg ${plan.highlight ? 'text-blue-700' : 'text-gray-900'}`}>
                                        {plan.name}
                                    </h3>
                                    <div className="flex items-end gap-1 mt-1">
                                        <span className={`text-3xl font-extrabold ${plan.highlight ? 'text-blue-600' : 'text-gray-900'}`}>
                                            {plan.price}
                                        </span>
                                        {plan.period && <span className="text-gray-400 text-sm mb-1">{plan.period}</span>}
                                    </div>
                                </div>

                                <ul className="space-y-2 flex-1 mb-6">
                                    {plan.features.map((f) => (
                                        <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                                            <svg className={`w-4 h-4 flex-shrink-0 ${plan.highlight ? 'text-blue-500' : 'text-green-500'}`} fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            {f}
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    className={`w-full py-2.5 rounded-xl font-bold text-sm transition active:scale-95
                    ${plan.highlight
                                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-200'
                                            : 'bg-gray-900 text-white hover:bg-gray-700'}`}
                                >
                                    {plan.name === 'Enterprise' ? 'Contact Sales' : `Upgrade to ${plan.name}`}
                                </button>
                            </div>
                        ))}
                    </div>

                    {}
                    <div className="text-center mt-6">
                        <button
                            onClick={() => setShowUpgradeModal(false)}
                            className="text-sm text-gray-400 hover:text-gray-600 font-medium transition underline underline-offset-2"
                        >
                            Continue with current plan
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UpgradeModal;
