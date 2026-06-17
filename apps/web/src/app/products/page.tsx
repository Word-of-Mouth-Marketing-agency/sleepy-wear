import Link from "next/link";
import type { PaginatedResponse, Product } from "@sleepywear/shared";
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
      <div className="bg-white">
        <section className="border-b border-[var(--line)] bg-brand-light-pink/45">
          <div className="container py-8 sm:py-10">
            <p className="text-sm font-bold text-brand-pink">
              {search ? "نتائج البحث" : "تسوقي SleepyWear"}
            </p>
            <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-3xl font-black text-brand-black sm:text-4xl">
                  {search ? `بحث عن "${search}"` : "كل المنتجات"}
                </h1>
                <p className="mt-2 text-sm text-[var(--muted)]">
                  {data.meta.total} {data.meta.total === 1 ? "منتج" : "منتج"} متاح
                  {search ? " حسب بحثك" : " من الكوليكشن الحالي"}.
                </p>
              </div>
              {search ? (
                <Link
                  href="/products"
                  className="inline-flex w-fit items-center justify-center rounded-full border border-brand-pink/30 bg-white px-4 py-2 text-sm font-bold text-brand-pink transition-colors hover:bg-brand-pink hover:text-white"
                >
                  عرض كل المنتجات
                </Link>
              ) : null}
            </div>
          </div>
        </section>

        <section className="container py-8 sm:py-10">
          {data.items.length > 0 ? (
            <>
              <ProductGrid products={data.items} />
              {data.meta.totalPages > 1 ? (
                <div className="mt-10 flex flex-wrap items-center justify-center gap-3 text-sm">
                  {page > 1 ? (
                    <Link
                      className="rounded-full border border-[var(--line)] bg-white px-5 py-2.5 font-bold transition-colors hover:border-brand-pink hover:text-brand-pink"
                      href={pageLink(page - 1)}
                    >
                      السابق
                    </Link>
                  ) : (
                    <span className="rounded-full border border-[var(--line)] px-5 py-2.5 text-[var(--muted)] opacity-50">
                      السابق
                    </span>
                  )}
                  <span className="rounded-full bg-brand-light-pink px-4 py-2 font-bold text-brand-black">
                    صفحة {page} من {data.meta.totalPages}
                  </span>
                  {page < data.meta.totalPages ? (
                    <Link
                      className="rounded-full border border-[var(--line)] bg-white px-5 py-2.5 font-bold transition-colors hover:border-brand-pink hover:text-brand-pink"
                      href={pageLink(page + 1)}
                    >
                      التالي
                    </Link>
                  ) : (
                    <span className="rounded-full border border-[var(--line)] px-5 py-2.5 text-[var(--muted)] opacity-50">
                      التالي
                    </span>
                  )}
                </div>
              ) : null}
            </>
          ) : (
            <div className="mx-auto max-w-xl rounded-3xl border border-dashed border-brand-pink/35 bg-brand-light-pink/50 px-6 py-12 text-center">
              <p className="text-lg font-black text-brand-black">
                {search ? "لا توجد نتائج مطابقة" : "لا توجد منتجات حالياً"}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                {search
                  ? "جربي كلمة أبسط مثل بيجامة أو ساتان، أو تصفحي كل المنتجات."
                  : "سيتم عرض المنتجات هنا بمجرد توفرها."}
              </p>
              {search ? (
                <Link
                  href="/products"
                  className="mt-5 inline-flex rounded-full bg-brand-pink px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-blue"
                >
                  عرض كل المنتجات
                </Link>
              ) : null}
            </div>
          )}
        </section>
      </div>
    );
  } catch {
    return (
      <div className="container py-12">
        <div className="rounded-3xl border border-red-100 bg-red-50 px-6 py-8 text-center">
          <h1 className="text-2xl font-black text-brand-black">كل المنتجات</h1>
          <p className="mt-3 text-sm text-red-700">
            تعذر تحميل المنتجات الآن. تأكدي من تشغيل API وقاعدة البيانات.
          </p>
        </div>
      </div>
    );
  }
}
