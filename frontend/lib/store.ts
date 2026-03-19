import { create } from "zustand";
import { apiEndpoints, getApiUrl } from './apiConfig';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  size: number;
  color: string;
  image: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName?: string;
  isGuest?: boolean;
}

interface Store {
  // Auth
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  loadUserFromStorage: () => void;
  logout: () => void;
  
  // Cart
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateCartQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  loadCartFromStorage: () => void;
  syncCartWithBackend: (token: string) => Promise<void>;
}

export const useStore = create<Store>((set, get) => ({
  // Auth state
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  
  setToken: (token) => {
    if (typeof window !== "undefined") {
      if (token) {
        localStorage.setItem("token", token);
      } else {
        localStorage.removeItem("token");
      }
    }
    set({ token, isAuthenticated: !!token });
  },

  loadUserFromStorage: () => {
    if (typeof window === "undefined") {
      set({ isLoading: false });
      return;
    }

    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    
    if (storedToken && storedUser) {
      try {
        const user = JSON.parse(storedUser);
        set({
          token: storedToken,
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      } catch (error) {
        console.error("Failed to parse stored user:", error);
        set({ isLoading: false });
      }
    } else {
      set({ isLoading: false });
    }
  },

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("isGuest");
      localStorage.removeItem("cart");
      localStorage.removeItem("wishlist"); // Clear wishlist on logout
    }
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      cart: [],
    });
  },

  // Cart state
  cart: [],

  addToCart: (item) =>
    set((state) => {
      const exists = state.cart.find(
        (c) => c.id === item.id && c.size === item.size && c.color === item.color
      );

      let updatedCart;
      if (exists) {
        updatedCart = state.cart.map((c) =>
          c.id === item.id && c.size === item.size && c.color === item.color
            ? { ...c, quantity: c.quantity + item.quantity }
            : c
        );
      } else {
        updatedCart = [...state.cart, item];
      }

      // Persist to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("cart", JSON.stringify(updatedCart));
      }

      return { cart: updatedCart };
    }),
  
  removeFromCart: (id) => set((state) => {
    const updatedCart = state.cart.filter((item) => item.id !== id);
    
    // Persist to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("cart", JSON.stringify(updatedCart));
    }

    return { cart: updatedCart };
  }),
  
  updateCartQuantity: (id, quantity) => set((state) => {
    // If quantity is 0 or less, remove the item from cart
    if (quantity <= 0) {
      const updatedCart = state.cart.filter((item) => item.id !== id);
      // Persist to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("cart", JSON.stringify(updatedCart));
      }
      return { cart: updatedCart };
    }

    // Otherwise update the quantity
    const updatedCart = state.cart.map((item) =>
      item.id === id ? { ...item, quantity } : item
    );

    // Persist to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("cart", JSON.stringify(updatedCart));
    }

    return { cart: updatedCart };
  }),
  
  clearCart: () => set(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("cart");
    }
    return { cart: [] };
  }),

  // Load cart from localStorage on app startup
  loadCartFromStorage: () => {
    if (typeof window === "undefined") return;
    
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        const cart = JSON.parse(savedCart);
        set({ cart });
      } catch (error) {
        console.error("Failed to load cart from localStorage:", error);
      }
    }
  },

  // Sync cart with backend when user logs in
  syncCartWithBackend: async (token: string) => {
    if (typeof window === "undefined") return;
    
    try {
      const state = useStore.getState();
      const response = await fetch(getApiUrl(apiEndpoints.users.syncCart), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ cart: state.cart }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Cart synced with backend");
        // Update local cart if backend returned different data
        if (data.cart) {
          set({ cart: data.cart });
          localStorage.setItem("cart", JSON.stringify(data.cart));
        }
      } else {
        console.error("Failed to sync cart with backend");
      }
    } catch (error) {
      console.error("Error syncing cart with backend:", error);
    }
  },
}));

// Legacy cart store for backwards compatibility
interface OldCartItem {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface CartState {
  items: OldCartItem[];
  addToCart: (item: OldCartItem) => void;
  removeFromCart: (_id: string) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  items: [],
  addToCart: (item) => set((state) => {
    const exists = state.items.find((i) => i._id === item._id);
    if (exists) {
      return {
        items: state.items.map((i) =>
          i._id === item._id ? { ...i, quantity: i.quantity + item.quantity } : i
        ),
      };
    }
    return { items: [...state.items, item] };
  }),
  removeFromCart: (_id) => set((state) => ({
    items: state.items.filter((i) => i._id !== _id),
  })),
  clearCart: () => set({ items: [] }),
}));
