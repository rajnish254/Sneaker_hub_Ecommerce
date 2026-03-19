'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { apiEndpoints, getApiUrl } from '@/lib/apiConfig';

interface OTPVerificationProps {
  email: string;
  onSuccess?: () => void;
  onBack?: () => void;
}

export default function OTPVerification({ email, onSuccess, onBack }: OTPVerificationProps) {
  const [otp, setOtp] = useState(Array(6).fill(''));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState('');
  const router = useRouter();
  const setUser = useStore((state) => state.setUser);
  const setToken = useStore((state) => state.setToken);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(-1);
    }
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus to next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) (nextInput as HTMLInputElement).focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) (prevInput as HTMLInputElement).focus();
    }
  };

  const handleVerifyOtp = async () => {
    setError('');
    const otpCode = otp.join('');

    if (otpCode.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(getApiUrl(apiEndpoints.auth.verifyOtp), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otpCode })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'OTP verification failed');
      }

      const data = await response.json();
      
      // Store user data
      setToken(data.token);
      setUser(data.user);

      setResendSuccess('✅ Email verified! Redirecting...');
      setTimeout(() => {
        onSuccess?.();
        router.push('/dashboard');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setResendLoading(true);
    setError('');
    setResendSuccess('');

    try {
      const response = await fetch(getApiUrl(apiEndpoints.auth.resendOtp), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to resend OTP');
      }

      setResendSuccess('✅ New OTP sent to your email');
      setOtp(Array(6).fill(''));
    } catch (err: any) {
      setError(err.message || 'Failed to resend OTP');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-[#1a2332] rounded-2xl border border-[#2d3f52] p-8 space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Verify Your Email</h2>
          <p className="text-[#7a8ba8]">We sent a 6-digit code to {email}</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 text-red-400 flex items-center gap-2">
            <span>❌</span> {error}
          </div>
        )}

        {/* Success Message */}
        {resendSuccess && (
          <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 text-green-400 flex items-center gap-2">
            <span>✅</span> {resendSuccess}
          </div>
        )}

        {/* OTP Input */}
        <div>
          <label className="block text-sm text-[#bfc8e6] mb-4">Enter OTP</label>
          <div className="flex gap-2 justify-center mb-6">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                placeholder="0"
                className="w-12 h-12 bg-[#2d3f52] text-white text-xl font-bold text-center rounded-lg border border-[#3d4f62] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            ))}
          </div>
        </div>

        {/* Verify Button */}
        <button
          onClick={handleVerifyOtp}
          disabled={loading || otp.join('').length !== 6}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-all"
        >
          {loading ? 'Verifying...' : 'Verify OTP'}
        </button>

        {/* Resend OTP */}
        <div className="text-center">
          <p className="text-[#7a8ba8] text-sm mb-2">Didn't receive the code?</p>
          <button
            onClick={handleResendOtp}
            disabled={resendLoading}
            className="text-purple-400 hover:text-purple-300 font-semibold text-sm disabled:opacity-50"
          >
            {resendLoading ? 'Sending...' : 'Resend OTP'}
          </button>
        </div>

        {/* Back Button */}
        {onBack && (
          <button
            onClick={onBack}
            className="w-full text-[#7a8ba8] hover:text-white font-semibold py-2 rounded-lg border border-[#3d4f62] transition"
          >
            ← Back
          </button>
        )}
      </div>
    </div>
  );
}
