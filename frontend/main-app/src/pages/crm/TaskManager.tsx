import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';

type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

interface Task {
    id: string;
    title: string;
    description: string;
    due_date: string;
    status: TaskStatus;
    lead_id: string | null;
    assigned_to: string;
}

const COLUMNS: { id: TaskStatus; label: string; color: string }[] = [
    { id: 'TODO', label: '📋 To Do', color: 'bg-gray-100 border-gray-200' },
    { id: 'IN_PROGRESS', label: '⚡ In Progress', color: 'bg-blue-50 border-blue-200' },
    { id: 'DONE', label: '✅ Done', color: 'bg-green-50 border-green-200' },
];

const TaskManager: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        title: '',
        description: '',
        due_date: '',
        lead_id: '',
        assigned_to: 'current-user',
        status: 'TODO' as TaskStatus,
    });

    useEffect(() => {
        api.get('/tasks')
            .then((res) => setTasks(res.data.tasks || []))
            .catch(() => {
                setTasks([
                    { id: 't-1', title: 'Follow up with client', description: 'Send visa documents', due_date: '2026-02-25', status: 'TODO', lead_id: null, assigned_to: 'u-1' },
                    { id: 't-2', title: 'Review property offer', description: 'Check terms', due_date: '2026-02-23', status: 'IN_PROGRESS', lead_id: 'lead-99', assigned_to: 'u-2' },
                    { id: 't-3', title: 'Contract signed', description: 'Archive docs', due_date: '2026-02-20', status: 'DONE', lead_id: null, assigned_to: 'u-1' },
                ]);
            });
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await api.post('/tasks', form);
            setTasks([...tasks, res.data.task]);
        } catch {
            const optimistic: Task = { ...form, id: String(Date.now()), lead_id: form.lead_id || null };
            setTasks([...tasks, optimistic]);
        }
        setShowForm(false);
        setForm({ title: '', description: '', due_date: '', lead_id: '', assigned_to: 'current-user', status: 'TODO' });
    };

    const moveTask = async (task: Task, newStatus: TaskStatus) => {
        try {
            await api.put(`/tasks/${task.id}`, { status: newStatus });
        } catch (_) { }
        setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t)));
    };

    const getByStatus = (status: TaskStatus) => tasks.filter((t) => t.status === status);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Task Manager</h1>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-gray-900 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-gray-800 shadow-sm transition"
                >
                    {showForm ? 'Cancel' : '+ New Task'}
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-gray-700 mb-1">Task Title *</label>
                        <input required type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-sm" placeholder="What needs to be done?" />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                        <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-sm" placeholder="Additional context..." />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Due Date *</label>
                        <input required type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Linked Lead ID</label>
                        <input type="text" value={form.lead_id} onChange={(e) => setForm({ ...form, lead_id: e.target.value })}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-sm" placeholder="Optional lead UUID..." />
                    </div>
                    <div className="md:col-span-2 flex justify-end">
                        <button type="submit" className="bg-blue-600 text-white font-bold px-6 py-2.5 rounded-lg hover:bg-blue-700 transition shadow-sm">
                            Create Task
                        </button>
                    </div>
                </form>
            )}

            {}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {COLUMNS.map((col) => (
                    <div key={col.id} className={`rounded-2xl border-2 ${col.color} p-4 min-h-[300px]`}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-extrabold text-gray-800">{col.label}</h3>
                            <span className="bg-white text-gray-600 text-xs font-bold px-2 py-0.5 rounded-full border border-gray-200 shadow-sm">
                                {getByStatus(col.id).length}
                            </span>
                        </div>
                        <div className="space-y-3">
                            {getByStatus(col.id).map((task) => (
                                <div key={task.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 group hover:shadow-md transition">
                                    <p className="font-bold text-gray-900 text-sm mb-1">{task.title}</p>
                                    {task.description && (
                                        <p className="text-xs text-gray-500 mb-2 line-clamp-2">{task.description}</p>
                                    )}
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-gray-400 font-mono">📅 {task.due_date}</span>
                                        {task.lead_id && (
                                            <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-semibold">Lead</span>
                                        )}
                                    </div>
                                    {}
                                    <div className="mt-3 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {COLUMNS.filter((c) => c.id !== col.id).map((c) => (
                                            <button
                                                key={c.id}
                                                onClick={() => moveTask(task, c.id)}
                                                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-2 py-1 rounded-md font-medium transition"
                                            >
                                                → {c.id.replace('_', ' ')}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                            {getByStatus(col.id).length === 0 && (
                                <div className="text-center py-8 text-gray-300 text-sm font-medium">No tasks here</div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TaskManager;
