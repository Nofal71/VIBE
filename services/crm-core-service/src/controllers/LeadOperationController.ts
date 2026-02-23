import { Request, Response } from 'express';
import { Op, QueryTypes, WhereOptions } from 'sequelize';
import { TenantConnectionManager } from '../config/TenantConnectionManager';
import { Lead } from '../models/Lead';

export class LeadOperationController {

    private static async initLead(tenantId: string): Promise<void> {
        const sequelize = await TenantConnectionManager.getConnection(tenantId);
        Lead.initModel(sequelize, tenantId);
        await Lead.sync({ alter: true });
    }

    /**
     * Bulk delete leads by an array of IDs, wrapped in a transaction for safety.
     * Body: { lead_ids: string[] }
     */
    static async bulkDelete(req: Request, res: Response): Promise<void> {
        const tenantId = req.headers['x-tenant-id'] as string;

        try {
            const { lead_ids } = req.body as { lead_ids: string[] };

            if (!Array.isArray(lead_ids) || lead_ids.length === 0) {
                res.status(400).json({ error: 'lead_ids must be a non-empty array.' });
                return;
            }

            await LeadOperationController.initLead(tenantId);
            const sequelize = await TenantConnectionManager.getConnection(tenantId);
            const transaction = await sequelize.transaction();

            try {
                const deleted = await Lead.destroy({
                    where: { id: { [Op.in]: lead_ids } },
                    transaction,
                });
                await transaction.commit();
                res.status(200).json({ message: `${deleted} lead(s) deleted successfully.`, deleted });
            } catch (err) {
                await transaction.rollback();
                throw err;
            }
        } catch (error) {
            console.error('[LeadOperationController] bulkDelete failed:', error);
            res.status(500).json({ error: 'Bulk delete operation failed.' });
        }
    }

    /**
     * Bulk assign leads to a staff member, wrapped in a transaction.
     * Body: { lead_ids: string[], assigned_to: string }
     */
    static async bulkAssign(req: Request, res: Response): Promise<void> {
        const tenantId = req.headers['x-tenant-id'] as string;

        try {
            const { lead_ids, assigned_to } = req.body as { lead_ids: string[]; assigned_to: string };

            if (!Array.isArray(lead_ids) || lead_ids.length === 0) {
                res.status(400).json({ error: 'lead_ids must be a non-empty array.' });
                return;
            }
            if (!assigned_to) {
                res.status(400).json({ error: 'assigned_to (staff UUID) is required.' });
                return;
            }

            await LeadOperationController.initLead(tenantId);
            const sequelize = await TenantConnectionManager.getConnection(tenantId);
            const transaction = await sequelize.transaction();

            try {
                const [updated] = await Lead.update(
                    { assigned_to } as Partial<Lead>,
                    { where: { id: { [Op.in]: lead_ids } }, transaction }
                );
                await transaction.commit();
                res.status(200).json({ message: `${updated} lead(s) assigned to ${assigned_to}.`, updated });
            } catch (err) {
                await transaction.rollback();
                throw err;
            }
        } catch (error) {
            console.error('[LeadOperationController] bulkAssign failed:', error);
            res.status(500).json({ error: 'Bulk assign operation failed.' });
        }
    }

    /**
     * Advanced lead query with dynamic column filtering from query params.
     * Any query param that matches a column name is used as a filter.
     * Reserved params (page, limit) are extracted first.
     * Example: GET /leads/advanced?status_id=WON&country=US&page=1&limit=25
     */
    static async getLeadsAdvanced(req: Request, res: Response): Promise<void> {
        const tenantId = req.headers['x-tenant-id'] as string;

        try {
            await LeadOperationController.initLead(tenantId);
            const sequelize = await TenantConnectionManager.getConnection(tenantId);

            // Extract pagination params
            const page = Math.max(1, Number(req.query.page ?? 1));
            const limit = Math.min(200, Math.max(1, Number(req.query.limit ?? 50)));
            const offset = (page - 1) * limit;

            // Build WHERE clause from remaining query params
            const RESERVED = new Set(['page', 'limit']);
            const where: WhereOptions = {};
            for (const [key, value] of Object.entries(req.query)) {
                if (!RESERVED.has(key) && typeof value === 'string' && value.trim()) {
                    (where as Record<string, unknown>)[key] = value;
                }
            }

            const { count, rows } = await Lead.findAndCountAll({
                where,
                limit,
                offset,
                order: [['createdAt', 'DESC']],
            });

            res.status(200).json({
                leads: rows,
                pagination: {
                    total: count,
                    page,
                    limit,
                    pages: Math.ceil(count / limit),
                },
            });
        } catch (error) {
            console.error('[LeadOperationController] getLeadsAdvanced failed:', error);
            res.status(500).json({ error: 'Advanced lead query failed.' });
        }
    }
}
