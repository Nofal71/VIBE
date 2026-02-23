"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const NoteController_1 = require("../controllers/NoteController");
const router = (0, express_1.Router)();
router.get('/', NoteController_1.NoteController.getNotesByLead); // GET  /api/notes?lead_id=X
router.post('/', NoteController_1.NoteController.createNote); // POST /api/notes
router.put('/:id', NoteController_1.NoteController.updateNote); // PUT  /api/notes/:id
router.delete('/:id', NoteController_1.NoteController.deleteNote); // DEL  /api/notes/:id
exports.default = router;
