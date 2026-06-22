import type { Category } from "@sleepywear/shared";
import { PageShell } from "@/components/PageShell";
import { FullProductForm } from "@/components/admin/FullProductForm";
import { apiGet } from "@/lib/api";

export default async function NewProductPage() {
  const categories = await apiGet<Category[]>(
    "/categories?includeInactive=true",
  ).catch(() => null);

  return (
    <PageShell
      title="إضافة منتج"
      eyebrow="Admin"
      description="أضف بيانات المنتج والصور والمتغيرات مرة واحدة."
      noContainer
    >
      {!categories ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
          تعذر تحميل التصنيفات.
        </p>
      ) : (
        <FullProductForm categories={categories} />
      )}
    </PageShell>
  );
}
