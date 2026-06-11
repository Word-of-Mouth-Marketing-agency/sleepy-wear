import { PageShell } from "@/components/PageShell";

export default function AdminCategoriesPage() {
  return (
    <PageShell title="إدارة التصنيفات" eyebrow="Admin">
      <p className="text-[var(--muted)]">
        إدارة التصنيفات والروابط الدائمة ستتصل مع /api/categories.
      </p>
    </PageShell>
  );
}
