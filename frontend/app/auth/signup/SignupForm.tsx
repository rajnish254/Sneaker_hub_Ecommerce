'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { authAPI } from '@/lib/api';
import { apiEndpoints, getApiUrl } from '@/lib/apiConfig';
import { GoogleLogin } from '@react-oauth/google';
import OTPVerification from '@/app/components/OTPVerification';
import { toast } from 'react-toastify';

export default function SignupForm() {
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const router = useRouter();
  const setUser = useStore((state) => state.setUser);
  const setToken = useStore((state) => state.setToken);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Google Sign-Up Handler
  const handleGoogleSuccess = async (credentialResponse: any) => {
    setError('');
    setLoading(true);

    try {
      // console.log('🔐 Verifying Google credentials...');

      const response = await fetch(getApiUrl(apiEndpoints.auth.googleVerify), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: credentialResponse.credential,
          allowSignup: true
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        // Check if account already exists (409 Conflict)
        if (response.status === 409 && errorData.accountExists) {
          const errorMsg = 'Account already exists with this email. Please sign in instead.';
          setError(errorMsg);
          toast.error(`❌ ${errorMsg}`, { autoClose: 3000 });
          throw new Error(errorMsg);
        }
        
        throw new Error(errorData.error || 'Google signup failed');
      }

      const data = await response.json();
      
      // console.log('✅ Google signup successful');
      // console.log('📦 Token:', data.token);
      // console.log('👤 User:', data.user);

      // Store token in localStorage first
      if (typeof window !== 'undefined' && data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      // Update Zustand store
      setToken(data.token);
      setUser(data.user);

      toast.success('✅ Google signup successful!', { autoClose: 2000 });
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Google signup error:', err);
      const errorMsg = err.message || 'Google Sign-Up failed. Please try again.';
      setError(errorMsg);
      toast.error(`❌ ${errorMsg}`, { autoClose: 3000 });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    const errorMsg = 'Google Sign-Up failed. Please try again.';
    setError(errorMsg);
    toast.error(`❌ ${errorMsg}`, { autoClose: 3000 });
    console.error('Google Sign-Up error');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      const errorMsg = 'Please enter your full name';
      setError(errorMsg);
      toast.error(`❌ ${errorMsg}`, { autoClose: 3000 });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      const errorMsg = 'Passwords do not match';
      setError(errorMsg);
      toast.error(`❌ ${errorMsg}`, { autoClose: 3000 });
      return;
    }

    if (formData.password.length < 6) {
      const errorMsg = 'Password must be at least 6 characters';
      setError(errorMsg);
      toast.error(`❌ ${errorMsg}`, { autoClose: 3000 });
      return;
    }

    if (!agreeToTerms) {
      const errorMsg = 'Please agree to the terms and conditions';
      setError(errorMsg);
      toast.error(`❌ ${errorMsg}`, { autoClose: 3000 });
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.register(
        formData.firstName,
        formData.lastName,
        formData.email,
        formData.password
      );

      toast.success('✅ Verification email sent!', { autoClose: 2000 });
      // Move to OTP verification step
      setStep('otp');
    } catch (err: any) {
      const errorMsg = err.message || 'Signup failed. Please try again.';
      setError(errorMsg);
      toast.error(`❌ ${errorMsg}`, { autoClose: 3000 });
      console.error('Signup error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {step === 'otp' ? (
        <OTPVerification 
          email={formData.email}
          onBack={() => setStep('form')}
        />
      ) : (
        <div className="w-full max-w-md">
          <form onSubmit={handleSubmit} className="bg-[#1a2332] rounded-2xl border border-[#2d3f52] p-8 space-y-6">
            {/* First Name Field */}
            <div>
              <label className="block text-sm text-[#bfc8e6] mb-2">First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="John"
                className="w-full bg-[#2d3f52] text-white px-4 py-3 rounded-lg border border-[#3d4f62] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-500"
                required
              />
            </div>

            {/* Last Name Field */}
            <div>
              <label className="block text-sm text-[#bfc8e6] mb-2">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Doe"
                className="w-full bg-[#2d3f52] text-white px-4 py-3 rounded-lg border border-[#3d4f62] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-500"
                required
              />
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm text-[#bfc8e6] mb-2">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your.email@gmail.com"
                className="w-full bg-[#2d3f52] text-white px-4 py-3 rounded-lg border border-[#3d4f62] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-500"
                required
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm text-[#bfc8e6] mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full bg-[#2d3f52] text-white px-4 py-3 rounded-lg border border-[#3d4f62] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-300"
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              <p className="text-xs text-[#7a8ba8] mt-1">At least 6 characters</p>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-sm text-[#bfc8e6] mb-2">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full bg-[#2d3f52] text-white px-4 py-3 rounded-lg border border-[#3d4f62] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-500"
                  required
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

            {/* Error Message */}
            {error && (
              <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Terms & Conditions */}
            <div className="flex items-start">
              <input
                type="checkbox"
                id="terms"
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
                className="accent-purple-500 w-4 h-4 mt-1 cursor-pointer"
              />
              <label htmlFor="terms" className="ml-2 text-sm text-[#bfc8e6] cursor-pointer">
                I agree to the{' '}
                <Link href="#" className="text-purple-400 hover:text-purple-300">
                  Terms & Conditions
                </Link>
              </label>
            </div>

            {/* Sign Up Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black py-3 rounded-lg font-bold hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <span>✓</span>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-[#3d4f62]"></div>
              <span className="text-xs text-[#7a8ba8]">or sign up with</span>
              <div className="flex-1 h-px bg-[#3d4f62]"></div>
            </div>

            {/* Google Sign-Up Button */}
            <div className="w-full" style={{ overflow: 'visible' }}>
              <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  theme="filled_blue"
                  size="large"
                  width="360"
                />
              </div>
            </div>

            {/* Sign In Link */}
            <p className="text-center text-sm text-[#7a8ba8]">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-purple-400 hover:text-purple-300 font-semibold">
                Sign In
              </Link>
            </p>
          </form>

          {/* Features */}
          <div className="flex justify-around mt-12 gap-4">
            <div className="text-center">
              <div className="text-2xl mb-2">🔒</div>
              <p className="text-xs text-[#7a8ba8]">Secure</p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">⚡</div>
              <p className="text-xs text-[#7a8ba8]">Fast</p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">✨</div>
              <p className="text-xs text-[#7a8ba8]">Easy</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
