"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const FileController_1 = require("../controllers/FileController");
const multerConfig_1 = require("../middlewares/multerConfig");
const router = (0, express_1.Router)();
router.post('/upload', multerConfig_1.upload.single('document'), FileController_1.FileController.uploadFile); // POST /api/files/upload
router.get('/', FileController_1.FileController.getFiles); // GET  /api/files?lead_id=X
router.delete('/:id', FileController_1.FileController.deleteFile); // DEL  /api/files/:id
exports.default = router;
