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
                ? {
                    ...entry,
                    quantity: Math.min(
                      entry.quantity + item.quantity,
                      item.availableStock ??
                        entry.availableStock ??
                        Number.POSITIVE_INFINITY,
                    ),
                    availableStock: item.availableStock ?? entry.availableStock,
                  }
                : entry,
            ),
          };
        }),
      updateQuantity: (variantId, quantity) =>
        set((state) => ({
          items: state.items.map((entry) => {
            if (entry.variantId !== variantId) return entry;
            const maxQuantity = entry.availableStock ?? Number.POSITIVE_INFINITY;
            return {
              ...entry,
              quantity: Math.min(Math.max(1, quantity), maxQuantity),
            };
          }),
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
