"use client";

import { useState, useMemo } from "react";
import type { Product } from "@sleepywear/shared";
import { useCartStore } from "@/stores/cart-store";
import { getMediaUrl, getThumbUrl } from "@/lib/media";

type Props = {
  product: Product;
};

export default function ProductDetailsClient({ product }: Props) {
  const addItem = useCartStore((s) => s.addItem);

  const images = product.images;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [mainImageError, setMainImageError] = useState(false);

  const sizes = useMemo(() => {
    const map = new Map<
      string,
      NonNullable<(typeof product.variants)[0]["size"]>
    >();
    for (const v of product.variants) {
      if (v.size) map.set(v.size.id, v.size);
    }
    return Array.from(map.values());
  }, [product.variants]);

  const colors = useMemo(() => {
    const map = new Map<
      string,
      NonNullable<(typeof product.variants)[0]["color"]>
    >();
    for (const v of product.variants) {
      if (v.color) map.set(v.color.id, v.color);
    }
    return Array.from(map.values());
  }, [product.variants]);

  const hasSizes = sizes.length > 0;
  const hasColors = colors.length > 0;

  const [selectedSizeId, setSelectedSizeId] = useState<string | null>(
    sizes.length === 1 ? sizes[0].id : null,
  );
  const [selectedColorId, setSelectedColorId] = useState<string | null>(
    colors.length === 1 ? colors[0].id : null,
  );

  const selectedVariant = useMemo(() => {
    if (hasSizes && hasColors) {
      return (
        product.variants.find(
          (v) =>
            v.size?.id === selectedSizeId && v.color?.id === selectedColorId,
        ) ?? null
      );
    }
    if (hasSizes) {
      return (
        product.variants.find((v) => v.size?.id === selectedSizeId) ?? null
      );
    }
    if (hasColors) {
      return (
        product.variants.find((v) => v.color?.id === selectedColorId) ?? null
      );
    }
    return product.variants[0] ?? null;
  }, [product.variants, selectedSizeId, selectedColorId, hasSizes, hasColors]);

  const hasSale = product.variants.some((v) => v.salePrice !== null);
  const allOutOfStock = product.variants.every((v) => v.stock === 0);
  const minPrice = Math.min(...product.variants.map((v) => v.salePrice ?? v.price));
  const maxPrice = Math.max(...product.variants.map((v) => v.price));

  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [adding, setAdding] = useState(false);

  const handleAddToCart = () => {
    if (!selectedVariant) {
      setFeedback({ type: "error", message: "الرجاء اختيار المقاس واللون" });
      setTimeout(() => setFeedback(null), 3000);
      return;
    }
    if (selectedVariant.stock < 1) return;

    setAdding(true);
    setFeedback(null);

    const variantInfo = [selectedVariant.size?.labelAr, selectedVariant.color?.nameAr]
      .filter(Boolean)
      .join(" / ");

    addItem({
      productId: product.id,
      variantId: selectedVariant.id,
      nameAr: product.nameAr,
      sku: selectedVariant.sku,
      quantity: 1,
      price: selectedVariant.salePrice ?? selectedVariant.price,
      variantInfo,
    });

    setAdding(false);
    setFeedback({ type: "success", message: "تم إضافة المنتج إلى السلة" });
    setTimeout(() => setFeedback(null), 4000);
  };

  const mainImage = images[currentImageIndex];

  return (
    <div className="container py-10">
      <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-3">
          <div className="relative flex aspect-[4/3] items-center justify-center rounded-xl bg-brand-light-pink">
            {mainImage && !mainImageError ? (
              <img
                alt={mainImage.altAr ?? product.nameAr}
                className="h-full w-full rounded-xl object-cover"
                src={getMediaUrl(mainImage.url)}
                onError={() => setMainImageError(true)}
              />
            ) : (
              <span className="text-sm text-[var(--muted)]">
                {product.nameAr}
              </span>
            )}
            {hasSale ? (
              <span className="absolute left-3 top-3 rounded-full bg-brand-pink px-3 py-1 text-xs font-bold text-white">
                خصم
              </span>
            ) : null}
            {allOutOfStock ? (
              <span className="absolute right-3 top-3 rounded-full bg-black px-3 py-1 text-xs font-bold text-white">
                نفد من المخزون
              </span>
            ) : null}
          </div>

          {images.length > 1 ? (
            <div className="flex gap-2 overflow-x-auto hide-scrollbar">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => {
                    setCurrentImageIndex(i);
                    setMainImageError(false);
                  }}
                  className={`h-20 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                    i === currentImageIndex
                      ? "border-brand-pink"
                      : "border-transparent hover:border-brand-pink/50"
                  }`}
                >
                  <img
                    alt={img.altAr ?? `${product.nameAr} ${i + 1}`}
                    className="h-full w-full object-cover"
                    src={getThumbUrl(img.url)}
                  />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="space-y-5">
          <div>
            {product.category ? (
              <p className="text-xs font-semibold text-brand-pink">
                {product.category.nameAr}
              </p>
            ) : null}
            <h1 className="mt-1 text-2xl font-extrabold sm:text-3xl">
              {product.nameAr}
            </h1>
          </div>

          <div className="flex items-baseline gap-2">
            {selectedVariant ? (
              <>
                <span className="text-xl font-bold text-brand-pink">
                  {selectedVariant.salePrice ?? selectedVariant.price} ج
                </span>
                {selectedVariant.salePrice ? (
                  <span className="text-sm text-[var(--muted)] line-through">
                    {selectedVariant.price} ج
                  </span>
                ) : null}
              </>
            ) : minPrice !== maxPrice ? (
              <span className="text-xl font-bold text-brand-pink">
                {minPrice} - {maxPrice} ج
              </span>
            ) : null}
          </div>

          <p className="text-sm leading-relaxed text-[var(--muted)]">
            {product.descriptionAr ?? "لا يوجد وصف بعد."}
          </p>

          <div className="space-y-4">
            {hasSizes ? (
              <div>
                <h3 className="mb-2 text-sm font-bold">المقاس</h3>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size) => {
                    const hasStock = product.variants.some(
                      (v) => v.size?.id === size.id && v.stock > 0,
                    );
                    const isSelected = selectedSizeId === size.id;
                    return (
                      <button
                        key={size.id}
                        type="button"
                        disabled={!hasStock}
                        onClick={() => setSelectedSizeId(size.id)}
                        className={`min-w-[48px] rounded-lg border-2 px-4 py-2 text-sm font-semibold transition-colors ${
                          isSelected
                            ? "border-brand-pink bg-brand-pink text-white"
                            : "border-[var(--line)] bg-white text-black hover:border-brand-pink/50"
                        } ${!hasStock ? "cursor-not-allowed opacity-40" : ""}`}
                      >
                        {size.labelAr}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {hasColors ? (
              <div>
                <h3 className="mb-2 text-sm font-bold">اللون</h3>
                <div className="flex flex-wrap gap-2">
                  {colors.map((color) => {
                    const hasStock = product.variants.some(
                      (v) => v.color?.id === color.id && v.stock > 0,
                    );
                    const isSelected = selectedColorId === color.id;
                    return (
                      <button
                        key={color.id}
                        type="button"
                        disabled={!hasStock}
                        onClick={() => setSelectedColorId(color.id)}
                        className={`flex items-center gap-2 rounded-lg border-2 px-4 py-2 text-sm font-semibold transition-colors ${
                          isSelected
                            ? "border-brand-pink bg-brand-pink text-white"
                            : "border-[var(--line)] bg-white text-black hover:border-brand-pink/50"
                        } ${!hasStock ? "cursor-not-allowed opacity-40" : ""}`}
                      >
                        <span
                          className="inline-block h-4 w-4 rounded-full border border-[var(--line)]"
                          style={{ backgroundColor: color.hex }}
                        />
                        {color.nameAr}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {selectedVariant ? (
              <div className="text-sm">
                {selectedVariant.stock === 0 ? (
                  <span className="font-semibold text-red-600">
                    غير متوفر
                  </span>
                ) : selectedVariant.stock <= 5 ? (
                  <span className="font-semibold text-amber-600">
                    متبقي {selectedVariant.stock}
                  </span>
                ) : (
                  <span className="font-semibold text-green-700">متوفر</span>
                )}
              </div>
            ) : !hasSizes && !hasColors && product.variants.length > 0 ? (
              <div className="text-sm">
                {allOutOfStock ? (
                  <span className="font-semibold text-red-600">
                    غير متوفر
                  </span>
                ) : (
                  <span className="font-semibold text-green-700">متوفر</span>
                )}
              </div>
            ) : null}

            <div className="space-y-2">
              <button
                type="button"
                disabled={!selectedVariant || selectedVariant.stock < 1}
                onClick={handleAddToCart}
                className="w-full rounded-xl bg-brand-pink px-6 py-3 text-base font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {adding ? "جاري الإضافة..." : "أضف للسلة"}
              </button>

              {feedback ? (
                <div
                  className={`rounded-lg px-4 py-2 text-center text-sm font-semibold transition-opacity ${
                    feedback.type === "success"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {feedback.message}
                </div>
              ) : null}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 rounded-xl border border-[var(--line)] bg-brand-light-pink/30 p-4 sm:grid-cols-3">
            <span className="text-center text-xs font-semibold text-[var(--muted)]">
              توصيل سريع
            </span>
            <span className="text-center text-xs font-semibold text-[var(--muted)]">
              استبدال مجاني
            </span>
            <span className="text-center text-xs font-semibold text-[var(--muted)]">
              دفع عند الاستلام
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
