'use client';

import { useEffect } from 'react';
import { useStore } from '@/lib/store';
import { useWishlistStore } from '@/lib/wishlistStore';
import { apiEndpoints, getApiUrl } from '@/lib/apiConfig';

/**
 * RootInitializer
 * Initializes stores on app startup:
 * - Loads cart from localStorage
 * - Loads wishlist from localStorage
 * - Syncs with backend when user logs in
 */
export default function RootInitializer() {
  const loadUserFromStorage = useStore((state) => state.loadUserFromStorage);
  const loadCartFromStorage = useStore((state) => state.loadCartFromStorage);
  const user = useStore((state) => state.user);
  const token = useStore((state) => state.token);
  const isAuthenticated = useStore((state) => state.isAuthenticated);

  const loadWishlistFromStorage = useWishlistStore((state) => state.loadWishlistFromStorage);
  const syncWishlistWithBackend = useWishlistStore((state) => state.syncWishlistWithBackend);
  const clearWishlist = useWishlistStore((state) => state.clearWishlist);

  // Initialize stores from localStorage on app startup
  useEffect(() => {
    loadUserFromStorage();
    loadCartFromStorage();
    loadWishlistFromStorage();
  }, [loadUserFromStorage, loadCartFromStorage, loadWishlistFromStorage]);

  // Clear wishlist when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      clearWishlist();
    }
  }, [isAuthenticated, clearWishlist]);

  // Sync cart & wishlist with backend when user logs in
  useEffect(() => {
    const syncWithBackend = async () => {
      if (!isAuthenticated || !user || !token) return;

      try {
        // Sync wishlist with backend
        await syncWishlistWithBackend(user.id, token);

        // Sync cart with backend
        const cart = useStore.getState().cart;
        const response = await fetch(getApiUrl(apiEndpoints.users.syncCart), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ cart }),
        });

        if (response.ok) {
          const data = await response.json();
          // console.log('✅ Cart synced with backend');
          // Optional: Update local cart if backend returned different data
          if (data.cart) {
            // Cart is already in localStorage, no need to update unless backend has different items
            localStorage.setItem('cart', JSON.stringify(data.cart));
          }
        } else {
          // console.error('Failed to sync cart with backend');
        }
      } catch (error) {
        // console.error('Error syncing with backend:', error);
      }
    };

    syncWithBackend();
  }, [isAuthenticated, user, token]);

  return null; // This component doesn't render anything
}
