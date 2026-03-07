import mongoose from 'mongoose';

const requestSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  employeeDetails: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    whatsapp: { type: String },
    address: { type: String, required: true },
    employeeId: { type: String }, // Optional
    department: { type: String } // Optional
  },
  selectedProducts: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, default: 1 },
    price: { type: Number, required: true }
  }],
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Shipped', 'Delivered'],
    default: 'Pending'
  }
}, { timestamps: true });

export default mongoose.model('Request', requestSchema);