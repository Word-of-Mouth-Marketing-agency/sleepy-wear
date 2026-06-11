"use client";

import { FormEvent, useState } from "react";
import type { CreateOrderInput, Order } from "@sleepywear/shared";
import { apiPost } from "@/lib/api";
import { useCartStore } from "@/stores/cart-store";
import Link from "next/link";

export function CheckoutForm() {
  const items = useCartStore((state) => state.items);
  const clear = useCartStore((state) => state.clear);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  if (orderNumber) {
    return (
      <div className="space-y-6 py-10 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-2xl">
          ✓
        </div>
        <h2 className="text-xl font-extrabold">تم استلام طلبك!</h2>
        <p className="text-[var(--muted)]">
          رقم الطلب: <span className="font-bold text-brand-pink">{orderNumber}</span>
        </p>
        <p className="text-sm text-[var(--muted)]">
          سنتواصل معك قريبا لتأكيد الطلب.
        </p>
        <Link
          className="inline-block rounded-lg bg-brand-pink px-6 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
          href="/products"
        >
          تصفح المزيد من المنتجات
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-10">
        <p className="text-[var(--muted)]">سلتك فارغة.</p>
        <Link
          className="rounded-lg bg-brand-pink px-6 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
          href="/products"
        >
          تصفح المنتجات
        </Link>
      </div>
    );
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    const form = new FormData(event.currentTarget);
    const payload: CreateOrderInput = {
      customerName: String(form.get("customerName") ?? ""),
      phone: String(form.get("phone") ?? ""),
      email: String(form.get("email") ?? "") || undefined,
      address: String(form.get("address") ?? ""),
      city: String(form.get("city") ?? ""),
      notes: String(form.get("notes") ?? "") || undefined,
      items: items.map((item) => ({
        variantId: item.variantId,
        quantity: item.quantity,
      })),
    };

    setIsSubmitting(true);
    try {
      const order = await apiPost<Order, CreateOrderInput>("/orders", payload);
      clear();
      setOrderNumber(order.orderNumber);
      setMessage(
        `تم إنشاء الطلب ${order.orderNumber} بقيمة ${order.total} جنيه.`,
      );
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "تعذر إنشاء الطلب.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <form className="space-y-4" onSubmit={submit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <input
            className="rounded-xl border border-[var(--line)] bg-white p-3 text-sm shadow-sm"
            name="customerName"
            placeholder="الاسم الكامل"
            required
          />
          <input
            className="rounded-xl border border-[var(--line)] bg-white p-3 text-sm shadow-sm"
            name="phone"
            placeholder="رقم الهاتف"
            required
            dir="ltr"
          />
          <input
            className="rounded-xl border border-[var(--line)] bg-white p-3 text-sm shadow-sm"
            name="email"
            placeholder="البريد الإلكتروني (اختياري)"
            type="email"
          />
          <input
            className="rounded-xl border border-[var(--line)] bg-white p-3 text-sm shadow-sm"
            name="city"
            placeholder="المدينة"
            required
          />
          <input
            className="rounded-xl border border-[var(--line)] bg-white p-3 text-sm shadow-sm sm:col-span-2"
            name="address"
            placeholder="العنوان بالتفصيل"
            required
          />
          <textarea
            className="rounded-xl border border-[var(--line)] bg-white p-3 text-sm shadow-sm sm:col-span-2"
            name="notes"
            placeholder="ملاحظات (اختياري)"
            rows={2}
          />
        </div>

        {error ? (
          <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>
        ) : null}
        {message ? (
          <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
            {message}
          </p>
        ) : null}

        <button
          className="w-full rounded-xl bg-brand-pink px-4 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? "جاري إنشاء الطلب..." : "تأكيد الطلب"}
        </button>
      </form>

      <div className="h-fit space-y-4 rounded-xl border border-[var(--line)] bg-white p-5 shadow-sm">
        <h3 className="font-bold">منتجات الطلب</h3>
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.variantId} className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-light-pink text-xs font-bold text-brand-pink">
                {item.nameAr.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold truncate">
                  {item.nameAr}
                </p>
                <p className="text-xs text-[var(--muted)]">
                  {item.variantInfo || item.sku} × {item.quantity}
                </p>
              </div>
              <p className="text-sm font-bold shrink-0">
                {item.price * item.quantity} ج
              </p>
            </div>
          ))}
        </div>
        <div className="border-t border-[var(--line)] pt-3">
          <div className="flex justify-between text-sm">
            <span className="text-[var(--muted)]">المجموع</span>
            <span className="font-bold">{total} ج</span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-[var(--muted)]">الشحن</span>
            <span className="text-brand-blue font-semibold">مجاني</span>
          </div>
        </div>
      </div>
    </div>
  );
}
