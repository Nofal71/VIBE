import { Plan, DepartmentBlueprint, Company, Domain } from '../models';
import { DatabaseEngine } from '../services/DatabaseEngine';
import { TenantSeeder } from '../services/TenantSeeder';
import { DockerOrchestrator } from '../services/DockerOrchestrator';

export const runInitialSeed = async (): Promise<void> => {
    try {
        console.log('Checking database seed status...');

        const existingPlan = await Plan.findOne({ where: { name: 'Pro Plan' } });

        if (existingPlan) {
            console.log('Database already seeded. Skipping Plan/Blueprint initialization.');
        } else {
            console.log('Database is empty. Populating default System settings (Phase 13)...');

            // 1. Seed Default Plans
            await Plan.create({
                id: 'uuid-pro-plan',
                name: 'Pro Plan',
                max_leads: 10000,
                storage_limit_mb: 5000,
                features: { reports: true, automations: true },
            });

            await Plan.create({
                id: 'uuid-starter-plan',
                name: 'Starter Plan',
                max_leads: 500,
                storage_limit_mb: 1000,
                features: { reports: false, automations: false },
            });

            // 2. Seed Default Department Blueprints
            await DepartmentBlueprint.create({
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
                    primary_color: '#1E3A8A',
                    logo_url: 'https://via.placeholder.com/150x50/1E3A8A/FFFFFF?text=ImmiGlobal',
                    sidebar_theme: 'light'
                },
                default_stages_json: [
                    { name: 'New', color: '#CBD5E1' },
                    { name: 'Document Collection', color: '#FCD34D' },
                    { name: 'Lawyer Review', color: '#93C5FD' },
                    { name: 'Visa Submitted', color: '#C084FC' },
                    { name: 'Approved', color: '#4ADE80' },
                    { name: 'Rejected', color: '#F87171' }
                ]
            });

            await DepartmentBlueprint.create({
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
                    primary_color: '#4F46E5', // Updated to match default Tailwind brand
                    logo_url: 'https://via.placeholder.com/150x50/000000/4F46E5?text=Elite+Estates',
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
            console.log('Core System Seed completed.');
        }

        // 3. Seed Default Demo Company (Idempotent)
        const demoDomain = 'demo.localhost';
        const existingDomain = await Domain.findOne({ where: { domain_name: demoDomain } });

        if (!existingDomain) {
            console.log(`Seeding Default Demo Company: ${demoDomain}...`);

            const db_name = 'tenant_demo_default';
            const adminEmail = 'admin@' + demoDomain;
            const tempPassword = 'admin123A1!'; // Standardized demo password

            // Create Company Record
            const demoCompany = await Company.create({
                name: 'Demo Immigration Firm',
                plan_id: 'uuid-pro-plan',
                department_id: 'uuid-immigration',
                db_name,
                status: 'active',
            });

            // Create Domain Record
            await Domain.create({
                company_id: demoCompany.id,
                domain_name: demoDomain,
                is_verified: true,
            });

            // Provision Infrastructure & Database
            await DatabaseEngine.createTenantDatabase(db_name);

            const blueprint = await DepartmentBlueprint.findByPk('uuid-immigration');
            if (blueprint) {
                await DatabaseEngine.generateDynamicSchema(db_name, blueprint.schema_json);
                // Seed Tenant Users (Admin)
                await TenantSeeder.seedTenantBasics(db_name, blueprint, adminEmail, tempPassword, demoCompany.id);

                // Phase 15 Integration: Automated Infrastructure Orchestration for Demo
                await DockerOrchestrator.provisionTenantInfrastructure(demoDomain, db_name);

                console.log(`Demo Company [${demoDomain}] seeded successfully.`);
            }
        }

        console.log('Initial Database Seed process finished.');
    } catch (error) {
        console.error('Failed to run initial database seed:', error);
    }
};
