import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema({
  employeeId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', // Or whatever you named your employee model
    required: true, 
    unique: true 
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  items: [{
    productId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Product', // Or 'Gift'
      required: true 
    },
    quantity: { 
      type: Number, 
      required: true, 
      min: 1, 
      default: 1 
    }
  }]
}, { timestamps: true });

export default mongoose.model('Cart', cartSchema);