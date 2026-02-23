import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Company, Domain, DepartmentBlueprint } from '../models';
import { DatabaseEngine } from '../services/DatabaseEngine';
import { TenantSeeder } from '../services/TenantSeeder';
import { DockerOrchestrator } from '../services/DockerOrchestrator';

export class ProvisioningController {
    static async createCompany(req: Request, res: Response): Promise<void> {
        try {
            const { company_name, domain, plan_id, department_id } = req.body;

            if (!company_name || !domain || !plan_id || !department_id) {
                res.status(400).json({ error: 'Missing required fields.' });
                return;
            }

            const db_name = `tenant_${uuidv4().replace(/-/g, '')}`;

            const blueprint = await DepartmentBlueprint.findByPk(department_id);
            if (!blueprint) {
                res.status(404).json({ error: 'Department blueprint not found.' });
                return;
            }

            await DatabaseEngine.createTenantDatabase(db_name);
            await DatabaseEngine.generateDynamicSchema(db_name, blueprint.schema_json);

            // Generate credentials
            const adminEmail = 'admin@' + domain;
            const tempPassword = Math.random().toString(36).slice(-8) + 'A1!';

            const newCompany = await Company.create({
                name: company_name,
                plan_id,
                department_id,
                db_name,
                status: 'active',
            });

            // Phase 14: Automated Tenant User Seeding execution
            await TenantSeeder.seedTenantBasics(db_name, blueprint, adminEmail, tempPassword, newCompany.id);

            // Phase 15: Automated Infrastructure Orchestration
            await DockerOrchestrator.provisionTenantInfrastructure(domain, db_name);

            await Domain.create({
                company_id: newCompany.id,
                domain_name: domain,
                is_verified: false,
            });

            res.status(201).json({
                message: 'Company provisioned successfully.',
                company: newCompany,
                adminEmail,
                tempPassword,
            });
        } catch (error) {
            console.error('Provisioning error:', error);
            res.status(500).json({ error: 'Failed to provision company.' });
        }
    }
}
