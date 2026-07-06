"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ShoppingBag } from "lucide-react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("orderNumber");

  return (
    <div className="container py-12 sm:py-16">
      <div className="mx-auto max-w-lg rounded-3xl border border-green-100 bg-green-50 px-6 py-12 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm">
          <ShoppingBag size={28} className="text-green-600" />
        </div>
        <h2 className="mt-5 text-2xl font-black text-brand-black">
          تم استلام طلبك
        </h2>
        {orderNumber ? (
          <p className="mt-3 text-[var(--muted)]">
            رقم الطلب:{" "}
            <span className="font-black text-brand-pink">{orderNumber}</span>
          </p>
        ) : null}
        <p className="mt-2 text-sm text-[var(--muted)]">
          سنتواصل معك قريباً لتأكيد الطلب وتفاصيل الشحن.
        </p>
        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            className="inline-flex rounded-full bg-brand-pink px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-blue"
            href="/products"
          >
            تصفح المزيد من المنتجات
          </Link>
          <Link
            className="inline-flex rounded-full border border-[var(--line)] bg-white px-6 py-2.5 text-sm font-bold text-brand-black transition-colors hover:border-brand-pink hover:text-brand-pink"
            href="/"
          >
            العودة للرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  );
}
