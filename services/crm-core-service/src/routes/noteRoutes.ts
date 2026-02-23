import { Router } from 'express';
import { NoteController } from '../controllers/NoteController';

const router = Router();

router.get('/', NoteController.getNotesByLead);            // GET  /api/notes?lead_id=X
router.post('/', NoteController.createNote);               // POST /api/notes
router.put('/:id', NoteController.updateNote);             // PUT  /api/notes/:id
router.delete('/:id', NoteController.deleteNote);          // DEL  /api/notes/:id

export default router;
