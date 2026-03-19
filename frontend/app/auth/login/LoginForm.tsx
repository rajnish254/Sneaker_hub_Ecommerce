'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { authAPI } from '@/lib/api';
import { toast } from 'react-toastify';

import { apiEndpoints, getApiUrl } from '@/lib/apiConfig';
import { GoogleLogin } from '@react-oauth/google';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const setUser = useStore((state) => state.setUser);
  const setToken = useStore((state) => state.setToken);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login(email, password);
      
      // Store token and user data in Zustand store
      setToken(response.token);
      setUser(response.user);

      toast.success('✅ Login successful!', { autoClose: 2000 });
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err: any) {
      const errorMsg = err.message || 'Login failed. Please try again.';
      setError(errorMsg);
      toast.error(`❌ ${errorMsg}`, { autoClose: 3000 });
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.guestLogin();
      setUser(response.user);
      toast.success('✅ Welcome as guest!', { autoClose: 2000 });
      router.push('/products');
    } catch (err: any) {
      const errorMsg = err.message || 'Guest login failed. Please try again.';
      setError(errorMsg);
      toast.error(`❌ ${errorMsg}`, { autoClose: 3000 });
      console.error('Guest login error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Google Sign-In Handler
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
          token: credentialResponse.credential
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        // Check if user needs to sign up (401 Unauthorized with requiresSignup flag)
        if (response.status === 401 && errorData.requiresSignup) {
          const errorMsg = 'Account does not exist. Please sign up first.';
          setError(errorMsg);
          toast.info(`ℹ️ ${errorMsg}`, { autoClose: 4000 });
          // Could optionally redirect to signup here
          throw new Error(errorMsg);
        }
        
        throw new Error(errorData.error || 'Google authentication failed');
      }

      const data = await response.json();
      
      // console.log('✅ Google login successful');
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

      toast.success('✅ Google login successful!', { autoClose: 2000 });
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Google login error:', err);
      const errorMsg = err.message || 'Google Sign-In failed. Please try again.';
      setError(errorMsg);
      toast.error(`❌ ${errorMsg}`, { autoClose: 3000 });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google Sign-In failed. Please try again.');
    console.error('Google Sign-In error');
  };

  return (
    <div className="w-full max-w-md">
      <form onSubmit={handleSubmit} className="bg-[#1a2332] rounded-2xl border border-[#2d3f52] p-8 space-y-6">
        {/* Email Field */}
        <div>
          <label className="block text-sm text-[#bfc8e6] mb-2">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your.email@gmail.com"
            className="w-full bg-[#2d3f52] text-white px-4 py-3 rounded-lg border border-[#3d4f62] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-500"
            required
          />
        </div>

        {/* Password Field */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm text-[#bfc8e6]">Password</label>
            <Link href="/auth/forgot-password" className="text-xs text-purple-400 hover:text-purple-300">
              Forgot?
            </Link>
          </div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 text-red-400 text-sm space-y-3">
            <p>{error}</p>
            {error.includes('sign up first') && (
              <Link href="/auth/signup" className="block text-center bg-red-600/30 hover:bg-red-600/50 py-2 rounded transition font-semibold text-white">
                → Go to Sign Up
              </Link>
            )}
          </div>
        )}

        {/* Remember Me */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="remember"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="accent-purple-500 w-4 h-4 cursor-pointer"
          />
          <label htmlFor="remember" className="ml-2 text-sm text-[#bfc8e6] cursor-pointer">
            Remember me
          </label>
        </div>

        {/* Sign In Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-white text-black py-3 rounded-lg font-bold hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <span>✓</span>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-[#3d4f62]"></div>
          <span className="text-xs text-[#7a8ba8]">or continue as</span>
          <div className="flex-1 h-px bg-[#3d4f62]"></div>
        </div>

        {/* Google Sign-In Button */}
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

        {/* Guest Login */}
        <button
          type="button"
          onClick={handleGuestLogin}
          className="w-full bg-[#2d3f52] border border-[#3d4f62] text-white py-3 rounded-lg font-semibold hover:bg-[#3d4f62] transition flex items-center justify-center gap-2"
        >
          <span>👤</span>
          Continue as Guest
        </button>

        {/* Sign Up Link */}
        <p className="text-center text-sm text-[#7a8ba8]">
          Don't have an account?{' '}
          <Link href="/auth/signup" className="text-purple-400 hover:text-purple-300 font-semibold">
            Sign Up
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
  );
}
