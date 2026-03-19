/**
 * SEED SCRIPT - Migrate products from mockShoes.ts to MongoDB
 * Run with: npm run seed
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');

// Mock products from frontend
const PRODUCTS = [
  { name: 'Nike Air Max 90', brand: 'Nike', price: 8999, originalPrice: 12999, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500', description: 'Iconic Air Max with maximum comfort and style', category: 'Running', gender: 'Men', colors: ['Black', 'White', 'Red'], sizes: [6, 7, 8, 9, 10, 11, 12], stock: 50, rating: 4.5 },
  { name: 'Nike Air Max 270', brand: 'Nike', price: 9999, originalPrice: 13999, image: 'https://images.unsplash.com/photo-1551028719-00167b16ebc5?w=500', description: 'Lightweight with superior comfort', category: 'Lifestyle', gender: 'Women', colors: ['Black', 'White', 'Pink'], sizes: [5, 6, 7, 8, 9, 10], stock: 35, rating: 4.6 },
  { name: 'Nike Air Force 1', brand: 'Nike', price: 7499, originalPrice: 10999, image: 'https://images.unsplash.com/photo-1549298881-ffd1d99da907?w=500', description: 'Timeless classic sneaker', category: 'Casual', gender: 'Unisex', colors: ['White', 'Black', 'Red'], sizes: [6, 7, 8, 9, 10, 11, 12, 13], stock: 100, rating: 4.7 },
  { name: 'Nike ZoomX Invincible', brand: 'Nike', price: 13999, originalPrice: 19999, image: 'https://images.unsplash.com/photo-1507371341519-bbf12e43c64d?w=500', description: 'Ultimate cushioning for running', category: 'Running', gender: 'Men', colors: ['Black', 'White', 'Blue'], sizes: [7, 8, 9, 10, 11, 12], stock: 30, rating: 4.8 },
  { name: 'Nike React Infinity', brand: 'Nike', price: 12499, originalPrice: 17999, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500', description: 'Responsive cushioning technology', category: 'Running', gender: 'Women', colors: ['Pink', 'Purple', 'Blue'], sizes: [5, 6, 7, 8, 9, 10], stock: 25, rating: 4.5 },
  { name: 'Adidas Ultraboost 22', brand: 'Adidas', price: 11499, originalPrice: 15999, image: 'https://images.unsplash.com/photo-1597045566677-eae62b342017?w=500', description: 'Premium comfort with Boost', category: 'Running', gender: 'Unisex', colors: ['Black', 'White', 'Blue'], sizes: [5, 6, 7, 8, 9, 10, 11], stock: 40, rating: 4.8 },
  { name: 'Adidas Stan Smith', brand: 'Adidas', price: 5999, originalPrice: 8999, image: 'https://images.unsplash.com/photo-1552346154-16632713458b?w=500', description: 'Iconic classic sneaker', category: 'Casual', gender: 'Unisex', colors: ['White', 'Green', 'Blue'], sizes: [6, 7, 8, 9, 10, 11, 12], stock: 60, rating: 4.4 },
  { name: 'Adidas NMD R1', brand: 'Adidas', price: 8999, originalPrice: 12999, image: 'https://images.unsplash.com/photo-1606611013016-969c19a27081?w=500', description: 'Modern comfort with sleek design', category: 'Lifestyle', gender: 'Men', colors: ['Black', 'White', 'Grey'], sizes: [6, 7, 8, 9, 10, 11], stock: 35, rating: 4.3 },
  { name: 'Adidas Superstar', brand: 'Adidas', price: 6999, originalPrice: 10999, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500', description: 'Legendary shell-toe sneaker', category: 'Casual', gender: 'Unisex', colors: ['White', 'Black', 'Gold'], sizes: [5, 6, 7, 8, 9, 10, 11, 12], stock: 55, rating: 4.6 },
  { name: 'Adidas EQT Support', brand: 'Adidas', price: 9499, originalPrice: 13999, image: 'https://images.unsplash.com/photo-1556906781-9a412961b049?w=500', description: 'Equipment line with premium', category: 'Running', gender: 'Women', colors: ['Purple', 'Pink', 'Black'], sizes: [5, 6, 7, 8, 9, 10], stock: 30, rating: 4.5 },
  { name: 'Jordan 1 Retro High OG', brand: 'Jordan', price: 15999, originalPrice: 20000, image: 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=500', description: 'Classic basketball shoe', category: 'Basketball', gender: 'Men', colors: ['Black', 'Red', 'White'], sizes: [7, 8, 9, 10, 11, 12, 13], stock: 20, rating: 4.9 },
  { name: 'Jordan Air Jordan 11', brand: 'Jordan', price: 18999, originalPrice: 24999, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500', description: 'Premium basketball performance', category: 'Basketball', gender: 'Men', colors: ['Purple', 'Black', 'White'], sizes: [8, 9, 10, 11, 12, 13, 14], stock: 15, rating: 4.8 },
  { name: 'New Balance 990v6', brand: 'New Balance', price: 10999, originalPrice: 14999, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500', description: 'American classic with premium', category: 'Running', gender: 'Men', colors: ['Black', 'Grey', 'White'], sizes: [7, 8, 9, 10, 11, 12], stock: 25, rating: 4.6 },
  { name: 'New Balance 574', brand: 'New Balance', price: 7999, originalPrice: 11999, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500', description: 'Retro running aesthetic', category: 'Lifestyle', gender: 'Women', colors: ['Pink', 'Blue', 'White'], sizes: [5, 6, 7, 8, 9, 10], stock: 40, rating: 4.4 },
  { name: 'Puma RS-X Sneaker', brand: 'Puma', price: 7499, originalPrice: 11499, image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500', description: 'Retro style meets modern comfort', category: 'Casual', gender: 'Unisex', colors: ['White', 'Black', 'Pink', 'Blue'], sizes: [5, 6, 7, 8, 9, 10, 11], stock: 45, rating: 4.3 },
  { name: 'Puma Suede Classic', brand: 'Puma', price: 5499, originalPrice: 8499, image: 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=500', description: 'Iconic suede construction', category: 'Casual', gender: 'Unisex', colors: ['White', 'Black', 'Red'], sizes: [6, 7, 8, 9, 10, 11, 12], stock: 50, rating: 4.5 },
  { name: 'Converse Chuck Taylor', brand: 'Converse', price: 3999, originalPrice: 5999, image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500', description: 'Timeless classic canvas sneaker', category: 'Casual', gender: 'Unisex', colors: ['White', 'Black', 'Red', 'Blue'], sizes: [5, 6, 7, 8, 9, 10, 11, 12], stock: 100, rating: 4.2 },
  { name: 'Asics Gel-Lyte III', brand: 'Asics', price: 8999, originalPrice: 12999, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500', description: 'Split tongue design with comfort', category: 'Running', gender: 'Men', colors: ['Black', 'White', 'Red'], sizes: [6, 7, 8, 9, 10, 11], stock: 28, rating: 4.4 },
  { name: 'Asics Gel Kayano', brand: 'Asics', price: 10499, originalPrice: 14999, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500', description: 'Maximum support for running', category: 'Running', gender: 'Women', colors: ['Pink', 'Blue', 'Purple'], sizes: [5, 6, 7, 8, 9, 10], stock: 32, rating: 4.7 },
];

async function seedProducts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    await Product.deleteMany({});
    console.log('🗑️  Cleared existing products');

    const result = await Product.insertMany(PRODUCTS);
    console.log(`✅ Seeded ${result.length} products`);

    await mongoose.connection.close();
    console.log('✅ Connection closed');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
}

seedProducts();
