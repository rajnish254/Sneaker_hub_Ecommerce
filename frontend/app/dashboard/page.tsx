'use client';

import { useStore } from '@/lib/store';
import { useWishlistStore } from '@/lib/wishlistStore';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ordersAPI } from '@/lib/api';

interface Order {
  _id: string;
  orderNumber: string;
  status: 'confirmed' | 'processing' | 'shipped' | 'delivered';
  items: any[];
  totalAmount: number;
  createdAt: string;
}

export default function DashboardPage() {
  const user = useStore((state) => state.user);
  const cart = useStore((state) => state.cart);
  const isAuthenticated = useStore((state) => state.isAuthenticated);
  const wishlist = useWishlistStore((state) => state.wishlist);
  const loadWishlistFromStorage = useWishlistStore((state) => state.loadWishlistFromStorage);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Load wishlist from storage on mount and watch for changes
  useEffect(() => {
    loadWishlistFromStorage();
    
    // Also directly check localStorage as a fallback
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('wishlist');
      if (stored) {
        try {
          const items = JSON.parse(stored);
          setWishlistCount(Array.isArray(items) ? items.length : 0);
        } catch (e) {
          setWishlistCount(0);
        }
      }
    }
  }, [loadWishlistFromStorage]);

  // Update wishlist count when store changes
  useEffect(() => {
    setWishlistCount(wishlist.length);
  }, [wishlist]);

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await ordersAPI.getOrders();
        // Sort orders by createdAt in descending order (newest first)
        const sortedOrders = (response.orders || []).sort((a: Order, b: Order) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        setOrders(sortedOrders);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated]);

  // Calculate real stats
  const totalSpent = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
  const stats = [
    { label: 'Total Orders', value: orders.length.toString(), icon: '📦', color: 'from-blue-600 to-cyan-600' },
    { label: 'Total Spent', value: `₹${totalSpent.toLocaleString('en-IN')}`, icon: '💰', color: 'from-green-600 to-emerald-600' },
    { label: 'Wishlist Items', value: wishlistCount.toString(), icon: '❤️', color: 'from-pink-600 to-rose-600' },
    { label: 'Loyalty Points', value: '0', icon: '⭐', color: 'from-yellow-600 to-orange-600' },
  ];

  // Format recent orders
  const getStatusColor = (status: string) => {
    const colors: {[key: string]: string} = {
      'confirmed': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'processing': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      'shipped': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'delivered': 'bg-green-500/20 text-green-400 border-green-500/30',
    };
    return colors[status] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  const getStatusLabel = (status: string) => {
    const labels: {[key: string]: string} = {
      'confirmed': 'Confirmed',
      'processing': 'Processing',
      'shipped': 'Shipped',
      'delivered': 'Delivered',
    };
    return labels[status] || status;
  };

  const recentOrders = orders.slice(0, 3).map(order => ({
    id: order.orderNumber || order._id,
    date: order.createdAt || new Date().toISOString(),
    total: `₹${order.totalAmount?.toLocaleString('en-IN') || 0}`,
    status: getStatusLabel(order.status),
    statusColor: getStatusColor(order.status),
    items: order.items?.length || 0,
    orderId: order._id,
  }));

  return (
    <div className="min-h-screen bg-[#0f1621]">

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Welcome Header */}
        <div className="mb-12">
          <p className="text-[#7a8ba8] text-sm uppercase tracking-wide mb-2">Welcome back</p>
          <h1 className="text-4xl font-bold text-white mb-2">
            Hey, {user?.firstName || 'Guest'}! 👟
          </h1>
          <p className="text-[#7a8ba8]">Here's your shopping dashboard overview</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="group bg-gradient-to-br from-[#181e2a] to-[#1a2535] border border-purple-500/20 rounded-2xl p-6 hover:border-purple-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10 hover:scale-105"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`text-4xl bg-gradient-to-br ${stat.color} bg-clip-text text-transparent`}>
                  {stat.icon}
                </div>
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${stat.color} opacity-10`}></div>
              </div>
              <p className="text-[#7a8ba8] text-sm font-medium mb-2">{stat.label}</p>
              <p className="text-3xl font-bold text-white">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Orders */}
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-[#181e2a] to-[#1a2535] border border-purple-500/20 rounded-2xl p-8 shadow-xl shadow-purple-500/10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Recent Orders</h2>
                <Link
                  href="/dashboard/orders"
                  className="text-purple-400 hover:text-purple-300 text-sm font-semibold"
                >
                  View All →
                </Link>
              </div>

              <div className="space-y-4">
                {loading ? (
                  <p className="text-center text-[#7a8ba8] py-4">Loading orders...</p>
                ) : recentOrders.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-[#7a8ba8] mb-4">No orders yet</p>
                    <Link
                      href="/products"
                      className="text-purple-400 hover:text-purple-300 font-semibold"
                    >
                      Start Shopping →
                    </Link>
                  </div>
                ) : (
                  recentOrders.map((order) => (
                    <Link
                      key={order.orderId}
                      href={`/orders/${order.orderId}`}
                      className="flex items-center justify-between p-4 bg-[#1a2332] border border-purple-500/20 rounded-xl hover:border-purple-500/50 hover:bg-purple-500/10 transition-all group cursor-pointer shadow-md hover:shadow-lg"
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-white group-hover:text-purple-400 transition">
                          Order #{order.id}
                        </p>
                        <p className="text-sm text-[#7a8ba8]">
                          {new Date(order.date).toLocaleDateString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit' })} • {order.items} item{order.items > 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-bold text-white">{order.total}</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${order.statusColor}`}>
                          {order.status}
                        </span>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-[#181e2a] to-[#1a2535] border border-[#232a3a] rounded-2xl p-8">
              <h3 className="text-xl font-bold text-white mb-6">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  href="/products"
                  className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-xl hover:border-purple-500/60 hover:from-purple-600/30 hover:to-pink-600/30 transition-all group"
                >
                  <span className="text-2xl">🛍️</span>
                  <div className="flex-1">
                    <p className="font-semibold text-white group-hover:text-purple-400 transition">Browse Shoes</p>
                    <p className="text-xs text-[#7a8ba8]">Explore new collection</p>
                  </div>
                  <span className="text-purple-400">→</span>
                </Link>

                <Link
                  href="/wishlist"
                  className="flex items-center gap-3 p-4 bg-gradient-to-r from-pink-600/20 to-rose-600/20 border border-pink-500/30 rounded-xl hover:border-pink-500/60 hover:from-pink-600/30 hover:to-rose-600/30 transition-all group"
                >
                  <span className="text-2xl">❤️</span>
                  <div className="flex-1">
                    <p className="font-semibold text-white group-hover:text-pink-400 transition">My Wishlist</p>
                    <p className="text-xs text-[#7a8ba8]">View saved items</p>
                  </div>
                  <span className="text-pink-400">→</span>
                </Link>

                <Link
                  href="/dashboard/profile"
                  className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/30 rounded-xl hover:border-blue-500/60 hover:from-blue-600/30 hover:to-cyan-600/30 transition-all group"
                >
                  <span className="text-2xl">👤</span>
                  <div className="flex-1">
                    <p className="font-semibold text-white group-hover:text-blue-400 transition">Edit Profile</p>
                    <p className="text-xs text-[#7a8ba8]">Update information</p>
                  </div>
                  <span className="text-blue-400">→</span>
                </Link>

                <Link
                  href="/dashboard/addresses"
                  className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-xl hover:border-green-500/60 hover:from-green-600/30 hover:to-emerald-600/30 transition-all group"
                >
                  <span className="text-2xl">📍</span>
                  <div className="flex-1">
                    <p className="font-semibold text-white group-hover:text-green-400 transition">Addresses</p>
                    <p className="text-xs text-[#7a8ba8]">Manage delivery</p>
                  </div>
                  <span className="text-green-400">→</span>
                </Link>
              </div>
            </div>

            {/* Cart Summary */}
            {cart.length > 0 && (
              <div className="bg-gradient-to-br from-[#181e2a] to-[#1a2535] border border-purple-500/30 rounded-2xl p-6 shadow-xl shadow-purple-500/10">
                <p className="text-sm text-[#7a8ba8] uppercase tracking-wide mb-2 font-semibold">Active Cart</p>
                <p className="text-3xl font-bold text-white mb-4">{cart.length} Items</p>
                <Link
                  href="/cart"
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 rounded-xl transition-all text-center block shadow-lg shadow-purple-500/50 hover:shadow-xl"
                >
                  View Cart
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
