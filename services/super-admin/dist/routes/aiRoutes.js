"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AIGeneratorController_1 = require("../controllers/AIGeneratorController");
const router = (0, express_1.Router)();
// POST /api/ai/generate-blueprint  — Gemini-powered blueprint generation
router.post('/generate-blueprint', AIGeneratorController_1.AIGeneratorController.generateBlueprint);
exports.default = router;
