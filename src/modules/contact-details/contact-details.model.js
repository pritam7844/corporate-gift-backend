import mongoose from 'mongoose';

const contactDetailSchema = new mongoose.Schema({
  companyId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Company', 
    required: true 
  },
  firstName: { type: String, required: true },
  middleName: { type: String, default: '' },
  lastName: { type: String, required: true },
  mobileNumber: { type: String, required: true },
  email: { type: String, default: '' },
  employeeId: { type: String, required: true },
  employeeBranch: { type: String, default: '' },
  streetAddress: { type: String, required: true },
  addressLine2: { type: String, default: '' },
  city: { type: String, required: true },
  state: { type: String, required: true },
  country: { type: String, required: true },
  zipCode: { type: String, required: true },
  landmark: { type: String, default: '' }
}, { timestamps: true });

export default mongoose.model('ContactDetail', contactDetailSchema);
