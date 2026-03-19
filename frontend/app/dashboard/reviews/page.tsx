'use client';


import Link from 'next/link';

interface Review {
  id: string;
  productName: string;
  productImage: string;
  rating: number;
  title: string;
  body: string;
  date: string;
  helpful: number;
}

const mockReviews: Review[] = [
  {
    id: '1',
    productName: 'Nike Air Max 270',
    productImage: '👟',
    rating: 5,
    title: 'Absolutely Comfortable!',
    body: 'These shoes are incredibly comfortable for all-day wear. The cushioning is excellent and they look great too.',
    date: '2024-01-10',
    helpful: 15,
  },
  {
    id: '2',
    productName: 'Adidas Ultraboost',
    productImage: '👞',
    rating: 4,
    title: 'Great Quality, Excellent Support',
    body: 'Really good shoes for running. The support is amazing but they took a few days to break in.',
    date: '2024-01-05',
    helpful: 8,
  },
  {
    id: '3',
    productName: 'Puma RS-X',
    productImage: '👠',
    rating: 5,
    title: 'Love These!',
    body: 'Perfect for casual wear. The style matches any outfit and they feel great on my feet.',
    date: '2023-12-28',
    helpful: 12,
  },
];

export default function ReviewsPage() {
  return (
    <div className="min-h-screen bg-[#0f1621]">

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard" className="text-blue-500 hover:text-blue-400 text-sm mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold text-white mb-2">My Reviews</h1>
          <p className="text-[#7a8ba8]">Manage and view all your product reviews</p>
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {mockReviews.map((review) => (
            <div
              key={review.id}
              className="bg-gradient-to-br from-[#181e2a] to-[#1a2535] border border-[#232a3a] rounded-2xl p-6 hover:border-[#3d4f62] transition-all"
            >
              <div className="flex gap-4 md:gap-6">
                {/* Product Image */}
                <div className="w-20 h-20 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-lg flex items-center justify-center flex-shrink-0 text-4xl border border-[#3d4f62]">
                  {review.productImage}
                </div>

                {/* Review Content */}
                <div className="flex-1">
                  <h3 className="text-white font-bold mb-2">{review.productName}</h3>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={i < review.rating ? 'text-yellow-400' : 'text-[#3d4f62]'}>
                          ★
                        </span>
                      ))}
                    </div>
                    <span className="text-white font-semibold">{review.rating}.0</span>
                  </div>

                  {/* Review Title and Body */}
                  <h4 className="text-[#bfc8e6] font-semibold mb-2">{review.title}</h4>
                  <p className="text-[#7a8ba8] text-sm mb-3">{review.body}</p>

                  {/* Description */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#7a8ba8]">
                      Reviewed on {new Date(review.date).toLocaleDateString('en-IN')}
                    </span>
                    <div className="flex gap-3">
                      <button className="text-[#7a8ba8] hover:text-white transition">
                        👍 {review.helpful} Helpful
                      </button>
                      <button className="text-red-500 hover:text-red-400 transition">Delete</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {mockReviews.length === 0 && (
          <div className="bg-gradient-to-br from-[#181e2a] to-[#1a2535] border border-[#232a3a] rounded-2xl p-16 text-center">
            <div className="text-4xl mb-4">✍️</div>
            <h2 className="text-2xl font-bold text-white mb-4">No reviews yet</h2>
            <p className="text-[#7a8ba8] mb-8">Start reviewing products you've purchased</p>
            <Link
              href="/products"
              className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-8 rounded-lg transition-all"
            >
              Shop Now
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
