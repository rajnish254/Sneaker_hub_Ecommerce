'use client';


import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ordersAPI } from '../../lib/api';

export default function OrderSuccessComponent() {
  const params = useParams();
  const orderId = params.orderId as string;
  const [showConfetti, setShowConfetti] = useState(false);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setShowConfetti(true);
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const data = await ordersAPI.getOrder(orderId);
        setOrder(data);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch order');
      } finally {
        setLoading(false);
      }
    };
    if (orderId) fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f1621]">
        <div className="text-white text-xl">Loading order details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f1621]">
        <div className="text-red-400 text-xl">{error}</div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  // Helper: Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // Helper: Format currency
  const formatCurrency = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;

  // Helper: Get delivery estimate (simple 3-5 days from order date)
  const getDeliveryEstimate = (createdAt: string) => {
    const date = new Date(createdAt);
    const min = new Date(date);
    min.setDate(date.getDate() + 3);
    const max = new Date(date);
    max.setDate(date.getDate() + 5);
    return `${formatDate(min.toISOString())} - ${formatDate(max.toISOString())}`;
  };

  const shipping = order.shippingAddress;

  return (
    <div className="min-h-screen bg-[#0f1621] overflow-hidden">
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none">
          {[...Array(50)].map((_, i) => {
            const colors = ['#a855f7', '#ec4899', '#22c55e', '#3b82f6', '#facc15', '#f97316'];
            return (
              <div
                key={i}
                className="absolute w-2 h-2 rounded-full animate-pulse"
                style={{
                  backgroundColor: colors[i % colors.length],
                  left: `${(i * 2) % 100}%`,
                  top: '-10px',
                  animation: `fall ${2 + (i % 3)}s linear infinite`,
                }}
              />
            );
          })}
        </div>
      )}

      <style jsx>{`
        @keyframes fall {
          to {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>

      <div className="max-w-2xl mx-auto px-4 py-16">
        {/* Success Card */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-8">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center text-5xl animate-bounce shadow-2xl">
              ✓
            </div>
          </div>
          <h1 className="text-5xl font-black text-white mb-4">
            Order
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              {' '}Confirmed!
            </span>
          </h1>
          <p className="text-lg text-[#7a8ba8] mb-8">
            Your order has been placed successfully. Get ready to step up your shoe game! 👟
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-gradient-to-br from-[#181e2a] to-[#1a2535] border border-[#232a3a] rounded-2xl p-12 mb-12 shadow-2xl">
          <div className="space-y-8">
            {/* Order Info */}
            <div className="space-y-8 pb-8 border-b border-[#232a3a]">
              {/* Order ID - Full Width */}
              <div className="w-full">
                <p className="text-[#7a8ba8] text-sm font-medium mb-2 uppercase tracking-wider">Order ID</p>
                <p className="text-xl font-bold text-white font-mono break-words whitespace-normal">{order._id}</p>
              </div>
              {/* Order Date and Total Amount */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-[#7a8ba8] text-sm font-medium mb-2 uppercase tracking-wider">Order Date</p>
                  <p className="text-2xl font-bold text-white">
                    {formatDate(order.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-[#7a8ba8] text-sm font-medium mb-2 uppercase tracking-wider">Total Amount</p>
                  <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                    {formatCurrency(order.totalAmount)}
                  </p>
                </div>
              </div>
            </div>
            {/* Order Items */}
            <div>
              <h3 className="text-lg font-bold text-white mb-4">Order Items</h3>
              <div className="space-y-3">
                {order.items.map((item: any, i: number) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 bg-[#1a2332] border border-[#232a3a] rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-xl">
                        <img src={item.image} alt={item.name} className="w-8 h-8 object-contain" />
                      </div>
                      <div>
                        <p className="text-white font-medium">{item.name}</p>
                        <p className="text-[#7a8ba8] text-sm">Qty: {item.quantity} | Size: {item.size}</p>
                      </div>
                    </div>
                    <p className="text-[#bfc8e6] font-bold">{formatCurrency(item.price)}</p>
                  </div>
                ))}
              </div>
            </div>
            {/* Delivery Info */}
            <div className="pt-8 border-t border-[#232a3a]">
              <h3 className="text-lg font-bold text-white mb-4">Estimated Delivery</h3>
              <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/30 rounded-xl p-6">
                <p className="text-[#7a8ba8] text-sm mb-2">Expected to arrive:</p>
                <p className="text-3xl font-black text-white mb-2">{getDeliveryEstimate(order.createdAt)}</p>
                <p className="text-[#7a8ba8]">We'll send you tracking updates via email at {shipping.email}</p>
              </div>
            </div>
            {/* Shipping Address */}
            <div className="pt-8 border-t border-[#232a3a]">
              <h3 className="text-lg font-bold text-white mb-4">Delivery Address</h3>
              <div className="bg-gradient-to-r from-pink-600/20 to-purple-600/20 border border-pink-500/30 rounded-xl p-6">
                <p className="text-white font-medium mb-1">{shipping.firstName} {shipping.lastName}</p>
                <p className="text-[#bfc8e6] mb-1">{shipping.address}, {shipping.city}, {shipping.state} - {shipping.pincode}</p>
                <p className="text-[#bfc8e6]">Phone: {shipping.phone}</p>
              </div>
            </div>
            {/* Email Confirmation */}
            <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-xl p-6">
              <p className="text-[#7a8ba8] text-sm mb-2">📧 Confirmation Sent</p>
              <p className="text-white font-medium">A detailed order confirmation has been sent to your email</p>
            </div>
          </div>
        </div>
        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Link
            href={`/orders/${order._id}`}
            className="block bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 rounded-xl transition-all text-center text-lg"
          >
            🚚 Track Order
          </Link>
          <Link
            href="/products"
            className="block bg-[#2d3f52] hover:bg-[#3d4f62] text-white font-bold py-4 rounded-xl transition text-center text-lg"
          >
            🛍️ Continue Shopping
          </Link>
        </div>
        {/* Support Info */}
        <div className="bg-[#181e2a] border border-[#232a3a] rounded-2xl p-8 text-center">
          <p className="text-[#7a8ba8] mb-4">Have questions about your order?</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="text-purple-400 hover:text-purple-300 font-semibold">
              📞 Contact Support
            </button>
            <button className="text-blue-400 hover:text-blue-300 font-semibold">
              📧 Email Us
            </button>
            <button className="text-pink-400 hover:text-pink-300 font-semibold">
              💬 Live Chat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
