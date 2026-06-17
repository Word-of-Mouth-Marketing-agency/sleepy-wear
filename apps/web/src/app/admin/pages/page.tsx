import Link from "next/link";
import { ArrowUpLeft, Images } from "lucide-react";
import { PageShell } from "@/components/PageShell";

export default function AdminPagesPage() {
  return (
    <PageShell
      title="إدارة الصفحات"
      eyebrow="Admin"
      description="تحكم في المساحات المرئية التي تظهر في واجهة المتجر."
      noContainer
      surface="plain"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/pages/home"
          className="group rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-pink/40 hover:shadow-md"
        >
          <div className="flex items-start justify-between gap-4">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-pink text-white">
              <Images size={22} aria-hidden="true" />
            </span>
            <ArrowUpLeft
              size={18}
              className="text-[var(--muted)] transition group-hover:text-brand-pink"
              aria-hidden="true"
            />
          </div>
          <p className="mt-5 text-lg font-extrabold">الصفحة الرئيسية</p>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            إدارة بانرات الهيرو وصور تصنيفات الصفحة الرئيسية.
          </p>
        </Link>
      </div>
    </PageShell>
  );
}
