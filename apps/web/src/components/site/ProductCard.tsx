import Link from "next/link";
import type { Product } from "@sleepywear/shared";
import { getCardUrl } from "@/lib/media";

type ProductCardProps = {
  product: Product;
  layout?: "grid" | "row";
};

export function ProductCard({ product, layout = "grid" }: ProductCardProps) {
  const firstVariant = product.variants[0];
  const price = firstVariant
    ? (firstVariant.salePrice ?? firstVariant.price)
    : null;
  const originalPrice = firstVariant?.salePrice
    ? firstVariant.price
    : null;
  const image = product.images[0];

  if (layout === "row") {
    return (
      <Link
        href={`/products/${product.slug}`}
        className="group flex shrink-0 w-[160px] flex-col rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow"
      >
        <div className="flex aspect-[3/4] items-center justify-center rounded-t-xl bg-brand-light-pink">
          {image ? (
            <img
              alt={image.altAr ?? product.nameAr}
              className="h-full w-full rounded-t-xl object-cover"
              src={getCardUrl(image.url)}
            />
          ) : (
            <span className="px-2 text-center text-xs text-[var(--muted)]">
              {product.nameAr}
            </span>
          )}
        </div>
        <div className="flex flex-col gap-1 p-3">
          <p className="text-xs text-[var(--muted)] truncate">
            {product.category?.nameAr}
          </p>
          <h3 className="text-sm font-semibold truncate">{product.nameAr}</h3>
          {price ? (
            <div className="flex items-center gap-1.5 mt-1">
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
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex aspect-[3/4] items-center justify-center rounded-t-xl bg-brand-light-pink">
        {image ? (
          <img
            alt={image.altAr ?? product.nameAr}
            className="h-full w-full rounded-t-xl object-cover"
            src={getCardUrl(image.url)}
          />
        ) : (
          <span className="px-2 text-center text-sm text-[var(--muted)]">
            {product.nameAr}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-1 p-4">
        <p className="text-xs text-[var(--muted)]">
          {product.category?.nameAr}
        </p>
        <h3 className="font-semibold">{product.nameAr}</h3>
        {price ? (
          <div className="flex items-center gap-2 mt-1">
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
    </Link>
  );
}
