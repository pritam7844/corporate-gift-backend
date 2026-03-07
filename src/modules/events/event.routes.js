import express from 'express';
import {
  createEvent,
  updateEventProducts,
  getCompanyEvents,
  getAllEvents,
  assignGlobalEventToCompany,
  getEventByID
} from './event.controller.js';
import { isLoggedIn, isAdmin } from '../../middleware/auth.middleware.js';

const router = express.Router();

// Public/Portal Route: Employees need to see events for their company
router.get('/my-events', isLoggedIn, getCompanyEvents);
router.post('/', isLoggedIn, isAdmin, createEvent);
router.get('/', isLoggedIn, isAdmin, getAllEvents);
router.get('/:id', isLoggedIn, getEventByID);

// Route to "Add Products" to an existing event
router.patch('/add-products', isLoggedIn, isAdmin, updateEventProducts);
router.post('/assign', isLoggedIn, isAdmin, assignGlobalEventToCompany);

export default router;