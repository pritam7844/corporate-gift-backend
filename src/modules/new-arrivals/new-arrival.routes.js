import express from 'express';
import {
  addArrival,
  getArrivals,
  updateArrival,
  removeArrival
} from './new-arrival.controller.js';
import { isLoggedIn, isAdmin } from '../../middleware/auth.middleware.js';

const router = express.Router();

// Admin Only Mutations
router.post('/', isLoggedIn, isAdmin, addArrival);
router.put('/:id', isLoggedIn, isAdmin, updateArrival);
router.delete('/:id', isLoggedIn, isAdmin, removeArrival);

// Public/LoggedIn
router.get('/', isLoggedIn, getArrivals);

export default router;
