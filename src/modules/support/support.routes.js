import express from 'express';
import { createTicket, getAllTickets, updateTicketStatus } from './support.controller.js';
import { isLoggedIn, isAdmin } from '../../middleware/auth.middleware.js';

const router = express.Router();

/**
 * @route   POST /api/support
 * @desc    Submit a support ticket
 * @access  Public (Guest users can submit from landing page)
 */
router.post('/', createTicket);

/**
 * @route   GET /api/support
 * @desc    Admin views all support tickets
 * @access  Private (Admin Only)
 */
router.get('/', isLoggedIn, isAdmin, getAllTickets);

/**
 * @route   PUT /api/support/:id/status
 * @desc    Admin updates status of a support ticket
 * @access  Private (Admin Only)
 */
router.put('/:id/status', isLoggedIn, isAdmin, updateTicketStatus);

export default router;
