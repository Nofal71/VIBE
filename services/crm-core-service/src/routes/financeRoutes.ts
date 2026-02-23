import { Router } from 'express';
import { FinanceController } from '../controllers/FinanceController';

const router = Router();

// ─── Account Routes ─────────────────────────────────────────────────────────
router.get('/accounts', FinanceController.getAccounts);
router.post('/accounts', FinanceController.createAccount);
router.delete('/accounts/:id', FinanceController.deleteAccount);

// ─── Invoice Routes ──────────────────────────────────────────────────────────
router.get('/invoices', FinanceController.getInvoices);
router.post('/invoices', FinanceController.createInvoice);
router.put('/invoices/:id/status', FinanceController.updateInvoiceStatus);

export default router;
