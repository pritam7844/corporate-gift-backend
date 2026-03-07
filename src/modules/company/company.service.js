import Company from './company.model.js';

export const createCompany = async (companyData) => {
  const { name, subdomain, departments, logo } = companyData;
  const formattedSubdomain = subdomain.toLowerCase().trim();

  const existingCompany = await Company.findOne({ subdomain: formattedSubdomain });
  if (existingCompany) {
    throw new Error('Subdomain already taken');
  }

  // Creating the profile activates the subdomain logic in your Next.js middleware
  const company = await Company.create({
    name,
    subdomain: formattedSubdomain,
    departments: departments || [],
    logo: logo || ''
  });

  return company;
};

export const getCompanyById = async (id) => {
  const company = await Company.findById(id);
  if (!company) throw new Error('Company not found');
  return company;
};

export const updateCompany = async (id, updateData) => {
  const company = await Company.findByIdAndUpdate(id, updateData, { new: true });
  if (!company) throw new Error('Company not found');
  return company;
};

export const deleteCompany = async (id) => {
  const company = await Company.findByIdAndDelete(id);
  if (!company) throw new Error('Company not found');
  return company;
};

export const getAllCompanies = async () => {
  return await Company.find({}).sort({ createdAt: -1 });
};

export const getCompanyBySubdomain = async (subdomain) => {
  const company = await Company.findOne({ subdomain: subdomain.toLowerCase().trim() });
  if (!company) {
    throw new Error('Company not found');
  }
  return company;
};