import { PageShell } from "@/components/PageShell";

export default function CheckoutPage() {
  return (
    <PageShell title="إتمام الطلب" eyebrow="بدون دفع إلكتروني حاليا">
      <form className="grid gap-4 sm:grid-cols-2">
        <input
          className="rounded-md border border-[var(--line)] p-3"
          placeholder="الاسم"
        />
        <input
          className="rounded-md border border-[var(--line)] p-3"
          placeholder="رقم الهاتف"
        />
        <input
          className="rounded-md border border-[var(--line)] p-3 sm:col-span-2"
          placeholder="العنوان"
        />
        <button
          className="rounded-md bg-[var(--accent)] px-4 py-3 font-semibold text-white sm:col-span-2"
          type="button"
        >
          إنشاء طلب تجريبي
        </button>
      </form>
    </PageShell>
  );
}
