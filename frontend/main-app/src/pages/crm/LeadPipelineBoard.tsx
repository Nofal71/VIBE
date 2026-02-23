import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import { useTenantContext } from '../../context/TenantContext';

interface Lead {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    status_id: string;
}

export const LeadPipelineBoard: React.FC = () => {
    const { stages } = useTenantContext();
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);

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

    const handleDragStart = (e: React.DragEvent, leadId: string) => {
        e.dataTransfer.setData('leadId', leadId);
    };

    const handleDrop = async (e: React.DragEvent, targetStatus: string) => {
        e.preventDefault();
        const leadId = e.dataTransfer.getData('leadId');

        // Optimistic update
        const originalLeads = [...leads];
        setLeads(leads.map(l => l.id === leadId ? { ...l, status_id: targetStatus } : l));

        try {
            await api.put(`/leads/${leadId}`, { status_id: targetStatus });
        } catch (err) {
            console.error('Failed to update lead status', err);
            setLeads(originalLeads);
            alert('Failed to move lead');
        }
    };

    if (loading && leads.length === 0) {
        return <div className="p-8 text-center text-gray-500 animate-pulse">Loading Pipeline...</div>;
    }

    return (
        <div className="flex flex-col h-full space-y-4">
            <h1 className="text-2xl font-bold text-gray-800 px-4">Leads Pipeline</h1>

            <div className="flex-1 flex gap-4 overflow-x-auto p-4 scrollbar-thin scrollbar-thumb-gray-300">
                {stages.map(stage => (
                    <div
                        key={stage.id}
                        className="flex-shrink-0 w-80 bg-gray-50 rounded-lg flex flex-col border border-gray-200"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => handleDrop(e, stage.name)}
                    >
                        <div className="p-3 border-b border-gray-200 flex justify-between items-center bg-white rounded-t-lg">
                            <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: stage.color }}></div>
                                <h3 className="font-bold text-gray-700 uppercase text-xs tracking-wider">{stage.name}</h3>
                            </div>
                            <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs font-bold">
                                {leads.filter(l => l.status_id === stage.name).length}
                            </span>
                        </div>

                        <div className="flex-1 p-2 space-y-3 overflow-y-auto">
                            {leads.filter(l => l.status_id === stage.name).map(lead => (
                                <div
                                    key={lead.id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, lead.id)}
                                    className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 cursor-grab hover:shadow-md transition-shadow active:cursor-grabbing"
                                >
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-gray-900">{lead.first_name} {lead.last_name}</span>
                                        <span className="text-xs text-gray-500 mt-1 truncate">{lead.email}</span>
                                    </div>
                                    <div className="mt-3 flex justify-between items-center">
                                        <div className="text-[10px] text-gray-400 font-medium">#{lead.id.slice(0, 8)}</div>
                                        <button className="text-indigo-600 hover:text-indigo-800 text-xs font-semibold">View</button>
                                    </div>
                                </div>
                            ))}

                            {leads.filter(l => l.status_id === stage.name).length === 0 && (
                                <div className="h-24 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-xs italic">
                                    Empty Stage
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
