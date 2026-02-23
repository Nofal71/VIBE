"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const CompanyController_1 = require("../controllers/CompanyController");
const router = (0, express_1.Router)();
// GET  /api/companies             — Full company list with Plan, Domain, Blueprint joins
router.get('/', CompanyController_1.CompanyController.getCompanies);
// GET  /api/companies/:id/metrics — Live tenant DB tunnel: leads, users, storage
router.get('/:id/metrics', CompanyController_1.CompanyController.getCompanyMetrics);
// PATCH /api/companies/:id/status — Toggle active ↔ suspended
router.patch('/:id/status', CompanyController_1.CompanyController.updateCompanyStatus);
exports.default = router;
