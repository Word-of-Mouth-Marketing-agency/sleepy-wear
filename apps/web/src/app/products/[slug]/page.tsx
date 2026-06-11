import type { Product } from "@sleepywear/shared";
import { AddToCartButton } from "@/components/AddToCartButton";
import { PageShell } from "@/components/PageShell";
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
        <PageShell title="غير متوفر" eyebrow={slug}>
          <p className="text-[var(--muted)]">
            هذا المنتج غير متوفر حاليا.
          </p>
        </PageShell>
      );
    }

    return (
      <PageShell
        title={product.nameAr}
        eyebrow={product.category?.nameAr ?? "تفاصيل المنتج"}
      >
        <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <div className="flex aspect-[4/3] items-center justify-center rounded-md bg-[#f6eeea]">
            {product.images[0] ? (
              <img
                alt={product.images[0].altAr ?? product.nameAr}
                className="h-full w-full rounded-md object-cover"
                src={product.images[0].url}
              />
            ) : (
              <span className="text-sm text-[var(--muted)]">
                {product.nameAr}
              </span>
            )}
          </div>
          <div className="space-y-4">
            <p className="text-[var(--muted)]">
              {product.descriptionAr ?? "لا يوجد وصف بعد."}
            </p>
            <div className="space-y-3">
              {product.variants.length === 0 ? (
                <p className="text-[var(--muted)]">
                  لا توجد مقاسات متاحة حاليا.
                </p>
              ) : (
                product.variants.map((variant) => (
                  <div
                    key={variant.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-[var(--line)] p-3"
                  >
                    <div>
                      <p className="font-semibold">
                        {[variant.size?.labelAr, variant.color?.nameAr]
                          .filter(Boolean)
                          .join(" / ") || variant.sku}
                      </p>
                      <p className="text-sm text-[var(--muted)]">
                        المخزون: {variant.stock}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-[var(--accent)]">
                        {variant.salePrice ?? variant.price} جنيه
                      </span>
                      <AddToCartButton product={product} variant={variant} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </PageShell>
    );
  } catch {
    return (
      <PageShell title="تفاصيل المنتج" eyebrow={slug}>
        <p className="text-red-700">تعذر تحميل المنتج أو أنه غير موجود.</p>
      </PageShell>
    );
  }
}
