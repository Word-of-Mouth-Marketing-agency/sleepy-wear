import type { CategoryDetails } from "@sleepywear/shared";
import { ProductGrid } from "@/components/ProductGrid";
import { apiGet } from "@/lib/api";

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;

  try {
    const details = await apiGet<CategoryDetails>(`/categories/${slug}`);
    const { category, products } = details;
    const count = category.productCount ?? products.meta.total;

    return (
      <div className="bg-white">
        <section className="border-b border-[var(--line)] bg-brand-light-pink/45">
          <div className="container py-8 sm:py-10">
            <p className="text-sm font-bold text-brand-pink">تصنيف</p>
            <h1 className="mt-2 text-3xl font-black text-brand-black sm:text-4xl">
              {category.nameAr}
            </h1>
            <p className="mt-2 text-sm text-[var(--muted)]">
              {count} منتج متاح في هذا التصنيف.
            </p>
          </div>
        </section>

        <section className="container py-8 sm:py-10">
          {products.items.length > 0 ? (
            <ProductGrid products={products.items} />
          ) : (
            <div className="mx-auto max-w-xl rounded-3xl border border-dashed border-brand-pink/35 bg-brand-light-pink/50 px-6 py-12 text-center">
              <p className="text-lg font-black text-brand-black">
                لا توجد منتجات في هذا التصنيف حالياً
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                نضيف منتجات جديدة باستمرار، راجعي هذا التصنيف لاحقاً.
              </p>
            </div>
          )}
        </section>
      </div>
    );
  } catch {
    return (
      <div className="container py-12">
        <div className="rounded-3xl border border-red-100 bg-red-50 px-6 py-8 text-center">
          <h1 className="text-2xl font-black text-brand-black">التصنيفات</h1>
          <p className="mt-3 text-sm text-red-700">
            تعذر تحميل التصنيف أو أنه غير موجود.
          </p>
        </div>
      </div>
    );
  }
}
