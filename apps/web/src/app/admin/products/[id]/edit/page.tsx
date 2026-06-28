import type { Category, Product } from "@sleepywear/shared";
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
  const [product, categories] = await Promise.all([
    apiGet<Product>(`/products/${id}`).catch(() => null),
    apiGet<Category[]>("/categories?includeInactive=true").catch(() => null),
  ]);

  return (
    <PageShell
      title="تعديل منتج"
      eyebrow="Admin"
      description="راجع بيانات المنتج والصور والمتغيرات في مساحات واضحة."
      noContainer
      surface="plain"
    >
      {!product || !categories ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          تعذر تحميل بيانات المنتج.
        </p>
      ) : (
        <div className="grid gap-6">
          <section className="rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm">
            <div className="mb-4">
              <h2 className="text-lg font-extrabold">البيانات الأساسية</h2>
              <p className="mt-1 text-sm text-[var(--muted)]">
                الاسم، الرابط، التصنيف، الوصف، وحالة المنتج.
              </p>
            </div>
            <ProductForm categories={categories} product={product} />
          </section>

          <section className="rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm">
            <ImageManager product={product} />
          </section>

          <section className="rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm">
            <div className="mb-5">
              <h2 className="text-lg font-extrabold">المتغيرات والمخزون</h2>
              <p className="mt-1 text-sm text-[var(--muted)]">
                أضف متغيرا لكل مقاس أو لون متاح. اضغط على أيقونة الصورة في كل متغير لاختيار صورته من الصور المتاحة.
              </p>
            </div>
            <VariantManager product={product} />
          </section>
        </div>
      )}
    </PageShell>
  );
}
