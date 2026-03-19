'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { useStore } from '@/lib/store';
import { ordersAPI } from '@/lib/api';

interface OrderItem {
  id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

interface Order {
  _id: string;
  orderNumber: string;
  status: 'confirmed' | 'processing' | 'shipped' | 'delivered';
  items: OrderItem[];
  totalAmount: number;
  createdAt: string;
}

const STATUS_CONFIG = {
  confirmed: { color: '#22c55e', label: '✓ Confirmed' },
  processing: { color: '#f59e0b', label: '⏳ Processing' },
  shipped: { color: '#3b82f6', label: '📦 Shipped' },
  delivered: { color: '#8b5cf6', label: '✓ Delivered' },
};

export default function OrdersPage() {
  const router = useRouter();
  const isAuthenticated = useStore((state) => state.isAuthenticated);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);

  // Fetch orders from backend
  useEffect(() => {
    const fetchOrders = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');
        const response = await ordersAPI.getOrders();
        // Sort orders by createdAt in descending order (newest first)
        const sortedOrders = (response.orders || []).sort((a: Order, b: Order) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        setOrders(sortedOrders);
      } catch (err: any) {
        console.error('Failed to fetch orders:', err);
        setError(err.message || 'Failed to load orders. Please try again.');
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated]);

  // Filter orders when status changes
  useEffect(() => {
    if (selectedStatus === 'all') {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter((order) => order.status === selectedStatus));
    }
  }, [selectedStatus, orders]);

  const getStatusColor = (status: string) => {
    return STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]?.color || '#7a8ba8';
  };

  const getStatusLabel = (status: string) => {
    return STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]?.label || status;
  };

  // Helper: Format order date
  const formatOrderDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { 
      year: 'numeric', 
      month: 'short', 
      day: '2-digit' 
    });
  };

  // Helper: Calculate estimated delivery (3-5 days from order date)
  const getEstimatedDelivery = (createdAt: string) => {
    const date = new Date(createdAt);
    const deliveryDate = new Date(date);
    deliveryDate.setDate(date.getDate() + 4); // Add 4 days for mid-range estimate
    return deliveryDate.toLocaleDateString('en-GB', { 
      year: 'numeric', 
      month: 'short', 
      day: '2-digit' 
    });
  };

  // Check authentication
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0f1621]">
        <div className="max-w-6xl mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Please sign in to view your orders</h1>
          <Link href="/auth/login" className="text-blue-500 hover:text-blue-400">
            Sign In →
          </Link>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-[#0f1621]">

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Back Link */}
        <Link href="/dashboard" className="text-blue-500 hover:text-blue-400 text-sm mb-4 inline-block">
          ← Back to Dashboard
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">My Orders</h1>
          <p className="text-[#7a8ba8]">View and track all your orders</p>
        </div>

        {/* Status Tabs */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
          {['All', 'Confirmed', 'Processing', 'Shipped', 'Delivered'].map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedStatus(tab.toLowerCase())}
              className={`px-6 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                (tab === 'All' && selectedStatus === 'all') ||
                (tab !== 'All' && selectedStatus === tab.toLowerCase())
                  ? 'bg-blue-600 text-white'
                  : 'bg-[#181e2a] text-[#bfc8e6] border border-[#2d3f52] hover:border-[#3d4f62]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          {loading ? (
            <div className="bg-[#181e2a] rounded-lg p-8 text-center">
              <div className="inline-block animate-spin text-3xl">⏳</div>
              <p className="text-[#7a8ba8] mt-4">Loading your orders...</p>
            </div>
          ) : error ? (
            <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-8 text-center">
              <p className="text-red-400">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
              >
                Try Again
              </button>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="bg-[#181e2a] rounded-lg p-8 text-center">
              <p className="text-[#7a8ba8]">
                {orders.length === 0 ? 'No orders yet. Start shopping!' : 'No orders found in this category'}
              </p>
              {orders.length === 0 && (
                <Link href="/products" className="mt-4 inline-block text-blue-500 hover:text-blue-400">
                  Continue Shopping →
                </Link>
              )}
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div
                key={order._id}
                className="bg-[#181e2a] rounded-lg p-6 border border-[#232a3a] hover:border-[#3d4f62] transition-all"
              >
                {/* Order Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">Order {order.orderNumber}</h3>
                    <p className="text-[#7a8ba8] text-sm">{order.items.length} items</p>
                  </div>
                  <div
                    className="text-[#22c55e] font-semibold"
                    style={{ color: getStatusColor(order.status) }}
                  >
                    {getStatusLabel(order.status)}
                  </div>
                </div>

                {/* Product Images */}
                <div className="flex gap-4 mb-6">
                  {order.items.slice(0, 2).map((item, idx) => (
                    <div
                      key={idx}
                      className="w-32 h-32 bg-[#2d3f52] rounded-lg overflow-hidden flex items-center justify-center"
                    >
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-3xl">👟</span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Order Details */}
                <div className="grid grid-cols-3 gap-6 mb-6 py-6 border-y border-[#232a3a]">
                  <div>
                    <p className="text-[#7a8ba8] text-sm mb-1">Total Amount</p>
                    <p className="text-xl font-bold text-white">₹{order.totalAmount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[#7a8ba8] text-sm mb-1">Estimated Delivery</p>
                    <p className="text-xl font-bold text-white">{getEstimatedDelivery(order.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-[#7a8ba8] text-sm mb-1">Ordered On</p>
                    <p className="text-xl font-bold text-white">{formatOrderDate(order.createdAt)}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <button
                    onClick={() => router.push(`/orders/${order._id}`)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
                  >
                    ↑ Track Order
                  </button>
                  <button className="flex-1 bg-[#2d3f52] hover:bg-[#3d4f62] text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2">
                    📋 Invoice
                  </button>
                  <button className="flex-1 bg-orange-700 hover:bg-orange-800 text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2">
                    🔄 Return
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
