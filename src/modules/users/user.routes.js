import express from 'express';
import {
  getMe,
  getUsers,
  updateUserDetails,
  removeUser,
  createCompanyUser //
} from './user.controller.js';
import { isLoggedIn, isAdmin } from '../../middleware/auth.middleware.js';

const router = express.Router();

router.get('/me', isLoggedIn, getMe);

// Admin Only Routes
router.get('/', isLoggedIn, isAdmin, getUsers);
router.post('/company-user', isLoggedIn, isAdmin, createCompanyUser); // NEW
router.put('/:id', isLoggedIn, isAdmin, updateUserDetails);
router.delete('/:id', isLoggedIn, isAdmin, removeUser);

export default router;  