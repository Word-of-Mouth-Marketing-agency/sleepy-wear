import Link from "next/link";
import type { PaginatedResponse, Product } from "@sleepywear/shared";
import { PageShell } from "@/components/PageShell";
import { apiGet } from "@/lib/api";
import { getThumbUrl } from "@/lib/media";

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

export default async function AdminProductsPage() {
  const products = await apiGet<PaginatedResponse<Product>>(
    "/products?includeInactive=true&limit=1000",
  ).catch(() => null);

  return (
    <PageShell title="إدارة المنتجات" eyebrow="Admin">
      <div className="mb-4 flex justify-end">
        <Link
          className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white"
          href="/admin/products/new"
        >
          إضافة منتج
        </Link>
      </div>
      {!products ? <p className="text-red-700">تعذر تحميل المنتجات.</p> : null}
      {products && products.items.length === 0 ? (
        <p className="text-[var(--muted)]">لا توجد منتجات.</p>
      ) : null}
      {products && products.items.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-right text-sm">
            <thead className="border-b border-[var(--line)] text-[var(--muted)]">
              <tr>
                <th className="py-2 pl-4 w-12" />
                <th className="py-2">المنتج</th>
                <th className="py-2">السعر</th>
                <th className="py-2">التصنيف</th>
                <th className="py-2">الحالة</th>
                <th className="py-2">المتغيرات</th>
                <th className="py-2">إجراء</th>
              </tr>
            </thead>
            <tbody>
              {products.items.map((product) => {
                const thumb = product.images[0];
                return (
                  <tr
                    key={product.id}
                    className="border-b border-[var(--line)]"
                  >
                    <td className="py-2 pl-4">
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
                    <td className="py-2 font-semibold">{product.nameAr}</td>
                    <td className="py-2 whitespace-nowrap">
                      {priceDisplay(product)}
                    </td>
                    <td className="py-2">{product.category?.nameAr}</td>
                    <td className="py-2">{statusBadge(product.status)}</td>
                    <td className="py-2">{product.variants.length}</td>
                    <td className="py-2">
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
      ) : null}
    </PageShell>
  );
}
