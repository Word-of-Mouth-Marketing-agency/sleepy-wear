import type { Category } from "@sleepywear/shared";
import { PageShell } from "@/components/PageShell";
import { CategoryManager } from "@/components/admin/CategoryManager";
import { API_URL } from "@/lib/api";

export default async function AdminCategoriesPage() {
  const categories = await fetch(`${API_URL}/categories?includeInactive=true`, {
    cache: "no-store",
    headers: { Accept: "application/json" },
  })
    .then((response) =>
      response.ok ? (response.json() as Promise<Category[]>) : null,
    )
    .catch(() => null);

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
