"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const TemplateController_1 = require("../controllers/TemplateController");
const router = (0, express_1.Router)();
router.get('/', TemplateController_1.TemplateController.getTemplates); // GET    /api/templates
router.get('/:id', TemplateController_1.TemplateController.getTemplate); // GET    /api/templates/:id
router.post('/', TemplateController_1.TemplateController.createTemplate); // POST   /api/templates
router.put('/:id', TemplateController_1.TemplateController.updateTemplate); // PUT    /api/templates/:id
router.delete('/:id', TemplateController_1.TemplateController.deleteTemplate); // DELETE /api/templates/:id
exports.default = router;
