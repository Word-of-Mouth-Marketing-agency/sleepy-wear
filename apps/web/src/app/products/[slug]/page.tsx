import type { Product } from "@sleepywear/shared";
import { apiGet } from "@/lib/api";
import ProductDetailsClient from "@/components/site/ProductDetailsClient";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  try {
    const product = await apiGet<Product>(`/products/${slug}`);

    if (product.status !== "ACTIVE") {
      return (
        <div className="container py-10">
          <p className="text-[var(--muted)]">هذا المنتج غير متوفر حاليا.</p>
        </div>
      );
    }

    return <ProductDetailsClient product={product} />;
  } catch {
    return (
      <div className="container py-10">
        <p className="text-red-700">
          تعذر تحميل المنتج أو أنه غير موجود.
        </p>
      </div>
    );
  }
}
