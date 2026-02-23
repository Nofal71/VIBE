"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const WebFormController_1 = require("../controllers/WebFormController");
const router = (0, express_1.Router)();
// ── Public endpoints (no auth — intended for external website embeds) ─────────
// GET  /api/web-forms/schema/:tenantId  — returns dynamic field schema
router.get('/schema/:tenantId', WebFormController_1.WebFormController.getFormSchema);
// POST /api/web-forms/submit/:tenantId  — accepts a lead from an embedded form
router.post('/submit/:tenantId', WebFormController_1.WebFormController.submitPublicLead);
// ── Visibility toggle (gateway-gated — caller must pass valid Bearer token) ───
// PUT  /api/web-forms/visibility/:tenantId — toggle field web_form_visible flag
// NOTE: auth is enforced at nginx/gateway layer for all /api/* protected paths.
router.put('/visibility/:tenantId', WebFormController_1.WebFormController.updateFieldVisibility);
exports.default = router;
