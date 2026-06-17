"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CartItem } from "@sleepywear/shared";

type CartState = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  removeItem: (variantId: string) => void;
  clear: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
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
      updateQuantity: (variantId, quantity) =>
        set((state) => ({
          items: state.items.map((entry) =>
            entry.variantId === variantId
              ? { ...entry, quantity: Math.max(1, quantity) }
              : entry,
          ),
        })),
      removeItem: (variantId) =>
        set((state) => ({
          items: state.items.filter((entry) => entry.variantId !== variantId),
        })),
      clear: () => set({ items: [] }),
    }),
    {
      name: "sleepywear-cart",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
