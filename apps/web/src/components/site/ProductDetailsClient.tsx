"use client";

import { useState, useMemo } from "react";
import type { Product } from "@sleepywear/shared";
import { useCartStore } from "@/stores/cart-store";
import { getMediaUrl, getThumbUrl } from "@/lib/media";
import { ProductCard } from "./ProductCard";
import { SectionHeading } from "./SectionHeading";

type Props = {
  product: Product;
  relatedProducts: Product[];
};

export default function ProductDetailsClient({
  product,
  relatedProducts,
}: Props) {
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
  const minPrice = Math.min(
    ...product.variants.map((v) => v.salePrice ?? v.price),
  );
  const maxPrice = Math.max(...product.variants.map((v) => v.price));

  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [adding, setAdding] = useState(false);

  const handleAddToCart = () => {
    if (!selectedVariant) {
      setFeedback({
        type: "error",
        message: "اختاري المقاس أو اللون أولاً",
      });
      setTimeout(() => setFeedback(null), 3000);
      return;
    }
    if (selectedVariant.stock < 1) return;

    setAdding(true);
    setFeedback(null);

    const variantInfo = [
      selectedVariant.size?.labelAr,
      selectedVariant.color?.nameAr,
    ]
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
      imageUrl: images[0]?.url,
    });

    setAdding(false);
    setFeedback({ type: "success", message: "تمت إضافة المنتج إلى السلة" });
    setTimeout(() => setFeedback(null), 4000);
  };

  const mainImage = images[currentImageIndex];

  return (
    <div className="bg-white">
      <div className="container py-8 sm:py-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.9fr)] lg:items-start">
          <section className="space-y-3">
            <div className="relative flex aspect-[4/5] items-center justify-center overflow-hidden rounded-3xl border border-[var(--line)] bg-brand-light-pink sm:aspect-[4/3]">
              {mainImage && !mainImageError ? (
                <img
                  alt={mainImage.altAr ?? product.nameAr}
                  className="h-full w-full object-cover"
                  src={getMediaUrl(mainImage.url)}
                  onError={() => setMainImageError(true)}
                />
              ) : (
                <span className="px-6 text-center text-sm font-semibold text-[var(--muted)]">
                  {product.nameAr}
                </span>
              )}
              {hasSale ? (
                <span className="absolute left-4 top-4 rounded-full bg-brand-pink px-3 py-1 text-xs font-bold text-white shadow-sm">
                  خصم
                </span>
              ) : null}
              {allOutOfStock ? (
                <span className="absolute right-4 top-4 rounded-full bg-black px-3 py-1 text-xs font-bold text-white shadow-sm">
                  نفد من المخزون
                </span>
              ) : null}
            </div>

            {images.length > 1 ? (
              <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
                {images.map((img, i) => (
                  <button
                    key={img.id}
                    type="button"
                    aria-label={`صورة المنتج ${i + 1}`}
                    onClick={() => {
                      setCurrentImageIndex(i);
                      setMainImageError(false);
                    }}
                    className={`h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 bg-brand-light-pink transition-colors focus:outline-none focus:ring-2 focus:ring-brand-pink/40 ${
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
          </section>

          <section className="rounded-3xl border border-[var(--line)] bg-white p-5 shadow-sm sm:p-6 lg:sticky lg:top-32">
            <div className="space-y-5">
              <div>
                {product.category ? (
                  <p className="text-sm font-bold text-brand-pink">
                    {product.category.nameAr}
                  </p>
                ) : null}
                <h1 className="mt-2 text-2xl font-black leading-tight text-brand-black sm:text-3xl">
                  {product.nameAr}
                </h1>
              </div>

              <div className="rounded-2xl bg-brand-light-pink/70 p-4">
                <div className="flex items-baseline gap-2">
                  {selectedVariant ? (
                    <>
                      <span className="text-2xl font-black text-brand-pink">
                        {selectedVariant.salePrice ?? selectedVariant.price} ج
                      </span>
                      {selectedVariant.salePrice ? (
                        <span className="text-sm text-[var(--muted)] line-through">
                          {selectedVariant.price} ج
                        </span>
                      ) : null}
                    </>
                  ) : minPrice !== maxPrice ? (
                    <span className="text-2xl font-black text-brand-pink">
                      {minPrice} - {maxPrice} ج
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-xs font-semibold text-[var(--muted)]">
                  السعر شامل المنتج، والشحن يظهر في صفحة الدفع.
                </p>
              </div>

              <p className="text-sm leading-7 text-[var(--muted)]">
                {product.descriptionAr ?? "لا يوجد وصف بعد."}
              </p>

              <div className="space-y-4">
                {hasSizes ? (
                  <VariantGroup title="المقاس">
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
                          className={`min-h-11 min-w-[52px] rounded-xl border px-4 py-2 text-sm font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-brand-pink/30 ${
                            isSelected
                              ? "border-brand-pink bg-brand-pink text-white"
                              : "border-[var(--line)] bg-white text-black hover:border-brand-pink/60"
                          } ${
                            !hasStock ? "cursor-not-allowed opacity-40" : ""
                          }`}
                        >
                          {size.labelAr}
                        </button>
                      );
                    })}
                  </VariantGroup>
                ) : null}

                {hasColors ? (
                  <VariantGroup title="اللون">
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
                          className={`flex min-h-11 items-center gap-2 rounded-xl border px-4 py-2 text-sm font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-brand-pink/30 ${
                            isSelected
                              ? "border-brand-pink bg-brand-pink text-white"
                              : "border-[var(--line)] bg-white text-black hover:border-brand-pink/60"
                          } ${
                            !hasStock ? "cursor-not-allowed opacity-40" : ""
                          }`}
                        >
                          <span
                            className="inline-block h-4 w-4 rounded-full border border-black/10"
                            style={{ backgroundColor: color.hex }}
                          />
                          {color.nameAr}
                        </button>
                      );
                    })}
                  </VariantGroup>
                ) : null}

                <StockStatus
                  selectedVariant={selectedVariant}
                  allOutOfStock={allOutOfStock}
                  hasOptions={hasSizes || hasColors}
                  hasVariants={product.variants.length > 0}
                />

                <div className="space-y-3">
                  <button
                    type="button"
                    disabled={!selectedVariant || selectedVariant.stock < 1}
                    onClick={handleAddToCart}
                    className="w-full rounded-2xl bg-brand-pink px-6 py-3.5 text-base font-black text-white transition-colors hover:bg-brand-blue disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {adding ? "جاري الإضافة..." : "أضف للسلة"}
                  </button>

                  {feedback ? (
                    <div
                      className={`rounded-2xl px-4 py-3 text-center text-sm font-bold ${
                        feedback.type === "success"
                          ? "bg-green-50 text-green-700"
                          : "bg-red-50 text-red-700"
                      }`}
                    >
                      {feedback.message}
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 rounded-2xl border border-[var(--line)] bg-brand-light-blue/50 p-3">
                <TrustPill label="توصيل سريع" />
                <TrustPill label="استبدال 14 يوم" />
                <TrustPill label="دفع عند الاستلام" />
              </div>
            </div>
          </section>
        </div>

        {relatedProducts.length > 0 ? (
          <section className="mt-14 sm:mt-20">
            <div className="mb-6">
              <SectionHeading title="منتجات مشابهة" />
            </div>
            <div className="rounded-3xl bg-brand-light-pink/35 p-3 sm:p-5">
              <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
                {relatedProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}

function VariantGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="mb-2 text-sm font-black text-brand-black">{title}</h3>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function StockStatus({
  selectedVariant,
  allOutOfStock,
  hasOptions,
  hasVariants,
}: {
  selectedVariant: Product["variants"][number] | null;
  allOutOfStock: boolean;
  hasOptions: boolean;
  hasVariants: boolean;
}) {
  if (selectedVariant) {
    if (selectedVariant.stock === 0) {
      return <StatusText tone="danger" label="غير متوفر" />;
    }
    if (selectedVariant.stock <= 5) {
      return <StatusText tone="warning" label={`متبقي ${selectedVariant.stock}`} />;
    }
    return <StatusText tone="success" label="متوفر" />;
  }

  if (!hasOptions && hasVariants) {
    return allOutOfStock ? (
      <StatusText tone="danger" label="غير متوفر" />
    ) : (
      <StatusText tone="success" label="متوفر" />
    );
  }

  return null;
}

function StatusText({
  tone,
  label,
}: {
  tone: "success" | "warning" | "danger";
  label: string;
}) {
  const toneClass =
    tone === "success"
      ? "bg-green-50 text-green-700"
      : tone === "warning"
        ? "bg-amber-50 text-amber-700"
        : "bg-red-50 text-red-700";

  return (
    <div className={`w-fit rounded-full px-3 py-1 text-sm font-bold ${toneClass}`}>
      {label}
    </div>
  );
}

function TrustPill({ label }: { label: string }) {
  return (
    <span className="rounded-xl bg-white px-2 py-2 text-center text-xs font-bold text-[var(--muted)]">
      {label}
    </span>
  );
}
