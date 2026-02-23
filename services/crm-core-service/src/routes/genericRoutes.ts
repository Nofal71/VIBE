import { Router } from 'express';
import { GenericModuleController } from '../controllers/GenericModuleController';
import { applyFieldSecurity } from '../middlewares/fieldSecurityMiddleware';

const router = Router();

// Hook Field Security onto explicit extraction calls ensuring scrubbing executes automatically
router.get('/:tableName', applyFieldSecurity, GenericModuleController.getModuleData);

router.post('/:tableName', GenericModuleController.createModuleData);

export default router;
