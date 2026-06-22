import Link from "next/link";

export default function PaymentPendingPage() {
  return (
    <main className="bg-white py-14">
      <div className="container">
        <div className="mx-auto max-w-xl rounded-3xl border border-[var(--line)] bg-brand-light-pink/35 p-8 text-center shadow-sm">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-brand-blue text-2xl font-black text-white">
            …
          </div>
          <h1 className="mt-5 text-2xl font-black text-brand-black">
            الدفع قيد المراجعة
          </h1>
          <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
            إذا تم خصم المبلغ، سيتم تأكيد الطلب بعد وصول إشعار Paymob.
          </p>
          <Link
            href="/products"
            className="mt-6 inline-flex rounded-full bg-brand-pink px-6 py-3 text-sm font-bold text-white transition hover:bg-brand-blue"
          >
            متابعة التسوق
          </Link>
        </div>
      </div>
    </main>
  );
}
