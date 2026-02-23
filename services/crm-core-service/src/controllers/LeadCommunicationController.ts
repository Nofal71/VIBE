import { Request, Response } from 'express';
import { QueryTypes } from 'sequelize';
import { TenantConnectionManager } from '../config/TenantConnectionManager';
import { Lead } from '../models/Lead';
import { redisBus } from '../config/redisBus';

export class LeadCommunicationController {

    /**
     * Sends a direct outbound email to a lead by publishing to the
     * existing `SEND_OUTBOUND_EMAIL` Redis channel consumed by the email-service.
     *
     * POST /api/leads/:id/email
     * Body: { subject: string, body: string }
     * Returns: 202 Accepted immediately (fire-and-forget via Redis)
     */
    static async sendDirectEmail(req: Request, res: Response): Promise<void> {
        const tenantId = req.headers['x-tenant-id'] as string;
        const leadId = req.params.id;

        try {
            const { subject, body } = req.body as { subject: string; body: string };

            if (!subject?.trim() || !body?.trim()) {
                res.status(400).json({ error: 'Both subject and body are required.' });
                return;
            }

            if (!leadId) {
                res.status(400).json({ error: 'Lead ID is required in the URL path.' });
                return;
            }

            // Resolve lead's email address from the tenant database
            const sequelize = await TenantConnectionManager.getConnection(tenantId);
            Lead.initModel(sequelize, tenantId);

            const lead = await Lead.findByPk(leadId);
            if (!lead) {
                res.status(404).json({ error: `Lead ${leadId} not found in tenant ${tenantId}.` });
                return;
            }

            const recipientEmail = (lead as any).email as string | undefined;
            if (!recipientEmail) {
                res.status(422).json({ error: 'This lead has no email address on record.' });
                return;
            }

            // Publish event — email-service is the subscriber
            await redisBus.publish('SEND_OUTBOUND_EMAIL', {
                tenant_id: tenantId,
                lead_id: leadId,
                to: recipientEmail,
                subject,
                body,
                sent_at: new Date().toISOString(),
            });

            console.log(`[LeadComm] Outbound email queued for lead ${leadId} → ${recipientEmail} (tenant: ${tenantId})`);

            // 202 Accepted: message queued, not yet delivered
            res.status(202).json({
                message: 'Email queued for delivery.',
                lead_id: leadId,
                recipient: recipientEmail,
            });
        } catch (error) {
            console.error('[LeadCommunicationController] sendDirectEmail failed:', error);
            res.status(500).json({ error: 'Failed to queue email. Please try again.' });
        }
    }

    /**
     * Fetches the communication history (audit events) for a specific lead.
     * GET /api/leads/:id/timeline
     */
    static async getLeadTimeline(req: Request, res: Response): Promise<void> {
        const tenantId = req.headers['x-tenant-id'] as string;
        const leadId = req.params.id;

        try {
            const sequelize = await TenantConnectionManager.getConnection(tenantId);

            const events = await sequelize.query<Record<string, unknown>>(
                `SELECT * FROM \`audit_logs\`
         WHERE JSON_UNQUOTE(JSON_EXTRACT(new_values, '$.id')) = ?
            OR JSON_UNQUOTE(JSON_EXTRACT(old_values, '$.id')) = ?
         ORDER BY created_at DESC
         LIMIT 50`,
                {
                    replacements: [leadId, leadId],
                    type: QueryTypes.SELECT,
                }
            );

            res.status(200).json({ events });
        } catch (error) {
            // Graceful fallback if audit_logs doesn't exist yet
            console.warn('[LeadCommunicationController] Timeline query failed (table may not exist yet):', error);
            res.status(200).json({ events: [] });
        }
    }
}
