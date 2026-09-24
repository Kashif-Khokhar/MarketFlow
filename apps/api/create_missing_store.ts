import mongoose from 'mongoose';
import { User } from './src/models/User';
import { Store } from './src/models/Store';
import dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://root:password@localhost:27017/marketflow?authSource=admin';

const run = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    const seller = await User.findOne({ email: 'seller@marketflow.com' });
    if (seller) {
      let store = await Store.findOne({ owner: seller._id });
      if (!store) {
        store = await Store.create({
          owner: seller._id,
          name: 'Official Seller Store',
          description: 'The best store on MarketFlow',
          rating: 5,
          totalReviews: 10
        });
        console.log('Created store for seller');
      } else {
        console.log('Store already exists');
      }
    } else {
      console.log('Seller not found');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
};
run();
