'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/app/components/Navigation';
import { apiEndpoints, getApiUrl } from '@/lib/apiConfig';
import Link from 'next/link';
import { toast } from 'react-toastify';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email.trim()) {
      const errorMsg = 'Please enter your email address';
      setError(errorMsg);
      toast.error(`❌ ${errorMsg}`, { autoClose: 3000 });
      return;
    }

    // Check if email is valid
    if (!email.includes('@')) {
      const errorMsg = 'Please enter a valid email address';
      setError(errorMsg);
      toast.error(`❌ ${errorMsg}`, { autoClose: 3000 });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(getApiUrl(apiEndpoints.auth.forgotPassword), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process request');
      }

      toast.success('📧 Check your email for OTP code!', { autoClose: 2000 });
      setSubmitted(true);
      
      // Redirect to reset-password page with email
      setTimeout(() => {
        router.push(`/auth/reset-password?email=${encodeURIComponent(email)}`);
      }, 2000);
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to process request';
      setError(errorMsg);
      toast.error(`❌ ${errorMsg}`, { autoClose: 3000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1621]">
      <Navigation />

      <div className="max-w-md mx-auto px-4 py-16 md:py-24">
        <div className="bg-[#1a2332] rounded-2xl border border-[#2d3f52] p-8 space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Forgot Password?</h1>
            <p className="text-[#7a8ba8]">Enter your email and we'll send you an OTP to reset your password</p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 text-red-400 flex items-center gap-2">
              <span>❌</span> {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 text-green-400 flex items-center gap-2">
              <span>✅</span> {success}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-[#bfc8e6] mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@gmail.com"
                className="w-full bg-[#2d3f52] text-white px-4 py-3 rounded-lg border border-[#3d4f62] focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-bold py-3 rounded-lg transition-all disabled:cursor-not-allowed"
            >
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>

          {/* Back Links */}
          <div className="flex gap-3 justify-center text-sm">
            <Link href="/auth/login" className="text-purple-400 hover:text-purple-300 font-semibold">
              ← Back to Login
            </Link>
            <span className="text-[#3d4f62]">•</span>
            <Link href="/auth/signup" className="text-purple-400 hover:text-purple-300 font-semibold">
              Sign Up →
            </Link>
          </div>

          {/* Info */}
          <div className="bg-[#232a3a] rounded-lg p-4 text-sm text-[#bfc8e6]">
            <p className="font-semibold text-white mb-2">💡 Password Reset Help</p>
            <ul className="space-y-1 text-xs text-[#7a8ba8]">
              <li>• Check your spam/junk folder if you don't see the email</li>
              <li>• Reset links expire after 1 hour</li>
              <li>• Click the link in the email to create a new password</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
