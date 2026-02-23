import { Router } from 'express';
import { CompanyController } from '../controllers/CompanyController';

const router = Router();


router.get('/', CompanyController.getCompanies);


router.get('/:id/metrics', CompanyController.getCompanyMetrics);


router.patch('/:id/status', CompanyController.updateCompanyStatus);

export default router;
