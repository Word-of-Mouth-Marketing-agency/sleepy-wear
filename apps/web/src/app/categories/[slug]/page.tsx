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

    return (
      <PageShell
        title={details.category.nameAr}
        eyebrow={`${details.category.productCount ?? 0} منتج`}
      >
        <ProductGrid products={details.products.items} />
      </PageShell>
    );
  } catch {
    return (
      <PageShell title="تصنيف المنتجات" eyebrow={slug}>
        <p className="text-red-700">تعذر تحميل التصنيف أو أنه غير موجود.</p>
      </PageShell>
    );
  }
}
