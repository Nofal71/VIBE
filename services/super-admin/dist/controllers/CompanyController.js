"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyController = void 0;
const sequelize_1 = require("sequelize");
const models_1 = require("../models");
// ─── Ephemeral Tenant Connection ──────────────────────────────────────────────
/**
 * Opens a short-lived Sequelize connection to the given tenant DB,
 * runs the provided callback, then unconditionally closes the connection.
 * This avoids leaking connections during metrics tunnelling.
 */
async function withTenantConnection(dbName, fn) {
    const seq = new sequelize_1.Sequelize(dbName, process.env.DB_USER || 'admin', process.env.DB_PASSWORD || 'admin', {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306', 10),
        dialect: 'mysql',
        logging: false,
        pool: { max: 2, min: 0, acquire: 15000, idle: 5000 },
    });
    try {
        await seq.authenticate();
        return await fn(seq);
    }
    finally {
        await seq.close();
    }
}
// ─── Table existence guard ────────────────────────────────────────────────────
async function tableExists(seq, tableName, dbName) {
    const rows = await seq.query(`SELECT TABLE_NAME FROM information_schema.TABLES
         WHERE TABLE_SCHEMA = :db AND TABLE_NAME = :table LIMIT 1`, { replacements: { db: dbName, table: tableName }, type: sequelize_1.QueryTypes.SELECT });
    return rows.length > 0;
}
// ─────────────────────────────────────────────────────────────────────────────
class CompanyController {
    /**
     * GET /api/companies
     * Returns all Company records with associated Plan, Domain[], and DepartmentBlueprint.
     */
    static async getCompanies(req, res) {
        try {
            const companies = await models_1.Company.findAll({
                include: [
                    { model: models_1.Plan, as: 'plan', attributes: ['id', 'name', 'max_leads', 'storage_limit_mb'] },
                    { model: models_1.Domain, as: 'domains', attributes: ['id', 'domain_name', 'is_verified'] },
                    { model: models_1.DepartmentBlueprint, as: 'department', attributes: ['id', 'name'] },
                ],
                order: [['createdAt', 'DESC']],
            });
            res.status(200).json({ companies });
        }
        catch (error) {
            console.error('[CompanyController] getCompanies failed:', error);
            res.status(500).json({ error: 'Failed to fetch company directory.' });
        }
    }
    /**
     * GET /api/companies/:id/metrics
     * Tunnels into the tenant's own database and collects live metrics:
     *  - total_leads      (count from `leads` table)
     *  - total_users      (count from `users` table)
     *  - storage_bytes    (sum of size_bytes from `file_records` table, or 0 if missing)
     */
    static async getCompanyMetrics(req, res) {
        const { id } = req.params;
        try {
            // 1. Resolve db_name from Master DB
            const company = await models_1.Company.findByPk(id, {
                include: [
                    { model: models_1.Plan, as: 'plan', attributes: ['id', 'name', 'max_leads', 'storage_limit_mb'] },
                    { model: models_1.Domain, as: 'domains', attributes: ['domain_name', 'is_verified'] },
                    { model: models_1.DepartmentBlueprint, as: 'department', attributes: ['id', 'name'] },
                ],
            });
            if (!company) {
                res.status(404).json({ error: 'Company not found.' });
                return;
            }
            const { db_name } = company;
            // 2. Tunnel into tenant DB for live metrics
            const metrics = await withTenantConnection(db_name, async (seq) => {
                // ── Total Leads ──────────────────────────────────────────────
                let total_leads = 0;
                if (await tableExists(seq, 'leads', db_name)) {
                    const leadsResult = await seq.query('SELECT COUNT(*) AS cnt FROM `leads`', { type: sequelize_1.QueryTypes.SELECT });
                    total_leads = parseInt(leadsResult[0]?.cnt ?? '0', 10);
                }
                // ── Total Users ──────────────────────────────────────────────
                let total_users = 0;
                if (await tableExists(seq, 'users', db_name)) {
                    const usersResult = await seq.query('SELECT COUNT(*) AS cnt FROM `users`', { type: sequelize_1.QueryTypes.SELECT });
                    total_users = parseInt(usersResult[0]?.cnt ?? '0', 10);
                }
                // ── Storage (file_records) ───────────────────────────────────
                let storage_bytes = 0;
                if (await tableExists(seq, 'file_records', db_name)) {
                    const storageResult = await seq.query('SELECT COALESCE(SUM(size_bytes), 0) AS total FROM `file_records`', { type: sequelize_1.QueryTypes.SELECT });
                    storage_bytes = parseInt(storageResult[0]?.total ?? '0', 10);
                }
                return { total_leads, total_users, storage_bytes };
            });
            res.status(200).json({
                company: company.toJSON(),
                metrics: {
                    ...metrics,
                    storage_mb: parseFloat((metrics.storage_bytes / 1024 / 1024).toFixed(2)),
                },
            });
        }
        catch (error) {
            const msg = error instanceof Error ? error.message : String(error);
            console.error('[CompanyController] getCompanyMetrics failed:', msg);
            // Return partial data even on tunnel failure so the UI degrades gracefully
            res.status(502).json({
                error: `Failed to tunnel into tenant database: ${msg}`,
                metrics: { total_leads: 0, total_users: 0, storage_bytes: 0, storage_mb: 0 },
            });
        }
    }
    /**
     * PATCH /api/companies/:id/status
     * Body: { status: 'active' | 'suspended' }
     * If body is empty it toggles the current status automatically.
     */
    static async updateCompanyStatus(req, res) {
        const { id } = req.params;
        try {
            const company = await models_1.Company.findByPk(id);
            if (!company) {
                res.status(404).json({ error: 'Company not found.' });
                return;
            }
            const requestedStatus = req.body.status;
            const VALID = ['active', 'suspended'];
            let newStatus;
            if (requestedStatus && VALID.includes(requestedStatus)) {
                newStatus = requestedStatus;
            }
            else {
                // Auto-toggle
                newStatus = company.status === 'active' ? 'suspended' : 'active';
            }
            await company.update({ status: newStatus });
            console.log(`[CompanyController] Company "${company.name}" status → ${newStatus}`);
            res.status(200).json({
                message: `Company "${company.name}" is now ${newStatus}.`,
                id: company.id,
                status: newStatus,
            });
        }
        catch (error) {
            console.error('[CompanyController] updateCompanyStatus failed:', error);
            res.status(500).json({ error: 'Failed to update company status.' });
        }
    }
}
exports.CompanyController = CompanyController;
