'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { useWishlistStore } from '@/lib/wishlistStore';
import { toast } from 'react-toastify';

interface WishlistItem {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice: number;
  image: string;
  rating: number;
  reviews: number;
  stock: number;
}

export default function WishlistPage() {
  const addToCart = useStore((state) => state.addToCart);
  
  // Use Zustand wishlist store
  const wishlist = useWishlistStore((state) => state.wishlist);
  const removeFromWishlist = useWishlistStore((state) => state.removeFromWishlist);
  const clearWishlist = useWishlistStore((state) => state.clearWishlist);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleRemoveFromWishlist = (id: string, itemName: string) => {
    removeFromWishlist(id);
    toast.info(`❤️ Removed from wishlist`, { autoClose: 1500 });
  };

  const handleAddToCart = (item: any) => {
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      quantity: 1,
      size: 8,
      color: 'Default'
    });
    toast.success(`✅ ${item.name} added to cart!`, { autoClose: 2000 });
  };

  const handleClearWishlist = () => {
    clearWishlist();
    toast.info('🗑️ Wishlist cleared', { autoClose: 1500 });
  };

  if (!mounted) return null;

  if (wishlist.length === 0) {
    return (
      <div className="min-h-screen bg-[#0f1621] flex flex-col">
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <div className="mb-6">
              <span className="text-7xl drop-shadow-lg">❤️</span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">Your Wishlist is Empty</h1>
            <p className="text-[#7a8ba8] mb-8 text-lg">Save your favorite sneakers to see them here</p>
            <Link
              href="/products"
              className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-8 rounded-xl transition-all shadow-lg shadow-purple-500/50 hover:shadow-xl hover:scale-105 duration-300"
            >
              Explore Sneakers 👟
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1621] flex flex-col">
      <div className="max-w-7xl mx-auto px-4 py-8 w-full">
        {/* Header */}
        <div className="mb-12">
          <Link href="/products" className="text-blue-500 hover:text-blue-400 text-sm mb-4 inline-block">
            ← Continue Shopping
          </Link>
          <h1 className="text-4xl font-bold text-white mb-2">My Wishlist ❤️</h1>
          <p className="text-[#7a8ba8]">
            You have <span className="font-bold text-white">{wishlist.length}</span> {wishlist.length === 1 ? 'item' : 'items'} saved
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-2xl p-6">
            <p className="text-[#7a8ba8] text-sm font-medium mb-1">Total Items</p>
            <p className="text-4xl font-bold text-white">{wishlist.length}</p>
          </div>
          <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-2xl p-6">
            <p className="text-[#7a8ba8] text-sm font-medium mb-1">Potential Savings</p>
            <p className="text-4xl font-bold text-green-400">
              ₹{wishlist.reduce((sum, item) => sum + (item.originalPrice - item.price), 0).toLocaleString()}
            </p>
          </div>
          <div className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border border-blue-500/30 rounded-2xl p-6">
            <p className="text-[#7a8ba8] text-sm font-medium mb-1">Available Now</p>
            <p className="text-4xl font-bold text-blue-400">
              {wishlist.filter((item) => item.stock > 0).length}/{wishlist.length}
            </p>
          </div>
        </div>

        {/* Wishlist Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {wishlist.map((item) => {
            const discount = Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100);

            return (
              <div
                key={item.id}
                className="group bg-gradient-to-br from-[#181e2a] to-[#1a2535] border border-purple-500/20 rounded-2xl overflow-hidden hover:border-purple-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/20"
              >
                {/* Image Section */}
                <div className="relative h-48 bg-gradient-to-b from-[#2d3f52] to-[#1a2535] overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-600/0 via-pink-600/0 to-purple-600/0 group-hover:from-purple-600/20 group-hover:via-pink-600/20 group-hover:to-purple-600/20 transition-all duration-300" />
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-contain p-3 group-hover:scale-110 transition-transform duration-500"
                  />
                  {discount > 0 && (
                    <div className="absolute top-3 right-3 bg-gradient-to-r from-red-600 to-pink-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                      -{discount}%
                    </div>
                  )}
                  <button
                    onClick={() => handleRemoveFromWishlist(item.id, item.name)}
                    className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-red-600/80 hover:bg-red-700 text-white flex items-center justify-center transition-all duration-300 shadow-lg"
                  >
                    ✕
                  </button>
                </div>

                {/* Content Section */}
                <div className="p-4 flex flex-col">
                  <p className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-1">
                    {item.brand}
                  </p>
                  <h3 className="text-sm font-bold text-white mb-2 line-clamp-1">
                    {item.name}
                  </h3>
                  
                  <div className="flex items-center gap-1 mb-3">
                    <span className="text-yellow-400 text-xs">★</span>
                    <span className="text-[#7a8ba8] text-xs font-medium">{item.rating} ({item.reviews})</span>
                  </div>

                  <div className="space-y-1 mb-4">
                    {item.originalPrice > item.price && (
                      <p className="text-xs text-[#7a8ba8] line-through">₹{item.originalPrice.toLocaleString()}</p>
                    )}
                    <p className="text-lg font-black text-white">
                      ₹{item.price.toLocaleString()}
                    </p>
                  </div>

                  <button
                    onClick={() => handleAddToCart(item)}
                    disabled={item.stock === 0}
                    className={`w-full py-2 rounded-lg font-bold text-xs transition-all duration-300 ${
                      item.stock === 0
                        ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                        : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg shadow-purple-500/50'
                    }`}
                  >
                    {item.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Bar */}
        <div className="flex gap-4 justify-center">
          <Link
            href="/products"
            className="bg-[#2d3f52] hover:bg-[#3d4f62] text-white font-semibold py-3 px-6 rounded-xl transition-all"
          >
            Continue Shopping
          </Link>
          <button
            onClick={handleClearWishlist}
            className="bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 font-semibold py-3 px-6 rounded-xl border border-red-500/30 transition-all"
          >
            Clear Wishlist
          </button>
        </div>
      </div>
    </div>
  );
}