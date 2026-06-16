import type { Category, Color, Product, Size } from "@sleepywear/shared";
import { PageShell } from "@/components/PageShell";
import { ProductForm, VariantManager } from "@/components/admin/ProductForm";
import { ImageManager } from "@/components/admin/ImageManager";
import { apiGet } from "@/lib/api";

type EditProductPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditProductPage({
  params,
}: EditProductPageProps) {
  const { id } = await params;
  const [product, categories, sizes, colors] = await Promise.all([
    apiGet<Product>(`/products/${id}`).catch(() => null),
    apiGet<Category[]>("/categories?includeInactive=true").catch(() => null),
    apiGet<Size[]>("/sizes").catch(() => null),
    apiGet<Color[]>("/colors").catch(() => null),
  ]);

  return (
    <PageShell title="تعديل منتج" eyebrow="Admin" noContainer>
      {!product || !categories || !sizes || !colors ? (
        <p className="text-red-700">تعذر تحميل بيانات المنتج.</p>
      ) : (
        <div className="space-y-8">
          <ProductForm categories={categories} product={product} />
          <div className="border-t border-[var(--line)] pt-6">
            <ImageManager product={product} />
          </div>
          <div className="border-t border-[var(--line)] pt-6">
            <h2 className="mb-4 text-xl font-bold">المتغيرات والمخزون</h2>
            <VariantManager colors={colors} product={product} sizes={sizes} />
          </div>
        </div>
      )}
    </PageShell>
  );
}
