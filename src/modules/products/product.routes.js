import express from 'express';
import {
  addProduct,
  getProducts,
  getProductById,
  updateProduct,
  removeProduct
} from './product.controller.js';
import { isLoggedIn, isAdmin } from '../../middleware/auth.middleware.js';

const router = express.Router();

// Admin Only Routes
router.post('/', isLoggedIn, isAdmin, addProduct);
router.get('/', isLoggedIn, isAdmin, getProducts);
router.get('/:id', isLoggedIn, getProductById);
router.put('/:id', isLoggedIn, isAdmin, updateProduct);
router.delete('/:id', isLoggedIn, isAdmin, removeProduct);

export default router;