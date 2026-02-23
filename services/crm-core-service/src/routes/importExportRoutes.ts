import { Router } from 'express';
import { ImportExportController, csvUpload } from '../controllers/ImportExportController';

const router = Router();

router.get('/export/leads', ImportExportController.exportLeads);
router.post('/import/leads', csvUpload.single('file'), ImportExportController.importLeads);

export default router;
