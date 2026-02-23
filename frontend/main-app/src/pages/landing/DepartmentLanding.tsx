import React, { useMemo } from 'react';

const DepartmentLanding: React.FC = () => {
    const subdomain = useMemo(() => {
        const hostname = window.location.hostname;
        const parts = hostname.split('.');

        
        if (parts.length >= 3 && hostname.includes('ihsolution.tech')) {
            return parts[0].toLowerCase();
        }
        return 'default';
    }, []);

    const departmentData: Record<string, { title: string; subtitle: string; features: string[] }> = {
        realestate: {
            title: 'Real Estate CRM Hub',
            subtitle: 'Manage properties, track leads, and close deals faster.',
            features: ['Property Listings', 'Agent Collaboration', 'Buyer Matching'],
        },
        immigration: {
            title: 'Immigration Portal',
            subtitle: 'Streamline visa processing and client document handling.',
            features: ['Document Vault', 'Case Tracking', 'Automated Reminders'],
        },
        default: {
            title: 'Enterprise SaaS CRM',
            subtitle: 'The all-in-one scalable solution for your business.',
            features: ['Dynamic Fields', 'Automated Workflows', 'Multi-tenant Deep Security'],
        }
    };

    const content = departmentData[subdomain] || departmentData['default'];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
            <div className="max-w-4xl w-full bg-white shadow-xl rounded-2xl overflow-hidden p-8 md:p-16 text-center">
                <h1 className="text-5xl font-bold text-gray-900 mb-4 tracking-tight">{content.title}</h1>
                <p className="text-xl text-gray-600 mb-10">{content.subtitle}</p>

                <div className="grid md:grid-cols-3 gap-6 mb-12">
                    {content.features.map((feature, idx) => (
                        <div key={idx} className="p-6 bg-blue-50 rounded-xl border border-blue-100 shadow-sm">
                            <span className="font-semibold text-blue-900">{feature}</span>
                        </div>
                    ))}
                </div>

                <button
                    onClick={() => window.location.href = '/signup'}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transform transition hover:scale-105"
                >
                    Start Free Trial
                </button>
            </div>
        </div>
    );
};

export default DepartmentLanding;
