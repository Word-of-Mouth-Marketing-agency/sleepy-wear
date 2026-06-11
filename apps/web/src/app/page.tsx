import Link from "next/link";
import { PageShell } from "@/components/PageShell";

export default function HomePage() {
  return (
    <PageShell title="SleepyWear" eyebrow="متجر عربي جاهز للتوسع">
      <div className="space-y-4">
        <p className="text-[var(--muted)]">
          واجهة بداية نظيفة لمتجر ملابس منزلية ولانجري، متصلة لاحقا بواجهة
          NestJS.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white"
            href="/products"
          >
            تصفح المنتجات
          </Link>
          <Link
            className="rounded-md border border-[var(--line)] px-4 py-2 text-sm font-semibold"
            href="/admin"
          >
            لوحة الإدارة
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
