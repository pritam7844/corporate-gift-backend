// run the code type in terminal => node src/seed-admin.js

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './modules/users/user.model.js';
import dns from 'dns';

// Load environment variables
dns.setServers(['8.8.8.8']);
dotenv.config();

const seedAdmin = async () => {
    try {
        // 1. Connect to the database
        await mongoose.connect(process.env.MONGO_URI);
        console.log('🔗 Connected to Database for Admin Seeding...');

        // 3. Seed Admin
        const adminEmail = 'admin@gmail.com';
        const plainPassword = '123456';

        // Check if admin already exists with that email and delete if so
        const existingAdmin = await User.findOne({ email: adminEmail });
        if (existingAdmin) {
            await User.deleteOne({ email: adminEmail });
            console.log('🗑️ Existing admin user deleted.');
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(plainPassword, salt);

        const adminUser = await User.create({
            name: 'System Admin',
            email: adminEmail,
            password: hashedPassword,
            role: 'admin',
            companyId: null
        });
        console.log('👑 Admin user seeded successfully! (admin@gmail.com / 123456)');

        // Disconnect and exit successfully
        mongoose.connection.close();
        console.log('✅ Admin Seeding Complete!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding admin:', error);
        mongoose.connection.close();
        process.exit(1);
    }
};

seedAdmin();
