'use client';

import { Suspense } from 'react';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiEndpoints, getApiUrl } from '@/lib/apiConfig';
import Link from 'next/link';
import { toast } from 'react-toastify';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  // Resend OTP timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  useEffect(() => {
    if (!email) {
      setError('Invalid request. Please start from forgot password page.');
      setTimeout(() => {
        router.push('/auth/forgot-password');
      }, 2000);
    }
  }, [email, router]);

  const handleResendOTP = async () => {
    setError('');
    setResendLoading(true);

    try {
      const response = await fetch(getApiUrl(apiEndpoints.auth.forgotPassword), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend OTP');
      }

      toast.success('📧 OTP resent to your email!', { autoClose: 2000 });
      setResendTimer(60); // 60 second cooldown
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to resend OTP';
      setError(errorMsg);
      toast.error(`❌ ${errorMsg}`, { autoClose: 3000 });
    } finally {
      setResendLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!otp.trim()) {
      const errorMsg = 'Please enter the OTP from your email';
      setError(errorMsg);
      toast.error(`❌ ${errorMsg}`, { autoClose: 3000 });
      return;
    }

    if (otp.length !== 6 || !/^\d+$/.test(otp)) {
      const errorMsg = 'OTP must be 6 digits';
      setError(errorMsg);
      toast.error(`❌ ${errorMsg}`, { autoClose: 3000 });
      return;
    }

    if (!password.trim() || !confirmPassword.trim()) {
      const errorMsg = 'Please enter both passwords';
      setError(errorMsg);
      toast.error(`❌ ${errorMsg}`, { autoClose: 3000 });
      return;
    }

    if (password !== confirmPassword) {
      const errorMsg = 'Passwords do not match';
      setError(errorMsg);
      toast.error(`❌ ${errorMsg}`, { autoClose: 3000 });
      return;
    }

    if (password.length < 6) {
      const errorMsg = 'Password must be at least 6 characters';
      setError(errorMsg);
      toast.error(`❌ ${errorMsg}`, { autoClose: 3000 });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(getApiUrl(apiEndpoints.auth.resetPassword), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          otp,
          newPassword: password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      toast.success('✅ Password reset successfully!', { autoClose: 2000 });
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to reset password';
      setError(errorMsg);
      toast.error(`❌ ${errorMsg}`, { autoClose: 3000 });
    } finally {
      setLoading(false);
    }
  };

  if (!email) {
    return (
      <div className="min-h-screen bg-[#0f1621]">
        <div className="max-w-md mx-auto px-4 py-16 md:py-24">
          <div className="bg-[#1a2332] rounded-2xl border border-[#2d3f52] p-8 text-center">
            <p className="text-[#7a8ba8]">Redirecting to forgot password page...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1621]">

      <div className="max-w-md mx-auto px-4 py-16 md:py-24">
        <div className="bg-[#1a2332] rounded-2xl border border-[#2d3f52] p-8 space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Reset Password</h1>
            <p className="text-[#7a8ba8]">Enter the OTP code from your email and create a new password</p>
            {email && (
              <p className="text-xs text-[#6b7280] mt-3 bg-[#232a3a] px-3 py-2 rounded">
                📧 Code sent to: <span className="text-[#bfc8e6] break-all">{email}</span>
              </p>
            )}
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
          {!success && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* OTP */}
              <div>
                <label className="block text-sm text-[#bfc8e6] mb-2">OTP Code</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  disabled={loading}
                  className="w-full bg-[#2d3f52] text-white px-4 py-3 rounded-lg border border-[#3d4f62] focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-500 text-center text-xl letter-spacing disabled:opacity-60 disabled:cursor-not-allowed"

                />
                <p className="text-xs text-[#7a8ba8] mt-1">Enter the 6-digit code from your email</p>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm text-[#bfc8e6] mb-2">New Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={loading}
                    className="w-full bg-[#2d3f52] text-white px-4 py-3 rounded-lg border border-[#3d4f62] focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-500 disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-300"
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm text-[#bfc8e6] mb-2">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={loading}
                    className="w-full bg-[#2d3f52] text-white px-4 py-3 rounded-lg border border-[#3d4f62] focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-500 disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-300"
                  >
                    {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-bold py-3 rounded-lg transition-all disabled:cursor-not-allowed"
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>

              {/* Resend OTP Button */}
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={resendLoading || resendTimer > 0}
                className="w-full bg-[#2d3f52] hover:bg-[#3d4f62] disabled:bg-[#1f2a38] text-white font-semibold py-3 rounded-lg transition-all disabled:cursor-not-allowed border border-[#3d4f62]"
              >
                {resendLoading ? '⏳ Sending...' : resendTimer > 0 ? `📧 Resend OTP (${resendTimer}s)` : '📧 Resend OTP'}
              </button>
            </form>
          )}

          {/* Back Link */}
          <div className="text-center">
            <Link href="/auth/forgot-password" className="text-purple-400 hover:text-purple-300 font-semibold text-sm">
              ← Back to Forgot Password
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0f1621]">
        <div className="max-w-md mx-auto px-4 py-16 md:py-24">
          <div className="bg-[#1a2332] rounded-2xl border border-[#2d3f52] p-8 text-center">
            <p className="text-[#7a8ba8]">Loading...</p>
          </div>
        </div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
