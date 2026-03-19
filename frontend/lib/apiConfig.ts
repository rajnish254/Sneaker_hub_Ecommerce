/**
 * API Configuration
 * Centralized API endpoints and base URL
 * Update baseUrl here for different environments
 */

// ============== ENVIRONMENT CONFIG ==============
export const apiConfig = {
  // Change this to switch between environments
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000',
  timeout: 30000,
  retryAttempts: 3,
};

// ============== API ENDPOINTS ==============
export const apiEndpoints = {
  // Auth Endpoints
  auth: {
    register: '/auth/register',
    login: '/auth/login',
    logout: '/auth/logout',
    profile: '/auth/profile',
    verifyOtp: '/auth/verify-otp',
    resendOtp: '/auth/resend-otp',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    googleVerify: '/auth/google/verify',
    googleCallback: '/auth/google/callback',
  },

  // Checkout & Payment Endpoints
  checkout: {
    createPaymentIntent: '/checkout/create-payment-intent',
    confirmPayment: '/checkout/confirm-payment',
  },

  // Orders Endpoints
  orders: {
    getAll: '/orders',
    getById: (orderId: string) => `/orders/${orderId}`,
    updateStatus: (orderId: string) => `/orders/${orderId}/status`,
    sendEmail: '/orders/email/promotional',
  },

  // Products Endpoints
  products: {
    getAll: '/products',
    getById: (productId: string) => `/products/${productId}`,
    search: '/products/search',
  },

  // Reviews Endpoints
  reviews: {
    getByProduct: (productId: string) => `/reviews/product/${productId}`,
    create: '/reviews',
    update: (reviewId: string) => `/reviews/${reviewId}`,
    delete: (reviewId: string) => `/reviews/${reviewId}`,
  },

  // Users Endpoints
  users: {
    getData: '/users/data',
    syncCart: '/users/sync-cart',
    syncWishlist: '/users/sync-wishlist',
    updateProfile: '/users/profile',
    getAddresses: '/users/addresses',
    addAddress: '/users/addresses',
    updateAddress: (addressId: string) => `/users/addresses/${addressId}`,
    deleteAddress: (addressId: string) => `/users/addresses/${addressId}`,
  },

  // Cart Endpoints
  cart: {
    get: '/cart',
    add: '/cart/add',
    update: '/cart/update',
    remove: '/cart/remove',
    clear: '/cart/clear',
    sync: '/cart/sync',
  },

  // Wishlist Endpoints
  wishlist: {
    get: '/wishlist',
    add: '/wishlist/add',
    remove: '/wishlist/remove',
    clear: '/wishlist/clear',
    sync: '/wishlist/sync',
  },

  // Health Check Endpoints
  health: {
    check: '/health',
    detailed: '/health/detailed',
    mongodb: '/test/mongodb',
  },
};

/**
 * Construct full API URL
 * @param endpoint - API endpoint from apiEndpoints
 * @returns Full API URL
 */
export const getApiUrl = (endpoint: string): string => {
  return `${apiConfig.baseUrl}/api${endpoint}`;
};

/**
 * Example usage:
 * 
 * import { apiEndpoints, getApiUrl } from '@/lib/apiConfig';
 * 
 * // Old way (hardcoded):
 * fetch('http://localhost:5000/api/auth/login', { ... })
 * 
 * // New way (using config):
 * fetch(getApiUrl(apiEndpoints.auth.login), { ... })
 * 
 * // Or for dynamic endpoints:
 * fetch(getApiUrl(apiEndpoints.orders.getById('123')), { ... })
 */
