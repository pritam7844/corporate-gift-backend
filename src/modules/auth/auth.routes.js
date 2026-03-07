import express from 'express';
import { register, login, logout } from './auth.controller.js';
import { isLoggedIn, isAdmin } from '../../middleware/auth.middleware.js';

const router = express.Router();

// Public Routes
router.post('/login', login);


router.post('/register', register);
router.post('/logout', logout);

export default router;