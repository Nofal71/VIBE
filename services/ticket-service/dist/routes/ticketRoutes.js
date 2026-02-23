"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const TicketController_1 = require("../controllers/TicketController");
const router = (0, express_1.Router)();
router.post('/', TicketController_1.TicketController.createTicket);
router.get('/', TicketController_1.TicketController.getTickets);
exports.default = router;
