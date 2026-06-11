import { PageShell } from "@/components/PageShell";

export default function AdminProductsPage() {
  return (
    <PageShell title="إدارة المنتجات" eyebrow="Admin">
      <p className="text-[var(--muted)]">
        جدول المنتجات ونموذج الإضافة سيتم ربطهما مع /api/products.
      </p>
    </PageShell>
  );
}
