import { Router } from 'express';
import { AIGeneratorController } from '../controllers/AIGeneratorController';

const router = Router();

// POST /api/ai/generate-blueprint  — Gemini-powered blueprint generation
router.post('/generate-blueprint', AIGeneratorController.generateBlueprint);

export default router;
