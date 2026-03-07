import mongoose from 'mongoose';

const companySchema = new mongoose.Schema({
  name: { type: String, required: true },
  subdomain: { type: String, required: true, unique: true }, // e.g., 'aimt'
  logo: { type: String, default: '' },
  departments: [{ type: String }], // e.g., ['IT', 'HR', 'Sales']
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('Company', companySchema);