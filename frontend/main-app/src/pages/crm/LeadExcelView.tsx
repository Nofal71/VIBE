import React, { useState, useEffect, useRef, useCallback } from 'react';
import api from '../../api/axiosConfig';

interface Lead {
    id: string;
    [key: string]: unknown;
}


const STATIC_COLUMNS = ['first_name', 'last_name', 'email', 'phone', 'status_id'];

const LeadExcelView: React.FC = () => {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [columns, setColumns] = useState<string[]>(STATIC_COLUMNS);
    const [loading, setLoading] = useState(true);
    const [editingCell, setEditingCell] = useState<{ rowId: string; col: string } | null>(null);
    const [editValue, setEditValue] = useState<string>('');
    const inputRef = useRef<HTMLInputElement>(null);

    
    useEffect(() => {
        const loadData = async () => {
            try {
                const [leadsRes, fieldsRes] = await Promise.allSettled([
                    api.get('/leads/advanced?limit=200'),
                    api.get('/tenant/settings/fields'),
                ]);

                if (leadsRes.status === 'fulfilled') {
                    const rows: Lead[] = leadsRes.value.data?.leads ?? [];
                    setLeads(rows);

                    
                    if (rows.length > 0) {
                        const allCols = Object.keys(rows[0]).filter((k) => k !== 'id');
                        setColumns(allCols.slice(0, 14)); 
                    }
                } else {
                    setLeads([
                        { id: 'demo-1', first_name: 'Alice', last_name: 'Johnson', email: 'alice@example.com', phone: '+1234', status_id: 'NEW' },
                        { id: 'demo-2', first_name: 'Bob', last_name: 'Smith', email: 'bob@example.com', phone: '+5678', status_id: 'CONTACTED' },
                        { id: 'demo-3', first_name: 'Carol', last_name: 'White', email: 'carol@example.com', phone: '+9012', status_id: 'WON' },
                    ]);
                }

                if (fieldsRes.status === 'fulfilled') {
                    const customFields: string[] = (fieldsRes.value.data?.fields ?? []).map((f: { field_name: string }) => f.field_name);
                    setColumns((prev) => {
                        const merged = [...new Set([...STATIC_COLUMNS, ...customFields])];
                        return merged;
                    });
                }
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    
    useEffect(() => {
        if (editingCell) inputRef.current?.focus();
    }, [editingCell]);

    const startEdit = (rowId: string, col: string, current: unknown) => {
        setEditingCell({ rowId, col });
        setEditValue(String(current ?? ''));
    };

    const commitEdit = useCallback(async () => {
        if (!editingCell) return;
        const { rowId, col } = editingCell;

        
        setLeads((prev) =>
            prev.map((row) =>
                row.id === rowId ? { ...row, [col]: editValue } : row
            )
        );
        setEditingCell(null);

        try {
            await api.put(`/leads/${rowId}`, { [col]: editValue });
        } catch (error) {
            console.error('[LeadExcelView] Failed to save inline edit:', error);
        }
    }, [editingCell, editValue]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') commitEdit();
        if (e.key === 'Escape') setEditingCell(null);
    };

    const colLabel = (col: string) =>
        col.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

    if (loading) {
        return (
            <div className="py-20 text-center text-gray-400 animate-pulse font-medium">
                Loading spreadsheet view...
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Excel View</h1>
                    <p className="text-sm text-gray-500 mt-1">Click any cell to edit inline. Changes save automatically on blur or Enter.</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-xs bg-gray-100 text-gray-500 px-3 py-1 rounded-full font-semibold">
                        {leads.length} rows · {columns.length} columns
                    </span>
                </div>
            </div>

            {}
            <div className="overflow-auto rounded-2xl border border-gray-200 shadow-sm bg-white"
                style={{ maxHeight: '72vh' }}>
                <table className="min-w-full border-collapse text-xs">
                    <thead className="sticky top-0 z-10">
                        <tr className="bg-gray-800 text-white">
                            {}
                            <th className="w-10 px-2 py-2 text-center font-bold text-gray-400 border-r border-gray-600">#</th>
                            {columns.map((col) => (
                                <th
                                    key={col}
                                    className="px-3 py-2.5 text-left font-bold uppercase tracking-wide text-xs whitespace-nowrap border-r border-gray-600 min-w-[120px]"
                                >
                                    {colLabel(col)}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {leads.map((row, rowIdx) => (
                            <tr
                                key={row.id}
                                className={`border-b border-gray-100 ${rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50/60'} hover:bg-blue-50/40 transition-colors`}
                            >
                                {}
                                <td className="w-10 px-2 py-1.5 text-center text-gray-400 font-mono border-r border-gray-100 select-none">
                                    {rowIdx + 1}
                                </td>
                                {columns.map((col) => {
                                    const isEditing = editingCell?.rowId === row.id && editingCell?.col === col;
                                    const cellValue = row[col];

                                    return (
                                        <td
                                            key={col}
                                            className={`px-2 py-1.5 border-r border-gray-100 min-w-[120px] max-w-[220px] cursor-pointer group
                        ${isEditing ? 'p-0 ring-2 ring-inset ring-blue-500 bg-white' : 'hover:bg-blue-50'}`}
                                            onClick={() => !isEditing && startEdit(row.id, col, cellValue)}
                                        >
                                            {isEditing ? (
                                                <input
                                                    ref={inputRef}
                                                    value={editValue}
                                                    onChange={(e) => setEditValue(e.target.value)}
                                                    onBlur={commitEdit}
                                                    onKeyDown={handleKeyDown}
                                                    className="w-full h-full px-2 py-1.5 text-xs outline-none border-none bg-white"
                                                />
                                            ) : (
                                                <span className={`block truncate max-w-[200px] ${!cellValue ? 'text-gray-300 italic' : 'text-gray-800'}`}>
                                                    {cellValue !== null && cellValue !== undefined && String(cellValue) !== ''
                                                        ? String(cellValue)
                                                        : '—'}
                                                </span>
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                        {leads.length === 0 && (
                            <tr>
                                <td colSpan={columns.length + 1} className="py-16 text-center text-gray-400">
                                    No leads found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <p className="text-xs text-gray-400 text-right">
                Tip: Press <kbd className="bg-gray-100 border border-gray-300 px-1 rounded text-gray-600">Enter</kbd> to confirm, <kbd className="bg-gray-100 border border-gray-300 px-1 rounded text-gray-600">Esc</kbd> to cancel.
            </p>
        </div>
    );
};

export default LeadExcelView;
