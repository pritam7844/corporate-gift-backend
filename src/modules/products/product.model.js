import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' }, // Product description
  image: { type: String }, // Store URL or base64
  category: { type: String },
  actualPrice: { type: Number, required: true }, // For Admin reference
  discountedPrice: { type: Number }, // Price shown to employees

  // If null, it's a Global Product. If it has an ID, it's a Private Product.
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    default: null
  },
  isGlobal: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('Product', productSchema);