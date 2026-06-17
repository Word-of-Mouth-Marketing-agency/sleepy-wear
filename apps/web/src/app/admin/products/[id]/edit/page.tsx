import type { Category, Color, Product, Size } from "@sleepywear/shared";
import { PageShell } from "@/components/PageShell";
import { ProductForm, VariantManager } from "@/components/admin/ProductForm";
import { ImageManager } from "@/components/admin/ImageManager";
import { apiGet } from "@/lib/api";

type EditProductPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditProductPage({
  params,
}: EditProductPageProps) {
  const { id } = await params;
  const [product, categories, sizes, colors] = await Promise.all([
    apiGet<Product>(`/products/${id}`).catch(() => null),
    apiGet<Category[]>("/categories?includeInactive=true").catch(() => null),
    apiGet<Size[]>("/sizes").catch(() => null),
    apiGet<Color[]>("/colors").catch(() => null),
  ]);

  return (
    <PageShell
      title="تعديل منتج"
      eyebrow="Admin"
      description="راجع بيانات المنتج والصور والمتغيرات في مساحات واضحة."
      noContainer
      surface="plain"
    >
      {!product || !categories || !sizes || !colors ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          تعذر تحميل بيانات المنتج.
        </p>
      ) : (
        <div className="grid gap-5">
          <section className="rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-extrabold">بيانات المنتج</h2>
            <ProductForm categories={categories} product={product} />
          </section>
          <section className="rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm">
            <ImageManager product={product} />
          </section>
          <section className="rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm">
            <div className="mb-4">
              <h2 className="text-xl font-extrabold">المتغيرات والمخزون</h2>
              <p className="mt-1 text-sm text-[var(--muted)]">
                أضف متغيرا لكل مقاس أو لون متاح للعميل.
              </p>
            </div>
            <VariantManager colors={colors} product={product} sizes={sizes} />
          </section>
        </div>
      )}
    </PageShell>
  );
}
