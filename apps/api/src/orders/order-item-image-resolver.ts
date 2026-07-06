export type ResolverImage = {
  id: string;
  url: string;
  variantId: string | null;
  colorId: string | null;
  altAr: string | null;
  altEn: string | null;
  sortOrder: number;
  createdAt: Date;
};

export type ResolverVariant = {
  id: string;
  sku: string;
  colorId: string | null;
};

const SKU_PATTERN = /(EO-VAR-[a-f0-9-]+)/i;

function hasUsableUrl(image: ResolverImage): boolean {
  return Boolean(image.url?.trim());
}

function extractSkuFromImage(image: ResolverImage): string | null {
  const label = `${image.altAr ?? ""} ${image.altEn ?? ""}`;
  return label.match(SKU_PATTERN)?.[1] ?? null;
}

function isVariantLinked(image: ResolverImage): boolean {
  return Boolean(image.variantId || image.colorId || extractSkuFromImage(image));
}

export function resolveOrderItemImage(
  variant: ResolverVariant,
  images: ResolverImage[],
): string | null {
  const usable = images
    .filter(hasUsableUrl)
    .sort(
      (a, b) =>
        a.sortOrder - b.sortOrder ||
        a.createdAt.getTime() - b.createdAt.getTime() ||
        a.id.localeCompare(b.id),
    );

  if (!usable.length) return null;

  const exactVariant = usable.find((img) => img.variantId === variant.id);
  if (exactVariant) return exactVariant.url;

  const skuMatch = usable.find((img) => {
    const sku = extractSkuFromImage(img);
    return sku !== null && sku === variant.sku;
  });
  if (skuMatch) return skuMatch.url;

  if (variant.colorId != null) {
    const colorMatch = usable.find((img) => img.colorId === variant.colorId);
    if (colorMatch) return colorMatch.url;
  }

  const generic = usable.find((img) => !isVariantLinked(img));
  if (generic) return generic.url;

  return usable[0].url;
}
