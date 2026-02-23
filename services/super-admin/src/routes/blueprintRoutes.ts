import { Router } from 'express';
import { BlueprintController } from '../controllers/BlueprintController';

const router = Router();

router.post('/', BlueprintController.createBlueprint);
router.get('/', BlueprintController.getBlueprints);

export default router;
