import { Request, Response } from 'express';
import { QueryTypes } from 'sequelize';
import multer from 'multer';
import { TenantConnectionManager } from '../config/TenantConnectionManager';
import { v4 as uuidv4 } from 'uuid';

// Multer setup: memory storage to parse the CSV buffer directly
export const csvUpload = multer({ storage: multer.memoryStorage() });

export class ImportExportController {
    /**
     * Exports all leads for the authenticated tenant as a downloadable CSV file.
     */
    static async exportLeads(req: Request, res: Response): Promise<void> {
        try {
            const tenantId = req.headers['x-tenant-id'] as string;
            if (!tenantId) {
                res.status(400).json({ error: 'Missing x-tenant-id header.' });
                return;
            }

            const sequelize = await TenantConnectionManager.getConnection(tenantId);
            const leads = await sequelize.query<Record<string, unknown>>(
                'SELECT * FROM `leads`',
                { type: QueryTypes.SELECT }
            );

            if (!leads.length) {
                res.status(200).send('id,first_name,last_name,email,status_id\n');
                return;
            }

            // Build CSV from column names + rows
            const headers = Object.keys(leads[0]).join(',');
            const rows = leads.map((row) =>
                Object.values(row)
                    .map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`)
                    .join(',')
            );

            const csv = [headers, ...rows].join('\r\n');

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader(
                'Content-Disposition',
                `attachment; filename="leads_${tenantId}_${Date.now()}.csv"`
            );
            res.status(200).send(csv);
        } catch (error) {
            console.error('[ImportExport] exportLeads failed:', error);
            res.status(500).json({ error: 'Failed to export leads.' });
        }
    }

    /**
     * Accepts a CSV file upload and bulk-inserts rows into the tenant's `leads` table.
     * Expected CSV header: first_name,last_name,email,status_id
     */
    static async importLeads(req: Request, res: Response): Promise<void> {
        try {
            const tenantId = req.headers['x-tenant-id'] as string;
            if (!tenantId) {
                res.status(400).json({ error: 'Missing x-tenant-id header.' });
                return;
            }

            if (!req.file) {
                res.status(400).json({ error: 'No CSV file provided.' });
                return;
            }

            const csvContent = req.file.buffer.toString('utf-8');
            const lines = csvContent.split(/\r?\n/).filter((l) => l.trim());

            if (lines.length < 2) {
                res.status(400).json({ error: 'CSV file is empty or missing data rows.' });
                return;
            }

            const rawHeaders = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
            const sequelize = await TenantConnectionManager.getConnection(tenantId);

            let imported = 0;
            const errors: string[] = [];

            for (let i = 1; i < lines.length; i++) {
                const values = lines[i].split(',').map((v) => v.trim().replace(/^"|"$/g, ''));
                if (values.length !== rawHeaders.length) {
                    errors.push(`Row ${i + 1}: column count mismatch.`);
                    continue;
                }

                const rowData: Record<string, string> = {};
                rawHeaders.forEach((col, idx) => {
                    rowData[col] = values[idx] ?? '';
                });

                // Ensure required fields are present
                if (!rowData['first_name'] || !rowData['email']) {
                    errors.push(`Row ${i + 1}: missing required fields (first_name, email).`);
                    continue;
                }

                const id = rowData['id'] || uuidv4();
                const insertData = { id, ...rowData };
                const cols = Object.keys(insertData).map((k) => `\`${k}\``).join(', ');
                const placeholders = Object.keys(insertData).map(() => '?').join(', ');
                const vals = Object.values(insertData);

                await sequelize.query(
                    `INSERT IGNORE INTO \`leads\` (${cols}) VALUES (${placeholders})`,
                    { replacements: vals, type: QueryTypes.INSERT }
                );
                imported++;
            }

            res.status(200).json({ message: `Import complete.`, imported, errors });
        } catch (error) {
            console.error('[ImportExport] importLeads failed:', error);
            res.status(500).json({ error: 'Failed to import leads.' });
        }
    }
}
