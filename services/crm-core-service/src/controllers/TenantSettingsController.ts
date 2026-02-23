import { Request, Response } from 'express';
import { DataTypes, QueryTypes } from 'sequelize';
import { TenantConnectionManager } from '../config/TenantConnectionManager';

// Map API type names to SQL column types
const TYPE_MAP: Record<string, string> = {
    TEXT: 'VARCHAR(255)',
    NUMBER: 'FLOAT',
    DATE: 'DATE',
    BOOLEAN: 'TINYINT(1)',
    COUNTRY: 'VARCHAR(100)',
    TEXTAREA: 'TEXT',
};

export class TenantSettingsController {

    /**
     * Adds a new custom field column to the `leads` table via ALTER TABLE.
     * Also persists the field metadata in `tenant_fields` config table.
     * Body: { name, type, is_filterable, is_compulsory, section_name, order_index, requires_lock }
     */
    static async addField(req: Request, res: Response): Promise<void> {
        const tenantId = req.headers['x-tenant-id'] as string;

        try {
            const { name, type, is_filterable, is_compulsory, section_name, order_index, requires_lock } = req.body as {
                name: string;
                type: string;
                is_filterable?: boolean;
                is_compulsory?: boolean;
                section_name?: string;
                order_index?: number;
                requires_lock?: boolean;
            };

            if (!name || !type) {
                res.status(400).json({ error: 'Field name and type are required.' });
                return;
            }

            const sqlType = TYPE_MAP[type.toUpperCase()];
            if (!sqlType) {
                res.status(400).json({ error: `Unsupported type: ${type}. Supported: ${Object.keys(TYPE_MAP).join(', ')}` });
                return;
            }

            // Sanitize column name to prevent SQL injection (alphanumeric + underscores only)
            const safeColumnName = name.toLowerCase().replace(/[^a-z0-9_]/g, '_');

            const sequelize = await TenantConnectionManager.getConnection(tenantId);

            // 1. Attempt ALTER TABLE — silently skip if column already exists
            try {
                await sequelize.query(
                    `ALTER TABLE \`leads\` ADD COLUMN \`${safeColumnName}\` ${sqlType} NULL`,
                    { type: QueryTypes.RAW }
                );
                console.log(`[TenantSettings] Column '${safeColumnName}' added to leads table for tenant ${tenantId}.`);
            } catch (alterError: any) {
                // MySQL error 1060 = Duplicate column name — safe to ignore
                if (alterError?.original?.errno !== 1060) throw alterError;
                console.warn(`[TenantSettings] Column '${safeColumnName}' already exists. Updating metadata only.`);
            }

            // 2. Persist field metadata in `tenant_fields` config table
            await sequelize.query(
                `CREATE TABLE IF NOT EXISTS \`tenant_fields\` (
          id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
          field_name VARCHAR(100) NOT NULL UNIQUE,
          field_type VARCHAR(50) NOT NULL,
          target_table VARCHAR(100) NOT NULL DEFAULT 'leads',
          is_filterable TINYINT(1) DEFAULT 0,
          is_compulsory TINYINT(1) DEFAULT 0,
          requires_lock TINYINT(1) DEFAULT 0,
          section_name VARCHAR(100) DEFAULT 'General',
          order_index INT DEFAULT 99,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,
                { type: QueryTypes.RAW }
            );

            await sequelize.query(
                `INSERT INTO \`tenant_fields\`
          (field_name, field_type, is_filterable, is_compulsory, requires_lock, section_name, order_index)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
          field_type = VALUES(field_type),
          is_filterable = VALUES(is_filterable),
          is_compulsory = VALUES(is_compulsory),
          requires_lock = VALUES(requires_lock),
          section_name = VALUES(section_name),
          order_index = VALUES(order_index)`,
                {
                    replacements: [
                        safeColumnName,
                        type.toUpperCase(),
                        is_filterable ? 1 : 0,
                        is_compulsory ? 1 : 0,
                        requires_lock ? 1 : 0,
                        section_name || 'General',
                        order_index ?? 99,
                    ],
                    type: QueryTypes.INSERT,
                }
            );

            res.status(200).json({
                message: `Field '${safeColumnName}' (${sqlType}) added to leads table successfully.`,
                column: safeColumnName,
                sql_type: sqlType,
            });
        } catch (error) {
            console.error('[TenantSettings] addField failed:', error);
            res.status(500).json({ error: 'Failed to add custom field.' });
        }
    }

    /**
     * Reads all custom fields for this tenant from the `tenant_fields` config table.
     */
    static async getFields(req: Request, res: Response): Promise<void> {
        const tenantId = req.headers['x-tenant-id'] as string;
        try {
            const sequelize = await TenantConnectionManager.getConnection(tenantId);
            const fields = await sequelize.query<Record<string, unknown>>(
                `SELECT * FROM \`tenant_fields\` ORDER BY order_index ASC`,
                { type: QueryTypes.SELECT }
            );
            res.status(200).json({ fields });
        } catch (error) {
            console.error('[TenantSettings] getFields failed:', error);
            res.status(200).json({ fields: [] }); // Return empty gracefully if table doesn't exist yet
        }
    }

    /**
     * Updates pipeline stages stored in `tenant_config` key-value table.
     * Body: { stages: [{ name: string, color: string, order_index: number }] }
     */
    static async updateStages(req: Request, res: Response): Promise<void> {
        const tenantId = req.headers['x-tenant-id'] as string;

        try {
            const { stages } = req.body as {
                stages: { name: string; color: string; order_index: number }[];
            };

            if (!Array.isArray(stages) || stages.length === 0) {
                res.status(400).json({ error: 'stages must be a non-empty array.' });
                return;
            }

            const sequelize = await TenantConnectionManager.getConnection(tenantId);

            // Ensure the config store table exists
            await sequelize.query(
                `CREATE TABLE IF NOT EXISTS \`tenant_config\` (
          config_key VARCHAR(100) PRIMARY KEY,
          config_value LONGTEXT NOT NULL,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )`,
                { type: QueryTypes.RAW }
            );

            const stagesJson = JSON.stringify(stages);
            await sequelize.query(
                `INSERT INTO \`tenant_config\` (config_key, config_value) VALUES ('pipeline_stages', ?)
         ON DUPLICATE KEY UPDATE config_value = VALUES(config_value)`,
                { replacements: [stagesJson], type: QueryTypes.INSERT }
            );

            res.status(200).json({ message: 'Pipeline stages updated successfully.', stages });
        } catch (error) {
            console.error('[TenantSettings] updateStages failed:', error);
            res.status(500).json({ error: 'Failed to update pipeline stages.' });
        }
    }

    /**
     * Read the stored pipeline stages for this tenant.
     */
    static async getStages(req: Request, res: Response): Promise<void> {
        const tenantId = req.headers['x-tenant-id'] as string;
        try {
            const sequelize = await TenantConnectionManager.getConnection(tenantId);
            const rows = await sequelize.query<{ config_value: string }>(
                `SELECT config_value FROM \`tenant_config\` WHERE config_key = 'pipeline_stages'`,
                { type: QueryTypes.SELECT }
            );
            const stages = rows.length > 0 ? JSON.parse(rows[0].config_value) : [];
            res.status(200).json({ stages });
        } catch (error) {
            res.status(200).json({ stages: [] }); // Graceful fallback
        }
    }

    // ─── Branding ──────────────────────────────────────────────────────────────

    /**
     * GET /api/tenant/settings/branding
     * Reads the tenant's UI branding (primary_color, logo_url, sidebar_theme)
     * from the `tenant_config` key-value store under the key 'ui_branding'.
     */
    static async getBranding(req: Request, res: Response): Promise<void> {
        const tenantId = req.headers['x-tenant-id'] as string;
        try {
            const sequelize = await TenantConnectionManager.getConnection(tenantId);

            // Ensure table exists before querying (safe for fresh tenants)
            await sequelize.query(
                `CREATE TABLE IF NOT EXISTS \`tenant_config\` (
                  config_key VARCHAR(100) PRIMARY KEY,
                  config_value LONGTEXT NOT NULL,
                  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )`,
                { type: QueryTypes.RAW }
            );

            const rows = await sequelize.query<{ config_value: string }>(
                `SELECT config_value FROM \`tenant_config\` WHERE config_key = 'ui_branding'`,
                { type: QueryTypes.SELECT }
            );

            const branding = rows.length > 0
                ? JSON.parse(rows[0].config_value)
                : { primary_color: '#4F46E5', logo_url: '', sidebar_theme: 'dark' };

            res.status(200).json({ branding });
        } catch (error) {
            console.error('[TenantSettings] getBranding failed:', error);
            res.status(200).json({ branding: { primary_color: '#4F46E5', logo_url: '', sidebar_theme: 'dark' } });
        }
    }

    /**
     * PUT /api/tenant/settings/branding
     * Persists tenant-specific UI branding into the `tenant_config` key-value table.
     * Body: { primary_color: string, logo_url: string, sidebar_theme: 'dark' | 'light' }
     * Does NOT alter the global DepartmentBlueprint — fully tenant-scoped.
     */
    static async updateBranding(req: Request, res: Response): Promise<void> {
        const tenantId = req.headers['x-tenant-id'] as string;

        try {
            const { primary_color, logo_url, sidebar_theme } = req.body as {
                primary_color?: string;
                logo_url?: string;
                sidebar_theme?: 'dark' | 'light';
            };

            // Validate color format if provided
            if (primary_color && !/^#[0-9a-fA-F]{6}$/.test(primary_color)) {
                res.status(400).json({ error: 'primary_color must be a valid 6-digit hex color (e.g., #4F46E5).' });
                return;
            }

            if (sidebar_theme && sidebar_theme !== 'dark' && sidebar_theme !== 'light') {
                res.status(400).json({ error: "sidebar_theme must be 'dark' or 'light'." });
                return;
            }

            const sequelize = await TenantConnectionManager.getConnection(tenantId);

            // Ensure the config store table exists
            await sequelize.query(
                `CREATE TABLE IF NOT EXISTS \`tenant_config\` (
                  config_key VARCHAR(100) PRIMARY KEY,
                  config_value LONGTEXT NOT NULL,
                  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )`,
                { type: QueryTypes.RAW }
            );

            // Read existing branding first (to merge, not overwrite unset fields)
            const existing = await sequelize.query<{ config_value: string }>(
                `SELECT config_value FROM \`tenant_config\` WHERE config_key = 'ui_branding'`,
                { type: QueryTypes.SELECT }
            );
            const currentBranding = existing.length > 0
                ? JSON.parse(existing[0].config_value)
                : { primary_color: '#4F46E5', logo_url: '', sidebar_theme: 'dark' };

            const merged = {
                ...currentBranding,
                ...(primary_color !== undefined && { primary_color }),
                ...(logo_url !== undefined && { logo_url }),
                ...(sidebar_theme !== undefined && { sidebar_theme }),
            };

            await sequelize.query(
                `INSERT INTO \`tenant_config\` (config_key, config_value) VALUES ('ui_branding', ?)
                 ON DUPLICATE KEY UPDATE config_value = VALUES(config_value)`,
                { replacements: [JSON.stringify(merged)], type: QueryTypes.INSERT }
            );

            res.status(200).json({
                message: 'Branding settings updated successfully.',
                branding: merged,
            });
        } catch (error) {
            console.error('[TenantSettings] updateBranding failed:', error);
            res.status(500).json({ error: 'Failed to update branding settings.' });
        }
    }
}
