"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const NotificationController_1 = require("../controllers/NotificationController");
const router = (0, express_1.Router)();
router.get('/unread', NotificationController_1.NotificationController.getUnreadNotifications);
router.put('/:id/read', NotificationController_1.NotificationController.markAsRead);
router.put('/mark-all-read', NotificationController_1.NotificationController.markAllAsRead);
exports.default = router;
