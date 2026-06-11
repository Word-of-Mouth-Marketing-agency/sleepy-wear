import Link from "next/link";
import type { Product } from "@sleepywear/shared";
import { getCardUrl } from "@/lib/media";

type ProductGridProps = {
  products: Product[];
};

export function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return <p className="text-[var(--muted)]">لا توجد منتجات حاليا.</p>;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => {
        const firstVariant = product.variants[0];
        const price = firstVariant
          ? (firstVariant.salePrice ?? firstVariant.price)
          : null;
        const image = product.images[0];

        return (
          <Link
            key={product.id}
            href={`/products/${product.slug}`}
            className="rounded-md border border-[var(--line)] p-4"
          >
            <div className="mb-4 flex aspect-[4/3] items-center justify-center rounded-md bg-[#f6eeea]">
              {image ? (
                <img
                  alt={image.altAr ?? product.nameAr}
                  className="h-full w-full rounded-md object-cover"
                  src={getCardUrl(image.url)}
                />
              ) : (
                <span className="text-sm text-[var(--muted)]">
                  {product.nameAr}
                </span>
              )}
            </div>
            <p className="text-xs text-[var(--muted)]">
              {product.category?.nameAr}
            </p>
            <h2 className="mt-1 font-semibold">{product.nameAr}</h2>
            {price ? (
              <p className="mt-2 text-sm font-bold text-[var(--accent)]">
                {price} جنيه
              </p>
            ) : null}
          </Link>
        );
      })}
    </div>
  );
}
