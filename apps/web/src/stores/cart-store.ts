"use client";

import { create } from "zustand";
import type { CartItem } from "@sleepywear/shared";

type CartState = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (variantId: string) => void;
  clear: () => void;
};

export const useCartStore = create<CartState>((set) => ({
  items: [],
  addItem: (item) =>
    set((state) => {
      const existing = state.items.find(
        (entry) => entry.variantId === item.variantId,
      );
      if (!existing) return { items: [...state.items, item] };

      return {
        items: state.items.map((entry) =>
          entry.variantId === item.variantId
            ? { ...entry, quantity: entry.quantity + item.quantity }
            : entry,
        ),
      };
    }),
  removeItem: (variantId) =>
    set((state) => ({
      items: state.items.filter((item) => item.variantId !== variantId),
    })),
  clear: () => set({ items: [] }),
}));
