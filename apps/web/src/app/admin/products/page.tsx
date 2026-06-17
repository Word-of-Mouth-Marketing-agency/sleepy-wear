"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, PackagePlus, Search } from "lucide-react";
import type { PaginatedResponse, Product } from "@sleepywear/shared";
import { PageShell } from "@/components/PageShell";
import { getThumbUrl } from "@/lib/media";
import { API_URL } from "@/lib/api";

const PAGE_SIZE = 24;

function statusBadge(status: Product["status"]) {
  const styles: Record<string, string> = {
    ACTIVE: "border-green-200 bg-green-50 text-green-700",
    DRAFT: "border-amber-200 bg-amber-50 text-amber-700",
    ARCHIVED: "border-gray-200 bg-gray-50 text-gray-500",
  };
  const labels: Record<string, string> = {
    ACTIVE: "نشط",
    DRAFT: "مسودة",
    ARCHIVED: "مؤرشف",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold ${styles[status] ?? "border-gray-200 bg-gray-50 text-gray-500"}`}
    >
      {labels[status] ?? status}
    </span>
  );
}

function priceDisplay(product: Product) {
  const prices = product.variants.map((v) => v.salePrice ?? v.price);
  if (prices.length === 0) return "—";
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return min === max ? `${min} ج` : `${min} - ${max} ج`;
}

export default function AdminProductsPage() {
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<PaginatedResponse<Product> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const params = new URLSearchParams({
        includeInactive: "true",
        limit: String(PAGE_SIZE),
        page: String(page),
      });
      if (search) params.set("search", search);
      const res = await fetch(`${API_URL}/products?${params}`, {
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error("Failed");
      setData((await res.json()) as PaginatedResponse<Product>);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    setSearch(query);
  }

  return (
    <PageShell
      title="إدارة المنتجات"
      eyebrow="Admin"
      description="بحث سريع، مراجعة الحالة، وتعديل المنتج أو المتغيرات من مكان واحد."
      noContainer
      surface="plain"
      actions={
        <Link
          className="inline-flex items-center gap-2 rounded-full bg-brand-pink px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-brand-pink/90"
          href="/admin/products/new"
        >
          <PackagePlus size={17} aria-hidden="true" />
          إضافة منتج
        </Link>
      }
    >
      <div className="rounded-2xl border border-[var(--line)] bg-white p-4 shadow-sm sm:p-5">
        <form
          onSubmit={handleSearch}
          className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"
        >
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--muted)]"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ابحث باسم المنتج أو الكود..."
              className="h-12 w-full rounded-2xl border border-[var(--line)] bg-[#fbf7fa] pr-11 pl-4 text-sm outline-none transition focus:border-brand-pink focus:bg-white focus:ring-4 focus:ring-pink-100"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              className="rounded-full bg-black px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-pink"
            >
              بحث
            </button>
            {search ? (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setSearch("");
                  setPage(1);
                }}
                className="rounded-full border border-[var(--line)] px-4 py-2.5 text-sm font-bold text-[var(--muted)] transition hover:border-brand-blue hover:text-brand-blue"
              >
                إلغاء البحث
              </button>
            ) : null}
          </div>
        </form>
      </div>

      {error ? (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-700">
          تعذر تحميل المنتجات. يرجى المحاولة مرة أخرى.
        </div>
      ) : null}

      {loading ? (
        <div className="mt-4 rounded-2xl border border-[var(--line)] bg-white p-10 text-center text-sm font-semibold text-[var(--muted)] shadow-sm">
          جاري تحميل المنتجات...
        </div>
      ) : null}

      {!loading && !error && data && data.items.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed border-pink-200 bg-white p-12 text-center shadow-sm">
          <p className="text-base font-bold">
            {search ? "لا توجد نتائج لهذا البحث" : "لا توجد منتجات بعد"}
          </p>
          <p className="mt-2 text-sm text-[var(--muted)]">
            {search
              ? "جرّب كلمة بحث مختلفة أو ألغِ البحث الحالي."
              : "ابدأ بإضافة أول منتج للكتالوج."}
          </p>
        </div>
      ) : null}

      {!loading && !error && data && data.items.length > 0 ? (
        <>
          <div className="mt-4 overflow-hidden rounded-2xl border border-[var(--line)] bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] text-right text-sm">
                <thead>
                  <tr className="border-b border-[var(--line)] bg-[#fbf7fa] text-xs font-bold text-[var(--muted)]">
                    <th className="w-16 px-4 py-4" />
                    <th className="px-4 py-4">المنتج</th>
                    <th className="px-4 py-4">السعر</th>
                    <th className="px-4 py-4">التصنيف</th>
                    <th className="px-4 py-4">الحالة</th>
                    <th className="px-4 py-4">المتغيرات</th>
                    <th className="px-4 py-4">إجراء</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((product) => {
                    const thumb = product.images[0];
                    return (
                      <tr
                        key={product.id}
                        className="border-b border-[var(--line)] transition last:border-0 hover:bg-pink-50/30"
                      >
                        <td className="px-4 py-3">
                          {thumb ? (
                            <img
                              alt=""
                              className="h-12 w-12 rounded-xl object-cover"
                              src={getThumbUrl(thumb.url)}
                            />
                          ) : (
                            <div className="grid h-12 w-12 place-items-center rounded-xl bg-pink-50 text-xs font-bold text-brand-pink">
                              SW
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-bold text-black">{product.nameAr}</p>
                          <p className="mt-1 text-xs text-[var(--muted)]">
                            /{product.slug}
                          </p>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 font-bold">
                          {priceDisplay(product)}
                        </td>
                        <td className="px-4 py-3 text-[var(--muted)]">
                          {product.category?.nameAr ?? "بدون تصنيف"}
                        </td>
                        <td className="px-4 py-3">{statusBadge(product.status)}</td>
                        <td className="px-4 py-3">
                          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-brand-blue">
                            {product.variants.length}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            className="rounded-full border border-[var(--line)] px-4 py-2 text-xs font-bold transition hover:border-brand-pink hover:bg-pink-50 hover:text-brand-pink"
                            href={`/admin/products/${product.id}/edit`}
                          >
                            تعديل
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-sm shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <span className="font-semibold text-[var(--muted)]">
              إجمالي {data.meta.total} منتج
              {search ? ` - نتائج البحث عن "${search}"` : ""}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="inline-flex items-center gap-1 rounded-full border border-[var(--line)] px-3 py-2 text-sm font-bold transition hover:border-brand-blue hover:text-brand-blue disabled:pointer-events-none disabled:opacity-40"
              >
                <ChevronRight size={16} />
                السابق
              </button>
              <span className="rounded-full bg-[#fbf7fa] px-3 py-2 text-xs font-bold text-[var(--muted)]">
                {data.meta.page} من {data.meta.totalPages}
              </span>
              <button
                type="button"
                disabled={page >= data.meta.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="inline-flex items-center gap-1 rounded-full border border-[var(--line)] px-3 py-2 text-sm font-bold transition hover:border-brand-blue hover:text-brand-blue disabled:pointer-events-none disabled:opacity-40"
              >
                التالي
                <ChevronLeft size={16} />
              </button>
            </div>
          </div>
        </>
      ) : null}
    </PageShell>
  );
}
