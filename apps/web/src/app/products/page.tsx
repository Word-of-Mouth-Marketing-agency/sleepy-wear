import Link from "next/link";
import type { PaginatedResponse, Product } from "@sleepywear/shared";
import { PageShell } from "@/components/PageShell";
import { ProductGrid } from "@/components/ProductGrid";
import { apiGet } from "@/lib/api";

type ProductsPageProps = {
  searchParams: Promise<{ page?: string; search?: string }>;
};

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const { page: pageStr, search: rawSearch } = await searchParams;
  const page = Math.max(1, Number(pageStr) || 1);
  const search = rawSearch?.trim() || "";

  try {
    const apiPath = search
      ? `/products?page=${page}&search=${encodeURIComponent(search)}`
      : `/products?page=${page}`;
    const data = await apiGet<PaginatedResponse<Product>>(apiPath);

    const pageLink = (p: number) =>
      search
        ? `/products?page=${p}&search=${encodeURIComponent(search)}`
        : `/products?page=${p}`;

    return (
      <div className="container py-10">
        <div className="mb-6">
          {search ? (
            <>
              <h1 className="text-2xl font-extrabold sm:text-3xl">
                نتائج البحث عن &quot;{search}&quot;
              </h1>
              <p className="mt-1 text-sm text-[var(--muted)]">
                {data.meta.total} نتيجة
              </p>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-extrabold sm:text-3xl">
                جميع المنتجات
              </h1>
              <p className="mt-1 text-sm text-[var(--muted)]">
                {data.meta.total} منتج
              </p>
            </>
          )}
        </div>

        {data.items.length > 0 ? (
          <>
            <ProductGrid products={data.items} />
            {data.meta.totalPages > 1 ? (
              <div className="mt-8 flex items-center justify-center gap-4 text-sm">
                {page > 1 ? (
                  <Link
                    className="rounded-lg border border-[var(--line)] px-4 py-2 font-semibold transition-colors hover:bg-brand-light-pink"
                    href={pageLink(page - 1)}
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
                    href={pageLink(page + 1)}
                  >
                    التالي
                  </Link>
                ) : (
                  <span className="px-4 py-2 text-[var(--muted)]">التالي</span>
                )}
              </div>
            ) : null}
          </>
        ) : (
          <div className="flex flex-col items-center py-16">
            <p className="text-lg font-semibold text-[var(--muted)]">
              {search
                ? `لا توجد نتائج لـ "${search}"`
                : "لا توجد منتجات."}
            </p>
            {search ? (
              <Link
                href="/products"
                className="mt-4 rounded-lg bg-brand-pink px-6 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                عرض جميع المنتجات
              </Link>
            ) : null}
          </div>
        )}
      </div>
    );
  } catch {
    return (
      <div className="container py-10">
        <h1 className="text-2xl font-extrabold">جميع المنتجات</h1>
        <p className="mt-4 text-red-700">
          تعذر تحميل المنتجات. تأكد من تشغيل API وقاعدة البيانات.
        </p>
      </div>
    );
  }
}
