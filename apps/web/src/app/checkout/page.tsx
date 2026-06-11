import { CheckoutForm } from "@/components/CheckoutForm";

export default function CheckoutPage() {
  return (
    <div className="container py-10">
      <h1 className="mb-6 text-2xl font-extrabold">إتمام الطلب</h1>
      <CheckoutForm />
    </div>
  );
}
