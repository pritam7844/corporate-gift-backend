import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';

const connectDB = async () => {
    if (!process.env.MONGO_URI) {
        console.error('Error: MONGO_URI is not defined in environment variables.');
        return;
    }

    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`MongoDB Connection Error: ${error.message}`);
        // In serverless, we don't necessarily want process.exit(1) 
        // as it might be a temporary network hiccup.
        throw error;
    }
}
export default connectDB;