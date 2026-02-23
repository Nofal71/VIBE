import { Router } from 'express';
import { FileController } from '../controllers/FileController';
import { upload } from '../middlewares/multerConfig';

const router = Router();

router.post('/upload', upload.single('document'), FileController.uploadFile);  // POST /api/files/upload
router.get('/', FileController.getFiles);                                       // GET  /api/files?lead_id=X
router.delete('/:id', FileController.deleteFile);                               // DEL  /api/files/:id

export default router;
