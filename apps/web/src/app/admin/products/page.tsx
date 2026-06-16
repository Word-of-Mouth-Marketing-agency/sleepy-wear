"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import type { PaginatedResponse, Product } from "@sleepywear/shared";
import { PageShell } from "@/components/PageShell";
import { getThumbUrl } from "@/lib/media";
import { API_URL } from "@/lib/api";

const PAGE_SIZE = 24;

function statusBadge(status: Product["status"]) {
  const styles: Record<string, string> = {
    ACTIVE: "bg-green-100 text-green-800",
    DRAFT: "bg-amber-100 text-amber-800",
    ARCHIVED: "bg-gray-100 text-gray-500",
  };
  const labels: Record<string, string> = {
    ACTIVE: "نشط",
    DRAFT: "مسودة",
    ARCHIVED: "مؤرشف",
  };
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles[status] ?? "bg-gray-100 text-gray-500"}`}
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
    <PageShell title="إدارة المنتجات" eyebrow="Admin" noContainer>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative">
            <Search
              size={16}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ابحث باسم المنتج أو الكود..."
              className="h-10 w-64 rounded-lg border border-[var(--line)] bg-white pr-9 pl-3 text-sm outline-none transition-colors focus:border-brand-pink"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-brand-pink px-4 text-sm font-semibold text-white transition-opacity hover:opacity-90"
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
              className="rounded-lg border border-[var(--line)] px-3 text-sm font-semibold text-[var(--muted)] transition-colors hover:bg-[var(--line)]"
            >
              إلغاء
            </button>
          ) : null}
        </form>
        <Link
          className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white"
          href="/admin/products/new"
        >
          إضافة منتج
        </Link>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          تعذر تحميل المنتجات. يرجى المحاولة مرة أخرى.
        </div>
      ) : null}

      {loading ? (
        <div className="flex items-center justify-center py-20 text-sm text-[var(--muted)]">
          جاري التحميل…
        </div>
      ) : null}

      {!loading && !error && data && data.items.length === 0 ? (
        <div className="py-20 text-center text-sm text-[var(--muted)]">
          {search ? "لا توجد نتائج لهذا البحث" : "لا توجد منتجات"}
        </div>
      ) : null}

      {!loading && !error && data && data.items.length > 0 ? (
        <>
          <div className="overflow-x-auto rounded-lg border border-[var(--line)] bg-white">
            <table className="w-full min-w-[800px] text-right text-sm">
              <thead>
                <tr className="border-b border-[var(--line)] bg-[#fafafa]">
                  <th className="py-3 pl-4 w-12" />
                  <th className="py-3 font-semibold text-[var(--muted)]">المنتج</th>
                  <th className="py-3 font-semibold text-[var(--muted)]">السعر</th>
                  <th className="py-3 font-semibold text-[var(--muted)]">التصنيف</th>
                  <th className="py-3 font-semibold text-[var(--muted)]">الحالة</th>
                  <th className="py-3 font-semibold text-[var(--muted)]">المتغيرات</th>
                  <th className="py-3 font-semibold text-[var(--muted)]">إجراء</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((product) => {
                  const thumb = product.images[0];
                  return (
                    <tr
                      key={product.id}
                      className="border-b border-[var(--line)] last:border-0"
                    >
                      <td className="py-2.5 pl-4">
                        {thumb ? (
                          <img
                            alt=""
                            className="h-10 w-10 rounded-md object-cover"
                            src={getThumbUrl(thumb.url)}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-md bg-brand-light-pink" />
                        )}
                      </td>
                      <td className="py-2.5 font-semibold">{product.nameAr}</td>
                      <td className="py-2.5 whitespace-nowrap">
                        {priceDisplay(product)}
                      </td>
                      <td className="py-2.5">{product.category?.nameAr}</td>
                      <td className="py-2.5">{statusBadge(product.status)}</td>
                      <td className="py-2.5">{product.variants.length}</td>
                      <td className="py-2.5">
                        <Link
                          className="rounded-md border border-[var(--line)] px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-[var(--line)]"
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

          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-[var(--muted)]">
              إجمالي {data.meta.total} منتج
              {search ? ` — نتائج البحث عن "${search}"` : ""}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="flex items-center gap-1 rounded-lg border border-[var(--line)] px-3 py-1.5 text-sm font-semibold transition-colors hover:bg-[var(--line)] disabled:pointer-events-none disabled:opacity-40"
              >
                <ChevronRight size={16} />
                السابق
              </button>
              <span className="px-2 text-[var(--muted)]">
                {data.meta.page} من {data.meta.totalPages}
              </span>
              <button
                type="button"
                disabled={page >= data.meta.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="flex items-center gap-1 rounded-lg border border-[var(--line)] px-3 py-1.5 text-sm font-semibold transition-colors hover:bg-[var(--line)] disabled:pointer-events-none disabled:opacity-40"
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
