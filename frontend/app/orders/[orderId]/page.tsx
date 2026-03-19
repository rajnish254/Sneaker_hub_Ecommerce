'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';

import Link from 'next/link';
import { ordersAPI } from '@/lib/api';

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface ShippingAddress {
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
}

interface Order {
  _id: string;
  totalAmount: number;
  createdAt: string;
  status: string;
  items: OrderItem[];
  shippingAddress?: ShippingAddress;
}

export default function OrderTrackingPage() {
  const params = useParams();
  const orderId = params.orderId as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const data = await ordersAPI.getOrder(orderId);
        setOrder(data);
      } catch (err: any) {
        console.error('Failed to fetch order:', err);
        setError(err.message || 'Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f1621]">

        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <div className="inline-block animate-spin text-3xl">⏳</div>
          <p className="text-[#7a8ba8] mt-4">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[#0f1621]">
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <p className="text-red-400 mb-4">{error || 'Order not found'}</p>
          <Link href="/dashboard/orders" className="text-blue-500 hover:text-blue-400">
            ← Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  // Helper: Generate timeline with dynamic dates based on order creation date
  const generateTimeline = () => {
    const baseDate = new Date(order.createdAt);
    
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-GB', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit' 
      }) + ' ' + date.toLocaleTimeString('en-GB', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true
      });
    };
    
    return [
      {
        status: 'confirmed',
        label: 'Order Confirmed',
        date: formatDate(baseDate),
        description: 'Your order has been confirmed and is being prepared',
        completed: true,
      },
      {
        status: 'processing',
        label: 'Processing',
        date: formatDate(new Date(baseDate.getTime() + 6 * 60 * 60 * 1000)), // +6 hours
        description: 'We are preparing your order for shipment',
        completed: ['processing', 'shipped', 'delivered'].includes(order.status),
      },
      {
        status: 'shipped',
        label: 'Shipped',
        date: formatDate(new Date(baseDate.getTime() + 24 * 60 * 60 * 1000)), // +1 day
        description: 'Your order has been dispatched and is on the way',
        completed: ['shipped', 'delivered'].includes(order.status),
      },
      {
        status: 'delivered',
        label: 'Delivered',
        date: formatDate(new Date(baseDate.getTime() + 4 * 24 * 60 * 60 * 1000)), // +4 days
        description: 'Your order will be delivered by this time',
        completed: order.status === 'delivered',
      },
    ];
  };

  const timelineSteps = generateTimeline();
  const currentStepIndex = timelineSteps.findIndex((step) => step.status === order.status);

  const getStepColor = (index: number) => {
    if (index < currentStepIndex) return 'from-green-600 to-emerald-600';
    if (index === currentStepIndex) return 'from-purple-600 to-pink-600';
    return 'from-[#3d4f62] to-[#2d3f52]';
  };

  return (
    <div className="min-h-screen bg-[#0f1621]">

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard/orders" className="text-blue-500 hover:text-blue-400 text-sm mb-4 inline-block">
            ← Back to Orders
          </Link>
          <h1 className="text-4xl font-bold text-white mb-2">Track Your Order</h1>
          <p className="text-[#7a8ba8]">Order #{orderId}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Timeline */}
          <div className="lg:col-span-2">
            {/* Order Header Card */}
            <div className="bg-gradient-to-br from-[#181e2a] to-[#1a2535] border border-[#232a3a] rounded-2xl p-8 mb-8">
              <div className="space-y-8">
                {/* Order ID - Full Width */}
                <div className="w-full">
                  <p className="text-[#7a8ba8] text-sm font-medium mb-2 uppercase tracking-wider">Order Number</p>
                  <p className="text-xl font-bold text-white font-mono break-words whitespace-normal">#{orderId}</p>
                </div>
                
                {/* Order Date and Total Amount */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-[#7a8ba8] text-sm font-medium mb-1">Order Date</p>
                    <p className="text-2xl font-bold text-white">{new Date(order.createdAt).toLocaleDateString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit' })}</p>
                  </div>
                  <div>
                    <p className="text-[#7a8ba8] text-sm font-medium mb-1">Total Amount</p>
                    <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                      ₹{order.totalAmount.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-[#181e2a] border border-[#232a3a] rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-8">Delivery Timeline</h2>

              <div className="space-y-6">
                {timelineSteps.map((step, index) => (
                  <div key={index} className="relative">
                    {/* Connector Line */}
                    {index < timelineSteps.length - 1 && (
                      <div
                        className={`absolute left-6 top-12 w-1 h-12 bg-gradient-to-b ${
                          index < currentStepIndex
                            ? 'from-green-600 to-green-600'
                            : 'from-[#3d4f62] to-[#2d3f52]'
                        }`}
                      ></div>
                    )}

                    {/* Step Content */}
                    <div className="flex gap-6">
                      {/* Step Circle */}
                      <div
                        className={`flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br ${getStepColor(
                          index
                        )} flex items-center justify-center text-white font-bold text-lg shadow-lg relative z-10`}
                      >
                        {index < currentStepIndex ? '✓' : index + 1}
                      </div>

                      {/* Step Info */}
                      <div className="flex-1 pt-2">
                        <h3 className="text-lg font-bold text-white mb-1">{step.label}</h3>
                        <p className="text-[#7a8ba8] text-sm mb-2">{step.date}</p>
                        <p className="text-[#bfc8e6]">{step.description}</p>

                        {index === currentStepIndex && (
                          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full">
                            <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></span>
                            <span className="text-sm font-medium text-purple-400">In Progress</span>
                          </div>
                        )}

                        {index < currentStepIndex && (
                          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full">
                            <span className="text-sm font-medium text-green-400">Completed</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Estimated Delivery */}
              <div className="mt-8 pt-8 border-t border-[#232a3a]">
                <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/30 rounded-xl p-6">
                  <p className="text-[#7a8ba8] text-sm font-medium mb-2">Status</p>
                  <p className="text-2xl font-bold text-white mb-2 capitalize">
                    {order.status}
                  </p>
                  <p className="text-[#7a8ba8]">Your order is {order.status}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Items */}
            <div className="bg-[#181e2a] border border-[#232a3a] rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Order Items ({order.items.length})</h3>
              <div className="space-y-3">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex gap-4 pb-3 border-b border-[#232a3a] last:border-0">
                    <div className="w-16 h-16 bg-[#2d3f52] rounded-lg flex items-center justify-center overflow-hidden">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl">👟</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium text-sm">{item.name}</p>
                      <p className="text-[#7a8ba8] text-xs mt-1">Qty: {item.quantity}</p>
                      <p className="text-[#bfc8e6] font-bold text-sm mt-2">₹{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-[#181e2a] border border-[#232a3a] rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Delivery Address</h3>
              <div className="bg-[#1a2332] rounded-lg p-3 border border-[#232a3a] text-sm">
                <p className="text-white font-medium mb-2">{order.shippingAddress?.firstName} {order.shippingAddress?.lastName}</p>
                <p className="text-[#bfc8e6] text-xs mb-1">{order.shippingAddress?.address}</p>
                <p className="text-[#bfc8e6] text-xs">{order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}</p>
                <p className="text-[#7a8ba8] text-xs mt-2">Phone: {order.shippingAddress?.phone}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold py-3 rounded-lg transition-all">
                📞 Contact Courier
              </button>
              <button className="w-full bg-[#2d3f52] hover:bg-[#3d4f62] text-white font-bold py-3 rounded-lg transition">
                🐛 Report Issue
              </button>
              <Link
                href="/products"
                className="w-full block bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 rounded-lg transition-all text-center"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
