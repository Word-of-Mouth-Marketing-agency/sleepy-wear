"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { ShoppingBag } from "lucide-react";

type TrackingData = {
  orderId: string;
  orderNumber: string;
  total: number;
  currency: string;
  itemCount: number;
  contentIds: string[];
};

const STORAGE_KEY = "sleepywear_purchase_tracked";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("orderNumber");
  const [tracking, setTracking] = useState<TrackingData | null>(null);

  useEffect(() => {
    if (!orderNumber) return;

    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored === orderNumber) return;

    fetch(`/api/orders/success/${encodeURIComponent(orderNumber)}`, {
      headers: { Accept: "application/json" },
    })
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json() as Promise<TrackingData>;
      })
      .then((data) => {
        setTracking(data);
        if (typeof window !== "undefined" && (window as any).fbq) {
          (window as any).fbq("track", "Purchase", {
            value: data.total,
            currency: data.currency,
            content_ids: data.contentIds,
            content_type: "product",
            num_items: data.itemCount,
          });
        }
        sessionStorage.setItem(STORAGE_KEY, orderNumber);
      })
      .catch(() => {});
  }, [orderNumber]);

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
        {tracking ? (
          <p className="mt-1 text-base font-extrabold text-brand-black">
            إجمالي الطلب: {Math.round(tracking.total).toLocaleString("ar-EG")} ج.م
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
