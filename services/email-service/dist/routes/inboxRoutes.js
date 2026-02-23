"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const InboxController_1 = require("../controllers/InboxController");
const router = (0, express_1.Router)();
// IMAP credential management (stored per user in tenant DB)
router.get('/imap-settings', InboxController_1.InboxController.getImapSettings);
router.post('/imap-settings', InboxController_1.InboxController.saveImapSettings);
// Inbox email listing with lead JOIN
router.get('/emails', InboxController_1.InboxController.getInbox);
exports.default = router;
