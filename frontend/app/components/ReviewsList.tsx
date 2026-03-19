'use client';

import { useState } from 'react';

interface Review {
  id: string;
  rating: number;
  title: string;
  body: string;
  author: string;
  date: string;
}

interface ReviewsListProps {
  reviews: Review[];
  onDeleteReview?: (reviewId: string) => void;
}

export default function ReviewsList({ reviews, onDeleteReview }: ReviewsListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Calculate average rating and distribution
  const averageRating = reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : '0';
  
  const ratingDistribution = {
    5: reviews.filter((r) => r.rating === 5).length,
    4: reviews.filter((r) => r.rating === 4).length,
    3: reviews.filter((r) => r.rating === 3).length,
    2: reviews.filter((r) => r.rating === 2).length,
    1: reviews.filter((r) => r.rating === 1).length,
  };

  const maxCount = Math.max(...Object.values(ratingDistribution), 1);

  const handleDelete = (reviewId: string) => {
    if (confirm('Are you sure you want to delete this review?')) {
      setDeletingId(reviewId);
      onDeleteReview?.(reviewId);
      setTimeout(() => setDeletingId(null), 300);
    }
  };

  return (
    <div className="space-y-8">
      {/* Rating Summary */}
      <div className="bg-[#181e2a] border border-[#232a3a] rounded-lg p-6">
        <h3 className="text-2xl font-bold text-white mb-6">Customer Reviews</h3>

        {/* Rating Overview */}
        <div className="mb-8">
          <div className="flex items-start gap-4">
            {/* Average Rating */}
            <div className="text-center">
              <div className="text-5xl font-bold text-white mb-2">{averageRating}</div>
              <div className="flex gap-1 justify-center mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`text-lg ${
                      star <= Math.round(parseFloat(averageRating))
                        ? 'text-yellow-400'
                        : 'text-[#3d4f62]'
                    }`}
                  >
                    ★
                  </span>
                ))}
              </div>
              <p className="text-[#7a8ba8] text-sm">Based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
            </div>

            {/* Rating Distribution */}
            <div className="flex-1 space-y-3">
              {[5, 4, 3, 2, 1].map((stars) => (
                <div key={stars} className="flex items-center gap-3">
                  <span className="text-[#bfc8e6] font-medium w-4">{stars}</span>
                  <span className="text-yellow-400">★</span>
                  <div className="flex-1 bg-[#2d3f52] rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-yellow-400 h-full transition-all duration-300"
                      style={{
                        width: `${maxCount > 0 ? (ratingDistribution[stars as keyof typeof ratingDistribution] / maxCount) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <span className="text-[#7a8ba8] text-sm w-8 text-right">{ratingDistribution[stars as keyof typeof ratingDistribution]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Individual Reviews */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="bg-[#181e2a] border border-[#232a3a] rounded-lg p-8 text-center">
            <p className="text-[#7a8ba8]">No reviews yet. Be the first to review this product!</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div
              key={review.id}
              className={`bg-[#181e2a] border border-[#232a3a] rounded-lg p-6 transition-all ${
                deletingId === review.id ? 'opacity-50' : ''
              }`}
            >
              {/* Review Header */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  {/* Rating and Title */}
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={`text-lg ${
                            star <= review.rating ? 'text-yellow-400' : 'text-[#3d4f62]'
                          }`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <span className="text-[#bfc8e6] font-semibold">{review.rating}.0</span>
                  </div>

                  {/* Review Title */}
                  <h4 className="text-lg font-bold text-white mb-2">{review.title}</h4>
                </div>

                {/* Delete Button */}
                <button
                  onClick={() => handleDelete(review.id)}
                  className="text-red-500 hover:text-red-400 font-semibold text-sm transition"
                >
                  ✕ Delete
                </button>
              </div>

              {/* Review Body */}
              <p className="text-[#bfc8e6] mb-4 leading-relaxed">{review.body}</p>

              {/* Author and Date */}
              <div className="flex items-center justify-between text-sm text-[#7a8ba8]">
                <span>By {review.author}</span>
                <span>{review.date}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
