import Link from "next/link";
import { PageShell } from "@/components/PageShell";

export default function AdminPagesPage() {
  return (
    <PageShell title="إدارة الصفحات" eyebrow="Admin" noContainer>
      <div className="space-y-3">
        <Link
          href="/admin/pages/home"
          className="flex items-center justify-between rounded-lg border border-[var(--line)] bg-white p-4 transition-colors hover:bg-[#fafafa]"
        >
          <div>
            <p className="font-semibold">الصفحة الرئيسية</p>
            <p className="mt-0.5 text-sm text-[var(--muted)]">
              إدارة بانرات الهيرو والبنر الرئيسي
            </p>
          </div>
          <span className="text-sm text-brand-pink">تعديل</span>
        </Link>
      </div>
    </PageShell>
  );
}
