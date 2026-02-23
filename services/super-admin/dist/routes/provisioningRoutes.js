"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ProvisioningController_1 = require("../controllers/ProvisioningController");
const router = (0, express_1.Router)();
router.post('/provision', ProvisioningController_1.ProvisioningController.createCompany);
exports.default = router;
