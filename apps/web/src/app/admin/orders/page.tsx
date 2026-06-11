import { PageShell } from "@/components/PageShell";

export default function AdminOrdersPage() {
  return (
    <PageShell title="إدارة الطلبات" eyebrow="Admin">
      <p className="text-[var(--muted)]">
        قائمة الطلبات وتحديث الحالات ستتصل مع /api/orders.
      </p>
    </PageShell>
  );
}
