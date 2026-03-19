'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { useStore } from '@/lib/store';
import { toast } from 'react-toastify';

export default function CartPage() {
  const router = useRouter();
  const cart = useStore((state) => state.cart);
  const removeFromCart = useStore((state) => state.removeFromCart);
  const updateCartQuantity = useStore((state) => state.updateCartQuantity);

  const handleRemoveItem = (itemId: string, itemName: string) => {
    removeFromCart(itemId);
    toast.info(`❤️ Removed from cart`, { autoClose: 1500 });
  };

  const handleUpdateQuantity = (itemId: string, newQuantity: number, itemName?: string) => {
    if (newQuantity <= 0) {
      // Item will be removed when quantity reaches 0
      updateCartQuantity(itemId, newQuantity);
      toast.info(`🗑️ ${itemName || 'Item'} removed from cart`, { autoClose: 1500 });
    } else {
      updateCartQuantity(itemId, newQuantity);
      toast.info(`📦 Quantity updated`, { autoClose: 1000 });
    }
  };


  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal >= 5000 ? 0 : 99;
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + shipping + tax;

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#0f1621]">
        <div className="max-w-6xl mx-auto px-4 py-16 text-center">
          <div className="mb-8">
            <div className="text-6xl mb-4">🛒</div>
            <h1 className="text-4xl font-bold text-white mb-4">Your Cart is Empty</h1>
            <p className="text-[#7a8ba8] mb-8">Explore our collection and add some amazing sneakers!</p>
          </div>
          <Link
            href="/products"
            className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-8 rounded-lg transition-all"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1621] flex flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-12">
          <Link href="/products" className="text-blue-500 hover:text-blue-400 text-sm mb-4 inline-block">
            ← Continue Shopping
          </Link>
          <h1 className="text-4xl font-bold text-white mb-2">Shopping Cart</h1>
          <p className="text-[#7a8ba8]">
            You have <span className="font-bold text-white">{cart.length}</span> {cart.length === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div
                key={item.id}
                className="bg-gradient-to-r from-[#181e2a] to-[#1a2535] border border-[#232a3a] rounded-2xl overflow-hidden hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20"
              >
                <div className="p-6">
                  {/* Item Header - Desktop */}
                  <div className="hidden md:flex items-center gap-6">
                    {/* Product Image */}
                    <div className="w-32 h-32 bg-[#2d3f52] rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-600/20 to-pink-600/20 flex items-center justify-center text-3xl">👟</div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white mb-1">{item.name}</h3>
                      <div className="flex gap-4 text-sm text-[#7a8ba8]">
                        <span>Size: <strong className="text-white">{item.size}</strong></span>
                        <span>Color: <strong className="text-white">{item.color}</strong></span>
                      </div>
                    </div>

                    {/* Quantity */}
                    <div className="flex items-center gap-3 bg-[#2d3f52] rounded-lg px-3 py-2">
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1, item.name)}
                        className="text-white hover:text-purple-400 transition"
                      >
                        −
                      </button>
                      <span className="w-6 text-center text-white font-bold">{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        className="text-white hover:text-purple-400 transition"
                      >
                        +
                      </button>
                    </div>

                    {/* Price */}
                    <div className="text-right min-w-24">
                      <p className="text-sm text-[#7a8ba8] mb-1">Price</p>
                      <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemoveItem(item.id, item.name)}
                      className="text-red-500 hover:text-red-400 text-xl transition"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Item Header - Mobile */}
                  <div className="md:hidden">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-white mb-2">{item.name}</h3>
                        <div className="flex gap-4 text-sm text-[#7a8ba8]">
                          <span>Size: <strong className="text-white">{item.size}</strong></span>
                          <span>Color: <strong className="text-white">{item.color}</strong></span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item.id, item.name)}
                        className="text-red-500 hover:text-red-400 text-xl transition"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 bg-[#2d3f52] rounded-lg px-3 py-2">
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1, item.name)}
                          className="text-white hover:text-purple-400 transition"
                        >
                          −
                        </button>
                        <span className="w-6 text-center text-white font-bold">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          className="text-white hover:text-purple-400 transition"
                        >
                          +
                        </button>
                      </div>
                      <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-[#181e2a] to-[#1a2535] border border-purple-500/30 rounded-2xl p-6 sticky top-24 shadow-2xl shadow-purple-500/10">
              <h2 className="text-2xl font-bold text-white mb-6">Order Summary</h2>

              {/* Summary Items */}
              <div className="space-y-4 mb-6 pb-6 border-b border-[#232a3a]">
                <div className="flex justify-between text-[#bfc8e6]">
                  <span>Subtotal</span>
                  <span className="font-semibold">₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[#bfc8e6]">
                  <span>Shipping</span>
                  <span className={`font-semibold ${shipping === 0 ? 'text-green-400' : 'text-orange-400'}`}>
                    {shipping === 0 ? 'FREE' : `+₹${shipping}`}
                  </span>
                </div>
                <div className="flex justify-between text-[#bfc8e6]">
                  <span>Tax (5%)</span>
                  <span className="font-semibold">₹{tax}</span>
                </div>
              </div>

              {/* Total */}
              <div className="mb-6 p-4 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-lg">
                <div className="flex justify-between items-baseline">
                  <span className="text-[#7a8ba8]">Total Amount</span>
                  <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                    ₹{total.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Promo Code */}
              <div className="mb-6">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Promo code"
                    className="flex-1 bg-[#2d3f52] border border-[#3d4f62] text-white placeholder-[#7a8ba8] rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500"
                  />
                  <button className="bg-[#2d3f52] hover:bg-[#3d4f62] text-white px-4 py-2 rounded-lg transition">
                    Apply
                  </button>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={() => router.push('/checkout')}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-purple-500/50 mb-3 hover:shadow-2xl hover:scale-105 duration-300"
              >
                Proceed to Checkout →
              </button>

              {/* Continue Shopping */}
              <Link
                href="/products"
                className="block w-full text-center bg-[#2d3f52] hover:bg-[#3d4f62] text-white font-semibold py-3 rounded-lg transition"
              >
                Continue Shopping
              </Link>

              {/* Info Messages */}
              <div className="mt-6 space-y-3 text-sm">
                <div className="flex gap-2 text-green-400">
                  <span>✓</span>
                  <span>Free shipping on orders above ₹5000</span>
                </div>
                <div className="flex gap-2 text-blue-400">
                  <span>✓</span>
                  <span>Secure checkout with SSL encryption</span>
                </div>
                <div className="flex gap-2 text-purple-400">
                  <span>✓</span>
                  <span>Easy returns within 30 days</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}

