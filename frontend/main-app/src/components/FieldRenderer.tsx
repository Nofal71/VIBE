import React from 'react';

export type FieldType = 'text' | 'number' | 'email' | 'select' | 'textarea' | 'boolean' | 'date';

export interface FieldDefinition {
    id: string;
    name: string;
    label: string;
    type: FieldType;
    required?: boolean;
    options?: { label: string; value: string }[] | string[];
    placeholder?: string;
    defaultValue?: any;
}

interface FieldRendererProps {
    field: FieldDefinition;
    value: any;
    onChange: (fieldName: string, value: any) => void;
    error?: string;
}

export const FieldRenderer: React.FC<FieldRendererProps> = ({ field, value, onChange, error }) => {
    const baseInputClasses = "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border";

    const renderInput = () => {
        switch (field.type) {
            case 'select':
                return (
                    <select
                        id={field.id}
                        name={field.name}
                        className={baseInputClasses}
                        value={value || ''}
                        onChange={(e) => onChange(field.name, e.target.value)}
                        required={field.required}
                    >
                        <option value="">Select an option</option>
                        {field.options?.map((opt: any) => {
                            const label = typeof opt === 'string' ? opt : opt.label;
                            const val = typeof opt === 'string' ? opt : opt.value;
                            return <option key={val} value={val}>{label}</option>;
                        })}
                    </select>
                );
            case 'textarea':
                return (
                    <textarea
                        id={field.id}
                        name={field.name}
                        rows={3}
                        className={baseInputClasses}
                        placeholder={field.placeholder}
                        value={value || ''}
                        onChange={(e) => onChange(field.name, e.target.value)}
                        required={field.required}
                    />
                );
            case 'boolean':
                return (
                    <div className="flex items-center">
                        <input
                            id={field.id}
                            name={field.name}
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            checked={!!value}
                            onChange={(e) => onChange(field.name, e.target.checked)}
                        />
                        <label htmlFor={field.id} className="ml-2 block text-sm text-gray-900">
                            {field.placeholder || 'Yes'}
                        </label>
                    </div>
                );
            case 'date':
                return (
                    <input
                        id={field.id}
                        name={field.name}
                        type="date"
                        className={baseInputClasses}
                        value={value || ''}
                        onChange={(e) => onChange(field.name, e.target.value)}
                        required={field.required}
                    />
                );
            default:
                return (
                    <input
                        id={field.id}
                        name={field.name}
                        type={field.type}
                        className={baseInputClasses}
                        placeholder={field.placeholder}
                        value={value || ''}
                        onChange={(e) => onChange(field.name, e.target.value)}
                        required={field.required}
                    />
                );
        }
    };

    return (
        <div className="mb-4">
            <label htmlFor={field.id} className="block text-sm font-medium text-gray-700">
                {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            {renderInput()}
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>
    );
};
