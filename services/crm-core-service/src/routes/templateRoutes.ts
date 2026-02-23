import { Router } from 'express';
import { TemplateController } from '../controllers/TemplateController';

const router = Router();

router.get('/', TemplateController.getTemplates);               // GET    /api/templates
router.get('/:id', TemplateController.getTemplate);            // GET    /api/templates/:id
router.post('/', TemplateController.createTemplate);            // POST   /api/templates
router.put('/:id', TemplateController.updateTemplate);          // PUT    /api/templates/:id
router.delete('/:id', TemplateController.deleteTemplate);       // DELETE /api/templates/:id

export default router;
