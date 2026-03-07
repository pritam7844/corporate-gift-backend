import mongoose from 'mongoose';

const supportSchema = new mongoose.Schema({
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company'
        // optional since unauthenticated users might not have a company 
        // But since they land on a subdomain, we should pass the companyId.
    },
    name: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true },
    status: {
        type: String,
        enum: ['Open', 'In Progress', 'Resolved'],
        default: 'Open'
    }
}, { timestamps: true });

export default mongoose.model('Support', supportSchema);
