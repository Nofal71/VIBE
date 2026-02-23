import { Request, Response } from 'express';
import { FieldLock } from '../models/FieldLock';
import { FeaturePermission } from '../models/FeaturePermission';

export class FieldLockController {

    static async createFieldLock(req: Request, res: Response): Promise<void> {
        try {
            const { role_id, table_name, column_name, can_read, can_write } = req.body;

            if (!role_id || !table_name || !column_name) {
                res.status(400).json({ error: 'Missing required layout bounds (role_id, table_name, column_name)!' });
                return;
            }

            const lock = await FieldLock.create({
                role_id,
                table_name,
                column_name,
                can_read: can_read ?? true,
                can_write: can_write ?? true,
            });

            res.status(201).json({ message: 'Dynamic field security lock generated!', lock });
        } catch (error) {
            console.error('Failed to craft field lock constraint:', error);
            res.status(500).json({ error: 'Failed to create field lock configuration.' });
        }
    }

    static async updateFieldLock(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const { can_read, can_write } = req.body;

            const lock = await FieldLock.findByPk(id);
            if (!lock) {
                res.status(404).json({ error: 'FieldLock rule map not found.' });
                return;
            }

            if (can_read !== undefined) lock.can_read = can_read;
            if (can_write !== undefined) lock.can_write = can_write;

            await lock.save();
            res.status(200).json({ message: 'Security lock updated', lock });
        } catch (error) {
            console.error('Failed modifying lock layout:', error);
            res.status(500).json({ error: 'Internal Server Error modifying field rules.' });
        }
    }

    static async getFieldLocks(req: Request, res: Response): Promise<void> {
        try {
            const { role_id, table_name } = req.query;
            const whereClause: Record<string, unknown> = {};
            if (role_id) whereClause['role_id'] = role_id;
            if (table_name) whereClause['table_name'] = table_name;

            const locks = await FieldLock.findAll({ where: whereClause });
            res.status(200).json({ locks });
        } catch (error) {
            console.error('Failed parsing field layouts:', error);
            res.status(500).json({ error: 'Failed retrieving lock security metrics.' });
        }
    }

    // ─── Feature Permissions ────────────────────────────────────────────────────

    /**
     * Returns all feature permissions for a given role_id.
     * GET /iam/feature-permissions?role_id=<uuid>
     */
    static async getFeaturePermissions(req: Request, res: Response): Promise<void> {
        try {
            const { role_id } = req.query;
            if (!role_id) {
                res.status(400).json({ error: 'role_id query parameter is required.' });
                return;
            }

            const permissions = await FeaturePermission.findAll({
                where: { role_id: role_id as string },
            });

            res.status(200).json({ permissions });
        } catch (error) {
            console.error('[FieldLockController] getFeaturePermissions failed:', error);
            res.status(500).json({ error: 'Failed to retrieve feature permissions.' });
        }
    }

    /**
     * Upserts a feature permission for a role.
     * POST /iam/feature-permissions
     * Body: { role_id, feature_name, is_allowed }
     */
    static async setFeaturePermission(req: Request, res: Response): Promise<void> {
        try {
            const { role_id, feature_name, is_allowed } = req.body as {
                role_id: string;
                feature_name: string;
                is_allowed: boolean;
            };

            if (!role_id || !feature_name) {
                res.status(400).json({ error: 'role_id and feature_name are required.' });
                return;
            }

            const [permission, created] = await FeaturePermission.findOrCreate({
                where: { role_id, feature_name },
                defaults: { role_id, feature_name, is_allowed: is_allowed ?? true },
            });

            if (!created) {
                await permission.update({ is_allowed: is_allowed ?? true });
            }

            res.status(200).json({ permission });
        } catch (error) {
            console.error('[FieldLockController] setFeaturePermission failed:', error);
            res.status(500).json({ error: 'Failed to set feature permission.' });
        }
    }
}
