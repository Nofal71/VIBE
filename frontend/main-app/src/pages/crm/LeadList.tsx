import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import { useTenantContext } from '../../context/TenantContext';
import { DynamicFormEngine } from '../../components/DynamicFormEngine';
import { FieldDefinition } from '../../components/FieldRenderer';

interface Lead {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    status_id: string;
    custom_fields?: Record<string, any>;
}

const LeadList: React.FC = () => {
    const { stages, uiConfig } = useTenantContext();
    const [leads, setLeads] = useState<Lead[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);

    const stageOptions = stages.map(s => ({ label: s.name, value: s.name }));

    const systemFields: FieldDefinition[] = [
        { id: 'first_name', name: 'first_name', label: 'First Name', type: 'text', required: true },
        { id: 'last_name', name: 'last_name', label: 'Last Name', type: 'text', required: true },
        { id: 'email', name: 'email', label: 'Email Address', type: 'email', required: true },
        {
            id: 'status_id',
            name: 'status_id',
            label: 'Pipeline Stage',
            type: 'select',
            options: stageOptions.length > 0 ? stageOptions : [{ label: 'New', value: 'New' }],
            required: true
        },
    ];

    // Placeholder for actual custom field definitions from tenant config
    const customFields: FieldDefinition[] = [];

    const fetchLeads = async () => {
        setLoading(true);
        try {
            const res = await api.get('/leads');
            setLeads(res.data.leads || []);
        } catch (err) {
            console.error('Failed to fetch leads', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeads();
    }, []);

    const handleCreateLead = async (data: Record<string, any>) => {
        try {
            await api.post('/leads', data);
            fetchLeads();
            setShowForm(false);
        } catch (err) {
            console.error('Failed to create lead', err);
        }
    };

    const getStageColor = (stageName: string) => {
        const stage = stages.find(s => s.name === stageName);
        return stage ? stage.color : '#CBD5E1';
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center pb-5 border-b border-gray-200 sm:pb-0">
                <h3 className="text-xl leading-6 font-bold text-gray-900 pb-4">Leads Pipeline</h3>
                <div className="mt-3 flex sm:mt-0 sm:ml-4 pb-4">
                    <button
                        type="button"
                        onClick={() => setShowForm(!showForm)}
                        style={{ backgroundColor: uiConfig.primary_color || '#4F46E5', color: 'white' }}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-opacity"
                    >
                        {showForm ? 'Cancel' : 'Add Lead'}
                    </button>
                </div>
            </div>

            {showForm && (
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="p-6">
                        <h2 className="text-lg font-bold mb-4 text-gray-800">Create New Lead</h2>
                        <DynamicFormEngine
                            systemFields={systemFields}
                            customFields={customFields}
                            onSubmit={handleCreateLead}
                            submitLabel="Create Lead"
                        />
                    </div>
                </div>
            )}

            <div className="flex flex-col">
                <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                        <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg bg-white">
                            {loading ? (
                                <div className="p-10 text-center text-gray-400 animate-pulse">Loading leads...</div>
                            ) : leads.length > 0 ? (
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Stage</th>
                                            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {leads.map(lead => (
                                            <tr key={lead.id} className="hover:bg-gray-50 transition cursor-pointer">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">{lead.first_name} {lead.last_name}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-500">{lead.email}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span
                                                        className="px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full text-white"
                                                        style={{ backgroundColor: getStageColor(lead.status_id) }}
                                                    >
                                                        {lead.status_id}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button className="text-indigo-600 hover:text-indigo-900">Edit</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="p-10 text-center text-gray-500">No leads found. Use the button above to add your first lead.</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LeadList;
