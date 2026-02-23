import React, { useState, useCallback } from 'react';



interface Stage {
    name: string;
    color: string;
}

interface BlueprintPayload {
    name: string;
    schema_json: { tables: { name: string; columns: Record<string, unknown> }[] };
    default_roles_json: { roles: string[] };
    ui_config_json: { primary_color: string; sidebar_theme: 'dark' | 'light' };
    default_stages_json: Stage[];
}

type StatusState = { type: 'idle' | 'loading' | 'ai_loading' | 'success' | 'error'; msg?: string };


const SUPER_API = '';





interface TemplateCard {
    id: string;
    icon: string;
    label: string;
    description: string;
    tables: string[];
    color: string; 
    payload: BlueprintPayload;
}

const TEMPLATES: TemplateCard[] = [
    {
        id: 'healthcare',
        icon: '🏥',
        label: 'Healthcare / Clinic',
        description: 'Patient management, appointments, prescriptions & medical records.',
        tables: ['patients', 'appointments', 'prescriptions', 'medical_records'],
        color: '#0ea5e9',
        payload: {
            name: 'Healthcare Clinic CRM',
            schema_json: {
                tables: [
                    {
                        name: 'patients',
                        columns: {
                            id: { type: 'UUID', primaryKey: true, defaultValue: 'UUIDV4' },
                            first_name: { type: 'STRING', allowNull: false },
                            last_name: { type: 'STRING', allowNull: false },
                            date_of_birth: { type: 'STRING', allowNull: true },
                            gender: { type: 'ENUM', values: ['Male', 'Female', 'Other'], allowNull: true },
                            phone: { type: 'STRING', allowNull: true },
                            email: { type: 'STRING', allowNull: true },
                            blood_type: { type: 'STRING', allowNull: true },
                        },
                    },
                    {
                        name: 'appointments',
                        columns: {
                            id: { type: 'UUID', primaryKey: true, defaultValue: 'UUIDV4' },
                            patient_id: { type: 'UUID', allowNull: false },
                            doctor_name: { type: 'STRING', allowNull: false },
                            appointment_date: { type: 'STRING', allowNull: false },
                            status: { type: 'ENUM', values: ['Scheduled', 'Completed', 'Cancelled', 'No-Show'], allowNull: false },
                            notes: { type: 'STRING', allowNull: true },
                        },
                    },
                    {
                        name: 'prescriptions',
                        columns: {
                            id: { type: 'UUID', primaryKey: true, defaultValue: 'UUIDV4' },
                            patient_id: { type: 'UUID', allowNull: false },
                            medication: { type: 'STRING', allowNull: false },
                            dosage: { type: 'STRING', allowNull: true },
                            prescribed_date: { type: 'STRING', allowNull: false },
                            refills_remaining: { type: 'NUMBER', allowNull: true },
                        },
                    },
                ],
            },
            default_roles_json: { roles: ['Admin', 'Doctor', 'Nurse', 'Receptionist'] },
            ui_config_json: { primary_color: '#0ea5e9', sidebar_theme: 'dark' },
            default_stages_json: [
                { name: 'New Patient', color: '#6366f1' },
                { name: 'Consultation', color: '#f59e0b' },
                { name: 'Treatment', color: '#3b82f6' },
                { name: 'Discharged', color: '#10b981' },
                { name: 'Referred', color: '#8b5cf6' },
            ],
        },
    },
    {
        id: 'legal',
        icon: '⚖️',
        label: 'Legal / Law Firm',
        description: 'Case management, clients, hearings & billing for legal practices.',
        tables: ['clients', 'cases', 'hearings', 'invoices'],
        color: '#7c3aed',
        payload: {
            name: 'Legal Firm CRM',
            schema_json: {
                tables: [
                    {
                        name: 'clients',
                        columns: {
                            id: { type: 'UUID', primaryKey: true, defaultValue: 'UUIDV4' },
                            full_name: { type: 'STRING', allowNull: false },
                            email: { type: 'STRING', allowNull: true },
                            phone: { type: 'STRING', allowNull: true },
                            company: { type: 'STRING', allowNull: true },
                            id_number: { type: 'STRING', allowNull: true },
                            nationality: { type: 'STRING', allowNull: true },
                        },
                    },
                    {
                        name: 'cases',
                        columns: {
                            id: { type: 'UUID', primaryKey: true, defaultValue: 'UUIDV4' },
                            client_id: { type: 'UUID', allowNull: false },
                            case_number: { type: 'STRING', allowNull: false },
                            case_type: { type: 'ENUM', values: ['Civil', 'Criminal', 'Corporate', 'Immigration', 'Family'], allowNull: false },
                            assigned_lawyer: { type: 'STRING', allowNull: true },
                            status: { type: 'ENUM', values: ['Open', 'In Progress', 'Won', 'Lost', 'Settled'], allowNull: false },
                            filed_date: { type: 'STRING', allowNull: true },
                        },
                    },
                    {
                        name: 'hearings',
                        columns: {
                            id: { type: 'UUID', primaryKey: true, defaultValue: 'UUIDV4' },
                            case_id: { type: 'UUID', allowNull: false },
                            hearing_date: { type: 'STRING', allowNull: false },
                            court_name: { type: 'STRING', allowNull: true },
                            judge_name: { type: 'STRING', allowNull: true },
                            outcome: { type: 'STRING', allowNull: true },
                        },
                    },
                ],
            },
            default_roles_json: { roles: ['Admin', 'Senior Lawyer', 'Associate', 'Paralegal', 'Receptionist'] },
            ui_config_json: { primary_color: '#7c3aed', sidebar_theme: 'dark' },
            default_stages_json: [
                { name: 'Inquiry', color: '#6366f1' },
                { name: 'Retainer Signed', color: '#f59e0b' },
                { name: 'Case Filed', color: '#3b82f6' },
                { name: 'In Hearing', color: '#8b5cf6' },
                { name: 'Won', color: '#10b981' },
                { name: 'Lost', color: '#ef4444' },
            ],
        },
    },
    {
        id: 'logistics',
        icon: '🚚',
        label: 'Logistics & Freight',
        description: 'Shipments, drivers, vehicles, warehouses & delivery tracking.',
        tables: ['shipments', 'drivers', 'vehicles', 'warehouses'],
        color: '#f59e0b',
        payload: {
            name: 'Logistics & Freight CRM',
            schema_json: {
                tables: [
                    {
                        name: 'shipments',
                        columns: {
                            id: { type: 'UUID', primaryKey: true, defaultValue: 'UUIDV4' },
                            tracking_number: { type: 'STRING', allowNull: false },
                            origin: { type: 'STRING', allowNull: false },
                            destination: { type: 'STRING', allowNull: false },
                            weight_kg: { type: 'NUMBER', allowNull: true },
                            status: { type: 'ENUM', values: ['Pending', 'In Transit', 'Delivered', 'Returned', 'Lost'], allowNull: false },
                            driver_id: { type: 'UUID', allowNull: true },
                            estimated_delivery: { type: 'STRING', allowNull: true },
                        },
                    },
                    {
                        name: 'drivers',
                        columns: {
                            id: { type: 'UUID', primaryKey: true, defaultValue: 'UUIDV4' },
                            full_name: { type: 'STRING', allowNull: false },
                            license_number: { type: 'STRING', allowNull: false },
                            phone: { type: 'STRING', allowNull: true },
                            vehicle_id: { type: 'UUID', allowNull: true },
                            is_available: { type: 'BOOLEAN', allowNull: false },
                        },
                    },
                    {
                        name: 'vehicles',
                        columns: {
                            id: { type: 'UUID', primaryKey: true, defaultValue: 'UUIDV4' },
                            plate_number: { type: 'STRING', allowNull: false },
                            vehicle_type: { type: 'ENUM', values: ['Van', 'Truck', 'Motorcycle', 'Trailer'], allowNull: false },
                            capacity_kg: { type: 'NUMBER', allowNull: true },
                            is_active: { type: 'BOOLEAN', allowNull: false },
                        },
                    },
                ],
            },
            default_roles_json: { roles: ['Admin', 'Dispatcher', 'Driver', 'Warehouse Manager'] },
            ui_config_json: { primary_color: '#f59e0b', sidebar_theme: 'dark' },
            default_stages_json: [
                { name: 'Order Received', color: '#6366f1' },
                { name: 'Processing', color: '#3b82f6' },
                { name: 'Picked Up', color: '#f59e0b' },
                { name: 'In Transit', color: '#8b5cf6' },
                { name: 'Delivered', color: '#10b981' },
                { name: 'Failed', color: '#ef4444' },
            ],
        },
    },
    {
        id: 'real_estate',
        icon: '🏢',
        label: 'Real Estate Agency',
        description: 'Property listings, buyers, sellers, viewings & transactions.',
        tables: ['properties', 'viewings', 'transactions', 'agents'],
        color: '#10b981',
        payload: {
            name: 'Real Estate Agency CRM',
            schema_json: {
                tables: [
                    {
                        name: 'properties',
                        columns: {
                            id: { type: 'UUID', primaryKey: true, defaultValue: 'UUIDV4' },
                            title: { type: 'STRING', allowNull: false },
                            property_type: { type: 'ENUM', values: ['Apartment', 'Villa', 'Office', 'Land', 'Townhouse'], allowNull: false },
                            price: { type: 'NUMBER', allowNull: false },
                            bedrooms: { type: 'NUMBER', allowNull: true },
                            bathrooms: { type: 'NUMBER', allowNull: true },
                            area_sqft: { type: 'NUMBER', allowNull: true },
                            location: { type: 'STRING', allowNull: false },
                            status: { type: 'ENUM', values: ['Available', 'Under Offer', 'Sold', 'Rented'], allowNull: false },
                        },
                    },
                    {
                        name: 'viewings',
                        columns: {
                            id: { type: 'UUID', primaryKey: true, defaultValue: 'UUIDV4' },
                            property_id: { type: 'UUID', allowNull: false },
                            lead_id: { type: 'UUID', allowNull: false },
                            viewing_date: { type: 'STRING', allowNull: false },
                            agent_name: { type: 'STRING', allowNull: true },
                            feedback: { type: 'STRING', allowNull: true },
                        },
                    },
                    {
                        name: 'transactions',
                        columns: {
                            id: { type: 'UUID', primaryKey: true, defaultValue: 'UUIDV4' },
                            property_id: { type: 'UUID', allowNull: false },
                            buyer_id: { type: 'UUID', allowNull: false },
                            transaction_date: { type: 'STRING', allowNull: false },
                            sale_price: { type: 'NUMBER', allowNull: false },
                            commission_pct: { type: 'NUMBER', allowNull: true },
                            transaction_type: { type: 'ENUM', values: ['Sale', 'Rental', 'Lease'], allowNull: false },
                        },
                    },
                ],
            },
            default_roles_json: { roles: ['Admin', 'Senior Agent', 'Agent', 'Coordinator'] },
            ui_config_json: { primary_color: '#10b981', sidebar_theme: 'dark' },
            default_stages_json: [
                { name: 'New Inquiry', color: '#6366f1' },
                { name: 'Property Search', color: '#3b82f6' },
                { name: 'Viewing Scheduled', color: '#f59e0b' },
                { name: 'Offer Made', color: '#8b5cf6' },
                { name: 'Closed', color: '#10b981' },
                { name: 'Lost', color: '#ef4444' },
            ],
        },
    },
    {
        id: 'education',
        icon: '🎓',
        label: 'Education / Training',
        description: 'Students, courses, enrollments, instructors & certifications.',
        tables: ['students', 'courses', 'enrollments', 'instructors'],
        color: '#6366f1',
        payload: {
            name: 'Education & Training CRM',
            schema_json: {
                tables: [
                    {
                        name: 'students',
                        columns: {
                            id: { type: 'UUID', primaryKey: true, defaultValue: 'UUIDV4' },
                            full_name: { type: 'STRING', allowNull: false },
                            email: { type: 'STRING', allowNull: false },
                            phone: { type: 'STRING', allowNull: true },
                            nationality: { type: 'STRING', allowNull: true },
                            enrollment_date: { type: 'STRING', allowNull: true },
                            is_active: { type: 'BOOLEAN', allowNull: false },
                        },
                    },
                    {
                        name: 'courses',
                        columns: {
                            id: { type: 'UUID', primaryKey: true, defaultValue: 'UUIDV4' },
                            title: { type: 'STRING', allowNull: false },
                            category: { type: 'STRING', allowNull: true },
                            duration_hours: { type: 'NUMBER', allowNull: true },
                            price: { type: 'NUMBER', allowNull: true },
                            is_certified: { type: 'BOOLEAN', allowNull: false },
                            instructor_id: { type: 'UUID', allowNull: true },
                        },
                    },
                    {
                        name: 'enrollments',
                        columns: {
                            id: { type: 'UUID', primaryKey: true, defaultValue: 'UUIDV4' },
                            student_id: { type: 'UUID', allowNull: false },
                            course_id: { type: 'UUID', allowNull: false },
                            start_date: { type: 'STRING', allowNull: false },
                            completion_date: { type: 'STRING', allowNull: true },
                            grade: { type: 'STRING', allowNull: true },
                            status: { type: 'ENUM', values: ['Enrolled', 'In Progress', 'Completed', 'Dropped'], allowNull: false },
                        },
                    },
                ],
            },
            default_roles_json: { roles: ['Admin', 'Instructor', 'Counselor', 'Student'] },
            ui_config_json: { primary_color: '#6366f1', sidebar_theme: 'dark' },
            default_stages_json: [
                { name: 'Inquiry', color: '#6366f1' },
                { name: 'Enrolled', color: '#3b82f6' },
                { name: 'In Progress', color: '#f59e0b' },
                { name: 'Completed', color: '#10b981' },
                { name: 'Dropped', color: '#ef4444' },
            ],
        },
    },
    {
        id: 'hospitality',
        icon: '🏨',
        label: 'Hospitality / Hotel',
        description: 'Guests, reservations, rooms, events & housekeeping management.',
        tables: ['guests', 'reservations', 'rooms', 'events'],
        color: '#ec4899',
        payload: {
            name: 'Hospitality & Hotel CRM',
            schema_json: {
                tables: [
                    {
                        name: 'guests',
                        columns: {
                            id: { type: 'UUID', primaryKey: true, defaultValue: 'UUIDV4' },
                            full_name: { type: 'STRING', allowNull: false },
                            email: { type: 'STRING', allowNull: true },
                            phone: { type: 'STRING', allowNull: true },
                            nationality: { type: 'STRING', allowNull: true },
                            passport_number: { type: 'STRING', allowNull: true },
                            vip_status: { type: 'BOOLEAN', allowNull: false },
                        },
                    },
                    {
                        name: 'reservations',
                        columns: {
                            id: { type: 'UUID', primaryKey: true, defaultValue: 'UUIDV4' },
                            guest_id: { type: 'UUID', allowNull: false },
                            room_id: { type: 'UUID', allowNull: false },
                            check_in: { type: 'STRING', allowNull: false },
                            check_out: { type: 'STRING', allowNull: false },
                            total_amount: { type: 'NUMBER', allowNull: true },
                            status: { type: 'ENUM', values: ['Booked', 'Checked In', 'Checked Out', 'Cancelled', 'No-Show'], allowNull: false },
                        },
                    },
                    {
                        name: 'rooms',
                        columns: {
                            id: { type: 'UUID', primaryKey: true, defaultValue: 'UUIDV4' },
                            room_number: { type: 'STRING', allowNull: false },
                            room_type: { type: 'ENUM', values: ['Standard', 'Deluxe', 'Suite', 'Penthouse'], allowNull: false },
                            floor: { type: 'NUMBER', allowNull: true },
                            price_per_night: { type: 'NUMBER', allowNull: false },
                            is_available: { type: 'BOOLEAN', allowNull: false },
                        },
                    },
                ],
            },
            default_roles_json: { roles: ['Admin', 'Front Desk', 'Housekeeping', 'Manager', 'Concierge'] },
            ui_config_json: { primary_color: '#ec4899', sidebar_theme: 'dark' },
            default_stages_json: [
                { name: 'Inquiry', color: '#6366f1' },
                { name: 'Booked', color: '#3b82f6' },
                { name: 'Checked In', color: '#10b981' },
                { name: 'Checked Out', color: '#f59e0b' },
                { name: 'Cancelled', color: '#ef4444' },
            ],
        },
    },
];





const toEditorJson = (payload: BlueprintPayload): string =>
    JSON.stringify(payload.schema_json, null, 2);





const DepartmentEditor: React.FC = () => {
    
    const [aiPrompt, setAiPrompt] = useState('');
    const [aiGenerating, setAiGenerating] = useState(false);
    const [aiError, setAiError] = useState('');
    const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

    
    const [name, setName] = useState('');
    const [schemaJson, setSchemaJson] = useState('{\n  "tables": []\n}');
    const [rolesJson, setRolesJson] = useState('["Admin", "Manager", "Staff"]');
    const [primaryColor, setPrimaryColor] = useState('#4F46E5');
    const [sidebarTheme, setSidebarTheme] = useState<'dark' | 'light'>('dark');
    const [stages, setStages] = useState<Stage[]>([
        { name: 'Lead', color: '#6366f1' },
        { name: 'Qualified', color: '#f59e0b' },
        { name: 'Won', color: '#22c55e' },
        { name: 'Lost', color: '#ef4444' },
    ]);

    const [status, setStatus] = useState<StatusState>({ type: 'idle' });

    

    const applyPayload = useCallback((payload: BlueprintPayload, templateId?: string) => {
        setName(payload.name);
        setSchemaJson(JSON.stringify(payload.schema_json, null, 2));
        setRolesJson(JSON.stringify(payload.default_roles_json.roles, null, 2));
        setPrimaryColor(payload.ui_config_json.primary_color ?? '#4F46E5');
        setSidebarTheme(payload.ui_config_json.sidebar_theme ?? 'dark');
        setStages(payload.default_stages_json ?? []);
        if (templateId) setSelectedTemplateId(templateId);
        setStatus({ type: 'idle' });
        setAiError('');
        
        setTimeout(() => {
            document.getElementById('blueprint-engine')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    }, []);

    

    const handleAIGenerate = async () => {
        if (!aiPrompt.trim()) return;
        setAiGenerating(true);
        setAiError('');
        setSelectedTemplateId(null);

        try {
            const res = await fetch(`${SUPER_API}/api/ai/generate-blueprint`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: aiPrompt }),
            });

            const data = await res.json();
            if (!res.ok) {
                setAiError(data.error ?? 'Gemini returned an error. Please try again.');
                return;
            }

            applyPayload(data.blueprint as BlueprintPayload, 'ai_generated');
        } catch (err) {
            setAiError(err instanceof Error ? err.message : 'Network error reaching AI service.');
        } finally {
            setAiGenerating(false);
        }
    };

    

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus({ type: 'loading' });

        let parsedSchema: unknown;
        try {
            parsedSchema = JSON.parse(schemaJson);
        } catch {
            setStatus({ type: 'error', msg: 'Schema JSON is invalid. Please fix the syntax before saving.' });
            return;
        }

        let parsedRoles: string[];
        try {
            parsedRoles = JSON.parse(rolesJson);
            if (!Array.isArray(parsedRoles)) throw new Error('Roles must be an array.');
        } catch {
            setStatus({ type: 'error', msg: 'Roles JSON is invalid. Must be an array of strings e.g. ["Admin","Staff"]' });
            return;
        }

        try {
            const res = await fetch(`${SUPER_API}/api/blueprints`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    schema_json: parsedSchema,
                    default_roles_json: { roles: parsedRoles },
                    ui_config_json: { primary_color: primaryColor, sidebar_theme: sidebarTheme },
                    default_stages_json: stages,
                }),
            });

            const data = await res.json();
            if (!res.ok) {
                setStatus({ type: 'error', msg: data.error ?? 'Failed to save blueprint.' });
                return;
            }

            setStatus({ type: 'success', msg: `✓ Blueprint "${name}" saved successfully!` });
        } catch (err) {
            setStatus({ type: 'error', msg: err instanceof Error ? err.message : 'Network error.' });
        }
    };

    

    const addStage = () => setStages((s) => [...s, { name: 'New Stage', color: '#6366f1' }]);
    const removeStage = (i: number) => setStages((s) => s.filter((_, idx) => idx !== i));
    const updateStage = (i: number, field: keyof Stage, value: string) =>
        setStages((s) => s.map((st, idx) => idx === i ? { ...st, [field]: value } : st));

    
    
    

    return (
        <div className="min-h-screen bg-gray-950 text-gray-100 pb-20">
            {}
            <div className="bg-gradient-to-r from-indigo-900/60 via-purple-900/50 to-gray-950 border-b border-white/10 px-8 py-10">
                <div className="max-w-6xl mx-auto flex items-start gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl shadow-xl flex-shrink-0">
                        🏗️
                    </div>
                    <div>
                        <h1 className="text-4xl font-extrabold tracking-tight text-white">Blueprint Engine</h1>
                        <p className="text-gray-400 mt-1.5 max-w-2xl">
                            Generate fully structured department schemas using Gemini AI, pick from the curated template library,
                            or hand-craft a schema from scratch.
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 py-10 space-y-12">

                {}
                <section>
                    {}
                    <div className="flex items-center gap-3 mb-5">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-lg">✨</div>
                        <div>
                            <h2 className="text-xl font-extrabold text-white">Section 1 — AI Architect</h2>
                            <p className="text-xs text-gray-500">Describe any business type. Gemini will generate a complete CRM schema instantly.</p>
                        </div>
                    </div>

                    <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
                        {}
                        <div className="h-1 bg-gradient-to-r from-violet-500 via-indigo-500 to-blue-500" />

                        <div className="p-6 space-y-4">
                            <textarea
                                rows={3}
                                value={aiPrompt}
                                onChange={(e) => setAiPrompt(e.target.value)}
                                placeholder={`Examples:\n• "Build a CRM for a Dental Clinic with patient records and appointments"\n• "Create a SaaS platform schema for a car rental company with fleets and bookings"\n• "Generate a hotel management CRM with guests, rooms and housekeeping"`}
                                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-100 placeholder-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none resize-none leading-relaxed font-mono"
                            />

                            {aiError && (
                                <div className="bg-red-900/40 border border-red-800 text-red-300 text-sm rounded-xl px-4 py-3 font-medium">
                                    ⚠️ {aiError}
                                </div>
                            )}

                            <div className="flex items-center gap-4">
                                <button
                                    type="button"
                                    onClick={handleAIGenerate}
                                    disabled={aiGenerating || !aiPrompt.trim()}
                                    className="inline-flex items-center gap-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-extrabold px-6 py-3 rounded-xl hover:from-violet-700 hover:to-indigo-700 transition shadow-lg shadow-indigo-900/50 disabled:opacity-50 active:scale-95"
                                >
                                    {aiGenerating ? (
                                        <>
                                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                            </svg>
                                            Gemini is thinking…
                                        </>
                                    ) : (
                                        <>✨ Generate with Gemini</>
                                    )}
                                </button>

                                {aiGenerating && (
                                    <div className="flex items-center gap-2 text-sm text-indigo-400 animate-pulse">
                                        <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                                        <span className="font-medium">Analyzing industry & generating schema…</span>
                                    </div>
                                )}
                            </div>

                            {}
                            <div className="flex flex-wrap gap-2 pt-1">
                                {['Schema Tables', 'Column Types', 'Pipeline Stages', 'Role Definitions', 'Brand Colors'].map((tag) => (
                                    <span key={tag} className="text-xs bg-indigo-950 text-indigo-300 border border-indigo-800 rounded-full px-3 py-1 font-semibold">
                                        ✓ {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {}
                <section>
                    <div className="flex items-center gap-3 mb-5">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-lg">📚</div>
                        <div>
                            <h2 className="text-xl font-extrabold text-white">Section 2 — Template Library</h2>
                            <p className="text-xs text-gray-500">Select a pre-built industry template to auto-fill the schema editor below.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                        {TEMPLATES.map((tpl) => {
                            const isSelected = selectedTemplateId === tpl.id;
                            return (
                                <button
                                    key={tpl.id}
                                    type="button"
                                    onClick={() => applyPayload(tpl.payload, tpl.id)}
                                    className={`relative text-left rounded-2xl border-2 p-5 transition active:scale-[0.98] group
                    ${isSelected
                                            ? 'border-white/40 bg-gray-800'
                                            : 'border-gray-800 bg-gray-900 hover:border-gray-600 hover:bg-gray-800/60'}`}
                                    style={{ borderLeftColor: isSelected ? tpl.color : undefined, borderLeftWidth: isSelected ? 3 : undefined }}
                                >
                                    {}
                                    {isSelected && (
                                        <div className="absolute top-3 right-3 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-widest"
                                            style={{ color: tpl.color, backgroundColor: `${tpl.color}22` }}>
                                            Selected
                                        </div>
                                    )}

                                    {}
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="text-3xl">{tpl.icon}</div>
                                        <div>
                                            <p className="font-extrabold text-white text-sm">{tpl.label}</p>
                                            <div className="w-8 h-0.5 rounded mt-0.5" style={{ backgroundColor: tpl.color }} />
                                        </div>
                                    </div>

                                    {}
                                    <p className="text-xs text-gray-400 leading-relaxed mb-3">{tpl.description}</p>

                                    {}
                                    <div className="flex flex-wrap gap-1.5">
                                        {tpl.tables.map((t) => (
                                            <span key={t} className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                                                style={{ color: tpl.color, borderColor: `${tpl.color}44`, backgroundColor: `${tpl.color}11` }}>
                                                {t}
                                            </span>
                                        ))}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </section>

                {}
                <section id="blueprint-engine">
                    <div className="flex items-center gap-3 mb-5">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-lg">⚙️</div>
                        <div>
                            <h2 className="text-xl font-extrabold text-white">Section 3 — Blueprint Engine</h2>
                            <p className="text-xs text-gray-500">Review, tweak or hand-craft your schema before committing to the Master database.</p>
                        </div>
                    </div>

                    {}
                    {status.msg && (
                        <div className={`mb-5 px-5 py-3.5 rounded-xl border font-semibold text-sm
              ${status.type === 'success'
                                ? 'bg-green-900/40 border-green-800 text-green-300'
                                : 'bg-red-900/40 border-red-800 text-red-300'}`}>
                            {status.msg}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {}
                        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 space-y-4">
                            <h3 className="font-extrabold text-gray-300 text-sm uppercase tracking-wider">Basic Info</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Blueprint Name *</label>
                                    <input
                                        required
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="e.g. Healthcare Clinic CRM"
                                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none placeholder-gray-500"
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <div className="flex-1">
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Primary Color</label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="color"
                                                value={primaryColor}
                                                onChange={(e) => setPrimaryColor(e.target.value)}
                                                className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                                            />
                                            <input
                                                type="text"
                                                value={primaryColor}
                                                onChange={(e) => { if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value)) setPrimaryColor(e.target.value); }}
                                                className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm font-mono text-white focus:ring-2 focus:ring-blue-500 outline-none uppercase"
                                                maxLength={7}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Sidebar</label>
                                        <div className="flex gap-2">
                                            {(['dark', 'light'] as ('dark' | 'light')[]).map((m) => (
                                                <button
                                                    key={m}
                                                    type="button"
                                                    onClick={() => setSidebarTheme(m)}
                                                    className={`flex-1 px-3 py-2.5 rounded-xl border text-xs font-bold capitalize transition
                            ${sidebarTheme === m ? 'border-blue-500 bg-blue-900/40 text-blue-300' : 'border-gray-700 text-gray-400 hover:border-gray-500'}`}
                                                >
                                                    {m}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {}
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Roles (JSON Array) *</label>
                                <input
                                    type="text"
                                    value={rolesJson}
                                    onChange={(e) => setRolesJson(e.target.value)}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm font-mono text-white focus:ring-2 focus:ring-blue-500 outline-none placeholder-gray-500"
                                    placeholder='["Admin", "Manager", "Staff"]'
                                />
                            </div>
                        </div>

                        {}
                        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-extrabold text-gray-300 text-sm uppercase tracking-wider">Pipeline Stages</h3>
                                <button
                                    type="button"
                                    onClick={addStage}
                                    className="text-xs font-bold text-blue-400 hover:text-blue-300 border border-blue-800 px-3 py-1 rounded-lg hover:bg-blue-900/30 transition"
                                >
                                    + Add Stage
                                </button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {stages.map((stage, i) => (
                                    <div key={i} className="flex items-center gap-2 bg-gray-800 rounded-xl p-3 border border-gray-700">
                                        {}
                                        <div className="w-6 h-6 rounded-lg border border-gray-600 cursor-pointer overflow-hidden flex-shrink-0">
                                            <input
                                                type="color"
                                                value={stage.color}
                                                onChange={(e) => updateStage(i, 'color', e.target.value)}
                                                className="w-8 h-8 -m-1 cursor-pointer border-0 bg-transparent"
                                                title="Stage color"
                                            />
                                        </div>
                                        {}
                                        <input
                                            type="text"
                                            value={stage.name}
                                            onChange={(e) => updateStage(i, 'name', e.target.value)}
                                            className="flex-1 bg-transparent text-sm text-white focus:outline-none placeholder-gray-600"
                                            placeholder="Stage name"
                                        />
                                        {}
                                        <div className="w-5 h-5 rounded-full bg-gray-700 flex items-center justify-center text-[10px] font-bold text-gray-400 flex-shrink-0">
                                            {i + 1}
                                        </div>
                                        {}
                                        <button
                                            type="button"
                                            onClick={() => removeStage(i)}
                                            className="text-gray-600 hover:text-red-400 transition font-bold text-sm flex-shrink-0"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {}
                        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 space-y-3">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="font-extrabold text-gray-300 text-sm uppercase tracking-wider">Schema JSON *</h3>
                                    <p className="text-xs text-gray-600 mt-0.5">This drives the Database Engine. Auto-filled by AI or Template above.</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-amber-500 bg-amber-900/30 border border-amber-800 px-2 py-1 rounded-lg">
                                        ⚠ Validate before save
                                    </span>
                                </div>
                            </div>
                            <textarea
                                required
                                rows={18}
                                value={schemaJson}
                                onChange={(e) => setSchemaJson(e.target.value)}
                                spellCheck={false}
                                className="w-full font-mono text-xs bg-gray-800 border border-gray-700 rounded-xl px-4 py-4 text-green-300 focus:ring-2 focus:ring-blue-500 outline-none resize-none leading-relaxed shadow-inner"
                            />
                        </div>

                        {}
                        <div className="flex items-center gap-4">
                            <button
                                type="submit"
                                disabled={status.type === 'loading'}
                                className="inline-flex items-center gap-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold px-8 py-3.5 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition shadow-lg shadow-blue-900/50 disabled:opacity-60 active:scale-[0.99]"
                            >
                                {status.type === 'loading' ? (
                                    <>
                                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Saving Blueprint…
                                    </>
                                ) : (
                                    '💾 Save Department Blueprint'
                                )}
                            </button>
                            <p className="text-xs text-gray-600">
                                This will write a permanent record to the Master database and make the blueprint available for tenant provisioning.
                            </p>
                        </div>
                    </form>
                </section>
            </div>
        </div>
    );
};

export default DepartmentEditor;
