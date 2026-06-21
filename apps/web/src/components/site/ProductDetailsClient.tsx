"use client";

import { useState, useMemo } from "react";
import type { Product } from "@sleepywear/shared";
import { useCartStore } from "@/stores/cart-store";
import { getMediaUrl, getThumbUrl } from "@/lib/media";
import {
  getAvailableVariants,
  getVariantInfo,
  hasRealColor,
  hasRealSize,
} from "@/lib/product-variants";
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

  const galleryImages = useMemo(() => {
    if (!images.length) return [];

    const variantImages = images.filter((img) =>
      img.altAr?.startsWith("EO-VAR-"),
    );

    if (variantImages.length === 0) {
      // No variant images: use main product image only
      const mainImage = images.find((img) => !img.altAr?.startsWith("EO-VAR-"));
      return mainImage ? [mainImage] : [];
    }

    // Has variant images: show only variant images, deduped by color
    // Map active variant SKUs to their colorId
    const skuToColor = new Map<string, string>();
    for (const v of product.variants) {
      if (v.stock > 0 && v.color?.id && hasRealColor(v)) {
        skuToColor.set(v.sku, v.color.id);
      }
    }

    // Dedupe variant images: one per color
    const seenUrl = new Set<string>();
    const seenColor = new Set<string>();
    const uniqueVariants: typeof images = [];

    for (const img of variantImages) {
      if (seenUrl.has(img.url)) continue;
      const skuMatch = img.altAr?.match(/^(EO-VAR-[a-f0-9-]+)/);
      if (!skuMatch) continue;
      const sku = skuMatch[1];
      const colorId = skuToColor.get(sku);
      if (!colorId) continue;
      if (seenColor.has(colorId)) continue;
      seenColor.add(colorId);
      seenUrl.add(img.url);
      uniqueVariants.push(img);
    }

    return uniqueVariants;
  }, [images, product.variants]);

  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [mainImageError, setMainImageError] = useState(false);

  const activeVariants = useMemo(
    () => getAvailableVariants(product),
    [product],
  );

  const sizes = useMemo(() => {
    const map = new Map<
      string,
      NonNullable<(typeof product.variants)[0]["size"]>
    >();
    for (const v of activeVariants) {
      if (v.size && hasRealSize(v)) map.set(v.size.id, v.size);
    }
    return Array.from(map.values());
  }, [activeVariants]);

  const colors = useMemo(() => {
    const map = new Map<
      string,
      NonNullable<(typeof product.variants)[0]["color"]>
    >();
    for (const v of activeVariants) {
      if (v.color && hasRealColor(v)) map.set(v.color.id, v.color);
    }
    return Array.from(map.values());
  }, [activeVariants]);

  const hasSizes = sizes.length > 1;
  const hasColors = colors.length > 1;

  const [selectedSizeId, setSelectedSizeId] = useState<string | null>(
    sizes.length === 1 ? sizes[0].id : null,
  );
  const [selectedColorId, setSelectedColorId] = useState<string | null>(
    colors.length === 1 ? colors[0].id : null,
  );

  const selectedVariant = useMemo(() => {
    if (hasSizes && hasColors) {
      return (
        activeVariants.find(
          (v) =>
            v.size?.id === selectedSizeId && v.color?.id === selectedColorId,
        ) ?? null
      );
    }
    if (hasSizes) {
      return (
        activeVariants.find((v) => v.size?.id === selectedSizeId) ?? null
      );
    }
    if (hasColors) {
      return (
        activeVariants.find((v) => v.color?.id === selectedColorId) ?? null
      );
    }
    return activeVariants[0] ?? null;
  }, [activeVariants, selectedSizeId, selectedColorId, hasSizes, hasColors]);

  const hasSale = activeVariants.some((v) => v.salePrice !== null);
  const allOutOfStock = activeVariants.length === 0;
  const activePrices = activeVariants.map((v) => v.salePrice ?? v.price);
  const minPrice = activePrices.length ? Math.min(...activePrices) : null;
  const maxPrice = activePrices.length
    ? Math.max(...activeVariants.map((v) => v.price))
    : null;

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

    const variantInfo = getVariantInfo(selectedVariant);

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

  const displayUrl = selectedImageUrl ?? galleryImages[0]?.url ?? null;

  const displayImage = useMemo(
    () => galleryImages.find((img) => img.url === displayUrl) ?? null,
    [galleryImages, displayUrl],
  );

  const isActiveThumbnail = (img: (typeof galleryImages)[number]) =>
    img.url === displayUrl;

  return (
    <div className="bg-white">
      <div className="container py-8 sm:py-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.9fr)] lg:items-start">
          <section className="flex min-w-0 w-full flex-col gap-3 lg:flex-row-reverse">
            <div className="relative flex h-[420px] w-full items-center justify-center overflow-hidden rounded-3xl border border-[var(--line)] bg-brand-light-pink sm:h-[520px] lg:h-[700px] lg:flex-1">
              {displayImage && !mainImageError ? (
                <img
                  alt={displayImage.altAr ?? product.nameAr}
                  className="h-full w-full object-contain p-4"
                  src={getMediaUrl(displayImage.url)}
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

            {galleryImages.length > 1 ? (
              <div className="flex w-full max-w-full gap-2 overflow-x-auto overflow-y-hidden pb-1 lg:w-auto lg:shrink-0 lg:flex-col lg:overflow-y-auto lg:overflow-x-hidden lg:pb-0 lg:pr-0 hide-scrollbar">
                {galleryImages.map((img, i) => (
                  <button
                    key={img.id}
                    type="button"
                    aria-label={`صورة المنتج ${i + 1}`}
                    onClick={() => {
                      setSelectedImageUrl(img.url);
                      setMainImageError(false);
                      const skuMatch = img.altAr?.match(/^(EO-VAR-[a-f0-9-]+)/);
                      if (skuMatch) {
                        const v = activeVariants.find((v) => v.sku === skuMatch[1]);
                        if (v) {
                          if (hasSizes) setSelectedSizeId(v.size?.id ?? null);
                          if (hasColors) setSelectedColorId(v.color?.id ?? null);
                        }
                      }
                    }}
                    className={`h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 bg-brand-light-pink transition-colors focus:outline-none focus:ring-2 focus:ring-brand-pink/40 lg:h-24 lg:w-24 ${
                      isActiveThumbnail(img)
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
                  ) : minPrice !== null &&
                    maxPrice !== null &&
                    minPrice !== maxPrice ? (
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
                      const hasStock = activeVariants.some(
                        (v) => v.size?.id === size.id && v.stock > 0,
                      );
                      const isSelected = selectedSizeId === size.id;
                      return (
                        <button
                          key={size.id}
                          type="button"
                          disabled={!hasStock}
                          onClick={() => {
                            setSelectedSizeId(size.id);
                            const v = activeVariants.find(
                              (v) =>
                                v.size?.id === size.id &&
                                (!hasColors || v.color?.id === selectedColorId),
                            );
                            if (v) {
                              const img = galleryImages.find((img) =>
                                img.altAr?.startsWith(v.sku),
                              );
                              if (img) setSelectedImageUrl(img.url);
                            }
                          }}
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
                      const hasStock = activeVariants.some(
                        (v) => v.color?.id === color.id && v.stock > 0,
                      );
                      const isSelected = selectedColorId === color.id;
                      return (
                        <button
                          key={color.id}
                          type="button"
                          disabled={!hasStock}
                          onClick={() => {
                            setSelectedColorId(color.id);
                            const v = activeVariants.find(
                              (v) =>
                                v.color?.id === color.id &&
                                (!hasSizes || v.size?.id === selectedSizeId),
                            );
                            if (v) {
                              const img = galleryImages.find((img) =>
                                img.altAr?.startsWith(v.sku),
                              );
                              if (img) setSelectedImageUrl(img.url);
                            }
                          }}
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
                  hasVariants={activeVariants.length > 0}
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
