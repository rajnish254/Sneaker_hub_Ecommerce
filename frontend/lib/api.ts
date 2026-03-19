/**
 * API Service - All backend API calls
 * Handles authentication, orders, products, and payment
 */

import { apiEndpoints, getApiUrl } from './apiConfig';

// Helper to get token from localStorage
const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

// Helper to set headers with auth token
const getHeaders = (includeAuth = true) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (includeAuth) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  return headers;
};

// ============== AUTH API ==============
export const authAPI = {
  // Register (Signup)
  register: async (firstName: string, lastName: string, email: string, password: string) => {
    try {
      const response = await fetch(getApiUrl(apiEndpoints.auth.register), {
        method: 'POST',
        headers: getHeaders(false),
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Registration failed');
      }

      const data = await response.json();
      
      // Store token & user info
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      
      return data;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  },

  // Login
  login: async (email: string, password: string) => {
    try {
      const response = await fetch(getApiUrl(apiEndpoints.auth.login), {
        method: 'POST',
        headers: getHeaders(false),
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Login failed');
      }

      const data = await response.json();
      
      // Store token & user info
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // Guest Login (create temporary user without storing to DB)
  guestLogin: async () => {
    try {
      const guestUser = {
        id: 'guest_' + Date.now(),
        email: 'guest@sneakhub.local',
        firstName: 'Guest',
        lastName: 'User',
        isGuest: true,
      };
      
      // Store guest user in localStorage
      localStorage.setItem('user', JSON.stringify(guestUser));
      localStorage.setItem('isGuest', 'true');
      
      return { user: guestUser };
    } catch (error) {
      console.error('Guest login error:', error);
      throw error;
    }
  },

  // Get current user profile
  getProfile: async () => {
    try {
      const response = await fetch(getApiUrl(apiEndpoints.auth.profile), {
        method: 'GET',
        headers: getHeaders(true),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const user = await response.json();
      localStorage.setItem('user', JSON.stringify(user));
      return user;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('isGuest');
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('token');
    }
    return false;
  },

  // Get stored user
  getStoredUser: () => {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    }
    return null;
  },
};

// ============== CHECKOUT API ==============
export const checkoutAPI = {
  // Create payment intent
  createPaymentIntent: async (amount: number, items: any[], shippingAddress: any) => {
    try {
      const response = await fetch(getApiUrl(apiEndpoints.checkout.createPaymentIntent), {
        method: 'POST',
        headers: getHeaders(true),
        body: JSON.stringify({
          amount,
          items,
          shippingAddress,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create payment intent');
      }

      return await response.json();
    } catch (error) {
      console.error('Create payment intent error:', error);
      throw error;
    }
  },

  // Confirm payment and create order
  confirmPayment: async (paymentIntentId: string, items: any[], shippingAddress: any, totalAmount: number) => {
    try {
      const response = await fetch(getApiUrl(apiEndpoints.checkout.confirmPayment), {
        method: 'POST',
        headers: getHeaders(true),
        body: JSON.stringify({
          paymentIntentId,
          items,
          shippingAddress,
          totalAmount,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Payment confirmation failed');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Confirm payment error:', error);
      throw error;
    }
  },
};

// ============== ORDERS API ==============
export const ordersAPI = {
  // Get user's orders
  getOrders: async () => {
    try {
      const response = await fetch(getApiUrl(apiEndpoints.orders.getAll), {
        method: 'GET',
        headers: getHeaders(true),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      return await response.json();
    } catch (error) {
      console.error('Get orders error:', error);
      throw error;
    }
  },

  // Get single order
  getOrder: async (orderId: string) => {
    try {
      const response = await fetch(getApiUrl(apiEndpoints.orders.getById(orderId)), {
        method: 'GET',
        headers: getHeaders(true),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch order');
      }

      return await response.json();
    } catch (error) {
      console.error('Get order error:', error);
      throw error;
    }
  },
};

// ============== PRODUCTS API ==============
export const productsAPI = {
  // Get all products
  getProducts: async () => {
    try {
      const response = await fetch(getApiUrl(apiEndpoints.products.getAll), {
        method: 'GET',
        headers: getHeaders(false),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      return await response.json();
    } catch (error) {
      console.error('Get products error:', error);
      throw error;
    }
  },

  // Get single product
  getProduct: async (productId: string) => {
    try {
      const response = await fetch(getApiUrl(apiEndpoints.products.getById(productId)), {
        method: 'GET',
        headers: getHeaders(false),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch product');
      }

      return await response.json();
    } catch (error) {
      console.error('Get product error:', error);
      throw error;
    }
  },
};
