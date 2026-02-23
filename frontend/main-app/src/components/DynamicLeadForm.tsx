import React, { useState } from 'react';

export interface SchemaColumn {
    name: string;
    type: 'STRING' | 'ENUM' | 'TEXT' | 'NUMBER' | 'BOOLEAN';
    options?: string[]; // For enums
    required?: boolean;
}

export interface SchemaJson {
    columns: SchemaColumn[];
}

interface DynamicLeadFormProps {
    schemaJson: SchemaJson;
    initialData?: Record<string, any>;
    onSubmit: (data: Record<string, any>) => void;
}

export const DynamicLeadForm: React.FC<DynamicLeadFormProps> = ({ schemaJson, initialData = {}, onSubmit }) => {
    const [formData, setFormData] = useState<Record<string, any>>(initialData);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

        setFormData((prev) => ({
            ...prev,
            [name]: val,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-w-lg mx-auto p-4 bg-white shadow rounded">
            {schemaJson.columns.map((col) => (
                <div key={col.name} className="flex flex-col">
                    <label className="mb-1 font-semibold text-gray-700 capitalize">{col.name.replace('_', ' ')}</label>

                    {col.type === 'ENUM' && col.options ? (
                        <select
                            name={col.name}
                            value={formData[col.name] || ''}
                            onChange={handleChange}
                            required={col.required}
                            className="border p-2 rounded focus:ring focus:ring-blue-200"
                        >
                            <option value="">Select...</option>
                            {col.options.map((opt) => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
                    ) : col.type === 'TEXT' ? (
                        <textarea
                            name={col.name}
                            value={formData[col.name] || ''}
                            onChange={handleChange}
                            required={col.required}
                            className="border p-2 rounded focus:ring focus:ring-blue-200"
                        />
                    ) : col.type === 'BOOLEAN' ? (
                        <input
                            type="checkbox"
                            name={col.name}
                            checked={!!formData[col.name]}
                            onChange={handleChange}
                            className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                    ) : (
                        <input
                            type={col.type === 'NUMBER' ? 'number' : 'text'}
                            name={col.name}
                            value={formData[col.name] || ''}
                            onChange={handleChange}
                            required={col.required}
                            className="border p-2 rounded focus:ring focus:ring-blue-200"
                        />
                    )}
                </div>
            ))}
            <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition">
                Save Lead
            </button>
        </form>
    );
};
