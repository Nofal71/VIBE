"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const FinanceController_1 = require("../controllers/FinanceController");
const router = (0, express_1.Router)();
// ─── Account Routes ─────────────────────────────────────────────────────────
router.get('/accounts', FinanceController_1.FinanceController.getAccounts);
router.post('/accounts', FinanceController_1.FinanceController.createAccount);
router.delete('/accounts/:id', FinanceController_1.FinanceController.deleteAccount);
// ─── Invoice Routes ──────────────────────────────────────────────────────────
router.get('/invoices', FinanceController_1.FinanceController.getInvoices);
router.post('/invoices', FinanceController_1.FinanceController.createInvoice);
router.put('/invoices/:id/status', FinanceController_1.FinanceController.updateInvoiceStatus);
exports.default = router;
