"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const BlueprintController_1 = require("../controllers/BlueprintController");
const router = (0, express_1.Router)();
router.post('/', BlueprintController_1.BlueprintController.createBlueprint);
router.get('/', BlueprintController_1.BlueprintController.getBlueprints);
exports.default = router;
