import type { Category } from "@sleepywear/shared";
import { PageShell } from "@/components/PageShell";
import { ProductForm } from "@/components/admin/ProductForm";
import { apiGet } from "@/lib/api";

export default async function NewProductPage() {
  const categories = await apiGet<Category[]>(
    "/categories?includeInactive=true",
  ).catch(() => null);

  return (
    <PageShell title="إضافة منتج" eyebrow="Admin" noContainer>
      {!categories ? (
        <p className="text-red-700">تعذر تحميل التصنيفات.</p>
      ) : (
        <ProductForm categories={categories} />
      )}
    </PageShell>
  );
}
