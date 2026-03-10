import express from 'express';
import { createRequest, getRequests, getUserRequests, updateRequestStatus } from './request.controller.js';
import { isLoggedIn, isAdmin } from '../../middleware/auth.middleware.js';

const router = express.Router();

/**
 * @route   POST /api/gift-requests
 * @desc    Employee submits their gift selection
 * @access  Public (Used by Next.js Employee Portal)
 */
router.post('/', isLoggedIn, createRequest);

/**
 * @route   GET /api/gift-requests/my-requests
 * @desc    Get current user's requests
 * @access  Private (Employee Only)
 */
router.get('/my-requests', isLoggedIn, getUserRequests);

/**
 * @route   GET /api/gift-requests
 * @desc    Admin views all gift requests (can filter by ?companyId=...)
 * @access  Private (Admin Only)
 */
router.get('/', isLoggedIn, isAdmin, getRequests);
router.get('/company/:companyId', isLoggedIn, isAdmin, getRequests);

/**
 * @route   PUT /api/gift-requests/:id/status
 * @desc    Admin updates status of a gift request
 * @access  Private (Admin Only)
 */
router.put('/:id/status', isLoggedIn, isAdmin, updateRequestStatus);

export default router;