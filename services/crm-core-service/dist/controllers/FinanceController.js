"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinanceController = void 0;
const TenantConnectionManager_1 = require("../config/TenantConnectionManager");
const Account_1 = require("../models/Account");
const Invoice_1 = require("../models/Invoice");
class FinanceController {
    // ─── Helpers ────────────────────────────────────────────────────────────────
    static async initModels(tenantId) {
        const sequelize = await TenantConnectionManager_1.TenantConnectionManager.getConnection(tenantId);
        Account_1.Account.initModel(sequelize, tenantId);
        Invoice_1.Invoice.initModel(sequelize, tenantId);
        await Account_1.Account.sync({ alter: true });
        await Invoice_1.Invoice.sync({ alter: true });
    }
    // ─── Accounts ───────────────────────────────────────────────────────────────
    static async getAccounts(req, res) {
        try {
            const tenantId = req.headers['x-tenant-id'];
            await FinanceController.initModels(tenantId);
            const accounts = await Account_1.Account.findAll({ order: [['name', 'ASC']] });
            res.status(200).json({ accounts });
        }
        catch (error) {
            console.error('[FinanceController] getAccounts failed:', error);
            res.status(500).json({ error: 'Failed to retrieve accounts.' });
        }
    }
    static async createAccount(req, res) {
        try {
            const tenantId = req.headers['x-tenant-id'];
            await FinanceController.initModels(tenantId);
            const { name, industry, website } = req.body;
            if (!name) {
                res.status(400).json({ error: 'Account name is required.' });
                return;
            }
            const account = await Account_1.Account.create({ name, industry: industry || '', website: website || '' });
            res.status(201).json({ account });
        }
        catch (error) {
            console.error('[FinanceController] createAccount failed:', error);
            res.status(500).json({ error: 'Failed to create account.' });
        }
    }
    static async deleteAccount(req, res) {
        try {
            const tenantId = req.headers['x-tenant-id'];
            await FinanceController.initModels(tenantId);
            const account = await Account_1.Account.findByPk(req.params.id);
            if (!account) {
                res.status(404).json({ error: 'Account not found.' });
                return;
            }
            await account.destroy();
            res.status(200).json({ message: 'Account deleted.' });
        }
        catch (error) {
            console.error('[FinanceController] deleteAccount failed:', error);
            res.status(500).json({ error: 'Failed to delete account.' });
        }
    }
    // ─── Invoices ───────────────────────────────────────────────────────────────
    static async getInvoices(req, res) {
        try {
            const tenantId = req.headers['x-tenant-id'];
            await FinanceController.initModels(tenantId);
            const { lead_id } = req.query;
            const where = lead_id ? { lead_id: lead_id } : {};
            const invoices = await Invoice_1.Invoice.findAll({ where, order: [['due_date', 'ASC']] });
            res.status(200).json({ invoices });
        }
        catch (error) {
            console.error('[FinanceController] getInvoices failed:', error);
            res.status(500).json({ error: 'Failed to retrieve invoices.' });
        }
    }
    static async createInvoice(req, res) {
        try {
            const tenantId = req.headers['x-tenant-id'];
            await FinanceController.initModels(tenantId);
            const { lead_id, amount, status, due_date } = req.body;
            if (!lead_id || !amount || !due_date) {
                res.status(400).json({ error: 'lead_id, amount, and due_date are required.' });
                return;
            }
            const invoice = await Invoice_1.Invoice.create({
                lead_id,
                amount: Number(amount),
                status: status || 'DRAFT',
                due_date,
            });
            res.status(201).json({ invoice });
        }
        catch (error) {
            console.error('[FinanceController] createInvoice failed:', error);
            res.status(500).json({ error: 'Failed to create invoice.' });
        }
    }
    static async updateInvoiceStatus(req, res) {
        try {
            const tenantId = req.headers['x-tenant-id'];
            await FinanceController.initModels(tenantId);
            const invoice = await Invoice_1.Invoice.findByPk(req.params.id);
            if (!invoice) {
                res.status(404).json({ error: 'Invoice not found.' });
                return;
            }
            const { status } = req.body;
            await invoice.update({ status });
            res.status(200).json({ invoice });
        }
        catch (error) {
            console.error('[FinanceController] updateInvoiceStatus failed:', error);
            res.status(500).json({ error: 'Failed to update invoice status.' });
        }
    }
}
exports.FinanceController = FinanceController;
