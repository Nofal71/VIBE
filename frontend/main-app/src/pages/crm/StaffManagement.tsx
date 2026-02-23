import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';

interface StaffMember {
    id: string;
    email: string;
    role_name: string;
    role_id: string;
}

interface FieldLock {
    id?: string;
    column_name: string;
    can_read: boolean;
    can_write: boolean;
}

// Known sensitive fields to show permission toggles for
const SENSITIVE_FIELDS = [
    { column: 'salary', label: 'Salary / Budget' },
    { column: 'budget', label: 'Deal Budget' },
    { column: 'nationality', label: 'Nationality' },
    { column: 'phone', label: 'Phone Number' },
    { column: 'passport_number', label: 'Passport / ID Number' },
];

const StaffManagement: React.FC = () => {
    const [staff, setStaff] = useState<StaffMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMember, setSelectedMember] = useState<StaffMember | null>(null);
    const [fieldLocks, setFieldLocks] = useState<FieldLock[]>([]);
    const [lockLoading, setLockLoading] = useState(false);

    useEffect(() => {
        api.get('/iam/users')
            .then((res) => setStaff(res.data.users || []))
            .catch(() => {
                // Fallback demo staff list
                setStaff([
                    { id: 'u-1', email: 'admin@company.com', role_name: 'Admin', role_id: 'role-admin' },
                    { id: 'u-2', email: 'agent@company.com', role_name: 'Agent', role_id: 'role-agent' },
                    { id: 'u-3', email: 'paralegal@company.com', role_name: 'Paralegal', role_id: 'role-para' },
                ]);
            })
            .finally(() => setLoading(false));
    }, []);

    const openPermissions = async (member: StaffMember) => {
        setSelectedMember(member);
        setLockLoading(true);
        try {
            const res = await api.get(`/iam/field-locks?role_id=${member.role_id}&table_name=leads`);
            setFieldLocks(res.data.locks || []);
        } catch {
            // Bootstrap with default open permissions
            setFieldLocks(SENSITIVE_FIELDS.map((f) => ({ column_name: f.column, can_read: true, can_write: true })));
        } finally {
            setLockLoading(false);
        }
    };

    const closeModal = () => {
        setSelectedMember(null);
        setFieldLocks([]);
    };

    const getLock = (column: string): FieldLock => {
        return (
            fieldLocks.find((l) => l.column_name === column) || {
                column_name: column,
                can_read: true,
                can_write: true,
            }
        );
    };

    const toggleLock = async (column: string, field: 'can_read' | 'can_write', value: boolean) => {
        if (!selectedMember) return;
        const existing = getLock(column);
        const updated = { ...existing, [field]: value };

        try {
            await api.post('/iam/field-locks', {
                role_id: selectedMember.role_id,
                table_name: 'leads',
                column_name: column,
                can_read: updated.can_read,
                can_write: updated.can_write,
            });
            setFieldLocks((prev) => {
                const idx = prev.findIndex((l) => l.column_name === column);
                if (idx >= 0) {
                    const next = [...prev];
                    next[idx] = updated;
                    return next;
                }
                return [...prev, updated];
            });
        } catch (err) {
            console.error('Failed to save field lock:', err);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Staff Management</h1>
                <button className="bg-gray-900 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-gray-800 shadow-sm transition">
                    + Invite Staff Member
                </button>
            </div>

            {loading ? (
                <div className="p-12 text-center text-gray-400 animate-pulse">Loading staff roster...</div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Email</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Role</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {staff.map((member) => (
                                <tr key={member.id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{member.email}</td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700">
                                            {member.role_name}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => openPermissions(member)}
                                            className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition mr-4"
                                        >
                                            Field Permissions
                                        </button>
                                        <button className="text-sm font-semibold text-gray-500 hover:text-gray-800 transition">
                                            Edit Role
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Field Lock Permissions Modal */}
            {selectedMember && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4">
                        <div className="flex items-start justify-between p-6 border-b border-gray-100">
                            <div>
                                <h2 className="text-xl font-extrabold text-gray-900">Field Security Locks</h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    Role: <span className="font-semibold text-indigo-600">{selectedMember.role_name}</span> — on <span className="font-mono text-gray-700">leads</span> table
                                </p>
                            </div>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-700 text-2xl leading-none font-bold">&times;</button>
                        </div>

                        <div className="p-6 space-y-4">
                            {lockLoading ? (
                                <div className="text-center text-gray-400 py-8 animate-pulse">Loading permission matrix...</div>
                            ) : (
                                SENSITIVE_FIELDS.map(({ column, label }) => {
                                    const lock = getLock(column);
                                    return (
                                        <div key={column} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-gray-50">
                                            <div>
                                                <p className="font-semibold text-gray-800 text-sm">{label}</p>
                                                <p className="text-xs text-gray-400 font-mono">{column}</p>
                                            </div>
                                            <div className="flex items-center space-x-6">
                                                <Toggle
                                                    label="Can Read"
                                                    value={lock.can_read}
                                                    onChange={(v) => toggleLock(column, 'can_read', v)}
                                                />
                                                <Toggle
                                                    label="Can Write"
                                                    value={lock.can_write}
                                                    onChange={(v) => toggleLock(column, 'can_write', v)}
                                                />
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        <div className="px-6 pb-6">
                            <button
                                onClick={closeModal}
                                className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-gray-700 transition"
                            >
                                Done — Save Permissions
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const Toggle: React.FC<{ label: string; value: boolean; onChange: (v: boolean) => void }> = ({ label, value, onChange }) => (
    <div className="flex flex-col items-center space-y-1">
        <span className="text-xs text-gray-500 font-medium">{label}</span>
        <button
            onClick={() => onChange(!value)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none shadow-inner ${value ? 'bg-green-500' : 'bg-red-400'
                }`}
        >
            <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${value ? 'translate-x-6' : 'translate-x-1'
                    }`}
            />
        </button>
    </div>
);

export default StaffManagement;
