import { Request, Response } from 'express';
import { TenantConnectionManager } from '../config/TenantConnectionManager';
import { QueryTypes } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

export class GenericModuleController {

    static async getModuleData(req: Request, res: Response): Promise<void> {
        try {
            const tenantId = req.headers['x-tenant-id'] as string;
            const { tableName } = req.params;

            if (!tenantId || !tableName) {
                res.status(400).json({ error: 'Missing tenant headers or dynamic table URL bindings.' });
                return;
            }

            const sequelize = await TenantConnectionManager.getConnection(tenantId);

            // Execute raw queries to support perfectly dynamic, unbound schema mappings inside Tenant bounds natively!
            const records = await sequelize.query(`SELECT * FROM \`${tableName}\``, {
                type: QueryTypes.SELECT
            });

            res.status(200).json({ records });
        } catch (error) {
            console.error(`Error querying dynamic module ${req.params.tableName}:`, error);
            res.status(500).json({ error: 'Failed to access custom schema architecture.' });
        }
    }

    static async createModuleData(req: Request, res: Response): Promise<void> {
        try {
            const tenantId = req.headers['x-tenant-id'] as string;
            const { tableName } = req.params;
            const data = req.body; // Full JSON tree mapping

            if (!tenantId || !tableName || !data) {
                res.status(400).json({ error: 'Incomplete parameters mapped inside Payload mapping' });
                return;
            }

            const sequelize = await TenantConnectionManager.getConnection(tenantId);

            // Simple Dynamic INSERT logic mimicking active query frameworks natively safely:
            const id = data.id || uuidv4();
            const insertData = { ...data, id };

            const keys = Object.keys(insertData);
            const values = Object.values(insertData);

            const columns = keys.map(k => `\`${k}\``).join(', ');
            const placeholders = keys.map(() => '?').join(', ');

            await sequelize.query(`INSERT INTO \`${tableName}\` (${columns}) VALUES (${placeholders})`, {
                replacements: values,
                type: QueryTypes.INSERT
            });

            res.status(201).json({
                message: 'Dynamic record appended successfully securely.',
                record: insertData
            });
        } catch (error) {
            console.error(`Error writing dynamic module constraints ${req.params.tableName}:`, error);
            res.status(500).json({ error: 'Failed inserting mapped variables strictly.' });
        }
    }
}
