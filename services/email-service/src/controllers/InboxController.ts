import { Request, Response } from 'express';
import { QueryTypes } from 'sequelize';
import { TenantConnectionManager } from '../config/TenantConnectionManager';
import { EmailActivity } from '../models/EmailActivity';
import { ImapSetting } from '../models/ImapSetting';

// ─── Controller ────────────────────────────────────────────────────────────────

export class InboxController {

    /**
     * GET /api/inbox/imap-settings
     * Returns the IMAP configuration for the requesting user.
     * Password is intentionally stripped from the response for security.
     */
    static async getImapSettings(req: Request, res: Response): Promise<void> {
        const tenantId = req.headers['x-tenant-id'] as string;
        const userId = req.headers['x-user-id'] as string;

        if (!tenantId || !userId) {
            res.status(400).json({ error: 'x-tenant-id and x-user-id headers are required.' });
            return;
        }

        try {
            const sequelize = await TenantConnectionManager.getConnection(tenantId);
            ImapSetting.initModel(sequelize);

            const setting = await ImapSetting.findOne({
                where: { user_id: userId },
                attributes: ['id', 'imap_host', 'imap_port', 'imap_username', 'is_active'],
            }) as (ImapSetting & { toJSON: () => Record<string, unknown> }) | null;

            res.status(200).json({ setting: setting ? setting.toJSON() : null });
        } catch (error) {
            console.error('[InboxController] getImapSettings failed:', error);
            res.status(500).json({ error: 'Failed to fetch IMAP settings.' });
        }
    }

    /**
     * POST /api/inbox/imap-settings
     * Creates or updates the IMAP configuration for the requesting user.
     * Body: { imap_host, imap_port, imap_username, imap_password }
     */
    static async saveImapSettings(req: Request, res: Response): Promise<void> {
        const tenantId = req.headers['x-tenant-id'] as string;
        const userId = req.headers['x-user-id'] as string;

        if (!tenantId || !userId) {
            res.status(400).json({ error: 'x-tenant-id and x-user-id headers are required.' });
            return;
        }

        try {
            const { imap_host, imap_port, imap_username, imap_password } = req.body as {
                imap_host: string;
                imap_port: number;
                imap_username: string;
                imap_password?: string;
            };

            if (!imap_host || !imap_port || !imap_username) {
                res.status(400).json({ error: 'imap_host, imap_port, and imap_username are required.' });
                return;
            }

            const sequelize = await TenantConnectionManager.getConnection(tenantId);
            ImapSetting.initModel(sequelize);

            const existing = await ImapSetting.findOne({ where: { user_id: userId } });

            if (existing) {
                await existing.update({
                    imap_host,
                    imap_port: Number(imap_port),
                    imap_username,
                    ...(imap_password ? { imap_password } : {}),
                });
                res.status(200).json({ message: 'IMAP settings updated.', id: existing.id });
            } else {
                const created = await ImapSetting.create({
                    user_id: userId,
                    imap_host,
                    imap_port: Number(imap_port),
                    imap_username,
                    ...(imap_password ? { imap_password } : {}),
                });
                res.status(201).json({ message: 'IMAP settings saved.', id: created.id });
            }
        } catch (error) {
            console.error('[InboxController] saveImapSettings failed:', error);
            res.status(500).json({ error: 'Failed to save IMAP settings.' });
        }
    }

    /**
     * GET /api/inbox/emails
     * Returns paginated email activity with associated lead information,
     * sorted by received_at DESC. Supports optional ?direction= and ?lead_id= filters.
     */
    static async getInbox(req: Request, res: Response): Promise<void> {
        const tenantId = req.headers['x-tenant-id'] as string;

        if (!tenantId) {
            res.status(400).json({ error: 'x-tenant-id header is required.' });
            return;
        }

        try {
            const {
                direction,
                lead_id,
                limit = '50',
                offset = '0',
            } = req.query as {
                direction?: 'INBOUND' | 'OUTBOUND';
                lead_id?: string;
                limit?: string;
                offset?: string;
            };

            const sequelize = await TenantConnectionManager.getConnection(tenantId);
            EmailActivity.initModel(sequelize);

            // Build dynamic WHERE fragments for safe parameterization
            const whereClauses: string[] = [];
            const replacements: Record<string, unknown> = {
                limitVal: parseInt(limit, 10),
                offsetVal: parseInt(offset, 10),
            };

            if (direction) {
                whereClauses.push('ea.direction = :direction');
                replacements['direction'] = direction;
            }

            if (lead_id) {
                whereClauses.push('ea.lead_id = :lead_id');
                replacements['lead_id'] = lead_id;
            }

            const whereSQL = whereClauses.length > 0
                ? `WHERE ${whereClauses.join(' AND ')}`
                : '';

            // LEFT JOIN against leads to get the lead's name & email
            const emailsSql = `
                SELECT
                    ea.id,
                    ea.lead_id,
                    ea.message_id,
                    ea.direction,
                    ea.subject,
                    ea.body,
                    ea.received_at,
                    ea.createdAt,
                    l.first_name AS lead_first_name,
                    l.last_name  AS lead_last_name,
                    l.email      AS lead_email
                FROM \`email_activities\` ea
                LEFT JOIN \`leads\` l ON l.id = ea.lead_id
                ${whereSQL}
                ORDER BY ea.received_at DESC
                LIMIT :limitVal OFFSET :offsetVal
            `;

            interface InboxRow {
                id: string;
                lead_id: string;
                message_id: string;
                direction: 'INBOUND' | 'OUTBOUND';
                subject: string;
                body: string;
                received_at: string;
                createdAt: string;
                lead_first_name: string | null;
                lead_last_name: string | null;
                lead_email: string | null;
            }

            const emails = await sequelize.query<InboxRow>(emailsSql, {
                replacements,
                type: QueryTypes.SELECT,
            });

            // Count for pagination
            const countSql = `
                SELECT COUNT(*) AS total
                FROM \`email_activities\` ea
                ${whereSQL}
            `;

            const countResult = await sequelize.query<{ total: string }>(countSql, {
                replacements,
                type: QueryTypes.SELECT,
            });

            const total = parseInt(countResult[0]?.total ?? '0', 10);

            res.status(200).json({
                emails,
                pagination: {
                    total,
                    limit: parseInt(limit, 10),
                    offset: parseInt(offset, 10),
                    has_more: parseInt(offset, 10) + parseInt(limit, 10) < total,
                },
            });

        } catch (error) {
            console.error('[InboxController] getInbox failed:', error);
            res.status(500).json({ error: 'Failed to fetch inbox.' });
        }
    }
}
