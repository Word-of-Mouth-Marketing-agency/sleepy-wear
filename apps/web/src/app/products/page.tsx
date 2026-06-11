import type { PaginatedResponse, Product } from "@sleepywear/shared";
import { PageShell } from "@/components/PageShell";
import { ProductGrid } from "@/components/ProductGrid";
import { apiGet } from "@/lib/api";

export default async function ProductsPage() {
  try {
    const products = await apiGet<PaginatedResponse<Product>>("/products");

    return (
      <PageShell title="المنتجات" eyebrow="كتالوج المتجر">
        <ProductGrid products={products.items} />
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
