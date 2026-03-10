// run the code type in terminal => node src/seed.js

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './modules/users/user.model.js';
import Company from './modules/company/company.model.js';
import Product from './modules/products/product.model.js';
import Event from './modules/events/event.model.js';
import dns from 'dns';

// Load environment variables
dns.setServers(['8.8.8.8']);
dotenv.config();

const seedDB = async () => {
  try {
    // 1. Connect to the database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('🔗 Connected to Database for Seeding...');

    // Removed Admin Seeding logic, extracted to seed-admin.js

    // 4. Seed Companies
    const tata = await Company.create({
      name: 'Tata Consultancy Services',
      subdomain: 'tata',
      logo: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?q=80&w=200&auto=format&fit=crop',
      departments: ['IT', 'HR', 'Finance'],
      isActive: true
    });

    const apple = await Company.create({
      name: 'Apple Inc.',
      subdomain: 'apple',
      logo: 'https://images.unsplash.com/photo-1621768216002-5ac171876607?q=80&w=200&auto=format&fit=crop',
      departments: ['Engineering', 'Design', 'Marketing'],
      isActive: true
    });
    console.log('🏢 Companies seeded successfully!');

    // 5. Seed Products
    // Using realistic Unsplash images for products
    const productsArray = await Product.insertMany([
      {
        name: 'Premium Leather Work Bag',
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=800&auto=format&fit=crop',
        category: 'Accessories',
        actualPrice: 150,
        discountedPrice: 0, // Free for employee
        isGlobal: true
      },
      {
        name: 'Ergonomic Desk Chair',
        image: 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?q=80&w=800&auto=format&fit=crop',
        category: 'Furniture',
        actualPrice: 300,
        discountedPrice: 0,
        isGlobal: true
      },
      {
        name: 'Noise Cancelling Headphones',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop',
        category: 'Electronics',
        actualPrice: 200,
        discountedPrice: 0,
        isGlobal: true
      },
      {
        name: 'Smart Coffee Mug',
        image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800&auto=format&fit=crop',
        category: 'Accessories',
        actualPrice: 80,
        discountedPrice: 0,
        isGlobal: true
      }
    ]);
    console.log('🎁 Products seeded successfully!');

    // 6. Seed Events
    await Event.create({
      name: 'Diwali Celebration 2026',
      isGlobal: false,
      companyId: tata._id,
      products: [productsArray[0]._id, productsArray[3]._id], // Bag and Mug
      startDate: new Date('2026-10-01'),
      endDate: new Date('2026-11-01'),
      status: 'active'
    });

    await Event.create({
      name: 'Q3 Outstanding Performance Awards',
      isGlobal: false,
      companyId: tata._id,
      products: [productsArray[1]._id, productsArray[2]._id], // Chair and Headphones
      startDate: new Date('2026-06-01'),
      endDate: new Date('2026-12-31'),
      status: 'active'
    });

    await Event.create({
      name: 'WWDC Welcome Kit',
      isGlobal: false,
      companyId: apple._id,
      products: [productsArray[0]._id, productsArray[2]._id, productsArray[3]._id],
      startDate: new Date('2026-05-01'),
      endDate: new Date('2026-06-30'),
      status: 'active'
    });
    console.log('🎉 Events seeded successfully!');

    // 7. Seed Dummy Employees for testing the frontend later
    await User.create({
      name: 'Ratan Tata',
      email: 'ratan@tata.com',
      password: hashedPassword,
      role: 'company_user',
      companyId: tata._id
    });
    console.log('👤 Added test employee: ratan@tata.com / 123456');

    // 8. Disconnect and exit successfully
    mongoose.connection.close();
    console.log('✅ Seeding Complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    mongoose.connection.close();
    process.exit(1);
  }
};

seedDB();