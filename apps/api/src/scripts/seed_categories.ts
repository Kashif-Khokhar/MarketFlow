import mongoose from 'mongoose';
import dotenv from 'dotenv';
import slugify from 'slugify';
import { Category } from '../models/Category';

// Load the api .env file explicitly
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const categories = [
  { name: 'Electronics', description: 'Gadgets and devices' },
  { name: 'Clothing', description: 'Apparel for all ages' },
  { name: 'Home & Garden', description: 'Furniture and decor' },
  { name: 'Sports', description: 'Sporting goods and equipment' },
  { name: 'Books', description: 'Literature and educational material' },
  { name: 'Toys', description: 'Toys and games for kids' }
];

async function seed() {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://root:password@localhost:27017/marketflow?authSource=admin';
    console.log('Connecting to MongoDB...', uri);
    await mongoose.connect(uri);
    console.log('Connected to MongoDB.');

    for (const cat of categories) {
      const slug = slugify(cat.name, { lower: true, strict: true });
      const existing = await Category.findOne({ slug });
      if (!existing) {
        await Category.create({ ...cat, slug });
        console.log(`Created category: ${cat.name}`);
      } else {
        console.log(`Category already exists: ${cat.name}`);
      }
    }
    
    console.log('Seeding completed.');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding categories:', err);
    process.exit(1);
  }
}

seed();
