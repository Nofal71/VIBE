"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const TenantSettingsController_1 = require("../controllers/TenantSettingsController");
const router = (0, express_1.Router)();
// Custom Fields
router.get('/fields', TenantSettingsController_1.TenantSettingsController.getFields);
router.post('/fields', TenantSettingsController_1.TenantSettingsController.addField);
// Pipeline Stages
router.get('/stages', TenantSettingsController_1.TenantSettingsController.getStages);
router.put('/stages', TenantSettingsController_1.TenantSettingsController.updateStages);
// UI Branding (tenant-scoped, stored in tenant_config)
router.get('/branding', TenantSettingsController_1.TenantSettingsController.getBranding);
router.put('/branding', TenantSettingsController_1.TenantSettingsController.updateBranding);
exports.default = router;
