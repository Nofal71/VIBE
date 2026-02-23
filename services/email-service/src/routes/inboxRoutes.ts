import { Router } from 'express';
import { InboxController } from '../controllers/InboxController';

const router = Router();

// IMAP credential management (stored per user in tenant DB)
router.get('/imap-settings', InboxController.getImapSettings);
router.post('/imap-settings', InboxController.saveImapSettings);

// Inbox email listing with lead JOIN
router.get('/emails', InboxController.getInbox);

export default router;
