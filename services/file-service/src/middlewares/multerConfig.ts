import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';

const storage = multer.diskStorage({
    destination: (req: Request, file: Express.Multer.File, cb) => {
        const tenantId = req.headers['x-tenant-id'] as string;

        if (!tenantId) {
            return cb(new Error('Missing x-tenant-id header'), '');
        }

        const uploadPath = path.join('/var/crm_data', tenantId);

        // Synchronously create directory if it doesn't exist
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }

        cb(null, uploadPath);
    },
    filename: (req: Request, file: Express.Multer.File, cb) => {
        // Generate a unique file name to avoid collisions
        const ext = path.extname(file.originalname);
        const uniqueFileName = `${uuidv4()}${ext}`;
        cb(null, uniqueFileName);
    },
});

export const upload = multer({ storage });
