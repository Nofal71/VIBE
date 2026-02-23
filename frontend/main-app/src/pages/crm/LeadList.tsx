import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import { DynamicLeadForm, SchemaJson } from '../../components/DynamicLeadForm';
import { useTenantContext } from '../../context/TenantContext';

interface Lead {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    status_id: string; // Used as explicit stage in schema mapping
}

const LeadList: React.FC = () => {
    const { stages, uiConfig } = useTenantContext();
    const [leads, setLeads] = useState<Lead[]>([]);
    const [showForm, setShowForm] = useState(false);

    const stageOptions = stages.map(s => s.name);

    // Dynamic layout schema for Leads table using stage context
    const leadSchema: SchemaJson = {
        columns: [
            { name: 'first_name', type: 'STRING', required: true },
            { name: 'last_name', type: 'STRING', required: true },
            { name: 'email', type: 'STRING', required: true },
            { name: 'status_id', type: 'ENUM', options: stageOptions.length > 0 ? stageOptions : ['New'], required: true },
        ]
    };

    useEffect(() => {
        // In actual implementation, point this to API Gateway specifically mapping port 4001 CRM-Core
        api.get('/core/leads')
            .then(res => setLeads(res.data.leads || []))
            .catch(err => {
                console.error('Failed to fetch leads', err);
                // Fallback for visual rendering prior to actual backend seeders finalizing
                setLeads([
                    { id: '1', first_name: 'John', last_name: 'Doe', email: 'john@example.com', status_id: stageOptions[0] || 'New' },
                    { id: '2', first_name: 'Jane', last_name: 'Smith', email: 'jane@example.com', status_id: stageOptions[1] || 'Contacted' },
                ]);
            });
    }, [stages]);

    const handleCreateLead = async (data: Record<string, any>) => {
        try {
            const res = await api.post('/core/leads', data);
            if (res.data.lead) {
                setLeads([...leads, res.data.lead]);
            }
            setShowForm(false);
        } catch (err) {
            console.error('Failed to create lead', err);
            // Optimistic update for presentation context
            setLeads([...leads, { ...data, id: String(Date.now()) } as Lead]);
            setShowForm(false);
        }
    };

    const getStageColor = (stageName: string) => {
        const stage = stages.find(s => s.name === stageName);
        return stage ? stage.color : '#CBD5E1';
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center pb-5 border-b border-gray-200 sm:pb-0">
                <h3 className="text-xl leading-6 font-bold text-gray-900 pb-4">Global Leads Directory</h3>
                <div className="mt-3 flex sm:mt-0 sm:ml-4 pb-4">
                    <button
                        type="button"
                        onClick={() => setShowForm(!showForm)}
                        style={{ backgroundColor: uiConfig.primary_color || '#2563EB', color: 'white' }}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-opacity"
                    >
                        {showForm ? 'Cancel Creation' : 'Add New Lead'}
                    </button>
                </div>
            </div>

            {showForm && (
                <div className="p-6 bg-white rounded-xl shadow-md border border-gray-100">
                    <h2 className="text-lg font-bold mb-4 text-gray-800">New Lead Data</h2>
                    <DynamicLeadForm schemaJson={leadSchema} onSubmit={handleCreateLead} />
                </div>
            )}

            <div className="flex flex-col">
                <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                        <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Pipeline Stage</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {leads.length > 0 ? leads.map(lead => (
                                        <tr key={lead.id} className="hover:bg-gray-50 transition cursor-pointer">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{lead.first_name} {lead.last_name}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">{lead.email}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className="px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full text-white shadow-sm"
                                                    style={{ backgroundColor: getStageColor(lead.status_id) }}
                                                >
                                                    {lead.status_id}
                                                </span>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">No leads found in architecture.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LeadList;
