"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const GenericModuleController_1 = require("../controllers/GenericModuleController");
const fieldSecurityMiddleware_1 = require("../middlewares/fieldSecurityMiddleware");
const router = (0, express_1.Router)();
// Hook Field Security onto explicit extraction calls ensuring scrubbing executes automatically
router.get('/:tableName', fieldSecurityMiddleware_1.applyFieldSecurity, GenericModuleController_1.GenericModuleController.getModuleData);
router.post('/:tableName', GenericModuleController_1.GenericModuleController.createModuleData);
exports.default = router;
