import { Request, Response } from 'express';
import { Company, DepartmentBlueprint, Plan } from '../models';

export class TenantConfigController {
    static async getTenantConfig(req: Request, res: Response): Promise<void> {
        try {
            const tenantId = req.headers['x-tenant-id'] as string;

            if (!tenantId) {
                res.status(400).json({ error: 'Missing x-tenant-id header' });
                return;
            }

            
            const company = await Company.findOne({
                where: { db_name: tenantId },
                include: [
                    {
                        model: DepartmentBlueprint,
                        as: 'department',
                    },
                    {
                        model: Plan,
                        as: 'plan',
                    }
                ],
            });

            if (!company) {
                res.status(404).json({ error: 'Tenant Configuration not found in SaaS Master.' });
                return;
            }

            const department = company.get('department') as any;
            const plan = company.get('plan') as any;

            res.status(200).json({
                tenant_id: company.db_name,
                company_name: company.name,
                schema_json: department?.schema_json || { tables: [] }, 
                permissions: department?.default_roles_json || {},
                ui_config_json: department?.ui_config_json || {},
                default_stages_json: department?.default_stages_json || [],
                plan_limits: {
                    max_leads: plan?.max_leads || 0,
                    storage_limit_mb: plan?.storage_limit_mb || 0,
                    features: plan?.features || {},
                }
            });
        } catch (error) {
            console.error('Error fetching TenantConfig:', error);
            res.status(500).json({ error: 'Internal Server Error while resolving bounds.' });
        }
    }
}
