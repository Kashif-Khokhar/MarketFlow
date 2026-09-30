import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import path from 'path';

import { User, UserRole } from '../models/User';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://root:password@localhost:27017/marketflow?authSource=admin';

const createAccounts = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const accounts = [
      {
        name: 'John Customer',
        email: 'customer@marketflow.com',
        password: 'password123',
        role: UserRole.CUSTOMER,
        isEmailVerified: true,
        isActive: true,
      },
      {
        name: 'Sarah Seller',
        email: 'seller@marketflow.com',
        password: 'password123',
        role: UserRole.SELLER,
        isEmailVerified: true,
        isActive: true,
      },
      {
        name: 'Admin Boss',
        email: 'admin@marketflow.com',
        password: 'password123',
        role: UserRole.ADMIN,
        isEmailVerified: true,
        isActive: true,
      }
    ];

    for (const acc of accounts) {
      const existing = await User.findOne({ email: acc.email });
      if (existing) {
        console.log(`Account ${acc.email} already exists. Updating password...`);
        existing.password = 'password123';
        await existing.save();
      } else {
        await User.create(acc);
        console.log(`Created account: ${acc.email}`);
      }
    }

    console.log('Account creation complete.');
    process.exit(0);
  } catch (error) {
    console.error('Error creating accounts:', error);
    process.exit(1);
  }
};

createAccounts();
