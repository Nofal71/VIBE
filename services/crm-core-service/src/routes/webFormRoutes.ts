import { Router } from 'express';
import { WebFormController } from '../controllers/WebFormController';

const router = Router();

// ── Public endpoints (no auth — intended for external website embeds) ─────────

// GET  /api/web-forms/schema/:tenantId  — returns dynamic field schema
router.get('/schema/:tenantId', WebFormController.getFormSchema);

// POST /api/web-forms/submit/:tenantId  — accepts a lead from an embedded form
router.post('/submit/:tenantId', WebFormController.submitPublicLead);

// ── Visibility toggle (gateway-gated — caller must pass valid Bearer token) ───

// PUT  /api/web-forms/visibility/:tenantId — toggle field web_form_visible flag
// NOTE: auth is enforced at nginx/gateway layer for all /api/* protected paths.
router.put('/visibility/:tenantId', WebFormController.updateFieldVisibility);

export default router;
