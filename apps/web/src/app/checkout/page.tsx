import { CheckoutForm } from "@/components/CheckoutForm";

export default function CheckoutPage() {
  return (
    <div className="container py-10 sm:py-12">
      <div className="mb-7">
        <p className="text-sm font-bold text-brand-pink">الدفع</p>
        <h1 className="mt-1 text-3xl font-black text-brand-black">
          إتمام الطلب
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          اكتبي بياناتك بعناية، وسنراجع الطلب معك قبل الشحن.
        </p>
      </div>
      <CheckoutForm />
    </div>
  );
}
