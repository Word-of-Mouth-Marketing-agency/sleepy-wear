import type { Category, Product } from "@sleepywear/shared";
import { PageShell } from "@/components/PageShell";
import { ProductForm, VariantManager } from "@/components/admin/ProductForm";
import { ImageManager } from "@/components/admin/ImageManager";
import { CollapsibleSection } from "@/components/admin/CollapsibleSection";
import { EditProductShell } from "@/components/admin/EditProductShell";
import { apiGet } from "@/lib/api";

type EditProductPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditProductPage({
  params,
}: EditProductPageProps) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    apiGet<Product>(`/products/${id}`).catch(() => null),
    apiGet<Category[]>("/categories?includeInactive=true").catch(() => null),
  ]);

  return (
    <PageShell
      title="تعديل منتج"
      eyebrow="Admin"
      description="راجع بيانات المنتج والصور والمتغيرات في مساحات واضحة."
      noContainer
      surface="plain"
    >
      {!product || !categories ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          تعذر تحميل بيانات المنتج.
        </p>
      ) : (
        <EditProductShell product={product} categories={categories} />
      )}
    </PageShell>
  );
}
