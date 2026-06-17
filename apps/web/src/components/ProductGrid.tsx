import type { Product } from "@sleepywear/shared";
import { ProductCard } from "@/components/site/ProductCard";

type ProductGridProps = {
  products: Product[];
};

export function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-brand-pink/35 bg-brand-light-pink/50 px-6 py-12 text-center">
        <p className="font-bold text-brand-black">لا توجد منتجات حالياً.</p>
        <p className="mt-2 text-sm text-[var(--muted)]">
          نضيف منتجات جديدة باستمرار، راجعي الصفحة لاحقاً.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
