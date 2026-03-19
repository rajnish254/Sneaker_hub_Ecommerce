


'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useWishlistStore } from '@/lib/wishlistStore';
import { toast } from 'react-toastify';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    brand: string;
    price: number;
    originalPrice: number;
    image: string;
    rating: number;
    reviews: number;
    stock: number;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Get wishlist store methods and state
  const wishlist = useWishlistStore((state) => state.wishlist);
  const addToWishlist = useWishlistStore((state) => state.addToWishlist);
  const removeFromWishlist = useWishlistStore((state) => state.removeFromWishlist);
  const isInWishlist = useWishlistStore((state) => state.isInWishlist);

  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

  // Check if item is in wishlist
  const inWishlist = isInWishlist(product.id);

  // Handle Hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (inWishlist) {
      removeFromWishlist(product.id);
      toast.info(`❤️ Removed from wishlist`, { autoClose: 1500 });
    } else {
      addToWishlist({
        id: product.id,
        name: product.name,
        brand: product.brand,
        price: product.price,
        originalPrice: product.originalPrice,
        image: product.image,
        rating: product.rating,
        reviews: product.reviews,
        stock: product.stock,
      });
      toast.success(`✅ Added to wishlist!`, { autoClose: 1500 });
    }
  };

  if (!mounted) return <div className="h-full aspect-square bg-[#181e2a] animate-pulse rounded-2xl" />;

  return (
    <Link href={`/products/${product.id}`} className="h-full">
      <div
        className="group relative flex flex-col h-full bg-[#181e2a] rounded-2xl overflow-hidden border border-[#232a3a] transition-all duration-300 hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/20 cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* IMAGE CONTAINER */}
        <div className="relative aspect-square w-full bg-[#232a3a]/50 overflow-hidden flex items-center justify-center p-4">
          <div
            className={`absolute inset-0 bg-gradient-to-br from-purple-600/10 to-pink-600/10 transition-opacity duration-300 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
          />

          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
          />

          {/* Badges */}
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold bg-green-500/20 text-green-400 border border-green-500/30">
            {product.stock > 0 ? `${product.stock} left` : 'Out of Stock'}
          </div>

          {discount > 0 && (
            <div className="absolute top-2 right-2 bg-pink-600 text-white px-2 py-0.5 rounded-md text-[10px] font-bold">
              -{discount}%
            </div>
          )}

          {/* Wishlist Button */}
          <button
            onClick={toggleWishlist}
            className={`absolute bottom-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg ${
              inWishlist ? 'bg-red-600 text-white' : 'bg-white text-pink-600'
            } ${isHovered ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
          >
            {inWishlist ? '❤️' : '🤍'}
          </button>
        </div>

        {/* DETAILS SECTION */}
        <div className="p-3 flex flex-col flex-grow select-text selection:bg-purple-600 selection:text-white">
          <p className="text-[10px] font-bold text-purple-400 uppercase tracking-widest select-text selection:bg-purple-600 selection:text-white">
            {product.brand}
          </p>
          <h3 className="text-sm font-bold text-white line-clamp-1 mt-0.5 select-text selection:bg-purple-600 selection:text-white">
            {product.name}
          </h3>

          <div className="flex items-center gap-1 mt-1 select-text selection:bg-purple-600 selection:text-white">
            <span className="text-yellow-400 text-xs">★</span>
            <span className="text-[#7a8ba8] text-[11px] font-medium">({product.reviews})</span>
          </div>

          <div className="flex-1 min-h-[4px]" />

          <div className="mt-2 select-text selection:bg-purple-600 selection:text-white">
            {product.originalPrice > product.price && (
              <p className="text-[10px] text-[#7a8ba8] line-through">
                ₹{product.originalPrice.toLocaleString()}
              </p>
            )}
            <div className="flex items-baseline justify-between">
              <p className="text-lg font-black text-white leading-none">
                ₹{product.price.toLocaleString()}
              </p>
              {isHovered && (
                <span className="text-[10px] font-bold text-purple-400 animate-pulse">
                  VIEW →
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}