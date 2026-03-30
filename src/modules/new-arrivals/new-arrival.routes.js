import express from 'express';
import multer from 'multer';
import {
  addArrival,
  getArrivals,
  updateArrival,
  removeArrival
} from './new-arrival.controller.js';
import { isLoggedIn, isAdmin } from '../../middleware/auth.middleware.js';

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Admin Only Mutations
router.post('/', isLoggedIn, isAdmin, upload.array('images', 5), addArrival);
router.put('/:id', isLoggedIn, isAdmin, upload.array('images', 5), updateArrival);
router.delete('/:id', isLoggedIn, isAdmin, removeArrival);

// Public/LoggedIn
router.get('/', isLoggedIn, getArrivals);

export default router;
