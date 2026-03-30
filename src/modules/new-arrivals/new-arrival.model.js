import mongoose from 'mongoose';

const newArrivalSchema = new mongoose.Schema({
  productName: { type: String, required: true },
  description: { type: String, default: '' },
  images: [{ type: String }],
  isComingSoon: { type: Boolean, default: true },
  comingSoonDate: { type: Date }
}, { timestamps: true });

export default mongoose.model('NewArrival', newArrivalSchema);
