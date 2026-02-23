import { Router } from 'express';
import { ProvisioningController } from '../controllers/ProvisioningController';

const router = Router();

router.post('/', ProvisioningController.createCompany);

export default router;
