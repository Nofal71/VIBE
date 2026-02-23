"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ImportExportController_1 = require("../controllers/ImportExportController");
const router = (0, express_1.Router)();
router.get('/export/leads', ImportExportController_1.ImportExportController.exportLeads);
router.post('/import/leads', ImportExportController_1.csvUpload.single('file'), ImportExportController_1.ImportExportController.importLeads);
exports.default = router;
