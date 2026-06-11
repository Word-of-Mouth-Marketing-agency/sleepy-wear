import type { Product } from "@sleepywear/shared";
import { AddToCartButton } from "@/components/AddToCartButton";
import { apiGet } from "@/lib/api";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  try {
    const product = await apiGet<Product>(`/products/${slug}`);

    if (product.status !== "ACTIVE") {
      return (
        <div className="container py-10">
          <p className="text-[var(--muted)]">هذا المنتج غير متوفر حاليا.</p>
        </div>
      );
    }

    const images = product.images;
    const mainImage = images[0];
    const extraImages = images.slice(1);
    const firstVariant = product.variants[0];
    const hasSale = product.variants.some((v) => v.salePrice !== null);
    const allOutOfStock = product.variants.every((v) => v.stock === 0);
    const minPrice = Math.min(
      ...product.variants.map((v) => v.salePrice ?? v.price),
    );
    const maxPrice = Math.max(...product.variants.map((v) => v.price));

    return (
      <div className="container py-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
          <div className="space-y-3">
            <div className="relative flex aspect-[4/3] items-center justify-center rounded-xl bg-brand-light-pink">
              {mainImage ? (
                <img
                  alt={mainImage.altAr ?? product.nameAr}
                  className="h-full w-full rounded-xl object-cover"
                  src={mainImage.url}
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

            {extraImages.length > 0 ? (
              <div className="flex gap-2 overflow-x-auto hide-scrollbar">
                {extraImages.map((img, i) => (
                  <img
                    key={img.id}
                    alt={img.altAr ?? `${product.nameAr} ${i + 2}`}
                    className="h-20 w-20 shrink-0 rounded-lg object-cover"
                    src={img.url.replace(/(\.webp)$/, "-thumb$1")}
                  />
                ))}
              </div>
            ) : null}
          </div>

          <div className="space-y-5">
            <div>
              <p className="text-xs font-semibold text-brand-pink">
                {product.category?.nameAr}
              </p>
              <h1 className="mt-1 text-2xl font-extrabold sm:text-3xl">
                {product.nameAr}
              </h1>
            </div>

            <div className="flex items-baseline gap-2">
              {minPrice !== maxPrice ? (
                <span className="text-xl font-bold text-brand-pink">
                  {minPrice} - {maxPrice} ج
                </span>
              ) : firstVariant ? (
                <span className="text-xl font-bold text-brand-pink">
                  {firstVariant.salePrice ?? firstVariant.price} ج
                </span>
              ) : null}
              {firstVariant?.salePrice ? (
                <span className="text-sm text-[var(--muted)] line-through">
                  {firstVariant.price} ج
                </span>
              ) : null}
            </div>

            <p className="text-sm leading-relaxed text-[var(--muted)]">
              {product.descriptionAr ?? "لا يوجد وصف بعد."}
            </p>

            <div className="space-y-3">
              <h3 className="font-bold text-sm">المقاسات والألوان</h3>
              {product.variants.length === 0 ? (
                <p className="text-sm text-[var(--muted)]">
                  لا توجد مقاسات متاحة حاليا.
                </p>
              ) : (
                product.variants.map((variant) => (
                  <div
                    key={variant.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--line)] bg-white p-4 shadow-sm"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold">
                        {[variant.size?.labelAr, variant.color?.nameAr]
                          .filter(Boolean)
                          .join(" / ") || variant.sku}
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="font-bold text-brand-pink">
                          {variant.salePrice ?? variant.price} ج
                        </span>
                        {variant.salePrice ? (
                          <span className="text-xs text-[var(--muted)] line-through">
                            {variant.price} ج
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      {variant.stock === 0 ? (
                        <span className="text-xs text-red-600 font-semibold">
                          غير متوفر
                        </span>
                      ) : variant.stock <= 5 ? (
                        <span className="text-xs text-amber-600 font-semibold">
                          متبقي {variant.stock}
                        </span>
                      ) : (
                        <span className="text-xs text-green-700 font-semibold">
                          متوفر
                        </span>
                      )}
                      <AddToCartButton product={product} variant={variant} />
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 rounded-xl border border-[var(--line)] bg-brand-light-pink/30 p-4 sm:grid-cols-3">
              <TrustBadge text="توصيل سريع" />
              <TrustBadge text="استبدال مجاني" />
              <TrustBadge text="دفع عند الاستلام" />
            </div>
          </div>
        </div>
      </div>
    );
  } catch {
    return (
      <div className="container py-10">
        <p className="text-red-700">
          تعذر تحميل المنتج أو أنه غير موجود.
        </p>
      </div>
    );
  }
}

function TrustBadge({ text }: { text: string }) {
  return (
    <span className="text-center text-xs font-semibold text-[var(--muted)]">
      {text}
    </span>
  );
}
