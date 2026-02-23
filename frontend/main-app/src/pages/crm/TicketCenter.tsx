import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';

interface Ticket {
    id: string;
    lead_id: string;
    title: string;
    description: string;
    status: string;
    priority: string;
}

const TicketCenter: React.FC = () => {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ title: '', description: '', priority: 'LOW', lead_id: 'SYSTEM_LEAD_01' });

    useEffect(() => {
        
        api.get('/tickets')
            .then(res => setTickets(res.data.tickets || []))
            .catch(err => {
                console.error('Failed fetching custom support tickets.', err);
                setTickets([
                    { id: 't-100', lead_id: 'client-01', title: 'Portal Login Failure', description: 'User cant access documents securely', status: 'OPEN', priority: 'HIGH' },
                    { id: 't-101', lead_id: 'client-02', title: 'Contract Revisions Needed', description: 'Updated pricing bounds needed', status: 'RESOLVED', priority: 'LOW' },
                ]);
            });
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await api.post('/tickets', formData);
            setTickets([...tickets, { id: String(Date.now()), ...formData, status: 'OPEN' } as Ticket]);
            setShowForm(false);
            setFormData({ title: '', description: '', priority: 'LOW', lead_id: 'SYSTEM_LEAD_01' });
        } catch (err) {
            console.error('Failed writing ticket payload', err);
            
            setTickets([...tickets, { id: String(Date.now()), ...formData, status: 'OPEN' } as Ticket]);
            setShowForm(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center sm:pb-0">
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Support Ticket Center</h1>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-gray-900 text-white font-medium px-5 py-2 rounded-lg hover:bg-gray-800 shadow-sm transition"
                >
                    {showForm ? 'Cancel Editor' : 'Open Ticket'}
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="mb-8 p-6 bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-gray-700 mb-1">Issue Summary</label>
                            <input required type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full border-gray-300 rounded-md p-2 border focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Brief outline of the problem..." />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-gray-700 mb-1">Deep Description</label>
                            <textarea required rows={4} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full border-gray-300 rounded-md p-2 border focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Provide full context here..." />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Priority Mapping</label>
                            <select value={formData.priority} onChange={e => setFormData({ ...formData, priority: e.target.value })} className="w-full border-gray-300 rounded-md p-2 border focus:ring-2 focus:ring-blue-500 outline-none">
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High (Critical)</option>
                            </select>
                        </div>
                        <div className="md:col-span-2 flex justify-end mt-4">
                            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-md shadow transition">Save Internal Ticket</button>
                        </div>
                    </div>
                </form>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {}
                {tickets.map(t => (
                    <div key={t.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition cursor-default relative overflow-hidden">
                        <div className={`absolute top-0 right-0 w-2 h-full ${t.priority === 'HIGH' ? 'bg-red-500' : t.priority === 'MEDIUM' ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                        <div className="mb-4 flex items-center justify-between pr-4">
                            <span className={`px-2.5 py-1 text-xs font-bold rounded-md ${t.status === 'OPEN' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>{t.status}</span>
                            <span className="text-gray-400 text-xs font-mono">#{t.id}</span>
                        </div>
                        <h3 className="font-extrabold text-gray-900 text-lg mb-2">{t.title}</h3>
                        <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed mb-4">{t.description}</p>
                        <p className="text-xs text-gray-400 tracking-wide">Linked Lead: <span className="font-semibold text-gray-700 uppercase">{t.lead_id}</span></p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TicketCenter;
