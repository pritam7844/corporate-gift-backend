import Company from '../modules/company/company.model.js';

export const identifyTenant = async (req, res, next) => {
  // Frontend will send the subdomain (e.g., 'apple') in this header
  const subdomain = req.headers['x-tenant-id']; 

  if (!subdomain) {
    return res.status(400).json({ message: "No company context provided" });
  }

  const company = await Company.findOne({ subdomain });
  if (!company) {
    return res.status(404).json({ message: "Company not found" });
  }

  req.company = company; // Attach company object to request
  next();
};