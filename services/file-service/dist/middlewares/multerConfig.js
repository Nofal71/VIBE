"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const multer_1 = __importDefault(require("multer"));
const uuid_1 = require("uuid");
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const tenantId = req.headers['x-tenant-id'];
        if (!tenantId) {
            return cb(new Error('Missing x-tenant-id header'), '');
        }
        const uploadPath = path_1.default.join('/var/crm_data', tenantId);
        // Synchronously create directory if it doesn't exist
        if (!fs_1.default.existsSync(uploadPath)) {
            fs_1.default.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        // Generate a unique file name to avoid collisions
        const ext = path_1.default.extname(file.originalname);
        const uniqueFileName = `${(0, uuid_1.v4)()}${ext}`;
        cb(null, uniqueFileName);
    },
});
exports.upload = (0, multer_1.default)({ storage });
