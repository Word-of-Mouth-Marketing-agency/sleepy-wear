import type { CategoryDetails } from "@sleepywear/shared";
import { PageShell } from "@/components/PageShell";
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

    return (
      <div className="container py-10">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold sm:text-3xl">
            {category.nameAr}
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {category.productCount ?? products.meta.total} منتج
          </p>
        </div>

        {products.items.length > 0 ? (
          <ProductGrid products={products.items} />
        ) : (
          <p className="text-[var(--muted)]">
            لا توجد منتجات في هذا التصنيف حاليا.
          </p>
        )}
      </div>
    );
  } catch {
    return (
      <div className="container py-10">
        <h1 className="text-2xl font-extrabold">التصنيفات</h1>
        <p className="mt-4 text-red-700">
          تعذر تحميل التصنيف أو أنه غير موجود.
        </p>
      </div>
    );
  }
}
