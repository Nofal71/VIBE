import React, { useState } from 'react';
import { FieldDefinition, FieldRenderer } from './FieldRenderer';

interface DynamicFormEngineProps {
    systemFields: FieldDefinition[];
    customFields: FieldDefinition[];
    initialData?: Record<string, any>;
    onSubmit: (data: Record<string, any>) => void;
    submitLabel?: string;
}

export const DynamicFormEngine: React.FC<DynamicFormEngineProps> = ({
    systemFields,
    customFields,
    initialData = {},
    onSubmit,
    submitLabel = "Save Changes"
}) => {
    // We separate system data from custom_fields data internally
    const [formData, setFormData] = useState<Record<string, any>>({
        ...initialData,
        custom_fields: initialData.custom_fields || {}
    });

    const handleFieldChange = (name: string, value: any, isCustom: boolean) => {
        if (isCustom) {
            setFormData(prev => ({
                ...prev,
                custom_fields: {
                    ...(prev.custom_fields || {}),
                    [name]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6 text-gray-800">
                <div className="md:grid md:grid-cols-3 md:gap-6">
                    <div className="md:col-span-1">
                        <h3 className="text-lg font-medium leading-6 text-gray-900">Information</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            Core information and custom properties.
                        </p>
                    </div>
                    <div className="mt-5 md:col-span-2 md:mt-0">
                        <div className="grid grid-cols-6 gap-6">
                            {systemFields.map(field => (
                                <div key={field.id} className="col-span-6 sm:col-span-3">
                                    <FieldRenderer
                                        field={field}
                                        value={formData[field.name]}
                                        onChange={(name, val) => handleFieldChange(name, val, false)}
                                    />
                                </div>
                            ))}
                        </div>

                        {customFields.length > 0 && (
                            <div className="mt-8">
                                <h4 className="text-md font-medium text-gray-700 border-b pb-2 mb-4">Custom Fields</h4>
                                <div className="grid grid-cols-6 gap-6">
                                    {customFields.map(field => (
                                        <div key={field.id} className="col-span-6 sm:col-span-3">
                                            <FieldRenderer
                                                field={field}
                                                value={formData.custom_fields[field.name]}
                                                onChange={(name, val) => handleFieldChange(name, val, true)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex justify-end">
                <button
                    type="submit"
                    className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                    {submitLabel}
                </button>
            </div>
        </form>
    );
};
