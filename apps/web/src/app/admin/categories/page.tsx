import type { Category } from "@sleepywear/shared";
import { PageShell } from "@/components/PageShell";
import { CategoryManager } from "@/components/admin/CategoryManager";
import { apiGet } from "@/lib/api";

export default async function AdminCategoriesPage() {
  const categories = await apiGet<Category[]>(
    "/categories?includeInactive=true",
  ).catch(() => null);

  return (
    <PageShell
      title="إدارة التصنيفات"
      eyebrow="Admin"
      description="أضف وعدّل التصنيفات التي تنظم المتجر وتظهر للعملاء."
      noContainer
      surface="plain"
    >
      {!categories ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          تعذر تحميل التصنيفات.
        </p>
      ) : (
        <CategoryManager categories={categories} />
      )}
    </PageShell>
  );
}
