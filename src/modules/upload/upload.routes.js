import express from 'express';
import multer from 'multer';
import { uploadLogo } from './upload.controller.js';

const router = express.Router();

// Configure multer to use memory storage (so we don't save to disk before Cloudinary)
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Route expects a field named 'logo'
router.post('/', upload.single('logo'), uploadLogo);

export default router;
