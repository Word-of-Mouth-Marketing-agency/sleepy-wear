"use client";

import Link from "next/link";
import { useState, useRef } from "react";
import type { Product } from "@sleepywear/shared";
import { getCardUrl } from "@/lib/media";
import {
  getAvailableVariants,
  getVariantInfo,
  hasSelectableVariations,
} from "@/lib/product-variants";
import { useCartStore } from "@/stores/cart-store";

type ProductCardProps = {
  product: Product;
  layout?: "grid" | "row";
};

const ADD_TO_CART_LABEL =
  "\u0623\u0636\u0641 \u0625\u0644\u0649 \u0627\u0644\u0633\u0644\u0629";
const ADDED_TO_CART_LABEL =
  "\u062A\u0645\u062A \u0627\u0644\u0625\u0636\u0627\u0641\u0629 \u2713";

export function ProductCard({ product, layout = "grid" }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const availableVariants = getAvailableVariants(product);
  const firstVariant = availableVariants[0] ?? product.variants[0];
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

  const inStockVariants = availableVariants;
  const availVariant = inStockVariants[0] ?? null;
  const hasChoices = hasSelectableVariations(product);

  function handleAddToCart() {
    if (!availVariant || added) return;
    addItem({
      variantId: availVariant.id,
      productId: product.id,
      nameAr: product.nameAr,
      sku: availVariant.sku,
      quantity: 1,
      price: availVariant.salePrice ?? availVariant.price,
      variantInfo: getVariantInfo(availVariant) || undefined,
      imageUrl: image?.url,
      availableStock: availVariant.stock,
    });
    setAdded(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setAdded(false), 2000);
  }

  if (layout === "row") {
    return (
      <Link
        href={`/products/${product.slug}`}
        className="group flex w-[168px] shrink-0 flex-col overflow-hidden rounded-2xl border border-[var(--line)] bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand-pink/35 hover:shadow-md"
      >
        <ProductImage
          imageUrl={image?.url}
          alt={image?.altAr ?? product.nameAr}
          fallback={product.nameAr}
          className="h-[210px]"
          salePercent={salePercent}
        />
        <div className="flex flex-col gap-1.5 p-3">
          <p className="truncate text-xs font-semibold text-brand-pink">
            {product.category?.nameAr}
          </p>
          <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-bold leading-5 text-brand-black transition-colors group-hover:text-brand-pink">
            {product.nameAr}
          </h3>
          <PriceBlock
            price={price}
            originalPrice={originalPrice}
            size="sm"
          />
        </div>
      </Link>
    );
  }

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--line)] bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand-pink/35 hover:shadow-md">
      <Link href={`/products/${product.slug}`} className="block">
        <ProductImage
          imageUrl={image?.url}
          alt={image?.altAr ?? product.nameAr}
          fallback={product.nameAr}
          className="aspect-[3/4]"
          salePercent={salePercent}
        />
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-3 sm:p-4">
        <p className="truncate text-xs font-semibold text-brand-pink">
          {product.category?.nameAr}
        </p>
        <Link href={`/products/${product.slug}`}>
          <h3 className="line-clamp-2 min-h-[2.75rem] font-bold leading-6 text-brand-black transition-colors hover:text-brand-pink">
            {product.nameAr}
          </h3>
        </Link>
        <PriceBlock price={price} originalPrice={originalPrice} />
      </div>

      <div className="px-3 pb-3 sm:px-4 sm:pb-4">
        {availVariant ? (
          hasChoices ? (
            <Link
              href={`/products/${product.slug}`}
              className="block w-full rounded-xl bg-brand-pink px-3 py-2.5 text-center text-sm font-bold text-white shadow-sm transition-colors hover:bg-brand-blue"
            >
              {ADD_TO_CART_LABEL}
            </Link>
          ) : (
            <button
              disabled={added}
              onClick={handleAddToCart}
              className="w-full rounded-xl bg-brand-pink px-3 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-blue disabled:opacity-80"
              type="button"
            >
              {added ? ADDED_TO_CART_LABEL : ADD_TO_CART_LABEL}
            </button>
          )
        ) : (
          <button
            disabled
            className="w-full cursor-not-allowed rounded-xl bg-brand-light-pink px-3 py-2.5 text-sm font-bold text-[var(--muted)]"
            type="button"
          >
            غير متوفر
          </button>
        )}
      </div>
    </article>
  );
}

function ProductImage({
  imageUrl,
  alt,
  fallback,
  className,
  salePercent,
}: {
  imageUrl?: string;
  alt: string;
  fallback: string;
  className: string;
  salePercent: number | null;
}) {
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden bg-brand-light-pink ${className}`}
    >
      {imageUrl ? (
        <img
          alt={alt}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          src={getCardUrl(imageUrl)}
        />
      ) : (
        <span className="px-4 text-center text-sm font-semibold text-[var(--muted)]">
          {fallback}
        </span>
      )}
      {salePercent != null && salePercent > 0 ? (
        <span className="absolute right-2 top-2 rounded-full bg-brand-pink px-2.5 py-1 text-xs font-bold text-white shadow-sm">
          خصم {salePercent}%
        </span>
      ) : null}
    </div>
  );
}

function PriceBlock({
  price,
  originalPrice,
  size = "base",
}: {
  price: number | null;
  originalPrice: number | null;
  size?: "base" | "sm";
}) {
  if (!price) return null;

  return (
    <div className="mt-auto flex flex-wrap items-center gap-2">
      {originalPrice ? (
        <span
          className={`text-[var(--muted)] line-through ${
            size === "sm" ? "text-xs" : "text-sm"
          }`}
        >
          {originalPrice} ج
        </span>
      ) : null}
      <span
        className={`font-black text-brand-pink ${
          size === "sm" ? "text-sm" : "text-lg"
        }`}
      >
        {price} ج
      </span>
    </div>
  );
}
