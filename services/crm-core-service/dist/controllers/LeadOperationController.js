"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeadOperationController = void 0;
const sequelize_1 = require("sequelize");
const TenantConnectionManager_1 = require("../config/TenantConnectionManager");
const Lead_1 = require("../models/Lead");
class LeadOperationController {
    static async initLead(tenantId) {
        const sequelize = await TenantConnectionManager_1.TenantConnectionManager.getConnection(tenantId);
        Lead_1.Lead.initModel(sequelize, tenantId);
        await Lead_1.Lead.sync({ alter: true });
    }
    /**
     * Bulk delete leads by an array of IDs, wrapped in a transaction for safety.
     * Body: { lead_ids: string[] }
     */
    static async bulkDelete(req, res) {
        const tenantId = req.headers['x-tenant-id'];
        try {
            const { lead_ids } = req.body;
            if (!Array.isArray(lead_ids) || lead_ids.length === 0) {
                res.status(400).json({ error: 'lead_ids must be a non-empty array.' });
                return;
            }
            await LeadOperationController.initLead(tenantId);
            const sequelize = await TenantConnectionManager_1.TenantConnectionManager.getConnection(tenantId);
            const transaction = await sequelize.transaction();
            try {
                const deleted = await Lead_1.Lead.destroy({
                    where: { id: { [sequelize_1.Op.in]: lead_ids } },
                    transaction,
                });
                await transaction.commit();
                res.status(200).json({ message: `${deleted} lead(s) deleted successfully.`, deleted });
            }
            catch (err) {
                await transaction.rollback();
                throw err;
            }
        }
        catch (error) {
            console.error('[LeadOperationController] bulkDelete failed:', error);
            res.status(500).json({ error: 'Bulk delete operation failed.' });
        }
    }
    /**
     * Bulk assign leads to a staff member, wrapped in a transaction.
     * Body: { lead_ids: string[], assigned_to: string }
     */
    static async bulkAssign(req, res) {
        const tenantId = req.headers['x-tenant-id'];
        try {
            const { lead_ids, assigned_to } = req.body;
            if (!Array.isArray(lead_ids) || lead_ids.length === 0) {
                res.status(400).json({ error: 'lead_ids must be a non-empty array.' });
                return;
            }
            if (!assigned_to) {
                res.status(400).json({ error: 'assigned_to (staff UUID) is required.' });
                return;
            }
            await LeadOperationController.initLead(tenantId);
            const sequelize = await TenantConnectionManager_1.TenantConnectionManager.getConnection(tenantId);
            const transaction = await sequelize.transaction();
            try {
                const [updated] = await Lead_1.Lead.update({ assigned_to }, { where: { id: { [sequelize_1.Op.in]: lead_ids } }, transaction });
                await transaction.commit();
                res.status(200).json({ message: `${updated} lead(s) assigned to ${assigned_to}.`, updated });
            }
            catch (err) {
                await transaction.rollback();
                throw err;
            }
        }
        catch (error) {
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
    static async getLeadsAdvanced(req, res) {
        const tenantId = req.headers['x-tenant-id'];
        try {
            await LeadOperationController.initLead(tenantId);
            const sequelize = await TenantConnectionManager_1.TenantConnectionManager.getConnection(tenantId);
            // Extract pagination params
            const page = Math.max(1, Number(req.query.page ?? 1));
            const limit = Math.min(200, Math.max(1, Number(req.query.limit ?? 50)));
            const offset = (page - 1) * limit;
            // Build WHERE clause from remaining query params
            const RESERVED = new Set(['page', 'limit']);
            const where = {};
            for (const [key, value] of Object.entries(req.query)) {
                if (!RESERVED.has(key) && typeof value === 'string' && value.trim()) {
                    where[key] = value;
                }
            }
            const { count, rows } = await Lead_1.Lead.findAndCountAll({
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
        }
        catch (error) {
            console.error('[LeadOperationController] getLeadsAdvanced failed:', error);
            res.status(500).json({ error: 'Advanced lead query failed.' });
        }
    }
}
exports.LeadOperationController = LeadOperationController;
