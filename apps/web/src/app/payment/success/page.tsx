import Link from "next/link";

export default function PaymentSuccessPage() {
  return (
    <PaymentResult
      tone="success"
      title="تم استلام عملية الدفع"
      message="شكرا لك. سنراجع حالة الدفع ونبدأ تجهيز الطلب بعد تأكيد Paymob."
    />
  );
}

function PaymentResult({
  message,
  title,
  tone,
}: {
  message: string;
  title: string;
  tone: "success" | "failed";
}) {
  return (
    <main className="bg-white py-14">
      <div className="container">
        <div className="mx-auto max-w-xl rounded-3xl border border-[var(--line)] bg-brand-light-pink/35 p-8 text-center shadow-sm">
          <div
            className={`mx-auto grid h-16 w-16 place-items-center rounded-full text-2xl font-black text-white ${
              tone === "success" ? "bg-green-600" : "bg-brand-pink"
            }`}
          >
            {tone === "success" ? "✓" : "!"}
          </div>
          <h1 className="mt-5 text-2xl font-black text-brand-black">
            {title}
          </h1>
          <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
            {message}
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
