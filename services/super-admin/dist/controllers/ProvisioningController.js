"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProvisioningController = void 0;
const uuid_1 = require("uuid");
const models_1 = require("../models");
const DatabaseEngine_1 = require("../services/DatabaseEngine");
const TenantSeeder_1 = require("../services/TenantSeeder");
class ProvisioningController {
    static async createCompany(req, res) {
        try {
            const { company_name, domain, plan_id, department_id, admin_email } = req.body;
            if (!company_name || !domain || !plan_id || !department_id) {
                res.status(400).json({ error: 'Missing required fields.' });
                return;
            }
            const db_name = `tenant_${(0, uuid_1.v4)().replace(/-/g, '')}`;
            const blueprint = await models_1.DepartmentBlueprint.findByPk(department_id);
            if (!blueprint) {
                res.status(404).json({ error: 'Department blueprint not found.' });
                return;
            }
            await DatabaseEngine_1.DatabaseEngine.createTenantDatabase(db_name);
            await DatabaseEngine_1.DatabaseEngine.generateDynamicSchema(db_name, blueprint.schema_json);
            // Phase 14: Automated Tenant User Seeding execution
            await TenantSeeder_1.TenantSeeder.seedTenantBasics(db_name, blueprint, admin_email || 'admin@tenant.local');
            const newCompany = await models_1.Company.create({
                name: company_name,
                plan_id,
                department_id,
                db_name,
                status: 'active',
            });
            await models_1.Domain.create({
                company_id: newCompany.id,
                domain_name: domain,
                is_verified: false,
            });
            res.status(201).json({
                message: 'Company provisioned successfully.',
                company: newCompany,
            });
        }
        catch (error) {
            console.error('Provisioning error:', error);
            res.status(500).json({ error: 'Failed to provision company.' });
        }
    }
}
exports.ProvisioningController = ProvisioningController;
