import type { Product } from "@sleepywear/shared";
import { ProductCard } from "@/components/site/ProductCard";

type ProductGridProps = {
  products: Product[];
};

export function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return <p className="text-[var(--muted)]">لا توجد منتجات حاليا.</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
