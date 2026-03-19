'use client';


import Link from 'next/link';

interface ViewedProduct {
  id: string;
  name: string;
  brand: string;
  price: number;
  image: string;
  rating: number;
  reviews: number;
  viewedOn: string;
}

const mockViewed: ViewedProduct[] = [
  {
    id: '1',
    name: 'Nike Air Max 270',
    brand: 'Nike',
    price: 13995,
    image: '👟',
    rating: 4.8,
    reviews: 234,
    viewedOn: '2024-01-15',
  },
  {
    id: '2',
    name: 'Adidas Ultraboost 22',
    brand: 'Adidas',
    price: 17999,
    image: '👞',
    rating: 4.6,
    reviews: 189,
    viewedOn: '2024-01-14',
  },
  {
    id: '3',
    name: 'Puma RS-X Sneaker',
    brand: 'Puma',
    price: 8999,
    image: '👠',
    rating: 4.5,
    reviews: 156,
    viewedOn: '2024-01-13',
  },
  {
    id: '4',
    name: 'New Balance 990v5',
    brand: 'New Balance',
    price: 20995,
    image: '🎽',
    rating: 4.9,
    reviews: 321,
    viewedOn: '2024-01-12',
  },
];

export default function ViewedPage() {
  return (
    <div className="min-h-screen bg-[#0f1621]">

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard" className="text-blue-500 hover:text-blue-400 text-sm mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold text-white mb-2">Recently Viewed</h1>
          <p className="text-[#7a8ba8]">Keep track of products you've checked out</p>
        </div>

        {/* Viewed Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {mockViewed.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="group bg-gradient-to-br from-[#181e2a] to-[#1a2535] border border-[#232a3a] rounded-2xl overflow-hidden hover:border-[#3d4f62] hover:shadow-xl transition-all duration-300"
            >
              {/* Image */}
              <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 h-72 flex items-center justify-center text-7xl group-hover:scale-110 transition-transform duration-300">
                {product.image}
              </div>

              {/* Content */}
              <div className="p-5">
                <p className="text-[#7a8ba8] text-xs uppercase tracking-wider font-bold mb-1">
                  {product.brand}
                </p>
                <h3 className="text-white font-bold text-sm mb-3 line-clamp-2 group-hover:text-purple-400 transition">
                  {product.name}
                </h3>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-yellow-400">★</span>
                  <span className="text-white font-semibold text-sm">{product.rating}</span>
                  <span className="text-[#7a8ba8] text-xs">({product.reviews})</span>
                </div>

                {/* Price */}
                <div className="mb-4">
                  <p className="text-white font-black text-lg">₹{product.price.toLocaleString()}</p>
                </div>

                {/* Viewed Date */}
                <p className="text-[#7a8ba8] text-xs mt-2 pt-2 border-t border-[#232a3a]">
                  Viewed: {new Date(product.viewedOn).toLocaleDateString('en-IN')}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {mockViewed.length === 0 && (
          <div className="bg-gradient-to-br from-[#181e2a] to-[#1a2535] border border-[#232a3a] rounded-2xl p-16 text-center">
            <div className="text-4xl mb-4">👁️</div>
            <h2 className="text-2xl font-bold text-white mb-4">You haven't viewed any products yet</h2>
            <p className="text-[#7a8ba8] mb-8">Start exploring our collection to track your browsing history</p>
            <Link
              href="/products"
              className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-8 rounded-lg transition-all"
            >
              Explore Products
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
