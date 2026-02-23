"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const DealController_1 = require("../controllers/DealController");
const router = (0, express_1.Router)();
router.post('/:id/transition', DealController_1.DealController.requestStateTransition);
exports.default = router;
