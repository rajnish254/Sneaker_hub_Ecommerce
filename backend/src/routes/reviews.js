/**
 * REVIEWS ROUTES
 * Product reviews and ratings management
 */

const express = require('express');
const mongoose = require('mongoose');
const Review = require('../models/Review');
const auth = require('../middleware/auth');
const inMemory = require('../utils/inMemoryStorage');

const router = express.Router();

// Helper to check if string is a valid MongoDB ObjectId
function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === id;
}



// Helper function to check MongoDB connection
function isMongoDBConnected() {
  return mongoose.connection.readyState === 1; // 1 = connected
}

// ============== CREATE REVIEW ==============
router.post('/', auth, async (req, res) => {
  try {
    const { productId, rating, title, comment } = req.body;
    const mongoConnected = isMongoDBConnected();

    // Validation
    if (!productId || !rating || !title || !comment) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    if (title.length < 5 || title.length > 100) {
      return res.status(400).json({ error: 'Title must be between 5 and 100 characters' });
    }

    if (comment.length < 10 || comment.length > 1000) {
      return res.status(400).json({ error: 'Comment must be between 10 and 1000 characters' });
    }

    // Check if user already reviewed this product
    let existingReview = null;
    
    if (mongoConnected) {
      // Try MongoDB first for all product types (mock or real)
      try {
        existingReview = await Review.findOne({ 
          productId, 
          userId: req.user.userId 
        });
      } catch (err) {
        // MongoDB query failed, try in-memory
        existingReview = await inMemory.findReviewByUserAndProduct(req.user.userId, productId);
      }
    } else {
      // MongoDB not connected, use in-memory fallback
      existingReview = await inMemory.findReviewByUserAndProduct(req.user.userId, productId);
    }

    if (existingReview) {
      return res.status(400).json({ error: 'You have already reviewed this product' });
    }

    // Create review - ALWAYS try MongoDB first for ALL product types (mock or real)
    let review;
    
    if (mongoConnected) {
      // Try MongoDB first regardless of productId type (mock or real)
      try {
        console.log(`📝 Attempting to save review to MongoDB for product: ${productId}`);
        review = new Review({
          productId,
          userId: req.user.userId,
          userName: req.user.userName || 'Anonymous',
          rating,
          title,
          comment
        });
        await review.save();
        console.log(`✅ Review saved to MongoDB successfully: { productId: "${productId}", userId: ${req.user.userId}, rating: ${rating} }`);
      } catch (mongoErr) {
        console.warn(`⚠️  MongoDB save failed, using in-memory fallback: ${mongoErr.message}`);
        review = await inMemory.createReview({
          productId,
          userId: req.user.userId,
          userName: req.user.userName || 'Anonymous',
          rating,
          title,
          comment
        });
      }
    } else {
      // MongoDB not connected, use in-memory fallback
      console.log(`⚠️  MongoDB not connected for review, using in-memory storage for product ${productId}`);
      review = await inMemory.createReview({
        productId,
        userId: req.user.userId,
        userName: req.user.userName || 'Anonymous',
        rating,
        title,
        comment
      });
    }

    res.status(201).json({
      message: 'Review created successfully',
      review
    });
  } catch (err) {
    console.error('Create review error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ============== GET REVIEWS FOR PRODUCT ==============
router.get('/product/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const { sort = '-createdAt', limit = 10, skip = 0 } = req.query;
    const mongoConnected = isMongoDBConnected();

    let reviews;
    // Always try MongoDB first for ALL product types (mock or real)
    if (mongoConnected) {
      try {
        // Query MongoDB regardless of productId format
        reviews = await Review.find({ productId })
          .sort(sort)
          .limit(Number(limit))
          .skip(Number(skip));
      } catch (mongoErr) {
        console.warn(`⚠️  MongoDB query failed for product reviews, using in-memory: ${mongoErr.message}`);
        reviews = await inMemory.getReviewsByProduct(productId);
      }
    } else {
      // MongoDB not connected - use in-memory fallback for all products
      reviews = await inMemory.getReviewsByProduct(productId);
    }

    // Calculate average rating
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : 0;

    // Count by rating
    const ratingCounts = {
      5: reviews.filter(r => r.rating === 5).length,
      4: reviews.filter(r => r.rating === 4).length,
      3: reviews.filter(r => r.rating === 3).length,
      2: reviews.filter(r => r.rating === 2).length,
      1: reviews.filter(r => r.rating === 1).length
    };

    res.json({
      reviews,
      totalReviews: reviews.length,
      avgRating: Number(avgRating),
      ratingCounts
    });
  } catch (err) {
    console.error('Get reviews error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ============== DELETE REVIEW ==============
router.delete('/:reviewId', auth, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const mongoConnected = isMongoDBConnected();

    let review;
    if (mongoConnected) {
      review = await Review.findById(reviewId);
    } else {
      review = await inMemory.findReviewById(reviewId);
    }

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    // Check if user owns this review
    if (review.userId.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (mongoConnected) {
      await Review.findByIdAndDelete(reviewId);
    } else {
      await inMemory.deleteReview(reviewId);
    }

    res.json({ message: 'Review deleted successfully' });
  } catch (err) {
    console.error('Delete review error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ============== UPDATE REVIEW ==============
router.put('/:reviewId', auth, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, title, comment } = req.body;
    const mongoConnected = isMongoDBConnected();

    // Validation
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    let review;
    if (mongoConnected) {
      review = await Review.findById(reviewId);
    } else {
      review = await inMemory.findReviewById(reviewId);
    }

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    // Check if user owns this review
    if (review.userId.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Update fields
    if (rating) review.rating = rating;
    if (title) review.title = title;
    if (comment) review.comment = comment;
    review.updatedAt = new Date();

    if (mongoConnected) {
      await review.save();
    } else {
      await inMemory.updateReview(reviewId, review);
    }

    res.json({
      message: 'Review updated successfully',
      review
    });
  } catch (err) {
    console.error('Update review error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
