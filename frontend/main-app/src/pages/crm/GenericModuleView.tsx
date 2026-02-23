import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { DynamicLeadForm, SchemaJson } from '../../components/DynamicLeadForm';

const GenericModuleView: React.FC = () => {
    const { tableName } = useParams<{ tableName: string }>();

    const [schema, setSchema] = useState<SchemaJson | null>(null);
    const [dataList, setDataList] = useState<any[]>([]);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        
        setDataList([]);
        setSchema(null);

        
        api.get(`/tenant/schema/${tableName}`)
            .then(res => setSchema({ columns: res.data.columns || [] }))
            .catch(err => {
                console.error(`Failed schema fetch for ${tableName}`, err);
                
                setSchema({
                    columns: [
                        { name: 'address_identifier', type: 'STRING', required: true },
                        { name: 'market_value', type: 'NUMBER', required: true },
                        { name: 'contract_active', type: 'BOOLEAN', required: false }
                    ]
                });
            });

        api.get(`/core/generic/${tableName}`)
            .then(res => setDataList(res.data.records || []))
            .catch(err => console.error(`Failed data fetch for ${tableName}`, err));
    }, [tableName]);

    const handleSubmit = async (data: Record<string, any>) => {
        try {
            const res = await api.post(`/core/generic/${tableName}`, data);
            if (res.data.record) {
                setDataList([...dataList, res.data.record]);
            }
            setShowForm(false);
        } catch (err) {
            console.error(`Error saving dynamically to ${tableName}`, err);
            
            setDataList([...dataList, data]);
            setShowForm(false);
        }
    };

    if (!schema) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="text-xl text-gray-400 font-semibold animate-pulse">Loading Custom Module Rules...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center sm:pb-0">
                <h1 className="text-2xl font-extrabold text-gray-900 capitalize tracking-tight">{tableName?.replace('_', ' ')} Records</h1>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-indigo-600 text-white font-medium px-5 py-2 rounded-lg hover:bg-indigo-700 shadow-sm transition"
                >
                    {showForm ? 'Close Builder' : `Appended Row to ${tableName}`}
                </button>
            </div>

            {showForm && (
                <div className="mb-8 p-6 bg-indigo-50 rounded-xl shadow-inner border border-indigo-100">
                    <h2 className="text-lg font-bold mb-4 text-indigo-900">Insert Row Data</h2>
                    <DynamicLeadForm schemaJson={schema} onSubmit={handleSubmit} />
                </div>
            )}

            <div className="bg-white shadow rounded-xl border border-gray-200 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                        <tr>
                            {schema.columns.map(col => (
                                <th key={col.name} className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-widest">
                                    {col.name.replace('_', ' ')}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {dataList.map((row, idx) => (
                            <tr key={idx} className="hover:bg-blue-50 transition cursor-default">
                                {schema.columns.map(col => (
                                    <td key={col.name} className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 font-medium">
                                        {typeof row[col.name] === 'boolean'
                                            ? (row[col.name] ? 'Enabled' : 'Disabled')
                                            : (row[col.name] || '—')}
                                    </td>
                                ))}
                            </tr>
                        ))}
                        {dataList.length === 0 && (
                            <tr>
                                <td colSpan={schema.columns.length} className="px-6 py-12 text-center text-gray-400 italic">
                                    No records stored inside dynamic blueprint schema for {tableName}.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default GenericModuleView;
