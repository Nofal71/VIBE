"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const LeadOperationController_1 = require("../controllers/LeadOperationController");
const LeadCommunicationController_1 = require("../controllers/LeadCommunicationController");
const router = (0, express_1.Router)();
router.get('/advanced', LeadOperationController_1.LeadOperationController.getLeadsAdvanced);
router.post('/bulk-delete', LeadOperationController_1.LeadOperationController.bulkDelete);
router.post('/bulk-assign', LeadOperationController_1.LeadOperationController.bulkAssign);
// Per-lead communication endpoints
router.post('/:id/email', LeadCommunicationController_1.LeadCommunicationController.sendDirectEmail);
router.get('/:id/timeline', LeadCommunicationController_1.LeadCommunicationController.getLeadTimeline);
exports.default = router;
