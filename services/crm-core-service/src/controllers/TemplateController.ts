import { Request, Response } from 'express';
import { TenantConnectionManager } from '../config/TenantConnectionManager';
import { EmailTemplate } from '../models/EmailTemplate';

export class TemplateController {

    private static async init(req: Request): Promise<{ EmailTemplate: typeof EmailTemplate }> {
        const tenantId = req.headers['x-tenant-id'] as string;
        const userId = (req.headers['x-user-id'] as string) ?? 'system';
        const sequelize = await TenantConnectionManager.getConnection(tenantId);
        EmailTemplate.initModel(sequelize, tenantId, userId);
        return { EmailTemplate };
    }

    /**
     * Extracts all {{variable}} placeholders from a string.
     * e.g., "Hello {{first_name}}" → ['first_name']
     */
    private static extractVariables(text: string): string[] {
        const matches = text.match(/\{\{([a-zA-Z0-9_]+)\}\}/g) ?? [];
        return [...new Set(matches.map((m) => m.replace(/^\{\{|\}\}$/g, '')))];
    }

    // ─── CREATE ──────────────────────────────────────────────────────────────────

    static async createTemplate(req: Request, res: Response): Promise<void> {
        try {
            const { EmailTemplate } = await TemplateController.init(req);
            const { name, subject, body_html } = req.body as {
                name: string;
                subject: string;
                body_html: string;
            };

            if (!name || !subject || !body_html) {
                res.status(400).json({ error: 'name, subject, and body_html are required.' });
                return;
            }

            // Auto-extract variables from both subject and body
            const variables = TemplateController.extractVariables(`${subject} ${body_html}`);

            const template = await EmailTemplate.create({
                name,
                subject,
                body_html,
                variables,
            } as any);

            res.status(201).json({ template });
        } catch (error) {
            console.error('[TemplateController] createTemplate failed:', error);
            res.status(500).json({ error: 'Failed to create email template.' });
        }
    }

    // ─── LIST ────────────────────────────────────────────────────────────────────

    static async getTemplates(req: Request, res: Response): Promise<void> {
        try {
            const { EmailTemplate } = await TemplateController.init(req);
            const templates = await EmailTemplate.findAll({ order: [['name', 'ASC']] });
            res.status(200).json({ templates });
        } catch (error) {
            console.error('[TemplateController] getTemplates failed:', error);
            res.status(500).json({ error: 'Failed to retrieve templates.' });
        }
    }

    // ─── GET ONE ─────────────────────────────────────────────────────────────────

    static async getTemplate(req: Request, res: Response): Promise<void> {
        try {
            const { EmailTemplate } = await TemplateController.init(req);
            const template = await EmailTemplate.findByPk(req.params.id);
            if (!template) {
                res.status(404).json({ error: 'Template not found.' });
                return;
            }
            res.status(200).json({ template });
        } catch (error) {
            console.error('[TemplateController] getTemplate failed:', error);
            res.status(500).json({ error: 'Failed to retrieve template.' });
        }
    }

    // ─── UPDATE ──────────────────────────────────────────────────────────────────

    static async updateTemplate(req: Request, res: Response): Promise<void> {
        try {
            const { EmailTemplate } = await TemplateController.init(req);
            const template = await EmailTemplate.findByPk(req.params.id);
            if (!template) {
                res.status(404).json({ error: 'Template not found.' });
                return;
            }

            const { name, subject, body_html } = req.body as Partial<{
                name: string;
                subject: string;
                body_html: string;
            }>;

            if (name !== undefined) (template as any).name = name;
            if (subject !== undefined) (template as any).subject = subject;
            if (body_html !== undefined) {
                (template as any).body_html = body_html;
                // Re-extract variables when body changes
                const newSubject = (subject ?? (template as any).subject) as string;
                (template as any).variables = TemplateController.extractVariables(`${newSubject} ${body_html}`);
            }

            await template.save();
            res.status(200).json({ template });
        } catch (error) {
            console.error('[TemplateController] updateTemplate failed:', error);
            res.status(500).json({ error: 'Failed to update template.' });
        }
    }

    // ─── DELETE ──────────────────────────────────────────────────────────────────

    static async deleteTemplate(req: Request, res: Response): Promise<void> {
        try {
            const { EmailTemplate } = await TemplateController.init(req);
            const template = await EmailTemplate.findByPk(req.params.id);
            if (!template) {
                res.status(404).json({ error: 'Template not found.' });
                return;
            }
            await template.destroy();
            res.status(200).json({ message: 'Template deleted.' });
        } catch (error) {
            console.error('[TemplateController] deleteTemplate failed:', error);
            res.status(500).json({ error: 'Failed to delete template.' });
        }
    }
}
