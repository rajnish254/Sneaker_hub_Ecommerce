'use client';

import { useState } from 'react';

interface ReviewFormProps {
  productId?: string;
  onReviewSubmitted: (review: {
    rating: number;
    title: string;
    body: string;
  }) => void;
}

export default function ReviewForm({ onReviewSubmitted }: ReviewFormProps) {
  const [rating, setRating] = useState(3);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !body.trim()) {
      alert('Please fill in all fields');
      return;
    }

    onReviewSubmitted({
      rating,
      title,
      body,
    });

    // Reset form
    setRating(3);
    setTitle('');
    setBody('');
  };

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition"
      >
        Write a Review
      </button>
    );
  }

  return (
    <div className="bg-[#1a2332] border border-[#232a3a] rounded-lg p-6 max-w-md">
      <h3 className="text-xl font-bold text-white mb-6">Write a Review</h3>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Rating */}
        <div>
          <label className="block text-white font-semibold mb-3">
            Rating <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="text-3xl transition-transform hover:scale-110"
              >
                <span
                  className={
                    star <= rating ? 'text-yellow-400 drop-shadow-lg' : 'text-[#3d4f62]'
                  }
                >
                  ★
                </span>
              </button>
            ))}
          </div>
          <p className="text-[#7a8ba8] text-xs mt-2">Click stars to select a rating</p>
        </div>

        {/* Review Title */}
        <div>
          <label className="block text-white font-semibold mb-2">
            Review Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value.slice(0, 100))}
            placeholder="Amazing product!"
            maxLength={100}
            className="w-full bg-[#2d3f52] border border-[#3d4f62] text-white placeholder-[#7a8ba8] rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
          />
          <p className="text-[#7a8ba8] text-xs mt-1">{title.length}/100</p>
        </div>

        {/* Review Body */}
        <div>
          <label className="block text-white font-semibold mb-2">
            Your Review <span className="text-red-500">*</span>
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value.slice(0, 1000))}
            placeholder="Share your thoughts about this product..."
            maxLength={1000}
            rows={4}
            className="w-full bg-[#2d3f52] border border-[#3d4f62] text-white placeholder-[#7a8ba8] rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 resize-none"
          />
          <p className="text-[#7a8ba8] text-xs mt-1">{body.length}/1000</p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
          >
            ✓ Submit Review
          </button>
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="flex-1 bg-[#2d3f52] hover:bg-[#3d4f62] text-white font-semibold py-3 rounded-lg transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
