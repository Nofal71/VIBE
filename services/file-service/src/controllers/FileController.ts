import { Request, Response } from 'express';
import { TenantConnectionManager } from '../config/TenantConnectionManager';
import { FileRecord } from '../models/FileRecord';

export class FileController {
    static async uploadFile(req: Request, res: Response): Promise<void> {
        try {
            const tenantId = req.headers['x-tenant-id'] as string;
            const { lead_id, uploaded_by } = req.body as { lead_id: string; uploaded_by: string };
            const file = req.file;

            if (!tenantId) {
                res.status(400).json({ error: 'Missing x-tenant-id header.' });
                return;
            }

            if (!file) {
                res.status(400).json({ error: 'No file uploaded.' });
                return;
            }

            if (!lead_id || !uploaded_by) {
                res.status(400).json({ error: 'Missing lead_id or uploaded_by in request body.' });
                return;
            }

            const sequelize = await TenantConnectionManager.getConnection(tenantId);
            const TenantFileRecord = FileRecord.initModel(sequelize);

            const newFileRecord = await TenantFileRecord.create({
                lead_id,
                file_name: file.originalname,
                file_path: file.path,
                mime_type: file.mimetype,
                size_bytes: file.size,
                uploaded_by,
            });

            res.status(201).json({ message: 'File uploaded successfully', file: newFileRecord });
        } catch (error) {
            console.error('Error uploading file:', error);
            res.status(500).json({ error: 'Failed to upload file.' });
        }
    }

    /**
     * GET /api/files?lead_id=<uuid>&tenant_id=<id> (tenant_id from header)
     * Returns all file records for a given lead in the tenant database.
     */
    static async getFiles(req: Request, res: Response): Promise<void> {
        try {
            const tenantId = req.headers['x-tenant-id'] as string;
            const { lead_id } = req.query as { lead_id?: string };

            if (!tenantId) {
                res.status(400).json({ error: 'Missing x-tenant-id header.' });
                return;
            }

            const sequelize = await TenantConnectionManager.getConnection(tenantId);
            const TenantFileRecord = FileRecord.initModel(sequelize);

            const whereClause: Record<string, unknown> = {};
            if (lead_id) whereClause['lead_id'] = lead_id;

            const files = await TenantFileRecord.findAll({
                where: whereClause,
                order: [['createdAt', 'DESC']],
            });

            res.status(200).json({ files });
        } catch (error) {
            console.error('[FileController] getFiles failed:', error);
            res.status(500).json({ error: 'Failed to retrieve files.' });
        }
    }

    /**
     * DELETE /api/files/:id — Hard-deletes a file record (does NOT remove disk file).
     */
    static async deleteFile(req: Request, res: Response): Promise<void> {
        try {
            const tenantId = req.headers['x-tenant-id'] as string;
            const { id } = req.params;

            const sequelize = await TenantConnectionManager.getConnection(tenantId);
            const TenantFileRecord = FileRecord.initModel(sequelize);

            const record = await TenantFileRecord.findByPk(id);
            if (!record) {
                res.status(404).json({ error: 'File record not found.' });
                return;
            }

            await record.destroy();
            res.status(200).json({ message: 'File record deleted.' });
        } catch (error) {
            console.error('[FileController] deleteFile failed:', error);
            res.status(500).json({ error: 'Failed to delete file record.' });
        }
    }
}
