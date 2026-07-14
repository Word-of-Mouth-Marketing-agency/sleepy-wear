import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  robots: { index: false },
};

export default function PaymentFailedPage() {
  return (
    <main className="bg-white py-14">
      <div className="container">
        <div className="mx-auto max-w-xl rounded-3xl border border-[var(--line)] bg-brand-light-pink/35 p-8 text-center shadow-sm">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-brand-pink text-2xl font-black text-white">
            !
          </div>
          <h1 className="mt-5 text-2xl font-black text-brand-black">
            لم تكتمل عملية الدفع
          </h1>
          <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
            لم يتم تأكيد الدفع أونلاين. يمكنك الرجوع للسلة والمحاولة مرة أخرى
            أو اختيار الدفع عند الاستلام.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/cart"
              className="rounded-full bg-brand-pink px-6 py-3 text-sm font-bold text-white transition hover:bg-brand-blue"
            >
              الرجوع للسلة
            </Link>
            <Link
              href="/products"
              className="rounded-full border border-[var(--line)] bg-white px-6 py-3 text-sm font-bold text-brand-black transition hover:border-brand-blue hover:text-brand-blue"
            >
              متابعة التسوق
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
