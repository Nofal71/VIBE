"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebFormController = void 0;
const sequelize_1 = require("sequelize");
const TenantConnectionManager_1 = require("../config/TenantConnectionManager");
const Lead_1 = require("../models/Lead");
const RATE_LIMIT_MAX = 20; // max submissions per window per tenant
const RATE_LIMIT_WINDOW_MS = 60_000; // 60-second rolling window
const rateBuckets = new Map();
function checkRateLimit(tenantId) {
    const now = Date.now();
    const bucket = rateBuckets.get(tenantId);
    if (!bucket || now - bucket.windowStart > RATE_LIMIT_WINDOW_MS) {
        rateBuckets.set(tenantId, { count: 1, windowStart: now });
        return { allowed: true, remaining: RATE_LIMIT_MAX - 1 };
    }
    if (bucket.count >= RATE_LIMIT_MAX) {
        return { allowed: false, remaining: 0 };
    }
    bucket.count += 1;
    return { allowed: true, remaining: RATE_LIMIT_MAX - bucket.count };
}
// ─── Allowed field sanitizer ──────────────────────────────────────────────────
/**
 * Strips any keys that are not alphanumeric + underscore to prevent
 * schema injection through crafted field names.
 */
function sanitizeFields(body) {
    const clean = {};
    for (const key of Object.keys(body)) {
        if (/^[a-z_][a-z0-9_]{0,99}$/i.test(key)) {
            clean[key] = body[key];
        }
    }
    return clean;
}
// ─── Controller ────────────────────────────────────────────────────────────────
class WebFormController {
    /**
     * POST /api/web-forms/submit/:tenantId
     *
     * PUBLIC endpoint — no auth required.
     * Accepts a dynamic JSON body of lead fields, validates them against
     * tenant_fields schema, and creates a Lead record in the tenant DB.
     *
     * Rate limited: 20 submissions / 60 seconds per tenant.
     */
    static async submitPublicLead(req, res) {
        const { tenantId } = req.params;
        if (!tenantId) {
            res.status(400).json({ error: 'tenantId URL parameter is required.' });
            return;
        }
        // ── Rate limit check ───────────────────────────────────────────────
        const rateCheck = checkRateLimit(tenantId);
        if (!rateCheck.allowed) {
            res.status(429).json({
                error: 'RATE_LIMITED',
                message: 'Too many submissions. Please wait before trying again.',
            });
            return;
        }
        // ── Sanitize incoming body ─────────────────────────────────────────
        const rawBody = req.body;
        const fields = sanitizeFields(rawBody);
        // Validate required core fields
        if (!fields['first_name'] || !fields['last_name']) {
            res.status(400).json({ error: 'first_name and last_name are required.' });
            return;
        }
        try {
            const sequelize = await TenantConnectionManager_1.TenantConnectionManager.getConnection(tenantId);
            // Init Lead model with 'System - Web Form' as the audit actor
            Lead_1.Lead.initModel(sequelize, tenantId, 'System - Web Form');
            // Build the create payload — only columns that actually exist in the schema
            // We do a raw SHOW COLUMNS to be safe about dynamic tenant fields
            let existingColumns;
            try {
                const cols = await sequelize.query('SHOW COLUMNS FROM `leads`', { type: sequelize_1.QueryTypes.SELECT });
                existingColumns = cols.map((c) => c.Field);
            }
            catch {
                existingColumns = ['first_name', 'last_name', 'email', 'status_id'];
            }
            // Filter submitted fields to only those that exist as columns
            const createPayload = { status_id: 'NEW' };
            for (const [key, value] of Object.entries(fields)) {
                if (existingColumns.includes(key)) {
                    createPayload[key] = value;
                }
            }
            const lead = await Lead_1.Lead.create(createPayload);
            res.status(201).json({
                success: true,
                message: 'Your enquiry has been submitted. We will be in touch shortly.',
                lead_id: lead.id,
            });
        }
        catch (error) {
            console.error('[WebFormController] submitPublicLead failed:', error);
            res.status(500).json({ error: 'Failed to submit form. Please try again later.' });
        }
    }
    /**
     * GET /api/web-forms/schema/:tenantId
     *
     * PUBLIC endpoint — returns the tenant's custom field schema so the
     * HTML form can build itself dynamically. Only returns fields that are
     * marked as web_form_visible (or all fields if toggle not yet applied).
     */
    static async getFormSchema(req, res) {
        const { tenantId } = req.params;
        if (!tenantId) {
            res.status(400).json({ error: 'tenantId URL parameter is required.' });
            return;
        }
        // CORS: allow any origin for this public endpoint
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET');
        try {
            const sequelize = await TenantConnectionManager_1.TenantConnectionManager.getConnection(tenantId);
            // Ensure table exists before querying
            const tableCheck = await sequelize.query(`SELECT COUNT(*) AS cnt FROM information_schema.TABLES
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'tenant_fields'`, { type: sequelize_1.QueryTypes.SELECT });
            if (parseInt(tableCheck[0]?.cnt ?? '0', 10) === 0) {
                // No custom fields configured — return core fields only
                res.status(200).json({
                    fields: [
                        { field_name: 'first_name', field_type: 'TEXT', is_compulsory: 1, section_name: 'Contact', order_index: 1 },
                        { field_name: 'last_name', field_type: 'TEXT', is_compulsory: 1, section_name: 'Contact', order_index: 2 },
                        { field_name: 'email', field_type: 'TEXT', is_compulsory: 0, section_name: 'Contact', order_index: 3 },
                    ],
                });
                return;
            }
            // web_form_visible column may not exist in older tenants — handle gracefully
            const fields = await sequelize.query(`SELECT field_name, field_type, is_compulsory, section_name, order_index,
                        COALESCE(web_form_visible, 1) AS web_form_visible
                 FROM \`tenant_fields\`
                 WHERE COALESCE(web_form_visible, 1) = 1
                 ORDER BY order_index ASC`, { type: sequelize_1.QueryTypes.SELECT });
            // Always prepend core fields
            const coreFields = [
                { field_name: 'first_name', field_type: 'TEXT', is_compulsory: 1, section_name: 'Contact', order_index: 0, web_form_visible: 1 },
                { field_name: 'last_name', field_type: 'TEXT', is_compulsory: 1, section_name: 'Contact', order_index: 0, web_form_visible: 1 },
                { field_name: 'email', field_type: 'TEXT', is_compulsory: 0, section_name: 'Contact', order_index: 0, web_form_visible: 1 },
            ];
            // Deduplicate (custom fields may repeat email etc.)
            const coreNames = new Set(coreFields.map((f) => f.field_name));
            const customOnly = fields.filter((f) => !coreNames.has(f.field_name));
            res.status(200).json({ fields: [...coreFields, ...customOnly] });
        }
        catch (error) {
            console.error('[WebFormController] getFormSchema failed:', error);
            res.status(500).json({ error: 'Failed to fetch form schema.' });
        }
    }
    /**
     * PUT /api/web-forms/visibility/:tenantId
     *
     * PROTECTED (tenant admin only) — Toggles the web_form_visible flag on
     * a tenant_field. Adds the column if it doesn't exist yet.
     * Body: { field_name: string, visible: boolean }
     */
    static async updateFieldVisibility(req, res) {
        const tenantId = req.headers['x-tenant-id'];
        const { field_name, visible } = req.body;
        if (!tenantId || !field_name) {
            res.status(400).json({ error: 'x-tenant-id header and field_name body param are required.' });
            return;
        }
        try {
            const sequelize = await TenantConnectionManager_1.TenantConnectionManager.getConnection(tenantId);
            // Add column if missing (idempotent)
            try {
                await sequelize.query('ALTER TABLE `tenant_fields` ADD COLUMN `web_form_visible` TINYINT(1) DEFAULT 1', { type: sequelize_1.QueryTypes.RAW });
            }
            catch (alterErr) {
                // 1060 = Duplicate column, safe to ignore
                if (alterErr?.original?.errno !== 1060)
                    throw alterErr;
            }
            await sequelize.query('UPDATE `tenant_fields` SET web_form_visible = :visible WHERE field_name = :field_name', {
                replacements: { visible: visible ? 1 : 0, field_name },
                type: sequelize_1.QueryTypes.UPDATE,
            });
            res.status(200).json({
                message: `Field '${field_name}' web form visibility set to ${visible}.`,
            });
        }
        catch (error) {
            console.error('[WebFormController] updateFieldVisibility failed:', error);
            res.status(500).json({ error: 'Failed to update field visibility.' });
        }
    }
}
exports.WebFormController = WebFormController;
