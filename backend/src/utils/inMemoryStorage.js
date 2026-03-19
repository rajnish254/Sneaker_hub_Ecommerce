/**
 * IN-MEMORY USER STORAGE - Development/Testing Fallback
 * Used when MongoDB is unavailable
 */

const bcrypt = require('bcryptjs');

let users = [];
let reviews = [];
let orders = [];
let userIdCounter = 1;
let reviewIdCounter = 1;

class InMemoryUser {
  constructor(email, password, firstName, lastName) {
    this._id = String(userIdCounter++);
    this.email = email.toLowerCase();
    this.password = password; // Will be hashed
    this.firstName = firstName;
    this.lastName = lastName;
    this.createdAt = new Date();
  }

  async hashPassword() {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }

  async comparePassword(plainPassword) {
    return await bcrypt.compare(plainPassword, this.password);
  }
}

module.exports = {
  // Find user by email
  findUserByEmail: async (email) => {
    return users.find(u => u.email === email.toLowerCase());
  },

  // Create new user
  createUser: async (email, password, firstName, lastName) => {
    const user = new InMemoryUser(email, password, firstName, lastName);
    await user.hashPassword();
    users.push(user);
    return user;
  },

  // Find user by ID
  findUserById: async (id) => {
    return users.find(u => u._id === id);
  },

  // Update user
  updateUser: async (id, updates) => {
    const user = users.find(u => u._id === id);
    if (!user) return null;
    
    if (updates.password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(updates.password, salt);
    }
    
    Object.assign(user, updates);
    return user;
  },

  // Get all users (for debugging)
  getAllUsers: () => users,

  // Reset storage (for testing)
  reset: () => {
    users = [];
    reviews = [];
    orders = [];
    userIdCounter = 1;
    reviewIdCounter = 1;
  },

  // ============== ORDER FUNCTIONS ==============
  createOrder: async (data) => {
    const order = {
      _id: 'order_' + Date.now(),
      userId: data.userId,
      items: data.items || [],
      shippingAddress: data.shippingAddress || {},
      totalAmount: data.totalAmount || 0,
      paymentMethod: data.paymentMethod || 'unknown',
      paymentId: data.paymentId || null,
      status: data.status || 'confirmed',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    orders.push(order);
    console.log(`💾 Order saved to in-memory: ${order._id}`);
    return order;
  },

  getUserOrders: async (userId) => {
    const userOrders = orders.filter(o => o.userId === userId);
    console.log(`📋 Retrieved ${userOrders.length} orders for user ${userId}`);
    return userOrders;
  },

  getOrderById: async (orderId) => {
    return orders.find(o => o._id === orderId);
  },

  getAllOrders: () => orders,

  // ============== REVIEW FUNCTIONS ==============
  createReview: async (data) => {
    const review = {
      _id: String(reviewIdCounter++),
      productId: data.productId,
      userId: data.userId,
      userName: data.userName || 'Anonymous',
      rating: data.rating,
      title: data.title,
      comment: data.comment,
      helpful: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    reviews.push(review);
    return review;
  },

  getReviewsByProduct: async (productId) => {
    return reviews.filter(r => r.productId === productId);
  },

  findReviewById: async (reviewId) => {
    return reviews.find(r => r._id === reviewId);
  },

  findReviewByUserAndProduct: async (userId, productId) => {
    return reviews.find(r => r.userId === userId && r.productId === productId);
  },

  deleteReview: async (reviewId) => {
    const index = reviews.findIndex(r => r._id === reviewId);
    if (index > -1) {
      reviews.splice(index, 1);
      return true;
    }
    return false;
  },

  updateReview: async (reviewId, updates) => {
    const review = reviews.find(r => r._id === reviewId);
    if (!review) return null;
    Object.assign(review, updates, { updatedAt: new Date() });
    return review;
  }
};
