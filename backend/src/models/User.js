/**
 * USER MODEL
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  firstName: {
    type: String,
    trim: true
  },
  lastName: {
    type: String,
    trim: true
  },
  phone: String,
  address: String,
  city: String,
  pincode: String,
  isAdmin: {
    type: Boolean,
    default: false
  },
  // Google OAuth fields
  isGoogleUser: {
    type: Boolean,
    default: false
  },
  googleId: String,
  profilePicture: String,
  // OTP fields for email verification
  emailVerified: {
    type: Boolean,
    default: false
  },
  otp: String,
  otpExpiry: Date,
  // Password reset fields
  resetToken: String,
  resetTokenExpiry: Date,
  // Cart data
  cart: [{
    id: String,
    name: String,
    price: Number,
    quantity: Number,
    size: Number,
    color: String,
    image: String
  }],
  // Wishlist data
  wishlist: [{
    id: String,
    name: String,
    brand: String,
    price: Number,
    originalPrice: Number,
    image: String,
    rating: Number,
    reviews: Number,
    stock: Number
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (err) {
    throw err;
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(plainPassword) {
  return await bcrypt.compare(plainPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
