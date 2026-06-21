import type { Product, ProductVariant } from "@sleepywear/shared";

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

export function hasSelectableVariations(product: Product) {
  const variants = getAvailableVariants(product);
  return variants.some(hasRealOption);
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
