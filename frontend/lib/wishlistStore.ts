import { create } from "zustand";
import { apiEndpoints, getApiUrl } from './apiConfig';

export interface WishlistItem {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice: number;
  image: string;
  rating: number;
  reviews: number;
  stock: number;
}

interface WishlistStore {
  wishlist: WishlistItem[];
  addToWishlist: (item: WishlistItem) => void;
  removeFromWishlist: (id: string) => void;
  isInWishlist: (id: string) => boolean;
  clearWishlist: () => void;
  loadWishlistFromStorage: () => void;
  syncWishlistWithBackend: (userId: string, token: string) => Promise<void>;
}

export const useWishlistStore = create<WishlistStore>((set, get) => ({
  wishlist: [],

  addToWishlist: (item) =>
    set((state) => {
      const exists = state.wishlist.find((w) => w.id === item.id);

      let updatedWishlist;
      if (exists) {
        // Item already in wishlist, don't add duplicates
        return { wishlist: state.wishlist };
      }

      updatedWishlist = [...state.wishlist, item];

      // Persist to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));
      }

      return { wishlist: updatedWishlist };
    }),

  removeFromWishlist: (id) =>
    set((state) => {
      const updatedWishlist = state.wishlist.filter((item) => item.id !== id);

      // Persist to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));
      }

      return { wishlist: updatedWishlist };
    }),

  isInWishlist: (id) => {
    const state = get();
    return state.wishlist.some((item) => item.id === id);
  },

  clearWishlist: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("wishlist");
    }
    set({ wishlist: [] });
  },

  loadWishlistFromStorage: () => {
    if (typeof window === "undefined") return;

    const savedWishlist = localStorage.getItem("wishlist");
    if (savedWishlist) {
      try {
        const wishlist = JSON.parse(savedWishlist);
        set({ wishlist });
      } catch (error) {
        console.error("Failed to load wishlist from localStorage:", error);
      }
    }
  },

  syncWishlistWithBackend: async (userId: string, token: string) => {
    if (typeof window === "undefined") return;

    try {
      const state = get();
      const response = await fetch(
        getApiUrl(apiEndpoints.users.syncWishlist),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            wishlist: state.wishlist,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        // Update local wishlist with synced data from backend
        if (data.wishlist) {
          set({ wishlist: data.wishlist });
          localStorage.setItem("wishlist", JSON.stringify(data.wishlist));
        }
        // console.log("✅ Wishlist synced with backend");
      } else {
        // console.error("Failed to sync wishlist with backend");
      }
    } catch (error) {
      console.error("Error syncing wishlist with backend:", error);
    }
  },
}));
