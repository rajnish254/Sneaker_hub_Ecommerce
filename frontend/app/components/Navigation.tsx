'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { useWishlistStore } from '@/lib/wishlistStore';

export default function Navigation() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [wishlistDisplay, setWishlistDisplay] = useState(0);
  const pathname = usePathname();
  const router = useRouter();
  
  const user = useStore((state) => state.user);
  const isAuthenticated = useStore((state) => state.isAuthenticated);
  const cart = useStore((state) => state.cart);
  const logout = useStore((state) => state.logout);
  const loadUserFromStorage = useStore((state) => state.loadUserFromStorage);

  // Get wishlist from Zustand store
  const wishlist = useWishlistStore((state) => state.wishlist);
  const loadWishlistFromStorage = useWishlistStore((state) => state.loadWishlistFromStorage);
  const clearWishlist = useWishlistStore((state) => state.clearWishlist);

  // Load user and wishlist from localStorage on mount
  useEffect(() => {
    loadUserFromStorage();
    loadWishlistFromStorage();
    setMounted(true);
  }, [loadUserFromStorage, loadWishlistFromStorage]);

  // Update wishlist display when store changes
  useEffect(() => {
    setWishlistDisplay(wishlist.length);
  }, [wishlist]);

  // Clear wishlist when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      clearWishlist();
      setWishlistDisplay(0);
    }
  }, [isAuthenticated, clearWishlist]);

  useEffect(() => {
    setShowDropdown(false);
  }, [pathname]);

  const handleLogout = () => {
    clearWishlist();
    logout();
    router.push('/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-[#0f1621] via-[#1a1f2e] to-[#0f1621] border-b border-purple-500/20 shadow-lg shadow-purple-500/10">
      <div className="max-w-full px-8 py-5 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 hover:scale-105 transition-transform duration-300">
          <span className="text-3xl drop-shadow-lg">👟</span>
          <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">SneakHub</span>
        </Link>

        {/* Center Navigation */}
        <div className="flex gap-8 items-center">
          <Link href="/" className="text-[#bfc8e6] hover:text-purple-400 transition font-semibold relative group">
            Home
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-400 to-pink-400 group-hover:w-full transition-all duration-300"></span>
          </Link>
          <Link href="/products" className="text-[#bfc8e6] hover:text-purple-400 transition font-semibold relative group">
            Shop
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-400 to-pink-400 group-hover:w-full transition-all duration-300"></span>
          </Link>
          <Link href="/wishlist" className="text-pink-400 hover:text-pink-300 transition text-xl hover:scale-110 duration-300 relative group">
            ❤️
            {wishlistDisplay > 0 && (
              <span className="absolute -top-2 -right-2 bg-gradient-to-r from-pink-500 to-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-lg">
                {wishlistDisplay}
              </span>
            )}
          </Link>
        </div>

        {/* Right Side */}
        <div className="flex gap-4 items-center">
          <Link
            href="/cart"
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-2.5 rounded-lg font-bold transition-all shadow-lg shadow-purple-500/50 inline-flex items-center gap-2 relative hover:shadow-xl"
          >
            🛒 Cart
            {cart.length > 0 && (
              <span className="absolute -top-3 -right-3 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-lg">
                {cart.length}
              </span>
            )}
          </Link>

          {mounted && isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-purple-500/50 hover:border-purple-400 hover:bg-purple-500/10 transition-all text-white shadow-md hover:shadow-lg"
              >
                <span className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                  {user.firstName ? user.firstName[0].toUpperCase() : 'U'}
                </span>
                <span className="text-[#bfc8e6] text-sm hidden sm:inline">
                  {user.isGuest ? 'Guest' : user.firstName}
                </span>
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-3 w-56 bg-gradient-to-br from-[#181e2a] to-[#1a2535] border border-purple-500/30 rounded-xl shadow-2xl shadow-purple-500/20 py-2 z-50 backdrop-blur-sm">
                  <div className="px-4 py-3 border-b border-[#232a3a]">
                    <p className="text-white font-semibold text-sm">
                      {user.isGuest ? 'Guest User' : user.firstName}
                    </p>
                    <p className="text-[#7a8ba8] text-xs">{user.email || 'guest@temporary'}</p>
                  </div>
                  {!user.isGuest && (
                    <>
                      <Link
                        href="/dashboard"
                        className="block px-4 py-2 text-[#bfc8e6] hover:bg-[#232a3a] transition text-sm flex items-center gap-2"
                        onClick={() => setShowDropdown(false)}
                      >
                        <span>📊</span> Dashboard
                      </Link>
                      <Link
                        href="/dashboard/profile"
                        className="block px-4 py-2 text-[#bfc8e6] hover:bg-[#232a3a] transition text-sm flex items-center gap-2"
                        onClick={() => setShowDropdown(false)}
                      >
                        <span>👤</span> My Profile
                      </Link>
                      <Link
                        href="/dashboard/orders"
                        className="block px-4 py-2 text-[#bfc8e6] hover:bg-[#232a3a] transition text-sm flex items-center gap-2"
                        onClick={() => setShowDropdown(false)}
                      >
                        <span>📦</span> My Orders
                      </Link>
                    </>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-red-400 hover:bg-red-900/20 transition font-medium text-sm flex items-center gap-2"
                  >
                    <span>🚪</span> Logout
                  </button>
                </div>
              )}
            </div>
          ) : mounted ? (
            <div className="flex gap-2">
              <Link
                href="/auth/login"
                className="px-4 py-2.5 text-[#bfc8e6] border border-purple-500/50 rounded-lg hover:border-purple-400 hover:text-purple-300 transition font-medium text-sm hover:bg-purple-500/10"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition font-medium text-sm shadow-lg shadow-purple-500/50"
              >
                Sign Up
              </Link>
            </div>
          ) : (
            // Loading skeleton
            <div className="px-4 py-2 bg-gray-700 rounded-lg w-24 h-10"></div>
          )}
        </div>
      </div>
    </nav>
  );
}
