import { Router } from 'express';
import { LeadOperationController } from '../controllers/LeadOperationController';
import { LeadCommunicationController } from '../controllers/LeadCommunicationController';

const router = Router();

router.get('/advanced', LeadOperationController.getLeadsAdvanced);
router.post('/bulk-delete', LeadOperationController.bulkDelete);
router.post('/bulk-assign', LeadOperationController.bulkAssign);

// Per-lead communication endpoints
router.post('/:id/email', LeadCommunicationController.sendDirectEmail);
router.get('/:id/timeline', LeadCommunicationController.getLeadTimeline);

export default router;
