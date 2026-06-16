import type { Category } from "@sleepywear/shared";
import { PageShell } from "@/components/PageShell";
import { CategoryManager } from "@/components/admin/CategoryManager";
import { apiGet } from "@/lib/api";

export default async function AdminCategoriesPage() {
  const categories = await apiGet<Category[]>(
    "/categories?includeInactive=true",
  ).catch(() => null);

  return (
    <PageShell title="إدارة التصنيفات" eyebrow="Admin" noContainer>
      {!categories ? (
        <p className="text-red-700">تعذر تحميل التصنيفات.</p>
      ) : (
        <CategoryManager categories={categories} />
      )}
    </PageShell>
  );
}
