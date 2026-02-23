import React, { useRef } from 'react';
import api from '../api/axiosConfig';

interface LeadToolbarProps {
    onImportSuccess?: () => void;
}

const LeadToolbar: React.FC<LeadToolbarProps> = ({ onImportSuccess }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleExport = async () => {
        try {
            const response = await api.get('/data/export/leads', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data], { type: 'text/csv' }));
            const a = document.createElement('a');
            a.href = url;
            a.download = `leads_export_${Date.now()}.csv`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Export failed:', error);
            alert('Export failed. Please check the CRM Core service connection.');
        }
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await api.post('/data/import/leads', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            const { imported, errors } = res.data;
            alert(`Import complete: ${imported} leads added. Errors: ${errors?.length || 0}`);
            onImportSuccess?.();
        } catch (error) {
            console.error('Import failed:', error);
            alert('Import failed. Ensure the CSV has headers: first_name, last_name, email, status_id');
        } finally {
            // Reset file input so the same file can be re-uploaded if needed
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div className="flex items-center space-x-3">
            {/* Hidden file input for CSV selection */}
            <input
                type="file"
                accept=".csv"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                id="csv-import-input"
            />

            <button
                onClick={handleImportClick}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm transition"
            >
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Import CSV
            </button>

            <button
                onClick={handleExport}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm transition"
            >
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export CSV
            </button>
        </div>
    );
};

export default LeadToolbar;
