import React, { useState, useEffect } from 'react';
import api from '../../../api/axiosConfig';

interface Stage {
    name: string;
    color: string;
    order_index: number;
}

const PRESET_COLORS = [
    '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
    '#f97316', '#eab308', '#22c55e', '#10b981',
    '#06b6d4', '#3b82f6', '#64748b', '#1f2937',
];

const StageBuilder: React.FC = () => {
    const [stages, setStages] = useState<Stage[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [newStageName, setNewStageName] = useState('');
    const [newStageColor, setNewStageColor] = useState(PRESET_COLORS[0]);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        api.get('/tenant/settings/stages')
            .then((res) => setStages(res.data.stages || []))
            .catch(() => {
                setStages([
                    { name: 'New Lead', color: '#6366f1', order_index: 0 },
                    { name: 'Contacted', color: '#3b82f6', order_index: 1 },
                    { name: 'Qualified', color: '#f97316', order_index: 2 },
                    { name: 'Won', color: '#22c55e', order_index: 3 },
                    { name: 'Lost', color: '#f43f5e', order_index: 4 },
                ]);
            })
            .finally(() => setLoading(false));
    }, []);

    const reindex = (arr: Stage[]): Stage[] =>
        arr.map((s, i) => ({ ...s, order_index: i }));

    const addStage = () => {
        if (!newStageName.trim()) return;
        const next: Stage = {
            name: newStageName.trim(),
            color: newStageColor,
            order_index: stages.length,
        };
        setStages(reindex([...stages, next]));
        setNewStageName('');
        setNewStageColor(PRESET_COLORS[stages.length % PRESET_COLORS.length]);
    };

    const removeStage = (idx: number) =>
        setStages(reindex(stages.filter((_, i) => i !== idx)));

    const moveUp = (idx: number) => {
        if (idx === 0) return;
        const next = [...stages];
        [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
        setStages(reindex(next));
    };

    const moveDown = (idx: number) => {
        if (idx === stages.length - 1) return;
        const next = [...stages];
        [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
        setStages(reindex(next));
    };

    const updateColor = (idx: number, color: string) => {
        const next = [...stages];
        next[idx] = { ...next[idx], color };
        setStages(next);
    };

    const updateName = (idx: number, name: string) => {
        const next = [...stages];
        next[idx] = { ...next[idx], name };
        setStages(next);
    };

    const saveStages = async () => {
        setSaving(true);
        try {
            await api.put('/tenant/settings/stages', { stages });
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            console.error('Failed to save stages:', err);
            alert('Failed to save stages. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Stage Builder</h1>
                    <p className="text-sm text-gray-500 mt-1">Configure pipeline stages, colors, and their order.</p>
                </div>
                <button
                    onClick={saveStages} disabled={saving}
                    className={`px-5 py-2.5 rounded-lg font-bold transition shadow-sm
            ${saved ? 'bg-green-600 text-white' : 'bg-gray-900 text-white hover:bg-gray-700'}
            disabled:opacity-60`}
                >
                    {saved ? '✓ Saved!' : saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Stage List */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100">
                        <h2 className="font-extrabold text-gray-800">Pipeline Stages ({stages.length})</h2>
                    </div>

                    {loading ? (
                        <div className="py-16 text-center text-gray-400 animate-pulse">Loading stages...</div>
                    ) : stages.length === 0 ? (
                        <div className="py-16 text-center text-gray-400 text-sm">No stages yet. Add your first stage.</div>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {stages.map((stage, idx) => (
                                <div key={idx} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50/80 transition group">
                                    {/* Color swatch + picker */}
                                    <div className="relative flex-shrink-0">
                                        <div
                                            className="w-8 h-8 rounded-lg cursor-pointer border-2 border-white shadow-md hover:scale-110 transition"
                                            style={{ backgroundColor: stage.color }}
                                        />
                                        <input
                                            type="color" value={stage.color}
                                            onChange={(e) => updateColor(idx, e.target.value)}
                                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                            title="Pick colour"
                                        />
                                    </div>

                                    {/* Stage name (inline editable) */}
                                    <input
                                        value={stage.name}
                                        onChange={(e) => updateName(idx, e.target.value)}
                                        className="flex-1 bg-transparent text-sm font-semibold text-gray-800 border-b border-transparent hover:border-gray-300 focus:border-blue-400 outline-none py-0.5 transition"
                                    />

                                    {/* Order badge */}
                                    <span className="text-xs text-gray-400 font-mono w-6 text-center">{idx + 1}</span>

                                    {/* Reorder controls */}
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => moveUp(idx)} disabled={idx === 0}
                                            className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-200 disabled:opacity-30 transition"
                                            title="Move up"
                                        >▲</button>
                                        <button
                                            onClick={() => moveDown(idx)} disabled={idx === stages.length - 1}
                                            className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-200 disabled:opacity-30 transition"
                                            title="Move down"
                                        >▼</button>
                                    </div>

                                    {/* Delete */}
                                    <button
                                        onClick={() => removeStage(idx)}
                                        className="p-1 rounded text-red-300 hover:text-red-600 hover:bg-red-50 transition opacity-0 group-hover:opacity-100"
                                        title="Delete stage"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Add Stage Panel */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5 self-start">
                    <h2 className="font-extrabold text-gray-800">Add New Stage</h2>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Stage Name</label>
                        <input
                            type="text" value={newStageName}
                            onChange={(e) => setNewStageName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addStage()}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="e.g. Negotiation"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Pick Colour</label>
                        <div className="grid grid-cols-6 gap-2">
                            {PRESET_COLORS.map((c) => (
                                <button
                                    key={c} type="button"
                                    onClick={() => setNewStageColor(c)}
                                    className={`w-8 h-8 rounded-lg border-2 transition hover:scale-110
                    ${newStageColor === c ? 'border-gray-800 scale-110 shadow-md' : 'border-transparent hover:border-gray-400'}`}
                                    style={{ backgroundColor: c }}
                                    title={c}
                                />
                            ))}
                        </div>
                        {/* Preview */}
                        <div className="mt-3 flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: newStageColor }} />
                            <span className="text-sm font-semibold text-gray-700">{newStageName || 'Preview'}</span>
                        </div>
                    </div>

                    <button
                        onClick={addStage} disabled={!newStageName.trim()}
                        className="w-full bg-blue-600 text-white font-bold py-2.5 rounded-xl hover:bg-blue-700 transition disabled:opacity-40"
                    >
                        + Add Stage
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StageBuilder;
