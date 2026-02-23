"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantConfigController = void 0;
const models_1 = require("../models");
class TenantConfigController {
    static async getTenantConfig(req, res) {
        try {
            const tenantId = req.headers['x-tenant-id'];
            if (!tenantId) {
                res.status(400).json({ error: 'Missing x-tenant-id header' });
                return;
            }
            // Query Master DB
            const company = await models_1.Company.findOne({
                where: { db_name: tenantId },
                include: [
                    {
                        model: models_1.DepartmentBlueprint,
                        as: 'department',
                    },
                    {
                        model: models_1.Plan,
                        as: 'plan',
                    }
                ],
            });
            if (!company) {
                res.status(404).json({ error: 'Tenant Configuration not found in SaaS Master.' });
                return;
            }
            const department = company.get('department');
            const plan = company.get('plan');
            res.status(200).json({
                tenant_id: company.db_name,
                company_name: company.name,
                schema_json: department?.schema_json || { tables: [] }, // Provide tables for Sidebar mapping
                permissions: department?.default_roles_json || {},
                ui_config_json: department?.ui_config_json || {},
                default_stages_json: department?.default_stages_json || [],
                plan_limits: {
                    max_leads: plan?.max_leads || 0,
                    storage_limit_mb: plan?.storage_limit_mb || 0,
                    features: plan?.features || {},
                }
            });
        }
        catch (error) {
            console.error('Error fetching TenantConfig:', error);
            res.status(500).json({ error: 'Internal Server Error while resolving bounds.' });
        }
    }
}
exports.TenantConfigController = TenantConfigController;
