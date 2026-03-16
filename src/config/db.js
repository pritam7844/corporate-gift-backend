import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Cache the database connection in serverless environments.
 * In Vercel, the same container may be reused across multiple requests.
 */
let isConnected = false;

const connectDB = async () => {
    if (isConnected) {
        console.log('Using existing MongoDB connection');
        return;
    }

    if (!process.env.MONGO_URI) {
        throw new Error('MONGO_URI is not defined in environment variables.');
    }

    try {
        mongoose.set('strictQuery', false); // Recommended for Mongoose 7+
        
        const conn = await mongoose.connect(process.env.MONGO_URI);
        
        isConnected = !!conn.connections[0].readyState;
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`MongoDB Connection Error: ${error.message}`);
        // We throw so the middleware can catch it and respond to the client
        throw error;
    }
}

export default connectDB;