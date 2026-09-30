import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';
import { User, UserRole } from '../models/User';
import readline from 'readline';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query: string): Promise<string> => {
  return new Promise(resolve => rl.question(query, resolve));
};

async function createOrPromoteAdmin() {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.error('MONGODB_URI is not defined in .env');
      process.exit(1);
    }

    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    const email = await question('Enter the email address for the admin: ');

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      existingUser.role = UserRole.ADMIN;
      await existingUser.save();
      console.log(`\nSuccess! Existing user ${email} has been promoted to ADMIN.`);
    } else {
      const name = await question('User does not exist. Enter name: ');
      const password = await question('Enter password (min 8 characters): ');

      if (password.length < 8) {
        console.error('Password must be at least 8 characters long.');
        process.exit(1);
      }

      await User.create({
        name,
        email,
        password,
        role: UserRole.ADMIN,
        isEmailVerified: true,
      });
      console.log(`\nSuccess! New admin user ${email} has been created.`);
    }
  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    await mongoose.disconnect();
    rl.close();
    process.exit(0);
  }
}

createOrPromoteAdmin();
