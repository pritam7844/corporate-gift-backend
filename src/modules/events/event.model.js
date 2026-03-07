import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., "Diwali 2026" or "CEO Birthday"
  
  // ADDED: Flag to determine if this is a master template or a private company event
  isGlobal: { type: Boolean, default: false }, 
  
  companyId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Company', 
    // MODIFIED: It is only required if it is NOT a global event
    required: function() { return !this.isGlobal; } 
  },
  
  // The Admin searches the global/private product library and adds IDs here
  products: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product' 
  }],
  startDate: { type: Date },
  endDate: { type: Date },
  status: { 
    type: String, 
    enum: ['active', 'closed'], 
    default: 'active' 
  }
}, { timestamps: true });

export default mongoose.model('Event', eventSchema);