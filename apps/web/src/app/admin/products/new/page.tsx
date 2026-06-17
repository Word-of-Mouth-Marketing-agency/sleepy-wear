import type { Category } from "@sleepywear/shared";
import { PageShell } from "@/components/PageShell";
import { ProductForm } from "@/components/admin/ProductForm";
import { apiGet } from "@/lib/api";

export default async function NewProductPage() {
  const categories = await apiGet<Category[]>(
    "/categories?includeInactive=true",
  ).catch(() => null);

  return (
    <PageShell
      title="إضافة منتج"
      eyebrow="Admin"
      description="أنشئ بيانات المنتج الأساسية أولا، ثم أضف الصور والمتغيرات بعد الحفظ."
      noContainer
    >
      {!categories ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
          تعذر تحميل التصنيفات.
        </p>
      ) : (
        <ProductForm categories={categories} />
      )}
    </PageShell>
  );
}
