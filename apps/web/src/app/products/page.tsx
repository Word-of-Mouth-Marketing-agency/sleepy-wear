import Link from "next/link";
import type { PaginatedResponse, Product } from "@sleepywear/shared";
import { PageShell } from "@/components/PageShell";
import { ProductGrid } from "@/components/ProductGrid";
import { apiGet } from "@/lib/api";

type ProductsPageProps = {
  searchParams: Promise<{ page?: string }>;
};

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const { page: pageStr } = await searchParams;
  const page = Math.max(1, Number(pageStr) || 1);

  try {
    const data = await apiGet<PaginatedResponse<Product>>(
      `/products?page=${page}`,
    );

    return (
      <PageShell title="المنتجات" eyebrow="كتالوج المتجر">
        <ProductGrid products={data.items} />
        {data.meta.totalPages > 1 ? (
          <div className="mt-6 flex items-center justify-center gap-4 text-sm">
            {page > 1 ? (
              <Link
                className="rounded-lg border border-[var(--line)] px-4 py-2 font-semibold transition-colors hover:bg-brand-light-pink"
                href={`/products?page=${page - 1}`}
              >
                السابق
              </Link>
            ) : (
              <span className="px-4 py-2 text-[var(--muted)]">السابق</span>
            )}
            <span className="text-[var(--muted)]">
              {page} من {data.meta.totalPages}
            </span>
            {page < data.meta.totalPages ? (
              <Link
                className="rounded-lg border border-[var(--line)] px-4 py-2 font-semibold transition-colors hover:bg-brand-light-pink"
                href={`/products?page=${page + 1}`}
              >
                التالي
              </Link>
            ) : (
              <span className="px-4 py-2 text-[var(--muted)]">التالي</span>
            )}
          </div>
        ) : null}
      </PageShell>
    );
  } catch {
    return (
      <PageShell title="المنتجات" eyebrow="كتالوج المتجر">
        <p className="text-red-700">
          تعذر تحميل المنتجات. تأكد من تشغيل API وقاعدة البيانات.
        </p>
      </PageShell>
    );
  }
}
