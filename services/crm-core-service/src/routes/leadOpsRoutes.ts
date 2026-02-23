import { Router } from 'express';
import { LeadController } from '../controllers/LeadController';
import { LeadOperationController } from '../controllers/LeadOperationController';
import { LeadCommunicationController } from '../controllers/LeadCommunicationController';

const router = Router();

// Base CRUD
router.get('/', LeadController.getLeads);
router.get('/:id', LeadController.getLeadById);
router.post('/', LeadController.createLead);
router.put('/:id', LeadController.updateLead);
router.delete('/:id', LeadController.deleteLead);

// Operations & Advanced
router.get('/advanced', LeadOperationController.getLeadsAdvanced);
router.post('/bulk-delete', LeadOperationController.bulkDelete);
router.post('/bulk-assign', LeadOperationController.bulkAssign);

// Per-lead communication endpoints
router.post('/:id/email', LeadCommunicationController.sendDirectEmail);
router.get('/:id/timeline', LeadCommunicationController.getLeadTimeline);

export default router;
