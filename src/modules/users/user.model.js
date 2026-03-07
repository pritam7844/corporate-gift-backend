import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Hashed in Auth Service
  role: { 
    type: String, 
    enum: ['admin', 'company_user'], 
    default: 'company_user' 
  },
  companyId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Company',
    default: null 
  }
}, { timestamps: true });

export default mongoose.model('User', userSchema);