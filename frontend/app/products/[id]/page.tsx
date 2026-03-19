// 'use client';

// import { useState, use } from 'react';
// import Navigation from '@/app/components/Navigation';
// import ReviewForm from '@/app/components/ReviewForm';
// import ReviewsList from '@/app/components/ReviewsList';
// import { SHOES } from '@/lib/mockShoes';
// import { useStore } from '@/lib/store';
// import Link from 'next/link';

// interface Review {
//   id: string;
//   rating: number;
//   title: string;
//   body: string;
//   author: string;
//   date: string;
// }

// interface PageProps {
//   params: Promise<{ id: string }>;
// }

// export default function ProductDetailPage({ params }: PageProps) {
//   const { id } = use(params);
//   const addToCart = useStore((state) => state.addToCart);
  
//   const product = SHOES.find((shoe) => shoe.id === id);
  
//   const [selectedSize, setSelectedSize] = useState<number | null>(null);
//   const [selectedColor, setSelectedColor] = useState<string | null>(null);
//   const [quantity, setQuantity] = useState(1);
//   const [reviews, setReviews] = useState<Review[]>([
//     {
//       id: '1',
//       rating: 3,
//       title: 'amazing',
//       body: 'good product',
//       author: 'Anonymous',
//       date: '22 Feb 2026',
//     },
//   ]);

//   if (!product) {
//     return (
//       <div className="min-h-screen bg-[#0f1621]">
//         <Navigation />
//         <div className="max-w-6xl mx-auto px-4 py-16 text-center">
//           <h1 className="text-3xl font-bold text-white mb-4">Product Not Found</h1>
//           <Link href="/products" className="text-blue-500 hover:text-blue-400">
//             ← Back to Products
//           </Link>
//         </div>
//       </div>
//     );
//   }

//   const handleAddToCart = () => {
//     if (!selectedSize) {
//       alert('Please select a size');
//       return;
//     }

//     addToCart({
//       id: product.id,
//       name: product.name,
//       price: product.price,
//       quantity,
//       size: selectedSize,
//       color: selectedColor || product.colors[0],
//       image: product.image,
//     });

//     alert('Added to cart!');
//   };

//   const handleReviewSubmitted = (newReview: { rating: number; title: string; body: string }) => {
//     const review: Review = {
//       id: String(reviews.length + 1),
//       ...newReview,
//       author: 'You',
//       date: new Date().toLocaleDateString('en-GB', {
//         day: '2-digit',
//         month: 'short',
//         year: 'numeric',
//       }),
//     };

//     setReviews([review, ...reviews]);
//     alert('Review submitted successfully!');
//   };

//   const handleDeleteReview = (reviewId: string) => {
//     setReviews(reviews.filter((r) => r.id !== reviewId));
//   };

//   return (
//     <div className="min-h-screen bg-[#0f1621] flex flex-col">
//       <Navigation />

//       <div className="flex-1 overflow-y-auto">
//         <div className="max-w-6xl mx-auto px-4 py-8">
//           <Link href="/products" className="text-blue-500 hover:text-blue-400 text-sm mb-3 inline-block">
//             ← Back to Products
//           </Link>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
//             <div className="bg-[#181e2a] rounded-lg p-4 flex items-center justify-center">
//               {/* eslint-disable-next-line @next/next/no-img-element */}
//               <img
//                 src={product.image}
//                 alt={product.name}
//                 className="w-full max-w-md h-auto object-contain"
//               />
//             </div>

//             <div>
//               <p className="text-[#7a8ba8] text-sm mb-1">{product.brand}</p>
//               <h1 className="text-4xl font-bold text-white mb-3">{product.name}</h1>

//               <div className="flex items-center gap-3 mb-4">
//                 <div className="flex gap-1">
//                   {[1, 2, 3, 4, 5].map((star) => (
//                     <span
//                       key={star}
//                       className={`text-xl ${
//                         star <= Math.round(product.rating) ? 'text-yellow-400' : 'text-[#3d4f62]'
//                       }`}
//                     >
//                       ★
//                     </span>
//                   ))}
//                 </div>
//                 <span className="text-[#bfc8e6]">({product.reviews} reviews)</span>
//               </div>

//               <div className="mb-4">
//                 <p className="text-[#7a8ba8] line-through text-sm mb-1">
//                   ₹{product.originalPrice.toLocaleString()}
//                 </p>
//                 <p className="text-4xl font-bold text-white">₹{product.price.toLocaleString()}</p>
//                 <p className="text-green-500 font-semibold mt-2">
//                   Save ₹{(product.originalPrice - product.price).toLocaleString()} (
//                   {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%)
//                 </p>
//               </div>

//               <p className="text-[#bfc8e6] mb-4">{product.description}</p>

//               <div className="mb-4">
//                 <p className={`font-semibold ${product.stock > 0 ? 'text-green-500' : 'text-red-500'}`}>
//                   {product.stock > 0 ? '✓ In Stock' : '✕ Out of Stock'} ({product.stock} available)
//                 </p>
//               </div>

//               {product.colors.length > 0 && (
//                 <div className="mb-4">
//                   <label className="block text-white font-semibold mb-2">Color</label>
//                   <div className="flex gap-3 flex-wrap">
//                     {product.colors.map((color: string) => (
//                       <button
//                         key={color}
//                         onClick={() => setSelectedColor(color)}
//                         className={`px-4 py-2 rounded-lg font-medium transition ${
//                           selectedColor === color
//                             ? 'bg-blue-600 text-white'
//                             : 'bg-[#181e2a] text-[#bfc8e6] border border-[#2d3f52] hover:border-[#3d4f62]'
//                         }`}
//                       >
//                         {color}
//                       </button>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               <div className="mb-4">
//                 <label className="block text-white font-semibold mb-2">Size (US)</label>
//                 <div className="grid grid-cols-4 gap-2">
//                   {product.sizes.map((size: number) => (
//                     <button
//                       key={size}
//                       onClick={() => setSelectedSize(size)}
//                       className={`py-3 rounded-lg font-medium transition ${
//                         selectedSize === size
//                           ? 'bg-blue-600 text-white'
//                           : 'bg-[#181e2a] text-[#bfc8e6] border border-[#2d3f52] hover:border-[#3d4f62]'
//                       }`}
//                     >
//                       {size}
//                     </button>
//                   ))}
//                 </div>
//               </div>

//               <div className="mb-4">
//                 <label className="block text-white font-semibold mb-2">Quantity</label>
//                 <div className="flex items-center gap-3 max-w-xs">
//                   <button
//                     onClick={() => setQuantity(Math.max(1, quantity - 1))}
//                     className="bg-[#181e2a] hover:bg-[#2d3f52] text-white w-10 h-10 rounded-lg transition"
//                   >
//                     −
//                   </button>
//                   <input
//                     type="number"
//                     value={quantity}
//                     onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
//                     className="flex-1 bg-[#181e2a] border border-[#2d3f52] text-white text-center py-2 rounded-lg"
//                   />
//                   <button
//                     onClick={() => setQuantity(quantity + 1)}
//                     className="bg-[#181e2a] hover:bg-[#2d3f52] text-white w-10 h-10 rounded-lg transition"
//                   >
//                     +
//                   </button>
//                 </div>
//               </div>

//               <button
//                 onClick={handleAddToCart}
//                 disabled={!product.stock}
//                 className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 rounded-lg transition disabled:opacity-50"
//               >
//                 🛒 Add to Cart
//               </button>
//             </div>
//           </div>

//           <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
//             <div className="lg:col-span-2">
//               <ReviewForm productId={product.id} onReviewSubmitted={handleReviewSubmitted} />
//             </div>

//             <div className="lg:col-span-3">
//               <ReviewsList reviews={reviews} onDeleteReview={handleDeleteReview} />
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


'use client';

import { useState, use, useEffect } from 'react';
import ReviewForm from '@/app/components/ReviewForm';
import ReviewsList from '@/app/components/ReviewsList';
import SizeChart from '@/app/components/SizeChart';
import { SHOES } from '@/lib/mockShoes';
import { useStore } from '@/lib/store';
import { useWishlistStore } from '@/lib/wishlistStore';
import Link from 'next/link';
import { toast } from 'react-toastify';

interface Review {
  id: string;
  rating: number;
  title: string;
  body: string;
  author: string;
  date: string;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ProductDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const addToCart = useStore((state) => state.addToCart);
  
  // Wishlist hooks
  const addToWishlist = useWishlistStore((state) => state.addToWishlist);
  const removeFromWishlist = useWishlistStore((state) => state.removeFromWishlist);
  const isInWishlist = useWishlistStore((state) => state.isInWishlist);
  
  const product = SHOES.find((shoe) => shoe.id === id);
  
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [sizeChartOpen, setSizeChartOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([
    {
      id: '1',
      rating: 3,
      title: 'amazing',
      body: 'good product',
      author: 'Anonymous',
      date: '22 Feb 2026',
    },
  ]);

  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!product) {
    return (
      <div className="min-h-screen bg-[#0f1621]">
        <div className="max-w-6xl mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Product Not Found</h1>
          <Link href="/products" className="text-blue-500 hover:text-blue-400">
            ← Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error('❌ Please select a size first!', { autoClose: 2000 });
      return;
    }

    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity,
      size: selectedSize,
      color: selectedColor || product.colors[0],
      image: product.image,
    });

    toast.success(`✅ Added ${quantity}x ${product.name} to cart!`, { autoClose: 2000 });
  };

  const handleWishlistToggle = () => {
    if (isInWishlist(product.id)) {
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

  const handleReviewSubmitted = (newReview: { rating: number; title: string; body: string }) => {
    const review: Review = {
      id: String(reviews.length + 1),
      ...newReview,
      author: 'You',
      date: new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
    };

    setReviews([review, ...reviews]);
    toast.success('⭐ Review submitted successfully!', { autoClose: 2000 });
  };

  const handleDeleteReview = (reviewId: string) => {
    setReviews(reviews.filter((r) => r.id !== reviewId));
    toast.info('🗑️ Review deleted', { autoClose: 1500 });
  };

  return (
    <div className="min-h-screen bg-[#0a0f1a] flex flex-col text-white">

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <Link href="/products" className="text-gray-400 hover:text-white text-sm mb-6 inline-flex items-center gap-2 transition-colors">
            ← Back to Shop
          </Link>

          {/* Main Product Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mb-16">
            
            {/* LEFT: Image Container - Fixed UI */}
            <div className="relative aspect-square bg-gradient-to-tr from-[#1e293b] to-[#0f172a] rounded-[2rem] border border-gray-800 flex items-center justify-center p-12 shadow-2xl">
                {/* Subtle Glow behind shoe */}
                <div className="absolute inset-0 bg-purple-500/5 rounded-[2rem] blur-3xl" />
                
                <img
                    src={product.image}
                    alt={product.name}
                    className="relative z-10 w-full h-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] hover:scale-105 transition-transform duration-700"
                />
            </div>

            {/* RIGHT: Product Info */}
            <div className="flex flex-col">
              <p className="text-purple-400 font-bold uppercase tracking-[0.2em] text-xs mb-2 select-text selection:bg-purple-600 selection:text-white">{product.brand}</p>
              <h1 className="text-5xl font-black mb-4 tracking-tighter italic uppercase select-text selection:bg-purple-600 selection:text-white">{product.name}</h1>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex text-yellow-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className={star <= Math.round(product.rating) ? "text-yellow-400" : "text-gray-700"}>★</span>
                  ))}
                </div>
                <span className="text-gray-500 text-sm font-medium">({product.reviews} verified reviews)</span>
              </div>

              <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800 mb-8">
                <div className="flex items-baseline gap-4 mb-2">
                  <span className="text-4xl font-black select-text selection:bg-purple-600 selection:text-white">₹{product.price.toLocaleString()}</span>
                  <span className="text-gray-500 line-through select-text selection:bg-purple-600 selection:text-white">₹{product.originalPrice.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-emerald-400 font-bold text-sm select-text selection:bg-purple-600 selection:text-white">
                        Save ₹{(product.originalPrice - product.price).toLocaleString()} ({Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%)
                    </span>
                </div>
              </div>

              <p className="text-gray-400 leading-relaxed mb-8 text-lg select-text selection:bg-purple-600 selection:text-white">{product.description}</p>

              {/* Status */}
              <div className="flex items-center gap-3 mb-8">
                <div className={`h-2 w-2 rounded-full animate-pulse ${product.stock > 0 ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-red-500'}`} />
                <span className={`text-sm font-bold uppercase select-text selection:bg-purple-600 selection:text-white ${product.stock > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                    {product.stock > 0 ? 'In Stock' : 'Out of Stock'} — {product.stock} units ready
                </span>
              </div>

              {/* Options Section */}
              <div className="space-y-6 mb-8">
                {product.colors.length > 0 && (
                    <div>
                        <label className="block text-gray-500 text-[10px] uppercase font-black tracking-widest mb-3">Available Colors</label>
                        <div className="flex gap-2">
                            {product.colors.map((color: string) => (
                                <button
                                    key={color}
                                    onClick={() => setSelectedColor(color)}
                                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
                                        selectedColor === color ? 'bg-white text-black border-white' : 'bg-transparent text-gray-400 border-gray-800 hover:border-gray-600'
                                    }`}
                                >
                                    {color}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div>
                    <div className="flex items-center justify-between mb-3">
                        <label className="block text-gray-500 text-[10px] uppercase font-black tracking-widest">Select Size (US)</label>
                        <button
                            onClick={() => setSizeChartOpen(true)}
                            className="text-purple-400 hover:text-purple-300 text-[10px] font-bold uppercase tracking-widest transition-colors"
                        >
                            📏 Size Guide
                        </button>
                    </div>
                    <div className="grid grid-cols-5 gap-2">
                        {product.sizes.map((size: number) => (
                            <button
                                key={size}
                                onClick={() => setSelectedSize(size)}
                                className={`py-3 rounded-xl text-sm font-bold transition-all border ${
                                    selectedSize === size ? 'bg-white text-black border-white' : 'bg-transparent text-gray-400 border-gray-800 hover:border-gray-600'
                                }`}
                            >
                                {size}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="flex-1">
                        <label className="block text-gray-500 text-[10px] uppercase font-black tracking-widest mb-3">Quantity</label>
                        <div className="flex items-center justify-between bg-gray-900 border border-gray-800 rounded-xl p-1 max-w-[150px]">
                            <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 flex items-center justify-center hover:bg-gray-800 rounded-lg transition-colors">−</button>
                            <span className="font-bold">{quantity}</span>
                            <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 flex items-center justify-center hover:bg-gray-800 rounded-lg transition-colors">+</button>
                        </div>
                    </div>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={!product.stock}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:scale-[1.02] active:scale-[0.98] text-white font-black py-5 rounded-2xl transition-all disabled:opacity-50 disabled:hover:scale-100 shadow-xl shadow-purple-500/20 uppercase italic tracking-widest"
              >
                Add to Cart
              </button>

              {mounted && (
                <button
                  onClick={handleWishlistToggle}
                  className={`w-full font-black py-4 rounded-2xl transition-all uppercase italic tracking-widest border-2 mt-3 ${
                    isInWishlist(product.id)
                      ? 'bg-red-600 border-red-600 hover:bg-red-700 text-white'
                      : 'bg-transparent border-gray-700 hover:border-gray-600 text-gray-400 hover:text-gray-300'
                  }`}
                >
                  {isInWishlist(product.id) ? '❤️ Remove from Wishlist' : '🤍 Add to Wishlist'}
                </button>
              )}
            </div>
          </div>

          {/* Review Section */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 border-t border-gray-900 pt-16">
            <div className="lg:col-span-2">
              <ReviewForm productId={product.id} onReviewSubmitted={handleReviewSubmitted} />
            </div>
            <div className="lg:col-span-3">
              <ReviewsList reviews={reviews} onDeleteReview={handleDeleteReview} />
            </div>
          </div>
        </div>
      </div>

      {/* Size Chart Modal */}
      <SizeChart isOpen={sizeChartOpen} onClose={() => setSizeChartOpen(false)} />
    </div>
  );
}