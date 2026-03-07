import express from 'express';
import {
    createCompany,
    getCompanies,
    getCompany,
    getCompanyByID,
    updateCompany,
    deleteCompany
} from './company.controller.js';
import { isLoggedIn, isAdmin } from '../../middleware/auth.middleware.js';

const router = express.Router();

// Public route for the Next.js Employee Portal (Fetches company details)
router.get('/portal/:subdomain', getCompany);

// Protected Admin Routes
router.post('/', isLoggedIn, isAdmin, createCompany);
router.get('/', isLoggedIn, isAdmin, getCompanies);
router.get('/:id', isLoggedIn, isAdmin, getCompanyByID);
router.put('/:id', isLoggedIn, isAdmin, updateCompany);
router.delete('/:id', isLoggedIn, isAdmin, deleteCompany);

export default router;