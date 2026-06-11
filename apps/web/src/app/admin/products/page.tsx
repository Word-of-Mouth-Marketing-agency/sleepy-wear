import Link from "next/link";
import type { PaginatedResponse, Product } from "@sleepywear/shared";
import { PageShell } from "@/components/PageShell";
import { apiGet } from "@/lib/api";

export default async function AdminProductsPage() {
  const products = await apiGet<PaginatedResponse<Product>>(
    "/products?includeInactive=true&limit=100",
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
          <table className="w-full min-w-[720px] text-right text-sm">
            <thead className="border-b border-[var(--line)] text-[var(--muted)]">
              <tr>
                <th className="py-2">المنتج</th>
                <th className="py-2">التصنيف</th>
                <th className="py-2">الحالة</th>
                <th className="py-2">المتغيرات</th>
                <th className="py-2">إجراء</th>
              </tr>
            </thead>
            <tbody>
              {products.items.map((product) => (
                <tr key={product.id} className="border-b border-[var(--line)]">
                  <td className="py-3 font-semibold">{product.nameAr}</td>
                  <td className="py-3">{product.category?.nameAr}</td>
                  <td className="py-3">{product.status}</td>
                  <td className="py-3">{product.variants.length}</td>
                  <td className="py-3">
                    <Link
                      className="text-[var(--accent)]"
                      href={`/admin/products/${product.id}/edit`}
                    >
                      تعديل
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </PageShell>
  );
}
