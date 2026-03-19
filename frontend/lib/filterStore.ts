// import { create } from "zustand";

// interface FilterState {
//   brand: string;
//   category: string;
//   priceRange: [number, number];
//   search: string;
  
//   // Actions
//   setBrand: (brand: string) => void;
//   setCategory: (category: string) => void;
//   setPriceRange: (range: [number, number]) => void;
//   setSearch: (search: string) => void;
//   resetFilters: () => void;
// }

// const DEFAULT_FILTERS = {
//   brand: "All",
//   category: "All",
//   priceRange: [0, 50000] as [number, number],
//   search: "",
// };

// export const useFilterStore = create<FilterState>((set) => ({
//   ...DEFAULT_FILTERS,
  
//   setBrand: (brand) => set({ brand }),
  
//   setCategory: (category) => set({ category }),
  
//   setPriceRange: (priceRange) => set({ priceRange }),
  
//   setSearch: (search) => set({ search }),
  
//   resetFilters: () => set(DEFAULT_FILTERS),
// }));


import { create } from "zustand";
import { persist } from "zustand/middleware";

interface FilterState {
  brand: string;
  category: string;
  priceRange: [number, number];
  search: string;
  
  // Actions
  setBrand: (brand: string) => void;
  setCategory: (category: string) => void;
  setPriceRange: (range: [number, number]) => void;
  setSearch: (search: string) => void;
  resetFilters: () => void;
}

const DEFAULT_FILTERS = {
  brand: "All",
  category: "All",
  priceRange: [0, 50000] as [number, number],
  search: "",
};

export const useFilterStore = create<FilterState>()(
  persist(
    (set) => ({
      ...DEFAULT_FILTERS,
      
      setBrand: (brand) => set({ brand }),
      
      setCategory: (category) => set({ category }),
      
      setPriceRange: (priceRange) => set({ priceRange }),
      
      setSearch: (search) => set({ search }),
      
      resetFilters: () => set(DEFAULT_FILTERS),
    }),
    {
      name: "filter-store",
      skipHydration: true,
    }
  )
);