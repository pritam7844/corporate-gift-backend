import * as companyService from './company.service.js';

export const createCompany = async (req, res, next) => {
  try {
    const company = await companyService.createCompany(req.body);
    res.status(201).json({ success: true, data: company });
  } catch (error) {
    res.status(400); // Bad Request for taken subdomains
    next(error);
  }
};

export const getCompanies = async (req, res, next) => {
  try {
    const companies = await companyService.getAllCompanies();
    res.status(200).json({ success: true, data: companies });
  } catch (error) {
    next(error);
  }
};

export const getCompany = async (req, res, next) => {
  try {
    const { subdomain } = req.params;
    const company = await companyService.getCompanyBySubdomain(subdomain);
    res.status(200).json({ success: true, data: company });
  } catch (error) {
    res.status(404); // Not Found
    next(error);
  }
};

export const getCompanyByID = async (req, res, next) => {
  try {
    console.log('Fetching company by ID:', req.params.id);
    const company = await companyService.getCompanyById(req.params.id);
    console.log('Company found:', company ? company.name : 'NULL');
    res.status(200).json({ success: true, data: company });
  } catch (error) {
    console.error('Error in getCompanyByID:', error.message);
    res.status(404);
    next(error);
  }
};

export const updateCompany = async (req, res, next) => {
  try {
    const company = await companyService.updateCompany(req.params.id, req.body);
    res.status(200).json({ success: true, data: company });
  } catch (error) {
    next(error);
  }
};

export const deleteCompany = async (req, res, next) => {
  try {
    await companyService.deleteCompany(req.params.id);
    res.status(200).json({ success: true, message: 'Company deleted' });
  } catch (error) {
    next(error);
  }
};