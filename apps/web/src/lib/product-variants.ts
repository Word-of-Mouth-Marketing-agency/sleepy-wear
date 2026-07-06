import type { Product, ProductImage, ProductVariant } from "@sleepywear/shared";

const GENERIC_OPTION_NAMES = new Set([
  "\u0639\u0627\u0645",
  "\u0639\u0627\u0645\u0629",
  "\u0639\u0627\u0645\u0647",
  "default",
  "general",
  "one size",
  "onesize",
  "free size",
]);

export function getAvailableVariants(product: Product) {
  return product.variants.filter((variant) => variant.stock > 0);
}

export function getAllVariants(product: Product) {
  return product.variants;
}

export function hasSelectableVariations(product: Product) {
  return product.variants.some(hasRealOption);
}

export function hasRealOption(variant: ProductVariant) {
  return hasRealSize(variant) || hasRealColor(variant);
}

export function getVariantInfo(variant: ProductVariant) {
  return [
    hasRealSize(variant) ? variant.size?.labelAr : null,
    hasRealColor(variant) ? variant.color?.nameAr : null,
  ]
    .filter(Boolean)
    .join(" / ");
}

export function getDisplayVariantInfo(variantInfo?: string) {
  if (!variantInfo) return "";

  return variantInfo
    .split("/")
    .map((part) => part.trim())
    .filter((part) => part && !isGenericOption(part))
    .join(" / ");
}

export function hasRealSize(variant: ProductVariant) {
  const label = variant.size?.labelAr ?? variant.size?.name;
  return Boolean(label && !isGenericOption(label));
}

export function hasRealColor(variant: ProductVariant) {
  const label = variant.color?.nameAr ?? variant.color?.nameEn;
  return Boolean(label && !isGenericOption(label));
}

function isGenericOption(value: string) {
  const normalized = value.trim().toLowerCase().replace(/\s+/g, " ");
  return GENERIC_OPTION_NAMES.has(normalized);
}

/* ------------------------------------------------------------------ */
/*  Image classification helpers for admin product edit               */
/* ------------------------------------------------------------------ */

const EO_VAR_RE = /^EO-VAR-/i;

export function isVariationImage(image: ProductImage) {
  if (image.variantId) return true;
  if (image.altAr && EO_VAR_RE.test(image.altAr.trim())) return true;
  if (image.altEn && EO_VAR_RE.test(image.altEn.trim())) return true;
  return false;
}

export function isAssignedVariantImage(image: ProductImage) {
  return Boolean(image.variantId);
}

export function normalizeImageUrl(url: string) {
  return url.trim();
}

export type ImageClass = "product" | "variation" | "assigned-variant";

export function classifyImage(image: ProductImage): ImageClass {
  if (image.variantId) return "assigned-variant";
  const alt = (image.altAr ?? "").trim();
  const altEn = (image.altEn ?? "").trim();
  if (EO_VAR_RE.test(alt) || EO_VAR_RE.test(altEn)) return "variation";
  return "product";
}

export function dedupeImages<T extends { url: string }>(
  images: T[],
): T[] {
  const seen = new Set<string>();
  const result: T[] = [];
  for (const img of images) {
    const normalized = normalizeImageUrl(img.url);
    if (seen.has(normalized)) continue;
    seen.add(normalized);
    result.push(img);
  }
  return result;
}

export function filterProductGalleryImages(
  images: ProductImage[],
): ProductImage[] {
  return dedupeImages(images.filter((img) => classifyImage(img) === "product"));
}
