import express from 'express';
import multer from 'multer';
import {
  addProduct,
  getProducts,
  updateProduct,
  removeProduct
} from './product.controller.js';
import { isLoggedIn, isAdmin } from '../../middleware/auth.middleware.js';

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Admin Only Routes
router.post('/', isLoggedIn, isAdmin, upload.array('images', 5), addProduct);
router.get('/', isLoggedIn, isAdmin, getProducts);
router.put('/:id', isLoggedIn, isAdmin, upload.array('images', 5), updateProduct);
router.delete('/:id', isLoggedIn, isAdmin, removeProduct);

export default router;