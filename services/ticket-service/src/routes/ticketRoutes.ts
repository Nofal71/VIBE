import { Router } from 'express';
import { TicketController } from '../controllers/TicketController';

const router = Router();

router.post('/', TicketController.createTicket);
router.get('/', TicketController.getTickets);

export default router;
