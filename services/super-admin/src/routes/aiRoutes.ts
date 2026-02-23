import { Router } from 'express';
import { AIGeneratorController } from '../controllers/AIGeneratorController';

const router = Router();


router.post('/generate-blueprint', AIGeneratorController.generateBlueprint);

export default router;
