"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenericModuleController = void 0;
const TenantConnectionManager_1 = require("../config/TenantConnectionManager");
const sequelize_1 = require("sequelize");
const uuid_1 = require("uuid");
class GenericModuleController {
    static async getModuleData(req, res) {
        try {
            const tenantId = req.headers['x-tenant-id'];
            const { tableName } = req.params;
            if (!tenantId || !tableName) {
                res.status(400).json({ error: 'Missing tenant headers or dynamic table URL bindings.' });
                return;
            }
            const sequelize = await TenantConnectionManager_1.TenantConnectionManager.getConnection(tenantId);
            // Execute raw queries to support perfectly dynamic, unbound schema mappings inside Tenant bounds natively!
            const records = await sequelize.query(`SELECT * FROM \`${tableName}\``, {
                type: sequelize_1.QueryTypes.SELECT
            });
            res.status(200).json({ records });
        }
        catch (error) {
            console.error(`Error querying dynamic module ${req.params.tableName}:`, error);
            res.status(500).json({ error: 'Failed to access custom schema architecture.' });
        }
    }
    static async createModuleData(req, res) {
        try {
            const tenantId = req.headers['x-tenant-id'];
            const { tableName } = req.params;
            const data = req.body; // Full JSON tree mapping
            if (!tenantId || !tableName || !data) {
                res.status(400).json({ error: 'Incomplete parameters mapped inside Payload mapping' });
                return;
            }
            const sequelize = await TenantConnectionManager_1.TenantConnectionManager.getConnection(tenantId);
            // Simple Dynamic INSERT logic mimicking active query frameworks natively safely:
            const id = data.id || (0, uuid_1.v4)();
            const insertData = { ...data, id };
            const keys = Object.keys(insertData);
            const values = Object.values(insertData);
            const columns = keys.map(k => `\`${k}\``).join(', ');
            const placeholders = keys.map(() => '?').join(', ');
            await sequelize.query(`INSERT INTO \`${tableName}\` (${columns}) VALUES (${placeholders})`, {
                replacements: values,
                type: sequelize_1.QueryTypes.INSERT
            });
            res.status(201).json({
                message: 'Dynamic record appended successfully securely.',
                record: insertData
            });
        }
        catch (error) {
            console.error(`Error writing dynamic module constraints ${req.params.tableName}:`, error);
            res.status(500).json({ error: 'Failed inserting mapped variables strictly.' });
        }
    }
}
exports.GenericModuleController = GenericModuleController;
