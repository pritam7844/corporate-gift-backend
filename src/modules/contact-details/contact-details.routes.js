import express from 'express';
import {
  submitContactForm,
  processCronQueue,
  getCompanySubmissions,
  exportCompanySubmissions,
  exportCompanySubmissionsExcel
} from './contact-details.controller.js';

const router = express.Router();

// Public route for employees to submit the form
router.post('/submit', submitContactForm);

// Secured cron route for Vercel/cron-job.org to process the queue
router.get('/cron/process', processCronQueue);

// Admin routes (In a real app, you would add admin auth middleware here)
router.get('/:companyId/submissions', getCompanySubmissions);
router.get('/:companyId/export', exportCompanySubmissions);
router.get('/:companyId/export-excel', exportCompanySubmissionsExcel);

export default router;
