"use client";

import Link from "next/link";
import { useState, useRef } from "react";
import type { Product } from "@sleepywear/shared";
import { getCardUrl } from "@/lib/media";
import { useCartStore } from "@/stores/cart-store";

type ProductCardProps = {
  product: Product;
  layout?: "grid" | "row";
};

export function ProductCard({ product, layout = "grid" }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const firstVariant = product.variants[0];
  const price = firstVariant
    ? (firstVariant.salePrice ?? firstVariant.price)
    : null;
  const originalPrice = firstVariant?.salePrice ? firstVariant.price : null;
  const image = product.images[0];

  const salePercent =
    firstVariant?.salePrice && firstVariant.price > 0
      ? Math.round(
          ((firstVariant.price - firstVariant.salePrice) /
            firstVariant.price) *
            100,
        )
      : null;

  const inStockVariants = product.variants.filter((v) => v.stock > 0);
  const availVariant = inStockVariants[0] ?? null;
  const hasChoices = inStockVariants.length > 1;

  function handleAddToCart() {
    if (!availVariant || added) return;
    addItem({
      variantId: availVariant.id,
      productId: product.id,
      nameAr: product.nameAr,
      sku: availVariant.sku,
      quantity: 1,
      price: availVariant.salePrice ?? availVariant.price,
      variantInfo:
        availVariant.size?.labelAr ?? availVariant.color?.nameAr ?? undefined,
    });
    setAdded(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setAdded(false), 2000);
  }

  if (layout === "row") {
    return (
      <Link
        href={`/products/${product.slug}`}
        className="flex w-[160px] shrink-0 flex-col rounded-xl bg-white shadow-sm transition-shadow hover:shadow-md"
      >
        <div className="relative h-[200px] overflow-hidden rounded-t-xl bg-brand-light-pink">
          {image ? (
            <img
              alt={image.altAr ?? product.nameAr}
              className="h-full w-full object-cover"
              src={getCardUrl(image.url)}
            />
          ) : (
            <span className="flex h-full items-center justify-center px-2 text-center text-xs text-[var(--muted)]">
              {product.nameAr}
            </span>
          )}
          {salePercent != null && salePercent > 0 ? (
            <span className="absolute right-1.5 top-1.5 rounded bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
              خصم {salePercent}%
            </span>
          ) : null}
        </div>
        <div className="flex flex-col gap-1 p-3">
          <p className="truncate text-xs text-[var(--muted)]">
            {product.category?.nameAr}
          </p>
          <h3 className="truncate text-sm font-semibold">
            {product.nameAr}
          </h3>
          {price ? (
            <div className="mt-1 flex items-center gap-1.5">
              {originalPrice ? (
                <span className="text-xs text-[var(--muted)] line-through">
                  {originalPrice} ج
                </span>
              ) : null}
              <span className="text-sm font-bold text-brand-pink">
                {price} ج
              </span>
            </div>
          ) : null}
        </div>
      </Link>
    );
  }

  return (
    <div className="flex flex-col rounded-xl bg-white shadow-sm transition-shadow hover:shadow-md">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative h-[360px] overflow-hidden rounded-t-xl bg-brand-light-pink max-sm:h-[260px]">
          {image ? (
            <img
              alt={image.altAr ?? product.nameAr}
              className="h-full w-full object-cover"
              src={getCardUrl(image.url)}
            />
          ) : (
            <span className="flex h-full items-center justify-center px-4 text-center text-sm text-[var(--muted)]">
              {product.nameAr}
            </span>
          )}
          {salePercent != null && salePercent > 0 ? (
            <span className="absolute right-2 top-2 rounded bg-red-500 px-2 py-1 text-xs font-bold text-white">
              خصم {salePercent}%
            </span>
          ) : null}
        </div>
      </Link>

      <div className="flex flex-col gap-1 p-4">
        <p className="text-xs text-[var(--muted)]">
          {product.category?.nameAr}
        </p>
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-semibold transition-colors hover:text-brand-pink">
            {product.nameAr}
          </h3>
        </Link>
        {price ? (
          <div className="mt-1 flex items-center gap-2">
            {originalPrice ? (
              <span className="text-sm text-[var(--muted)] line-through">
                {originalPrice} ج
              </span>
            ) : null}
            <span className="text-base font-bold text-brand-pink">
              {price} ج
            </span>
          </div>
        ) : null}
      </div>

      <div className="px-4 pb-4">
        {availVariant ? (
          hasChoices ? (
            <Link
              href={`/products/${product.slug}`}
              className="block w-full rounded-lg bg-brand-pink py-2 text-center text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              اختاري المقاس من صفحة المنتج
            </Link>
          ) : (
            <button
              disabled={added}
              onClick={handleAddToCart}
              className="w-full rounded-lg bg-brand-pink py-2 text-sm font-semibold text-white transition-opacity disabled:opacity-70 hover:opacity-90"
            >
              {added ? "تم ✓" : "أضف للسلة"}
            </button>
          )
        ) : (
          <button
            disabled
            className="w-full cursor-not-allowed rounded-lg bg-gray-200 py-2 text-sm font-semibold text-gray-400"
          >
            غير متوفر
          </button>
        )}
      </div>
    </div>
  );
}
