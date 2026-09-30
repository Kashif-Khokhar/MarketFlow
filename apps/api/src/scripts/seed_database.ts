import mongoose from 'mongoose';
import dotenv from 'dotenv';
import slugify from 'slugify';
import bcrypt from 'bcrypt';
import path from 'path';

import { User, UserRole } from '../models/User';
import { Store, StoreStatus } from '../models/Store';
import { Category } from '../models/Category';
import { Product } from '../models/Product';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://root:password@localhost:27017/marketflow?authSource=admin';

const categoriesData = [
  { name: 'Electronics', description: 'Gadgets, smartphones, and computers' },
  { name: 'Fashion', description: 'Clothing, shoes, and accessories' },
  { name: 'Home & Living', description: 'Furniture, decor, and home essentials' },
  { name: 'Beauty', description: 'Cosmetics, skincare, and fragrance' },
  { name: 'Sports', description: 'Sporting goods and outdoor gear' },
  { name: 'Toys & Games', description: 'Toys, puzzles, and video games' },
  { name: 'Groceries', description: 'Food, beverages, and pantry items' }
];

const storesData = [
  { name: 'TechStore', description: 'Premium tech products', rating: 4.8, totalReviews: 12400 },
  { name: 'FashionHub', description: 'Latest trends in fashion', rating: 4.7, totalReviews: 8000 },
  { name: 'HomeEssentials', description: 'Everything for your home', rating: 4.6, totalReviews: 5300 },
  { name: 'BeautyWorld', description: 'Top beauty products', rating: 4.8, totalReviews: 5700 },
  { name: 'SportsZone', description: 'Your sporting needs', rating: 4.5, totalReviews: 4200 }
];

const productTemplates = [
  { name: 'Premium Wireless Headphones', cat: 'Electronics', price: 299.99, img: 'https://picsum.photos/seed/headphones/800/800' },
  { name: 'Smartphone Pro Max', cat: 'Electronics', price: 1099.00, img: 'https://picsum.photos/seed/phone/800/800' },
  { name: 'Designer Cotton T-Shirt', cat: 'Fashion', price: 45.00, img: 'https://picsum.photos/seed/tshirt/800/800' },
  { name: 'Leather Crossbody Bag', cat: 'Fashion', price: 120.00, img: 'https://picsum.photos/seed/bag/800/800' },
  { name: 'Modern Velvet Sofa', cat: 'Home & Living', price: 850.00, img: 'https://picsum.photos/seed/sofa/800/800' },
  { name: 'Ceramic Table Lamp', cat: 'Home & Living', price: 65.00, img: 'https://picsum.photos/seed/lamp/800/800' },
  { name: 'Vitamin C Face Serum', cat: 'Beauty', price: 35.00, img: 'https://picsum.photos/seed/serum2/800/800' },
  { name: 'Hydrating Night Cream', cat: 'Beauty', price: 48.00, img: 'https://picsum.photos/seed/cream/800/800' },
  { name: 'Yoga Mat with Alignment Lines', cat: 'Sports', price: 42.00, img: 'https://picsum.photos/seed/yogamat/800/800' },
  { name: 'Adjustable Dumbbell Set', cat: 'Sports', price: 150.00, img: 'https://picsum.photos/seed/dumbbells/800/800' },
  { name: 'Educational Building Blocks', cat: 'Toys & Games', price: 30.00, img: 'https://picsum.photos/seed/blocks/800/800' },
  { name: 'Board Game Collection', cat: 'Toys & Games', price: 45.00, img: 'https://picsum.photos/seed/boardgame/800/800' },
  { name: 'Organic Almond Milk', cat: 'Groceries', price: 5.99, img: 'https://picsum.photos/seed/almondmilk/800/800' },
  { name: 'Artisan Coffee Beans', cat: 'Groceries', price: 18.50, img: 'https://picsum.photos/seed/coffeebeans/800/800' },
  { name: 'Smart Watch Series X', cat: 'Electronics', price: 349.00, img: 'https://picsum.photos/seed/watch/800/800' },
  { name: 'Running Shoes Pro', cat: 'Fashion', price: 130.00, img: 'https://picsum.photos/seed/shoes/800/800' },
  { name: 'Noise Cancelling Earbuds', cat: 'Electronics', price: 159.00, img: 'https://picsum.photos/seed/earbuds/800/800' },
  { name: 'Minimalist Desk Organizer', cat: 'Home & Living', price: 28.00, img: 'https://picsum.photos/seed/organizer/800/800' },
  { name: 'Organic Matcha Powder', cat: 'Groceries', price: 24.00, img: 'https://picsum.photos/seed/matcha2/800/800' },
];

async function seed() {
  try {
    console.log('Connecting to MongoDB...', MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB. Wiping existing data...');

    // Clear existing data
    await User.deleteMany({});
    await Store.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});

    console.log('Inserting Categories...');
    const createdCategories = await Category.insertMany(
      categoriesData.map(c => ({
        ...c,
        slug: slugify(c.name, { lower: true, strict: true })
      }))
    );

    const categoryMap = createdCategories.reduce((acc, cat) => {
      acc[cat.name] = cat._id;
      return acc;
    }, {} as Record<string, any>);

    console.log('Inserting Sellers and Stores...');
    const createdStores = [];
    for (let i = 0; i < storesData.length; i++) {
      const storeData = storesData[i];
      // Create user for the store
      const user = await User.create({
        name: `Seller ${i+1}`,
        email: `seller${i+1}@example.com`,
        password: await bcrypt.hash('password123', 10),
        role: UserRole.SELLER,
        isEmailVerified: true
      });

      // Create the store
      const store = await Store.create({
        owner: user._id,
        name: storeData.name,
        description: storeData.description,
        status: StoreStatus.ACTIVE,
        rating: storeData.rating,
        totalReviews: storeData.totalReviews,
        logoUrl: `https://picsum.photos/seed/store${i}/200/200`
      });

      createdStores.push(store);
    }

    console.log('Inserting Products...');
    for (let i = 0; i < productTemplates.length; i++) {
      const template = productTemplates[i];
      // Assign to a random store
      const randomStore = createdStores[Math.floor(Math.random() * createdStores.length)];
      
      await Product.create({
        store: randomStore._id,
        category: categoryMap[template.cat],
        name: template.name,
        slug: slugify(template.name, { lower: true, strict: true }),
        description: `This is a high-quality ${template.name}. Perfect for your natural lifestyle.`,
        basePrice: template.price,
        images: [template.img],
        status: 'ACTIVE',
        rating: 4.5 + Math.random() * 0.5,
        totalReviews: Math.floor(Math.random() * 200) + 10
      });
    }

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding database:', err);
    process.exit(1);
  }
}

seed();
