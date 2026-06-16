import type { PaginatedResponse, Product } from "@sleepywear/shared";
import { apiGet } from "@/lib/api";
import ProductDetailsClient from "@/components/site/ProductDetailsClient";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

async function getRelatedProducts(
  categorySlug: string | undefined,
  currentSlug: string,
): Promise<Product[]> {
  let related: Product[] = [];

  if (categorySlug) {
    const sameCat = await apiGet<PaginatedResponse<Product>>(
      `/products?categorySlug=${categorySlug}&status=ACTIVE&limit=5`,
    ).catch(() => null);

    if (sameCat) {
      related = sameCat.items.filter((p) => p.slug !== currentSlug).slice(0, 4);
    }
  }

  if (related.length < 4) {
    const fillCount = 4 - related.length;
    const fillRes = await apiGet<PaginatedResponse<Product>>(
      `/products?status=ACTIVE&limit=${fillCount + 1}`,
    ).catch(() => null);

    if (fillRes) {
      const existingIds = new Set(related.map((r) => r.id));
      for (const p of fillRes.items) {
        if (p.slug !== currentSlug && !existingIds.has(p.id)) {
          related.push(p);
          if (related.length >= 4) break;
        }
      }
    }
  }

  return related;
}

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

    const relatedProducts = await getRelatedProducts(
      product.category?.slug,
      slug,
    );

    return (
      <ProductDetailsClient
        product={product}
        relatedProducts={relatedProducts}
      />
    );
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
