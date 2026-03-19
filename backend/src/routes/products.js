/**
 * PRODUCTS ROUTES
 */

const express = require('express');
const mongoose = require('mongoose');
const Product = require('../models/Product');
const { MOCK_PRODUCTS } = require('../utils/mockProducts');

const router = express.Router();

// Helper to check if string is a valid MongoDB ObjectId
function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === id;
}

// Helper function to check MongoDB connection
function isMongoDBConnected() {
  return mongoose.connection.readyState === 1; // 1 = connected
}

// ============== GET ALL PRODUCTS ==============
router.get('/', async (req, res) => {
  try {
    const { category, gender, minPrice, maxPrice, search } = req.query;
    const mongoConnected = isMongoDBConnected();

    let filter = {};

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (gender && gender !== 'All') {
      filter.gender = gender;
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } }
      ];
    }

    // Try MongoDB first if connected
    if (mongoConnected) {
      try {
        const products = await Product.find(filter).limit(50);
        console.log(`✅ Retrieved ${products.length} products from MongoDB`);
        return res.json(products);
      } catch (dbErr) {
        console.error('⚠️  MongoDB query failed:', dbErr.message);
        // Fall through to mock data
      }
    } else {
      console.log('⚠️  MongoDB not connected, using mock products');
    }

    // Use mock data when MongoDB unavailable
    let products = MOCK_PRODUCTS;

    // Apply filters to mock data
    if (filter.category) {
      products = products.filter(p => p.category === filter.category);
    }
    if (filter.gender) {
      products = products.filter(p => p.gender === filter.gender);
    }
    if (filter.price) {
      products = products.filter(p => {
        if (filter.price.$gte && p.price < filter.price.$gte) return false;
        if (filter.price.$lte && p.price > filter.price.$lte) return false;
        return true;
      });
    }
    if (search) {
      const searchLower = search.toLowerCase();
      products = products.filter(p => 
        p.name.toLowerCase().includes(searchLower) || 
        p.brand.toLowerCase().includes(searchLower)
      );
    }

    return res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============== GET SINGLE PRODUCT ==============
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const mongoConnected = isMongoDBConnected();

    // Check if it's a valid MongoDB ObjectId
    if (!isValidObjectId(id)) {
      // Fallback to mock data for non-ObjectId products (like "n1", "n2", "a5", etc.)
      console.log(`🔍 Searching mock products for ID: ${id}`);
      const product = MOCK_PRODUCTS.find(p => p._id === id);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      return res.json(product);
    }

    // Valid ObjectId - try MongoDB if connected
    if (mongoConnected) {
      try {
        const product = await Product.findById(id);
        if (product) {
          console.log(`✅ Found product in MongoDB: ${product.name}`);
          return res.json(product);
        }
      } catch (dbErr) {
        console.warn('⚠️  MongoDB query failed for product:', id);
      }
    } else {
      console.log('⚠️  MongoDB not connected, checking mock products');
    }

    // Fallback to mock data for valid ObjectIds without MongoDB results
    const product = MOCK_PRODUCTS.find(p => p._id === id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    console.log(`📦 Found product in mock data: ${product.name}`);
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============== ADD REVIEW ==============
router.post('/:id/review', async (req, res) => {
  try {
    const { rating, comment, userId } = req.body;

    try {
      const product = await Product.findById(req.params.id).timeout(5000);
      if (product) {
        product.reviews.push({
          userId,
          rating,
          comment
        });

        // Recalculate average rating
        const avgRating = product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length;
        product.rating = avgRating;

        await product.save();
        return res.json(product);
      }
    } catch (dbErr) {
      console.log('⚠️  Using mock product (MongoDB unavailable)');
    }

    // Fallback to mock data
    const product = MOCK_PRODUCTS.find(p => p._id === req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    product.reviews.push({
      userId,
      rating,
      comment
    });

    const avgRating = product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length;
    product.rating = avgRating;

    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
