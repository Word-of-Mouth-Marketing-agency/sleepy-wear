import Link from "next/link";
import type { PaginatedResponse, Product } from "@sleepywear/shared";
import { PageShell } from "@/components/PageShell";
import { ProductGrid } from "@/components/ProductGrid";
import { apiGet } from "@/lib/api";

export default async function HomePage() {
  const products = await apiGet<PaginatedResponse<Product>>(
    "/products?limit=3",
  ).catch(() => null);

  return (
    <PageShell title="SleepyWear" eyebrow="متجر عربي جاهز للتوسع">
      <div className="space-y-6">
        <div className="space-y-4">
          <p className="text-[var(--muted)]">
            واجهة بداية نظيفة لمتجر ملابس منزلية ولانجري، متصلة الآن ببيانات
            المنتجات الفعلية.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white"
              href="/products"
            >
              تصفح المنتجات
            </Link>
            <Link
              className="rounded-md border border-[var(--line)] px-4 py-2 text-sm font-semibold"
              href="/admin"
            >
              لوحة الإدارة
            </Link>
          </div>
        </div>
        <div className="space-y-3">
          <h2 className="text-xl font-bold">منتجات مختارة</h2>
          {products ? (
            <ProductGrid products={products.items} />
          ) : (
            <p className="text-red-700">تعذر تحميل المنتجات المختارة.</p>
          )}
        </div>
      </div>
    </PageShell>
  );
}
