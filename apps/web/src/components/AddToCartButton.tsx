"use client";

import type { Product, ProductVariant } from "@sleepywear/shared";
import { useCartStore } from "@/stores/cart-store";

type AddToCartButtonProps = {
  product: Product;
  variant: ProductVariant;
};

export function AddToCartButton({ product, variant }: AddToCartButtonProps) {
  const addItem = useCartStore((state) => state.addItem);
  const price = variant.salePrice ?? variant.price;
  const variantInfo = [variant.size?.labelAr, variant.color?.nameAr]
    .filter(Boolean)
    .join(" / ");

  return (
    <button
      className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
      disabled={variant.stock < 1}
      onClick={() =>
        addItem({
          productId: product.id,
          variantId: variant.id,
          nameAr: product.nameAr,
          sku: variant.sku,
          quantity: 1,
          price,
          variantInfo,
        })
      }
      type="button"
    >
      {variant.stock > 0 ? "أضف للسلة" : "غير متوفر"}
    </button>
  );
}
