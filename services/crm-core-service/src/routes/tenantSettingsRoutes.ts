import { Router } from 'express';
import { TenantSettingsController } from '../controllers/TenantSettingsController';

const router = Router();

// Custom Fields
router.get('/fields', TenantSettingsController.getFields);
router.post('/fields', TenantSettingsController.addField);

// Pipeline Stages
router.get('/stages', TenantSettingsController.getStages);
router.put('/stages', TenantSettingsController.updateStages);

// UI Branding (tenant-scoped, stored in tenant_config)
router.get('/branding', TenantSettingsController.getBranding);
router.put('/branding', TenantSettingsController.updateBranding);

export default router;
