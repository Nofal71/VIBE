import { Router } from 'express';
import { CompanyController } from '../controllers/CompanyController';

const router = Router();

// GET  /api/companies             — Full company list with Plan, Domain, Blueprint joins
router.get('/', CompanyController.getCompanies);

// GET  /api/companies/:id/metrics — Live tenant DB tunnel: leads, users, storage
router.get('/:id/metrics', CompanyController.getCompanyMetrics);

// PATCH /api/companies/:id/status — Toggle active ↔ suspended
router.patch('/:id/status', CompanyController.updateCompanyStatus);

export default router;
