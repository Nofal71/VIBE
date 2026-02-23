"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runInitialSeed = void 0;
const models_1 = require("../models");
const runInitialSeed = async () => {
    try {
        console.log('Checking database seed status...');
        const existingPlan = await models_1.Plan.findOne({ where: { name: 'Pro Plan' } });
        if (existingPlan) {
            console.log('Database already seeded. Skipping initialization.');
            return;
        }
        console.log('Database is empty. Populating default System settings (Phase 13)...');
        // 1. Seed Default Plans
        await models_1.Plan.create({
            id: 'uuid-pro-plan',
            name: 'Pro Plan',
            max_leads: 10000,
            storage_limit_mb: 5000,
            features: { reports: true, automations: true },
        });
        await models_1.Plan.create({
            id: 'uuid-starter-plan',
            name: 'Starter Plan',
            max_leads: 500,
            storage_limit_mb: 1000,
            features: { reports: false, automations: false },
        });
        // 2. Seed Default Department Blueprints (Updated Phase 13)
        await models_1.DepartmentBlueprint.create({
            id: 'uuid-immigration',
            name: 'Immigration',
            schema_json: {
                tables: [
                    {
                        name: 'visas',
                        columns: {
                            id: { type: 'UUID', primaryKey: true, defaultValue: 'UUIDV4' },
                            lead_id: { type: 'UUID', allowNull: false },
                            country: { type: 'STRING', allowNull: false },
                            visa_type: { type: 'STRING', allowNull: false },
                        },
                        relations: [{ foreignKey: 'lead_id' }],
                    },
                ],
            },
            default_roles_json: { roles: ['Admin', 'Agent', 'Paralegal'] },
            ui_config_json: {
                primary_color: '#1E3A8A', // Tailwind Blue-900
                logo_url: 'https://via.placeholder.com/150x50/1E3A8A/FFFFFF?text=ImmiGlobal',
                sidebar_theme: 'light'
            },
            default_stages_json: [
                { name: 'New', color: '#CBD5E1' }, // slate-300
                { name: 'Document Collection', color: '#FCD34D' }, // amber-300
                { name: 'Lawyer Review', color: '#93C5FD' }, // blue-300
                { name: 'Visa Submitted', color: '#C084FC' }, // purple-400
                { name: 'Approved', color: '#4ADE80' }, // green-400
                { name: 'Rejected', color: '#F87171' } // red-400
            ]
        });
        await models_1.DepartmentBlueprint.create({
            id: 'uuid-realestate',
            name: 'Real Estate',
            schema_json: {
                tables: [
                    {
                        name: 'properties',
                        columns: {
                            id: { type: 'UUID', primaryKey: true, defaultValue: 'UUIDV4' },
                            lead_id: { type: 'UUID', allowNull: false },
                            address: { type: 'STRING', allowNull: false },
                            price: { type: 'FLOAT', allowNull: false },
                        },
                        relations: [{ foreignKey: 'lead_id' }],
                    },
                ],
            },
            default_roles_json: { roles: ['Admin', 'Broker', 'Agent'] },
            ui_config_json: {
                primary_color: '#B45309', // Tailwind Amber-700
                logo_url: 'https://via.placeholder.com/150x50/000000/B45309?text=Elite+Estates',
                sidebar_theme: 'dark'
            },
            default_stages_json: [
                { name: 'New Lead', color: '#CBD5E1' },
                { name: 'Property Shown', color: '#FDE047' },
                { name: 'Offer Made', color: '#FDBA74' },
                { name: 'Under Contract', color: '#60A5FA' },
                { name: 'Sold', color: '#4ADE80' },
                { name: 'Lost', color: '#9CA3AF' }
            ]
        });
        console.log('Initial Database Seed completed successfully.');
    }
    catch (error) {
        console.error('Failed to run initial database seed:', error);
    }
};
exports.runInitialSeed = runInitialSeed;
