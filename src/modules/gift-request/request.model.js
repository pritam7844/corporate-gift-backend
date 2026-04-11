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
    address: { type: String }, // Delivery Address
    employeeId: { type: String, required: true }, // Mandatory as requested
    department: { type: String }, // Optional
    additionalRequirements: { type: String } // Optional notes
  },
  customization: {
    isBrandingRequired: { type: Boolean, default: false },
    brandingType: { type: String }, // Digital Print, Screen Print, etc.
    brandingPositions: { type: mongoose.Schema.Types.Mixed }, // Can be Number (1,2,3) or String ("Custom")
    customBrandingPositions: { type: String }, // Details if "Custom"
    brandingSize: { type: String }, // 1-3, 3-5, 5-10 inches or "Custom"
    customBrandingSize: { type: String }, // Details if "Custom"
    brandingLogo: { type: String } // Cloudinary URL
  },
  shippingDetails: {
    deliveryType: { type: String, enum: ['Single Location'], default: 'Single Location' },
  },
  selectedProducts: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, default: 1 },
    actualPrice: { type: Number, required: true },
    discountedPrice: { type: Number, required: true },
    // Per-product customization
    brandingType: { type: String }, // Digital Print, Screen Print, etc.
    brandingPositions: { type: mongoose.Schema.Types.Mixed }, // Can be Number (1,2,3) or String ("Custom")
    customBrandingPositions: { type: String }, // Details if "Custom"
    brandingSize: { type: String }, // 1-3, 3-5, 5-10 inches or "Custom"
    customBrandingSize: { type: String } // Details if "Custom"
  }],
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Shipped', 'Delivered'],
    default: 'Approved'
  },
  orderId: {
    type: String,
    unique: true,
    sparse: true
  }
}, { timestamps: true });

// Pre-save middleware to generate a unique 10-character alphanumeric Order ID
requestSchema.pre('save', async function () {
  if (!this.isNew || this.orderId) {
    return;
  }

  // Fetch the company to get its name for the prefix
  const company = await mongoose.models.Company.findById(this.companyId).select('name');
  let prefix = 'ORDER'; // Fallback

  if (company && company.name) {
    // Remove spaces and special characters, convert to uppercase, take first 6 chars
    prefix = company.name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().substring(0, 6);
  }

  if (prefix.length === 0) {
    prefix = 'ORD';
  }

  const randomLength = 10 - prefix.length;
  let isUnique = false;
  let newOrderId = '';

  while (!isUnique) {
    // Generate remaining random alphanumeric characters
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let randomPart = '';
    for (let i = 0; i < randomLength; i++) {
      randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    newOrderId = prefix + randomPart;

    // Check if generated orderId already exists
    const existingRequest = await mongoose.models.Request.findOne({ orderId: newOrderId });
    if (!existingRequest) {
      isUnique = true;
    }
  }

  this.orderId = newOrderId;
});

export default mongoose.model('Request', requestSchema);