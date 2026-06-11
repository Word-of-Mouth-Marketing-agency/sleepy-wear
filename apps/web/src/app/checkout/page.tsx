import { CheckoutForm } from "@/components/CheckoutForm";
import { PageShell } from "@/components/PageShell";

export default function CheckoutPage() {
  return (
    <PageShell title="إتمام الطلب" eyebrow="بدون دفع إلكتروني حاليا">
      <CheckoutForm />
    </PageShell>
  );
}
